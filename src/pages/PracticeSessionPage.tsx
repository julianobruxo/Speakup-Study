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
import {
  AppShell,
  PageHeader,
  PrimaryButton,
} from "../components/AppShell";
import { PRESENT_TOBE_QUESTIONS } from "../content/data/presentTobeQuestions";
import type { MvpGrammarDifficulty } from "../content/model/content";
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
import type { GrammarPracticeQuestion } from "../content/model/content";

const CORRECT_TRANSITION_MS = 3000;

export default function PracticeSessionPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reduceMotion = useReducedMotion();
  const difficulty = parseDifficulty(params.get("difficulty"));
  const count = parseCount(params.get("count"));
  const seed = Number(params.get("seed")) || 1;
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
  const [questions, setQuestions] = useState<GrammarPracticeQuestion[] | null>(null);
  const [savedQuestionCount, setSavedQuestionCount] = useState<number | null>(null);
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
          ),
        );
      })
      .catch(() => {
        if (!active) return;
        setStorageWarning("O progresso local não pôde ser carregado. A rodada continua normalmente.");
        setQuestions(
          selectPracticeQuestions(PRESENT_TOBE_QUESTIONS, difficulty, count, seed),
        );
      });
    return () => {
      active = false;
    };
  }, [count, difficulty, seed]);

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
  const progress =
    questions
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
        setSavedQuestionCount((await getProgressSummary()).uniqueQuestions);
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
      }).catch(() => {
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
        <PageHeader
          onBack={() => navigate("/gramatica/present_tobe", { replace: true })}
          title="Verbo TO BE — presente"
        />
        <section className="session-loading" aria-live="polite">
          <AppIcon name="refresh" size={24} />
          <strong>Preparando sua rodada...</strong>
        </section>
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
      />
    );
  }

  return (
    <AppShell className="session-page" hideNavigation>
      <PageHeader
        action={
          <button
            aria-label={sound ? "Desativar sons" : "Ativar sons"}
            className="icon-button"
            onClick={toggleSound}
          >
            <AppIcon name={sound ? "volume" : "volume-off"} size={20} />
          </button>
        }
        onBack={() => setShowExit(true)}
        title="Verbo TO BE — presente"
      />

      <section className="session-meta">
        <div>
          <span>
            {difficulty === "easy" ? "Fácil" : "Médio"} · Questão{" "}
            {currentIndex + 1} de {questions.length}
          </span>
          <strong>
            {streak > 1
              ? `${streak} acertos seguidos`
              : "Escolha a melhor alternativa"}
          </strong>
        </div>
      </section>

      <div
        aria-label={`${Math.round(progress)}% da sessão concluída`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(progress)}
        className="session-progress"
        role="progressbar"
      >
        <motion.i
          animate={{ width: `${progress}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          animate={{ opacity: 1, x: 0 }}
          className="question-card"
          exit={{ opacity: 0, x: reduceMotion ? 0 : -18 }}
          initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }}
          key={currentQuestion.id}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <div className="question-prompt">
            <span className="question-label">Complete a frase</span>
            <h1>{currentQuestion.question}</h1>
          </div>
          <div className="question-response">
            <div className="answer-options" role="radiogroup" aria-label="Alternativas">
              {options.map((option, index) => {
                const selected = selectedOption === option;
                const correct = confirmed && option === currentQuestion.correctAnswer;
                const wrong = confirmed && selected && !correct;
                const dimmed = confirmed && !correct && !wrong;
                return (
                  <motion.button
                    aria-checked={selected}
                    className={[
                      selected ? "selected" : "",
                      correct ? "correct" : "",
                      wrong ? "wrong" : "",
                      dimmed ? "dimmed" : "",
                      confirmed ? "locked" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={confirmed}
                    key={option}
                    onClick={() => chooseOption(option)}
                    role="radio"
                    whileTap={confirmed ? undefined : { scale: 0.99 }}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
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
                  aria-label="Resposta correta. Próxima questão em 3 segundos."
                  aria-live="polite"
                  className="answer-feedback correct correct-transition"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                  key="correct"
                  ref={feedbackRef}
                  role="status"
                  tabIndex={-1}
                >
                  <span className="feedback-icon">
                    <AppIcon name="check" size={20} />
                  </span>
                  <div className="correct-transition-copy">
                    <strong>Correto!</strong>
                    <div
                      aria-label="Avanço automático em 3 segundos"
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuetext="Próxima questão em 3 segundos"
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
                  className="answer-feedback wrong"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                  key="wrong"
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest("button")) return;
                    advanceIncorrect();
                  }}
                  ref={feedbackRef}
                  role="status"
                  tabIndex={-1}
                >
                  <span className="feedback-icon">
                    <AppIcon name="book" size={20} />
                  </span>
                  <div className="wrong-feedback-copy">
                    <strong>Vamos entender.</strong>
                    <span>
                      Resposta correta: <b>{currentQuestion.correctAnswer}</b>
                    </span>
                    <p>{currentQuestion.feedback}</p>
                    <div className="wrong-feedback-footer">
                      <button
                        className="study-topic-button"
                        onClick={openStudy}
                        ref={studyTriggerRef}
                        type="button"
                      >
                        <AppIcon name="book" size={17} />
                        Estudar esse tópico
                      </button>
                      <small>Toque no card para continuar</small>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isCorrect && (
              <div className="session-action">
                {!confirmed ? (
                  <PrimaryButton
                    disabled={!selectedOption}
                    onClick={confirmAnswer}
                  >
                    Confirmar resposta
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    icon={<AppIcon name="chevron-right" />}
                    onClick={advanceIncorrect}
                  >
                    {currentIndex === questions.length - 1
                      ? "Ver resultado"
                      : "Continuar"}
                  </PrimaryButton>
                )}
              </div>
            )}
          </div>
        </motion.section>
      </AnimatePresence>

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
            <PrimaryButton
              onClick={() => setShowExit(false)}
              variant="secondary"
            >
              Continuar jogando
            </PrimaryButton>
            <PrimaryButton
              onClick={() => leaveSession("/gramatica/present_tobe")}
              variant="quiet"
            >
              Sair da sessão
            </PrimaryButton>
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
      {!reduceMotion && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <motion.i
              animate={{ opacity: [0, 1, 0], y: [0, 150], rotate: index * 38 }}
              key={index}
              style={{ left: `${5 + ((index * 29) % 90)}%` }}
              transition={{ delay: index * 0.035, duration: 1.4 }}
            />
          ))}
        </div>
      )}
      <div className="result-layout">
        <motion.section
          animate={{ scale: 1 }}
          className="result-hero"
          initial={{ scale: reduceMotion ? 1 : 0.98 }}
          transition={{ duration: reduceMotion ? 0 : 0.28 }}
        >
          <span className="result-burst" aria-hidden="true" />
          <span className="result-icon">
            <AppIcon name="trophy" size={40} />
          </span>
          <span className="eyebrow">Sessão concluída</span>
          <h1>{message}</h1>
          <p>
            Você completou o desafio de Verbo TO BE — presente no nível{" "}
            {difficulty === "easy" ? "Fácil" : "Médio"}.
          </p>
          <p className="result-progress-copy">
            {savedQuestionCount === null
              ? "Salvando seu progresso neste dispositivo..."
              : `Você já praticou ${savedQuestionCount} das 130 questões disponíveis.`}
          </p>
        </motion.section>

        <div className="result-summary">
          <section className="score-panel">
            <div
              className="score-ring"
              style={{ "--score": percentage } as CSSProperties}
            >
              <strong>{percentage}%</strong>
              <span>de acertos</span>
            </div>
            <div className="score-stats">
              <div>
                <strong>{count}</strong>
                <span>Total</span>
              </div>
              <div>
                <strong>{correct}</strong>
                <span>Acertos</span>
              </div>
              <div>
                <strong>{wrong}</strong>
                <span>Erros</span>
              </div>
              <div>
                <strong>{bestStreak}</strong>
                <span>Melhor sequência</span>
              </div>
            </div>
          </section>

          <div className="result-actions">
            <PrimaryButton icon={<AppIcon name="refresh" />} onClick={onRestart}>
              Jogar novamente
            </PrimaryButton>
            <PrimaryButton onClick={onChange} variant="secondary">
              Trocar configuração
            </PrimaryButton>
            <PrimaryButton
              icon={<AppIcon name="home" size={19} />}
              onClick={onHome}
              variant="quiet"
            >
              Voltar à home
            </PrimaryButton>
          </div>
        </div>
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
