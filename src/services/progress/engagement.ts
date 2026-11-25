import {
  ENGAGEMENT_STORE,
  GAME_SESSION_STORE,
  getProgressDatabase,
  getProgressSnapshot,
  PROGRESS_UPDATED_EVENT,
} from "./localProgress";
import { summarizeGrammarCourseProgress } from "./grammarCourseProgress";
import {
  enqueueLeaderboardSync,
  type RemoteUserState,
} from "../firebase/leaderboardSync";

const ENGAGEMENT_KEY = "local-player";
let mutationQueue: Promise<void> = Promise.resolve();
export const ENGAGEMENT_UPDATED_EVENT = "ingles-em-jogo-engagement-updated";
export const ENGAGEMENT_SCHEMA_VERSION = 1;

export type AvatarId =
  | "fox"
  | "owl"
  | "lion"
  | "panda"
  | "koala"
  | "tiger"
  | "dolphin"
  | "eagle"
  | "cat"
  | "dog"
  | "rocket"
  | "star";

export const PRESET_AVATARS: { id: AvatarId; emoji: string; label: string }[] = [
  { id: "fox", emoji: "🦊", label: "Raposa" },
  { id: "owl", emoji: "🦉", label: "Coruja" },
  { id: "lion", emoji: "🦁", label: "Leão" },
  { id: "panda", emoji: "🐼", label: "Panda" },
  { id: "koala", emoji: "🐨", label: "Coala" },
  { id: "tiger", emoji: "🐯", label: "Tigre" },
  { id: "dolphin", emoji: "🐬", label: "Golfinho" },
  { id: "eagle", emoji: "🦅", label: "Águia" },
  { id: "cat", emoji: "🐱", label: "Gato" },
  { id: "dog", emoji: "🐶", label: "Cachorro" },
  { id: "rocket", emoji: "🚀", label: "Foguete" },
  { id: "star", emoji: "⭐", label: "Estrela" },
];

export const ALLOWED_AVATAR_IDS = new Set<string>(
  PRESET_AVATARS.map((item) => item.id),
);

export const ALLOWED_AVATAR_TONES = new Set<string>([
  "cyan",
  "wine",
  "violet",
  "green",
  "orange",
]);

export function sanitizeAvatarTone(avatarTone?: string): string {
  return avatarTone && ALLOWED_AVATAR_TONES.has(avatarTone)
    ? avatarTone
    : "cyan";
}

export function getAvatarEmoji(avatarId?: string): string {
  return (
    PRESET_AVATARS.find((item) => item.id === avatarId)?.emoji ??
    PRESET_AVATARS[0].emoji
  );
}

export interface LocalPlayerProfile {
  displayName: string;
  avatarInitial: string;
  avatarId: AvatarId;
  avatarTone: string;
}

export interface DailyMission {
  date: string;
  grammarAnswers: number;
  grammarSessionCompleted: boolean;
  vocabularyCardsRevealed: string[];
  gameGrammarCompleted: boolean;
  gameVocabularyCompleted: boolean;
  gameValidChallengesResolved: number;
  completed: boolean;
  bonusGranted: boolean;
}

