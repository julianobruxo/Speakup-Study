import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppDialog from "../components/AppDialog";
import AppIcon from "../components/AppIcon";
import PresentTobeStudyDialog from "../components/PresentTobeStudyDialog";
import Toast from "../components/Toast";
import { AppShell } from "../components/AppShell";
import { PRESENT_TOBE_QUESTIONS } from "../content/data/presentTobeQuestions";
import type {
  GrammarPracticeQuestion,
  MvpGrammarDifficulty,
} from "../content/model/content";
import {
  isSoundEnabled,
  playSound,
  setSoundEnabled,
} from "../services/audio/sound";
import {
  selectPracticeQuestions,
  shuffleOptions,
} from "../services/sessions/selectPracticeQuestions";
import {
  getProgressSnapshot,
  getProgressSummary,
  recordQuestionAnswer,
  saveCompletedSession,
} from "../services/progress/localProgress";
import {
  recordGrammarAnswerEngagement,
  recordGrammarSessionEngagement,
} from "../services/progress/engagement";
import "../styles/activities.css";

const CORRECT_TRANSITION_MS = 2000;

export default function PracticeSessionPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reduceMotion = useReducedMotion();
  const difficulty = parseDifficulty(params.get("difficulty"));
  const count = parseCount(params.get("count"));
  const seed = Number(params.get("seed")) || 1;
  const includeOptionalChallenge = params.get("challenge") === "1";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showExit, setShowExit] = useState(false);
  const [showStudy, setShowStudy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sound, setSound] = useState(isSoundEnabled);
  const [questions, setQuestions] = useState<GrammarPracticeQuestion[] | null>(
    null,
  );
  const [savedQuestionCount, setSavedQuestionCount] = useState<number | null>(
    null,
  );
  const [storageWarning, setStorageWarning] = useState("");
  const feedbackRef = useRef<HTMLDivElement>(null);
  const historyActionRef = useRef<(() => void) | null>(null);
  const studyTriggerRef = useRef<HTMLButtonElement>(null);
  const answerWritesRef = useRef<Promise<void>[]>([]);
  const recordedQuestionsRef = useRef(new Set<string>());
  const sessionSavedRef = useRef(false);
  const sessionIdRef = useRef(crypto.randomUUID());

  useEffect(() => {
    let active = true;
    setQuestions(null);
    getProgressSnapshot()
      .then((snapshot) => {
        if (!active) return;
        setQuestions(
          selectPracticeQuestions(
            PRESENT_TOBE_QUESTIONS,
            difficulty,
            count,
            seed,
            snapshot.questions,
            includeOptionalChallenge,
          ),
        );
      })
      .catch(() => {
        if (!active) return;
        setStorageWarning(
          "O progresso local não pôde ser carregado. A rodada continua normalmente.",
        );
        setQuestions(
          selectPracticeQuestions(
            PRESENT_TOBE_QUESTIONS,
            difficulty,
            count,
            seed,
            [],
            includeOptionalChallenge,
          ),
        );
      });
    return () => {
      active = false;
    };
  }, [count, difficulty, includeOptionalChallenge, seed]);

  const currentQuestion = questions?.[currentIndex];
  const options = useMemo(
    () =>
      currentQuestion
        ? shuffleOptions(currentQuestion.options, seed + currentIndex * 97)
        : [],
    [currentIndex, currentQuestion, seed],
  );
  const isCorrect =
    confirmed && selectedOption === currentQuestion?.correctAnswer;
  const progress = questions
    ? ((currentIndex + (confirmed ? 1 : 0)) / questions.length) * 100
    : 0;

  useEffect(() => {
    if (finished) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = true;
    };
    const handlePopState = () => {
      const pendingAction = historyActionRef.current;
      if (pendingAction) {
        historyActionRef.current = null;
        pendingAction();
        return;
      }
      window.history.pushState(
        { ...window.history.state, practiceGuard: true },
        "",
        window.location.href,
      );
      setShowExit(true);
    };
    if (!window.history.state?.practiceGuard) {
      window.history.replaceState(
        { ...window.history.state, practiceBase: true },
        "",
        window.location.href,
      );
      window.history.pushState(
        { ...window.history.state, practiceGuard: true },
        "",
        window.location.href,
      );
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [finished]);

  useEffect(() => {
    if (!confirmed) return;
    feedbackRef.current?.focus();
  }, [confirmed, currentIndex]);

  useEffect(() => {
    if (!isCorrect || finished || showExit || !questions) return;

    const timer = window.setTimeout(async () => {
      await Promise.allSettled(answerWritesRef.current);
      if (currentIndex === questions.length - 1) {
        historyActionRef.current = () => {
          setFinished(true);
          setSessionCompleted(true);
          playSound("complete");
        };
        window.history.back();
        return;
      }

      setCurrentIndex((index) => index + 1);
      setSelectedOption(null);
      setConfirmed(false);
    }, CORRECT_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [currentIndex, finished, isCorrect, questions, showExit]);

  useEffect(() => {
    if (!sessionCompleted || !questions || sessionSavedRef.current) return;
    sessionSavedRef.current = true;

    const persistSession = async () => {
      await Promise.allSettled(answerWritesRef.current);
      const correctCount = answers.filter(Boolean).length;
      try {
        await saveCompletedSession({
          sessionId: sessionIdRef.current,
          topicId: "present_tobe",
          difficulty,
          questionCount: questions.length,
          correctCount,
          wrongCount: questions.length - correctCount,
          percentage: Math.round((correctCount / questions.length) * 100),
          bestStreak,
          completedAt: new Date().toISOString(),
        });
        const progressSummary = await getProgressSummary();
        await recordGrammarSessionEngagement(
          sessionIdRef.current,
          Math.round((correctCount / questions.length) * 100),
          bestStreak,
        );
        setSavedQuestionCount(progressSummary.uniqueQuestions);
      } catch {
        setStorageWarning(
          "Não foi possível salvar todo o progresso desta rodada. Seus resultados continuam disponíveis nesta tela.",
        );
      }
    };

    void persistSession();
  }, [answers, bestStreak, difficulty, questions, sessionCompleted]);

  function chooseOption(option: string) {
    if (confirmed) return;
    setSelectedOption(option);
    playSound("select");
  }

  function confirmAnswer() {
    if (!selectedOption || confirmed || !currentQuestion) return;
    const correct = selectedOption === currentQuestion.correctAnswer;
    const nextStreak = correct ? streak + 1 : 0;
    setConfirmed(true);
    setAnswers((current) => [...current, correct]);
    setStreak(nextStreak);
    setBestStreak((current) => Math.max(current, nextStreak));
    playSound(correct ? "correct" : "wrong");

    if (!recordedQuestionsRef.current.has(currentQuestion.id)) {
      recordedQuestionsRef.current.add(currentQuestion.id);
      const write = recordQuestionAnswer({
        questionId: currentQuestion.id,
        topicId: currentQuestion.topicId,
        difficulty: currentQuestion.difficulty,
        correct,
        answeredAt: new Date().toISOString(),
      })
        .then(() =>
          recordGrammarAnswerEngagement(
            `grammar-answer:${sessionIdRef.current}:${currentQuestion.id}`,
            correct,
          ),
        )
        .then(() => undefined)
        .catch(() => {
          setStorageWarning(
            "Esta resposta não pôde ser salva no dispositivo. A rodada continua normalmente.",
          );
        });
      answerWritesRef.current.push(write);
    }
  }

  function advanceIncorrect() {
    if (!confirmed || isCorrect || !questions) return;
    if (currentIndex === questions.length - 1) {
      historyActionRef.current = () => {
        setFinished(true);
        setSessionCompleted(true);
        playSound("complete");
      };
      window.history.back();
      return;
    }
    setCurrentIndex((index) => index + 1);
    setSelectedOption(null);
    setConfirmed(false);
  }

  function leaveSession(destination: string) {
    setShowExit(false);
    setShowStudy(false);
    historyActionRef.current = () => {
      setFinished(true);
      navigate(destination, { replace: true });
    };
    window.history.back();
  }

  function restart() {
    setCurrentIndex(0);
    setSelectedOption(null);
    setConfirmed(false);
    setAnswers([]);
    setStreak(0);
    setBestStreak(0);
    setShowExit(false);
    setShowStudy(false);
    setFinished(false);
    setSessionCompleted(false);
    setSavedQuestionCount(null);
    setQuestions(null);
    answerWritesRef.current = [];
    recordedQuestionsRef.current = new Set();
    sessionSavedRef.current = false;
    sessionIdRef.current = crypto.randomUUID();
    const nextParams = new URLSearchParams({
      difficulty,
      count: String(count),
      seed: String(Date.now()),
    });
    if (difficulty === "medium" && includeOptionalChallenge) {
      nextParams.set("challenge", "1");
    }
    navigate(`/praticar/present_tobe/sessao?${nextParams.toString()}`, {
      replace: true,
    });
  }

  function toggleSound() {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
    if (next) playSound("select");
  }

  function openStudy(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!confirmed || isCorrect) return;
    setShowStudy(true);
  }

  if (!questions || !currentQuestion) {
    return (
      <AppShell className="session-page" hideNavigation>
        <header className="fc-topbar">
          <button
            aria-label="Voltar"
            className="icon-btn-minimal"
            onClick={() => navigate("/gramatica/present_tobe", { replace: true })}
            type="button"
          >
            <AppIcon name="close" size={20} strokeWidth={1.8} />
          </button>
          <div className="fc-topbar__progress">
            <span className="fc-topbar__fill" style={{ width: "0%" }} />
          </div>
          <span className="fc-counter-pill">...</span>
        </header>
        <div className="practice-session-body" style={{ justifyContent: "center" }}>
          <section className="empty-state" aria-live="polite">
            <AppIcon name="refresh" size={26} />
            <h2 className="empty-state__title">Preparando sua rodada...</h2>
          </section>
        </div>
        <Toast message={storageWarning} />
      </AppShell>
    );
  }

  if (finished) {
    return (
      <ResultScreen
        answers={answers}
        bestStreak={bestStreak}
        count={questions.length}
        difficulty={difficulty}
        onChange={() =>
          navigate("/gramatica/present_tobe", { replace: true })
        }
        onHome={() => navigate("/", { replace: true })}
        onRestart={restart}
        reduceMotion={Boolean(reduceMotion)}
        savedQuestionCount={savedQuestionCount}
        storageWarning={storageWarning}
        xpEarned={answers.reduce(
          (total, answer) => total + (answer ? 10 : 2),
          20,
        )}
      />
    );
  }

  return (
    <AppShell className="session-page" hideNavigation>
      <header className="fc-topbar">
        <button
          aria-label="Sair da sessão"
          className="icon-btn-minimal"
          onClick={() => setShowExit(true)}
          type="button"
        >
          <AppIcon name="close" size={20} strokeWidth={1.8} />
        </button>

        <div
          aria-label={`${Math.round(progress)}% da sessão concluída`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(progress)}
          className="fc-topbar__progress"
          role="progressbar"
        >
          <motion.span
            animate={{ width: `${progress}%` }}
            className="fc-topbar__fill"
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
          />
        </div>

        <button
          aria-label={sound ? "Desativar sons" : "Ativar sons"}
          className="icon-btn-minimal"
          onClick={toggleSound}
          type="button"
        >
          <AppIcon name={sound ? "volume" : "volume-off"} size={19} />
        </button>
      </header>

      <div className="practice-session-body">
        <div className="practice-session-meta">
          <span>
            {difficulty === "easy" ? "Fácil" : "Médio"} · Questão{" "}
            <strong className="tabular-nums">
              {currentIndex + 1} de {questions.length}
            </strong>
          </span>
          {streak > 1 ? (
            <span className="combo-pill">{streak} seguidos!</span>
          ) : (
            <span>Verbo TO BE</span>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.section
            animate={{ opacity: 1, x: 0 }}
            className="practice-question-card"
            exit={{ opacity: 0, x: reduceMotion ? 0 : -16 }}
            initial={{ opacity: 0, x: reduceMotion ? 0 : 16 }}
            key={currentQuestion.id}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span className="pill-tag pill-tag--blue" style={{ width: "fit-content" }}>
                Complete a frase
              </span>
              <h1>{currentQuestion.question}</h1>
            </div>

            <div
              className="practice-options-list"
              role="radiogroup"
              aria-label="Alternativas"
            >
              {options.map((option, index) => {
                const selected = selectedOption === option;
                const correct =
                  confirmed && option === currentQuestion.correctAnswer;
                const wrong = confirmed && selected && !correct;
                const dimmed = confirmed && !correct && !wrong;
                return (
                  <motion.button
                    aria-checked={selected}
                    className={[
                      "practice-option-btn",
                      selected ? "selected" : "",
                      correct ? "correct" : "",
                      wrong ? "wrong" : "",
                      dimmed ? "dimmed" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={confirmed}
                    key={option}
                    onClick={() => chooseOption(option)}
                    role="radio"
                    type="button"
                    whileTap={confirmed ? undefined : { scale: 0.99 }}
                  >
                    <span className="practice-option-btn__letter">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <strong>{option}</strong>
                    {correct && <AppIcon name="check" size={19} />}
                    {wrong && <AppIcon name="close" size={19} />}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {isCorrect && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  aria-label="Resposta correta. Próxima questão em 2 segundos."
                  aria-live="polite"
                  className="status-banner status-banner--success"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                  key="correct"
                  ref={feedbackRef}
                  role="status"
                  tabIndex={-1}
                >
                  <AppIcon name="check" size={20} />
                  <div style={{ flex: 1 }}>
                    <strong>Correto!</strong>
                    <div
                      aria-label="Avanço automático em 2 segundos"
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuetext="Próxima questão em 2 segundos"
                      className="correct-transition-bar"
                      role="progressbar"
                    >
                      <i key={currentQuestion.id} />
                    </div>
                  </div>
                </motion.div>
              )}

              {confirmed && !isCorrect && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  aria-live="polite"
                  className="status-banner status-banner--error"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                  key="wrong"
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest("button")) return;
                    advanceIncorrect();
                  }}
                  ref={feedbackRef}
                  role="status"
                  tabIndex={-1}
                  style={{ cursor: "pointer", alignItems: "flex-start" }}
                >
                  <AppIcon name="book" size={20} />
                  <div className="wrong-feedback-box">
                    <strong>
                      Resposta correta: {currentQuestion.correctAnswer}
                    </strong>
                    <p style={{ margin: 0 }}>{currentQuestion.feedback}</p>
                    <div className="wrong-feedback-footer">
                      <button
                        className="btn-pill-outline"
                        onClick={openStudy}
                        ref={studyTriggerRef}
                        style={{ minHeight: 36, padding: "0 14px", fontSize: "var(--text-xs)" }}
                        type="button"
                      >
                        <AppIcon name="book" size={15} />
                        <span>Estudar esse tópico</span>
                      </button>
                      <small>Toque no card para continuar</small>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isCorrect && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {!confirmed ? (
                  <button
                    className="btn-3d-primary"
                    disabled={!selectedOption}
                    onClick={confirmAnswer}
                    style={{ width: "100%" }}
                    type="button"
                  >
                    Confirmar resposta
                  </button>
                ) : (
                  <button
                    className="btn-3d-primary"
                    onClick={advanceIncorrect}
                    style={{ width: "100%" }}
                    type="button"
                  >
                    <span>
                      {currentIndex === questions.length - 1
                        ? "Ver resultado"
                        : "Continuar"}
                    </span>
                    <AppIcon name="chevron-right" size={18} />
                  </button>
                )}
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>

      {selectedOption && (
        <PresentTobeStudyDialog
          onClose={() => setShowStudy(false)}
          open={showStudy}
          question={currentQuestion}
          selectedAnswer={selectedOption}
          triggerRef={studyTriggerRef}
        />
      )}

      <AppDialog
        actions={
          <>
            <button
              className="btn-pill-outline"
              onClick={() => setShowExit(false)}
              type="button"
            >
              Continuar praticando
            </button>
            <button
              className="btn-danger-outline"
              onClick={() => leaveSession("/gramatica/present_tobe")}
              type="button"
            >
              Sair da sessão
            </button>
          </>
        }
        description="As respostas já confirmadas ficam salvas, mas uma rodada interrompida não entra no histórico de sessões."
        onClose={() => setShowExit(false)}
        open={showExit}
        title="Sair da sessão?"
      />
      <Toast message={storageWarning} />
    </AppShell>
  );
}

function ResultScreen({
  answers,
  bestStreak,
  count,
  difficulty,
  onChange,
  onHome,
  onRestart,
  reduceMotion,
  savedQuestionCount,
  storageWarning,
  xpEarned,
}: {
  answers: boolean[];
  bestStreak: number;
  count: number;
  difficulty: MvpGrammarDifficulty;
  onChange: () => void;
  onHome: () => void;
  onRestart: () => void;
  reduceMotion: boolean;
  savedQuestionCount: number | null;
  storageWarning: string;
  xpEarned: number;
}) {
  const correct = answers.filter(Boolean).length;
  const wrong = count - correct;
  const percentage = Math.round((correct / count) * 100);
  const message =
    percentage >= 90
      ? "Excelente rodada!"
      : percentage >= 70
        ? "Você está no caminho certo!"
        : "Cada rodada deixa a regra mais clara.";

  return (
    <AppShell className="result-page" hideNavigation>
      <div className="result-layout">
        <motion.section
          animate={{ scale: 1 }}
          className="result-hero-card"
          initial={{ scale: reduceMotion ? 1 : 0.98 }}
          transition={{ duration: reduceMotion ? 0 : 0.24 }}
        >
          <span className="result-trophy-badge" aria-hidden="true">
            <AppIcon name="trophy" size={34} />
          </span>
          <span className="pill-tag pill-tag--blue">Sessão concluída</span>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700 }}>{message}</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Você completou o desafio de Verbo TO BE — presente no nível{" "}
            {difficulty === "easy" ? "Fácil" : "Médio"}.
          </p>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
            {savedQuestionCount === null
              ? "Salvando seu progresso neste dispositivo..."
              : `Você já praticou ${savedQuestionCount} das 130 questões disponíveis.`}
          </p>
        </motion.section>

        <section className="result-summary-card">
          <div
            className="score-ring-visual"
            style={{ "--score": percentage } as CSSProperties}
          >
            <div className="score-ring-visual__inner">
              <strong>{percentage}%</strong>
              <span>de acertos</span>
            </div>
          </div>

          <div className="score-stats-grid">
            <div className="score-stat-cell">
              <strong>{count}</strong>
              <span>Total</span>
            </div>
            <div className="score-stat-cell">
              <strong>{correct}</strong>
              <span>Acertos</span>
            </div>
            <div className="score-stat-cell">
              <strong>{wrong}</strong>
              <span>Erros</span>
            </div>
            <div className="score-stat-cell">
              <strong>{bestStreak}</strong>
              <span>Sequência</span>
            </div>
            <div className="score-stat-cell">
              <strong>+{xpEarned}</strong>
              <span>XP</span>
            </div>
          </div>

          <div className="activity-completion__actions">
            <button className="btn-3d-primary" onClick={onRestart} type="button">
              <AppIcon name="refresh" size={18} />
              <span>Jogar novamente</span>
            </button>
            <button className="btn-pill-outline" onClick={onChange} type="button">
              Trocar configuração
            </button>
            <button className="btn-soft" onClick={onHome} type="button">
              <AppIcon name="home" size={18} />
              <span>Voltar à home</span>
            </button>
          </div>
        </section>
      </div>
      <Toast message={storageWarning} />
    </AppShell>
  );
}

function parseDifficulty(value: string | null): MvpGrammarDifficulty {
  return value === "medium" ? "medium" : "easy";
}

function parseCount(value: string | null): 10 | 20 | 30 {
  const parsed = Number(value);
  return parsed === 20 || parsed === 30 ? parsed : 10;
}
