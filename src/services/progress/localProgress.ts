import type {
  AnswerProgressRecord,
  CompletedSessionProgress,
  ProgressSnapshot,
  ProgressSummary,
  QuestionProgress,
} from "./progress";

const DATABASE_NAME = "practice-progress";
const DATABASE_VERSION = 3;
const QUESTION_STORE = "questions";
const SESSION_STORE = "sessions";
export const ENGAGEMENT_STORE = "engagement";
export const GAME_SESSION_STORE = "gameSessions";

export const PROGRESS_UPDATED_EVENT = "practice-progress-updated";

let databasePromise: Promise<IDBDatabase> | null = null;

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Falha ao acessar o progresso local."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Falha ao salvar o progresso local."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("A gravação do progresso local foi interrompida."));
  });
}

function openDatabase(): Promise<IDBDatabase> {
  if (!databasePromise) {
    databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(QUESTION_STORE)) {
          database.createObjectStore(QUESTION_STORE, { keyPath: "questionId" });
        }

        if (!database.objectStoreNames.contains(SESSION_STORE)) {
          database.createObjectStore(SESSION_STORE, { keyPath: "sessionId" });
        }

        if (!database.objectStoreNames.contains(ENGAGEMENT_STORE)) {
          database.createObjectStore(ENGAGEMENT_STORE, { keyPath: "key" });
        }

        if (!database.objectStoreNames.contains(GAME_SESSION_STORE)) {
          database.createObjectStore(GAME_SESSION_STORE, { keyPath: "sessionId" });
        }
      };

      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => database.close();
        resolve(database);
      };
      request.onerror = () => reject(request.error ?? new Error("Não foi possível abrir o progresso local."));
      request.onblocked = () => reject(new Error("O progresso local está bloqueado por outra aba."));
    }).catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise!;
}

export async function getProgressDatabase(): Promise<IDBDatabase> {
  return openDatabase();
}

function announceProgressUpdate() {
  window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
}

export async function recordQuestionAnswer(record: AnswerProgressRecord): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(QUESTION_STORE, "readwrite");
  const store = transaction.objectStore(QUESTION_STORE);
  const existing = (await requestResult(
    store.get(record.questionId),
  )) as QuestionProgress | undefined;

  const next: QuestionProgress = {
    questionId: record.questionId,
    topicId: record.topicId,
    difficulty: record.difficulty,
    timesSeen: (existing?.timesSeen ?? 0) + 1,
    correctCount: (existing?.correctCount ?? 0) + (record.correct ? 1 : 0),
    wrongCount: (existing?.wrongCount ?? 0) + (record.correct ? 0 : 1),
    lastSeenAt: record.answeredAt,
    lastResult: record.correct,
  };

  store.put(next);
  await transactionDone(transaction);
  announceProgressUpdate();
}

export async function saveCompletedSession(
  session: CompletedSessionProgress,
): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(SESSION_STORE, "readwrite");
  transaction.objectStore(SESSION_STORE).put(session);
  await transactionDone(transaction);
  announceProgressUpdate();
}

export interface GameSessionRecord {
  sessionId: string;
  gameId: string;
  contentDomain: "grammar" | "vocabulary";
  contentDomains?: ("grammar" | "vocabulary")[];
  totalChallenges: number;
  correctCount: number;
  xpEarned: number;
  score: number;
  completedAt: string;
}

export async function saveGameSession(session: GameSessionRecord): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(GAME_SESSION_STORE, "readwrite");
  transaction.objectStore(GAME_SESSION_STORE).put(session);
  await transactionDone(transaction);
  announceProgressUpdate();
}

export async function getGameSessions(): Promise<GameSessionRecord[]> {
  const database = await openDatabase();
  const transaction = database.transaction(GAME_SESSION_STORE, "readonly");
  const result = (await requestResult(
    transaction.objectStore(GAME_SESSION_STORE).getAll(),
  )) as GameSessionRecord[];
  await transactionDone(transaction);
  return result;
}

export async function getProgressSnapshot(): Promise<ProgressSnapshot> {
  const database = await openDatabase();
  const transaction = database.transaction([QUESTION_STORE, SESSION_STORE], "readonly");
  const questionsRequest = transaction.objectStore(QUESTION_STORE).getAll();
  const sessionsRequest = transaction.objectStore(SESSION_STORE).getAll();
  const [questions, sessions] = await Promise.all([
    requestResult(questionsRequest) as Promise<QuestionProgress[]>,
    requestResult(sessionsRequest) as Promise<CompletedSessionProgress[]>,
    transactionDone(transaction),
  ]);

  return { questions, sessions };
}

export function summarizeProgress(snapshot: ProgressSnapshot): ProgressSummary {
  const totalAnswers = snapshot.questions.reduce((sum, item) => sum + item.timesSeen, 0);
  const correctAnswers = snapshot.questions.reduce((sum, item) => sum + item.correctCount, 0);
  const completedSessions = snapshot.sessions.length;
  const lastSessionActivity = snapshot.sessions.reduce<string | null>(
    (latest, item) => (!latest || item.completedAt > latest ? item.completedAt : latest),
    null,
  );

  return {
    uniqueQuestions: snapshot.questions.length,
    totalQuestions: 130,
    totalAnswers,
    correctAnswers,
    accuracy: totalAnswers ? Math.round((correctAnswers / totalAnswers) * 100) : null,
    completedSessions,
    bestStreak: snapshot.sessions.reduce(
      (best, session) => Math.max(best, session.bestStreak),
      0,
    ),
    bestResult: completedSessions
      ? snapshot.sessions.reduce(
          (best, session) => Math.max(best, session.percentage),
          0,
        )
      : null,
    lastActivity: lastSessionActivity,
    reviewCount: snapshot.questions.filter((item) => !item.lastResult).length,
    easyPracticed: snapshot.questions.filter((item) => item.difficulty === "easy").length,
    mediumPracticed: snapshot.questions.filter((item) => item.difficulty === "medium").length,
    easyReviewCount: snapshot.questions.filter(
      (item) => item.difficulty === "easy" && !item.lastResult,
    ).length,
    mediumReviewCount: snapshot.questions.filter(
      (item) => item.difficulty === "medium" && !item.lastResult,
    ).length,
  };
}

export async function getProgressSummary(): Promise<ProgressSummary> {
  return summarizeProgress(await getProgressSnapshot());
}

export async function clearLocalProgress(): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(
    [QUESTION_STORE, SESSION_STORE, GAME_SESSION_STORE],
    "readwrite",
  );
  transaction.objectStore(QUESTION_STORE).clear();
  transaction.objectStore(SESSION_STORE).clear();
  transaction.objectStore(GAME_SESSION_STORE).clear();
  await transactionDone(transaction);
  announceProgressUpdate();
}