export interface AchievementState {
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

export type AchievementId =
  | "first-step"
  | "sharp-aim"
  | "full-week"
  | "explorer"
  | "visual-vocabulary"
  | "no-stumble";

export interface LeagueParticipant {
  id: string;
  name: string;
  initial: string;
  avatarId: AvatarId;
  tone: string;
  baseXp: number;
}

export interface EngagementState {
  schemaVersion: number;
  migrationVersion: number;
  totalXp: number;
  weeklyXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string;
  activeDates: string[];
  weeklyActivity: Record<string, number>;
  dailyMission: DailyMission;
  achievements: Record<AchievementId, AchievementState>;
  league: {
    weekKey: string;
    simulatedParticipants: LeagueParticipant[];
  };
  processedEvents: Record<string, true>;
}

interface EngagementRecord {
  key: typeof ENGAGEMENT_KEY;
  profile: LocalPlayerProfile;
  state: EngagementState;
}

export interface EngagementSnapshot {
  profile: LocalPlayerProfile;
  state: EngagementState;
}

export interface LeagueStanding {
  id: string;
  name: string;
  initial: string;
  avatarId: AvatarId;
  tone: string;
  xp: number;
  isPlayer: boolean;
  isBot?: boolean;
}

export interface LevelSummary {
  level: number;
  title: string;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number;
}

const PARTICIPANTS: LeagueParticipant[] = [
  { id: "lucas", name: "Lucas", initial: "L", avatarId: "lion", tone: "gold", baseXp: 460 },
  { id: "marina", name: "Marina", initial: "M", avatarId: "owl", tone: "cyan", baseXp: 420 },
  { id: "ana", name: "Ana", initial: "A", avatarId: "cat", tone: "blue", baseXp: 390 },
  { id: "rafael", name: "Rafael", initial: "R", avatarId: "eagle", tone: "violet", baseXp: 350 },
  { id: "camila", name: "Camila", initial: "C", avatarId: "panda", tone: "wine", baseXp: 320 },
  { id: "bruno", name: "Bruno", initial: "B", avatarId: "tiger", tone: "orange", baseXp: 285 },
  { id: "sofia", name: "Sofia", initial: "S", avatarId: "dolphin", tone: "green", baseXp: 250 },
  { id: "diego", name: "Diego", initial: "D", avatarId: "dog", tone: "blue", baseXp: 215 },
  { id: "helena", name: "Helena", initial: "H", avatarId: "koala", tone: "cyan", baseXp: 180 },
  { id: "caio", name: "Caio", initial: "C", avatarId: "rocket", tone: "orange", baseXp: 145 },
];

const DEFAULT_PROFILE: LocalPlayerProfile = {
  displayName: "Jogador",
  avatarInitial: "J",
  avatarId: "fox",
  avatarTone: "cyan",
};

function localDate(value = new Date()): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWeekKey(value = new Date()): string {
  const date = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const weekday = date.getDay() || 7;
  date.setDate(date.getDate() - weekday + 1);
  return localDate(date);
}

function emptyAchievements(): Record<AchievementId, AchievementState> {
  return {
    "first-step": { unlocked: false, progress: 0 },
    "sharp-aim": { unlocked: false, progress: 0 },
    "full-week": { unlocked: false, progress: 0 },
    explorer: { unlocked: false, progress: 0 },
    "visual-vocabulary": { unlocked: false, progress: 0 },
    "no-stumble": { unlocked: false, progress: 0 },
  };
}

function newMission(date = localDate()): DailyMission {
  return {
    date,
    grammarAnswers: 0,
    grammarSessionCompleted: false,
    vocabularyCardsRevealed: [],
    gameGrammarCompleted: false,
    gameVocabularyCompleted: false,
    gameValidChallengesResolved: 0,
    completed: false,
    bonusGranted: false,
  };
}

function newState(now = new Date()): EngagementState {
  return {
    schemaVersion: ENGAGEMENT_SCHEMA_VERSION,
    migrationVersion: 0,
    totalXp: 0,
    weeklyXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    activeDates: [],
    weeklyActivity: {},
    dailyMission: newMission(localDate(now)),
    achievements: emptyAchievements(),
    league: {
      weekKey: getWeekKey(now),
      simulatedParticipants: PARTICIPANTS,
    },
    processedEvents: {},
  };
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Falha ao acessar o engajamento local."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Falha ao salvar o engajamento local."));
    transaction.onabort = transaction.onerror;
  });
}

function normalizeRecord(record: EngagementRecord, now = new Date()): EngagementRecord {
  const today = localDate(now);
  const weekKey = getWeekKey(now);
  const safeAvatarId: AvatarId = ALLOWED_AVATAR_IDS.has(record.profile?.avatarId)
    ? record.profile.avatarId
    : "fox";
  const safeAvatarTone = sanitizeAvatarTone(record.profile?.avatarTone);
  if (
    !record.profile ||
    record.profile.avatarId !== safeAvatarId ||
    record.profile.avatarTone !== safeAvatarTone
  ) {
    record.profile = {
      ...DEFAULT_PROFILE,
      ...record.profile,
      avatarId: safeAvatarId,
      avatarTone: safeAvatarTone,
    };
  }
  const state = record.state;
  if (state.dailyMission.date !== today) state.dailyMission = newMission(today);
  state.dailyMission.gameGrammarCompleted ??= false;
  state.dailyMission.gameVocabularyCompleted ??= false;
  state.dailyMission.gameValidChallengesResolved ??= 0;
  if (state.league.weekKey !== weekKey) {
    state.weeklyXp = 0;
    state.league = { weekKey, simulatedParticipants: PARTICIPANTS };
  }
  state.league.simulatedParticipants = state.league.simulatedParticipants.map(
    (participant, idx) => ({
      ...participant,
      avatarId: ALLOWED_AVATAR_IDS.has(participant.avatarId)
        ? participant.avatarId
        : PARTICIPANTS[idx % PARTICIPANTS.length].avatarId,
    }),
  );
  state.schemaVersion = ENGAGEMENT_SCHEMA_VERSION;
  state.processedEvents ??= {};
  state.weeklyActivity ??= {};
  state.activeDates ??= [];
  state.achievements = { ...emptyAchievements(), ...state.achievements };
  return record;
}

function unlock(
  state: EngagementState,
  id: AchievementId,
  progress: number,
  target: number,
  at: string,
) {
  const achievement = state.achievements[id];
  achievement.progress = Math.max(
    achievement.progress,
    Math.min(progress, target),
  );
  if (!achievement.unlocked && progress >= target) {
    achievement.unlocked = true;
    achievement.unlockedAt = at;
  }
}

function updateDerivedAchievements(
  state: EngagementState,
  at: string,
  values: {
    sessions?: number;
    accuracy?: number;
    uniqueQuestions?: number;
    bestAnswerStreak?: number;
    vocabularyCompleted?: boolean;
  },
) {
  if (values.sessions !== undefined) unlock(state, "first-step", values.sessions, 1, at);
  if (values.accuracy !== undefined) unlock(state, "sharp-aim", values.accuracy, 80, at);
  unlock(state, "full-week", state.longestStreak, 7, at);
  if (values.uniqueQuestions !== undefined) {
    unlock(state, "explorer", values.uniqueQuestions, 50, at);
  }
  if (values.bestAnswerStreak !== undefined) {
    unlock(state, "no-stumble", values.bestAnswerStreak, 10, at);
  }
  if (values.vocabularyCompleted) unlock(state, "visual-vocabulary", 24, 24, at);
}

function grantXp(state: EngagementState, amount: number, date: string) {
  state.totalXp += amount;
  if (getWeekKey(new Date(`${date}T12:00:00`)) === state.league.weekKey) {
    state.weeklyXp += amount;
  }
  state.weeklyActivity[date] = (state.weeklyActivity[date] ?? 0) + amount;
}

function completeMissionIfReady(state: EngagementState, date: string) {
  const mission = state.dailyMission;
  const challengesDone = mission.gameValidChallengesResolved >= 10;
  const grammarDone =
    (mission.grammarAnswers >= 5 && mission.grammarSessionCompleted) ||
    mission.gameGrammarCompleted;
  const vocabularyDone =
    mission.vocabularyCardsRevealed.length >= 5 || mission.gameVocabularyCompleted;
  mission.completed = challengesDone && grammarDone && vocabularyDone;
  if (mission.completed && !mission.bonusGranted) {
    mission.bonusGranted = true;
    grantXp(state, 80, date);
  }
}

function dayDifference(previous: string, current: string): number {
  const left = new Date(`${previous}T12:00:00`);
  const right = new Date(`${current}T12:00:00`);
  return Math.round((right.getTime() - left.getTime()) / 86_400_000);
}

function recordActiveDay(state: EngagementState, date: string) {
  if (state.activeDates.includes(date)) return;
  state.activeDates.push(date);
  state.activeDates.sort();
  if (!state.lastActiveDate) {
    state.currentStreak = 1;
  } else {
    const difference = dayDifference(state.lastActiveDate, date);
    if (difference === 1) state.currentStreak += 1;
    else if (difference > 1) state.currentStreak = 1;
    else return;
  }
  state.lastActiveDate = date;
  state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
}

async function migrate(record: EngagementRecord): Promise<EngagementRecord> {
  if (record.state.migrationVersion >= ENGAGEMENT_SCHEMA_VERSION) return record;
  const snapshot = await getProgressSnapshot();
  const at = new Date().toISOString();
  const totalCorrect = snapshot.questions.reduce((sum, item) => sum + item.correctCount, 0);
  const totalWrong = snapshot.questions.reduce((sum, item) => sum + item.wrongCount, 0);
  record.state.totalXp = totalCorrect * 10 + totalWrong * 2 + snapshot.sessions.length * 20;

  const dates = snapshot.sessions
    .map((session) => localDate(new Date(session.completedAt)))
    .filter((date, index, values) => values.indexOf(date) === index)
    .sort();
  dates.forEach((date) => recordActiveDay(record.state, date));

  const currentWeek = record.state.league.weekKey;
  record.state.weeklyXp = snapshot.sessions
    .filter((session) => getWeekKey(new Date(session.completedAt)) === currentWeek)
    .length * 20;
  for (const question of snapshot.questions) {
    if (getWeekKey(new Date(question.lastSeenAt)) === currentWeek) {
      record.state.weeklyXp += question.correctCount * 10 + question.wrongCount * 2;
    }
  }
  updateDerivedAchievements(record.state, at, {
    sessions: snapshot.sessions.length,
    accuracy: snapshot.sessions.reduce(
      (best, session) => Math.max(best, session.percentage),
      0,
    ),
    uniqueQuestions: snapshot.questions.length,
    bestAnswerStreak: snapshot.sessions.reduce(
      (best, session) => Math.max(best, session.bestStreak),
      0,
    ),
  });
  record.state.migrationVersion = ENGAGEMENT_SCHEMA_VERSION;
  return record;
}

async function readRecord(): Promise<EngagementRecord> {
  const database = await getProgressDatabase();
  const transaction = database.transaction(ENGAGEMENT_STORE, "readonly");
  const existing = (await requestResult(
    transaction.objectStore(ENGAGEMENT_STORE).get(ENGAGEMENT_KEY),
  )) as EngagementRecord | undefined;
  await transactionDone(transaction);
  let record = normalizeRecord(
    existing ?? { key: ENGAGEMENT_KEY, profile: DEFAULT_PROFILE, state: newState() },
  );
  if (record.state.migrationVersion < ENGAGEMENT_SCHEMA_VERSION) {
    record = await migrate(record);
    await writeRecord(record, false);
  }
  return record;
}

async function writeRecord(record: EngagementRecord, announce = true): Promise<void> {
  const database = await getProgressDatabase();
  const transaction = database.transaction(ENGAGEMENT_STORE, "readwrite");
  transaction.objectStore(ENGAGEMENT_STORE).put(record);
  await transactionDone(transaction);
  if (announce) {
    window.dispatchEvent(new CustomEvent(ENGAGEMENT_UPDATED_EVENT));
    window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
  }
}

function mutate(
  mutation: (record: EngagementRecord) => void | Promise<void>,
): Promise<EngagementSnapshot> {
  const operation = mutationQueue.then(async () => {
    const record = await readRecord();
    await mutation(record);
    await writeRecord(record);
    return { profile: record.profile, state: record.state };
  });
  mutationQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

export async function getEngagementSnapshot(): Promise<EngagementSnapshot> {
  const record = await readRecord();
  return { profile: record.profile, state: record.state };
}

export async function updateLocalProfile(
  displayName: string,
  avatarTone: string,
  avatarId?: AvatarId,
): Promise<EngagementSnapshot> {
  const snapshot = await mutate((record) => {
    const cleanName = displayName.trim().slice(0, 28) || "Jogador";
    const nextAvatarId =
      avatarId && ALLOWED_AVATAR_IDS.has(avatarId)
        ? avatarId
        : record.profile.avatarId;
    record.profile = {
      displayName: cleanName,
      avatarInitial: cleanName.charAt(0).toLocaleUpperCase("pt-BR"),
      avatarId: nextAvatarId,
      avatarTone: sanitizeAvatarTone(avatarTone),
    };
  });
  void enqueueLeaderboardSync(snapshot);
  return snapshot;
}

export async function mergeRemoteUserState(
  remote: RemoteUserState,
): Promise<EngagementSnapshot> {
  return mutate((record) => {
    const currentWeek = record.state.league.weekKey;
    const isDefaultName = record.profile.displayName === DEFAULT_PROFILE.displayName;
    if (isDefaultName && remote.displayName && remote.displayName !== "Jogador") {
      record.profile = {
        displayName: remote.displayName.slice(0, 28),
        avatarInitial: remote.displayName.charAt(0).toLocaleUpperCase("pt-BR"),
        avatarId: ALLOWED_AVATAR_IDS.has(remote.avatarId)
          ? remote.avatarId
          : record.profile.avatarId,
        avatarTone: sanitizeAvatarTone(remote.avatarTone || record.profile.avatarTone),
      };
    }
    record.state.totalXp = Math.max(record.state.totalXp, remote.totalXp);
    if (remote.weekKey === currentWeek) {
      record.state.weeklyXp = Math.max(record.state.weeklyXp, remote.weeklyXp);
    }
    for (const eventId of remote.processedEventIds) {
      record.state.processedEvents[eventId] = true;
    }
  });
}

export async function recordGrammarAnswerEngagement(
  eventId: string,
  correct: boolean,
  answeredAt = new Date(),
): Promise<EngagementSnapshot> {
  let deltaXp = 0;
  const snapshot = await mutate((record) => {
    const state = record.state;
    if (state.processedEvents[eventId]) return;
    const beforeXp = state.totalXp;
    state.processedEvents[eventId] = true;
    const date = localDate(answeredAt);
    if (state.dailyMission.date !== date) state.dailyMission = newMission(date);
    grantXp(state, correct ? 10 : 2, date);
    state.dailyMission.grammarAnswers += 1;
    completeMissionIfReady(state, date);
    deltaXp = state.totalXp - beforeXp;
  });
  if (deltaXp > 0) {
    void enqueueLeaderboardSync(snapshot, { eventId, deltaXp });
  }
  return snapshot;
}

export async function recordGrammarSessionEngagement(
  sessionId: string,
  percentage: number,
  bestAnswerStreak: number,
  completedAt = new Date(),
): Promise<EngagementSnapshot> {
  const eventId = `grammar-session:${sessionId}`;
  let deltaXp = 0;
  const snapshot = await mutate(async (record) => {
    const state = record.state;
    if (state.processedEvents[eventId]) return;
    const beforeXp = state.totalXp;
    const legacyProgress = await getProgressSnapshot();
    const uniqueQuestions = legacyProgress.questions.length
      + summarizeGrammarCourseProgress().uniqueQuestions;
    state.processedEvents[eventId] = true;
    const date = localDate(completedAt);
    if (state.dailyMission.date !== date) state.dailyMission = newMission(date);
    grantXp(state, 20, date);
    state.dailyMission.grammarSessionCompleted = true;
    recordActiveDay(state, date);
    completeMissionIfReady(state, date);
    updateDerivedAchievements(state, completedAt.toISOString(), {
      sessions: 1,
      accuracy: percentage,
      uniqueQuestions,
      bestAnswerStreak,
    });
    deltaXp = state.totalXp - beforeXp;
  });
  if (deltaXp > 0) {
    void enqueueLeaderboardSync(snapshot, { eventId, deltaXp });
  }
  return snapshot;
}

export async function recordFlashcardReveal(
  cardId: string,
  revealedAt = new Date(),
): Promise<EngagementSnapshot> {
  const date = localDate(revealedAt);
  const eventId = `flashcard:${date}:${cardId}`;
  let deltaXp = 0;
  const snapshot = await mutate((record) => {
    const state = record.state;
    if (state.processedEvents[eventId]) return;
    const beforeXp = state.totalXp;
    state.processedEvents[eventId] = true;
    if (state.dailyMission.date !== date) state.dailyMission = newMission(date);
    grantXp(state, 3, date);
    if (!state.dailyMission.vocabularyCardsRevealed.includes(cardId)) {
      state.dailyMission.vocabularyCardsRevealed.push(cardId);
    }
    if (state.dailyMission.vocabularyCardsRevealed.length >= 5) {
      recordActiveDay(state, date);
    }
    completeMissionIfReady(state, date);
    deltaXp = state.totalXp - beforeXp;
  });
  if (deltaXp > 0) {
    void enqueueLeaderboardSync(snapshot, { eventId, deltaXp });
  }
  return snapshot;
}

export async function recordFlashcardCompletion(
  completionId: string,
  revealedCount: number,
  completedAt = new Date(),
): Promise<EngagementSnapshot> {
  const eventId = `flashcard-completion:${completionId}`;
  let deltaXp = 0;
  const snapshot = await mutate((record) => {
    const state = record.state;
    if (state.processedEvents[eventId] || revealedCount < 24) return;
    const beforeXp = state.totalXp;
    state.processedEvents[eventId] = true;
    grantXp(state, 25, localDate(completedAt));
    updateDerivedAchievements(state, completedAt.toISOString(), {
      vocabularyCompleted: true,
    });
    deltaXp = state.totalXp - beforeXp;
  });
  if (deltaXp > 0) {
    void enqueueLeaderboardSync(snapshot, { eventId, deltaXp });
  }
  return snapshot;
}

/**
 * Grants game XP and updates the daily mission/streak only when the round
 * is finalized. Idempotent via `sessionId`: replay, refresh, or repeated
 * persistence of the same completed round never grants XP twice.
 */
export async function recordGameRoundEngagement(
  sessionId: string,
  contentDomain: "grammar" | "vocabulary",
  xpEarned: number,
  totalChallenges: number,
  completedAt = new Date(),
): Promise<EngagementSnapshot> {
  const eventId = `game-round:${sessionId}`;
  let deltaXp = 0;
  const snapshot = await mutate((record) => {
    const state = record.state;
    if (state.processedEvents[eventId]) return;
    const beforeXp = state.totalXp;
    state.processedEvents[eventId] = true;
    const date = localDate(completedAt);
    if (state.dailyMission.date !== date) state.dailyMission = newMission(date);
    grantXp(state, xpEarned, date);
    state.dailyMission.gameValidChallengesResolved += totalChallenges;
    if (contentDomain === "grammar") state.dailyMission.gameGrammarCompleted = true;
    if (contentDomain === "vocabulary") state.dailyMission.gameVocabularyCompleted = true;
    if (totalChallenges >= 5) recordActiveDay(state, date);
    completeMissionIfReady(state, date);
    deltaXp = state.totalXp - beforeXp;
  });
  if (deltaXp > 0) {
    void enqueueLeaderboardSync(snapshot, { eventId, deltaXp });
  }
  return snapshot;
}

export function getLevelSummary(totalXp: number): LevelSummary {
  const level = Math.floor(totalXp / 250) + 1;
  const title =
    level <= 3
      ? "Iniciante"
      : level <= 7
        ? "Explorador"
        : level <= 12
          ? "Desbravador"
          : level <= 19
            ? "Estrategista"
            : "Mestre de Jogo";
  const xpIntoLevel = totalXp % 250;
  return {
    level,
    title,
    xpIntoLevel,
    xpForNextLevel: 250,
    progress: Math.round((xpIntoLevel / 250) * 100),
  };
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getLeagueStandings(
  snapshot: EngagementSnapshot,
  now = new Date(),
): LeagueStanding[] {
  const elapsedDays = Math.max(
    0,
    Math.min(6, dayDifference(snapshot.state.league.weekKey, localDate(now))),
  );
  const simulated: LeagueStanding[] = snapshot.state.league.simulatedParticipants.map((participant) => {
    const variance = stableHash(`${snapshot.state.league.weekKey}:${participant.id}`) % 91;
    const dailyGrowth =
      (stableHash(`${participant.id}:${localDate(now)}`) % 35) + 22;
    return {
      id: participant.id,
      name: participant.name,
      initial: participant.initial,
      avatarId: participant.avatarId,
      tone: participant.tone,
      xp: participant.baseXp + variance + elapsedDays * dailyGrowth,
      isPlayer: false,
      isBot: true,
    };
  });
  simulated.push({
    id: "local-player",
    name: snapshot.profile.displayName,
    initial: snapshot.profile.avatarInitial,
    avatarId: snapshot.profile.avatarId,
    tone: snapshot.profile.avatarTone,
    xp: snapshot.state.weeklyXp,
    isPlayer: true,
    isBot: false,
  });
  return simulated.sort((left, right) => right.xp - left.xp || left.name.localeCompare(right.name));
}

export function getWeeklyGoal(snapshot: EngagementSnapshot): {
  activeDays: number;
  percentage: number;
} {
  const weekKey = snapshot.state.league.weekKey;
  const activeDays = snapshot.state.activeDates.filter(
    (date) => getWeekKey(new Date(`${date}T12:00:00`)) === weekKey,
  ).length;
  return { activeDays, percentage: Math.min(100, Math.round((activeDays / 5) * 100)) };
}

export function getWeekRemaining(now = new Date()): string {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const weekday = now.getDay() || 7;
  end.setDate(end.getDate() + (7 - weekday));
  const remaining = Math.max(0, end.getTime() - now.getTime());
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  return `${days}d ${hours}h restantes`;
}

export async function resetAllLocalData(): Promise<void> {
  const database = await getProgressDatabase();
  const transaction = database.transaction(
    ["questions", "sessions", ENGAGEMENT_STORE, GAME_SESSION_STORE],
    "readwrite",
  );
  transaction.objectStore("questions").clear();
  transaction.objectStore("sessions").clear();
  transaction.objectStore(ENGAGEMENT_STORE).clear();
  transaction.objectStore(GAME_SESSION_STORE).clear();
  await transactionDone(transaction);
  try { localStorage.removeItem("speakup-past-v1"); } catch { /* Storage can be disabled independently of IndexedDB. */ }
  window.dispatchEvent(new CustomEvent("past-progress"));
  window.dispatchEvent(new CustomEvent(ENGAGEMENT_UPDATED_EVENT));
  window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
}

