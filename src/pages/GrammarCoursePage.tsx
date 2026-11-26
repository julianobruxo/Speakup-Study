import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import {
  getGrammarCourse,
  type CourseLevel,
  type GrammarCourseId,
  type GrammarCourseQuestion,
} from "../content/data/grammarCourses";
import { orderQuestionOptions } from "../services/sessions/selectPracticeQuestions";
import {
  recordCourseAnswer,
  recordCourseCompletion,
} from "../services/progress/grammarCourseProgress";
import {
  recordGrammarAnswerEngagement,
  recordGrammarSessionEngagement,
} from "../services/progress/engagement";
import "../styles/activities.css";

type CourseView = "learn" | "practice" | "review";

export default function GrammarCoursePage() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const course = getGrammarCourse(topicId);
  const [view, setView] = useState<CourseView>("learn");
  const [level, setLevel] = useState<CourseLevel>(1);

  useEffect(() => {
    setView("learn");
    setLevel(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [course?.id]);

  if (!course) {
    return (
      <AppShell activeNav="study" className="standard-page">
        <PageHeader backTo="/gramatica" title="Gramática" />
        <div className="activity-page-container">
          <section className="empty-state">
            <h2 className="empty-state__title">Conteúdo não encontrado</h2>
            <p className="empty-state__body">
              Volte para os tópicos de gramática para escolher outra trilha.
            </p>
            <button
              className="btn-3d-primary"
              onClick={() => navigate("/gramatica")}
              type="button"
            >
              Ver tópicos
            </button>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="study" className="standard-page">
      <PageHeader backTo="/gramatica" title={course.shortTitle} />

      <div className="activity-page-container">
        <section className="activity-lead-card">
          <span className="pill-tag pill-tag--blue">
            Trilha de gramática · 5 níveis
          </span>
          <h1>{course.title}</h1>
          <p>{course.summary}</p>
          <div className="course-goal-pill">
            <AppIcon name="sparkles" size={18} />
            <span>
              <small>Ao concluir</small>
              {course.goal}
            </span>
          </div>
        </section>

        <nav className="course-tabs-bar" aria-label="Etapas do conteúdo">
          <CourseTab
            active={view === "learn"}
            onClick={() => setView("learn")}
            label="1. Aprender"
          />
          <CourseTab
            active={view === "practice"}
            onClick={() => setView("practice")}
            label="2. Praticar"
          />
          <CourseTab
            active={view === "review"}
            onClick={() => setView("review")}
            label="3. Revisão final"
          />
        </nav>

        {view === "learn" && (
          <section className="grammar-section-card">
            <span className="pill-tag">Explicação para iniciantes</span>
            <h3>Entenda antes de praticar</h3>
            <p>
              Leia os quatro blocos na ordem. Os exemplos mostram a estrutura em
              uso, não só a regra solta.
            </p>

            <div className="study-section-grid">
              {course.studySections.map((section, index) => (
                <article className="study-section-card" key={section.title}>
                  <span className="study-section-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{section.title}</h3>
                  <p>{section.explanation}</p>
                  <code className="study-formula-code">{section.formula}</code>
                  <div className="course-examples-list">
                    {section.examples.map((example) => (
                      <span key={example}>{example}</span>
                    ))}
                  </div>
                  {section.watchOut && (
                    <div className="status-banner status-banner--warning">
                      <span>
                        <strong>Atenção:</strong> {section.watchOut}
                      </span>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="course-source-row">
              <a
                className="course-ext-link"
                href={course.cambridgeUrl}
                target="_blank"
                rel="noreferrer"
              >
                Aprofundar na Cambridge Grammar
                <AppIcon name="chevron-right" size={17} />
              </a>
              <button
                className="btn-3d-primary btn-3d-primary--sm"
                onClick={() => setView("practice")}
                type="button"
              >
                Começar a praticar
              </button>
            </div>
          </section>
        )}

        {view === "practice" && (
          <PracticeStage
            key={`${course.id}-${level}`}
            courseId={course.id}
            courseTitle={course.title}
            level={level}
            levels={course.levels}
            onLevelChange={setLevel}
            onReview={() => setView("review")}
            questions={course.questions.filter((item) => item.level === level)}
          />
        )}

        {view === "review" && (
          <ReviewStage
            key={course.id}
            courseId={course.id}
            courseTitle={course.title}
            onStudy={() => setView("learn")}
            questions={course.questions}
          />
        )}
      </div>
    </AppShell>
  );
}

function CourseTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-current={active ? "step" : undefined}
      className={`course-tab-btn${active ? " is-active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function PracticeStage({
  courseId,
  courseTitle,
  level,
  levels,
  onLevelChange,
  onReview,
  questions,
}: {
  courseId: GrammarCourseId;
  courseTitle: string;
  level: CourseLevel;
  levels: { level: CourseLevel; title: string; focus: string }[];
  onLevelChange: (level: CourseLevel) => void;
  onReview: () => void;
  questions: GrammarCourseQuestion[];
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const engagementWriteRef = useRef<Promise<void>>(Promise.resolve());
  const question = questions[questionIndex];

  function chooseLevel(nextLevel: CourseLevel) {
    onLevelChange(nextLevel);
    setQuestionIndex(0);
    setSelected("");
    setSubmitted(false);
    setCorrectCount(0);
    setComplete(false);
    setStreak(0);
    setBestStreak(0);
    setSessionId(crypto.randomUUID());
    engagementWriteRef.current = Promise.resolve();
  }

  function submit() {
    if (!selected || submitted) return;
    const correct = isAnswerCorrect(question, selected);
    const nextStreak = correct ? streak + 1 : 0;
    setSubmitted(true);
    if (correct) setCorrectCount((current) => current + 1);
    setStreak(nextStreak);
    setBestStreak((current) => Math.max(current, nextStreak));
    recordCourseAnswer(courseId, question.id, correct);
    engagementWriteRef.current = engagementWriteRef.current
      .then(() =>
        recordGrammarAnswerEngagement(
          `course-answer:${sessionId}:${question.id}`,
          correct,
        ),
      )
      .then(() => undefined)
      .catch(() => undefined);
  }

  function next() {
    if (questionIndex === questions.length - 1) {
      const percentage = Math.round((correctCount / questions.length) * 100);
      recordCourseCompletion(courseId, `level-${level}`, percentage);
      setComplete(true);
      void engagementWriteRef.current.then(async () => {
        await recordGrammarSessionEngagement(sessionId, percentage, bestStreak);
      }).catch(() => undefined);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelected("");
    setSubmitted(false);
  }

  const levelMeta = levels.find((item) => item.level === level)!;
  const finalScore = correctCount;
  const answerIsCorrect = submitted && isAnswerCorrect(question, selected);

  return (
    <section className="grammar-section-card">
      <span className="pill-tag pill-tag--blue">Prática progressiva</span>
      <h3>Escolha o nível</h3>
      <p>
        Comece no 1 se o conteúdo for novo. Os níveis 4 e 5 exigem que você
        entenda a frase inteira.
      </p>

      <div className="level-picker" role="group" aria-label="Nível de prática">
        {levels.map((item) => (
          <button
            aria-pressed={level === item.level}
            className={`level-pill-btn${level === item.level ? " is-active" : ""}`}
            key={item.level}
            onClick={() => chooseLevel(item.level)}
            type="button"
          >
            <b>{item.level}</b>
            <span>{item.title}</span>
          </button>
        ))}
      </div>

      {complete ? (
        <ResultCard
          correct={finalScore}
          onPrimary={() => chooseLevel(level)}
          onSecondary={onReview}
          primaryLabel="Refazer este nível"
          secondaryLabel="Ir para a revisão final"
          title={`${courseTitle} · Nível ${level}`}
          total={questions.length}
        />
      ) : (
        <div className="grammar-runner">
          <div className="grammar-runner__meta">
            <span>
              Nível {level} · {levelMeta.title}
            </span>
            <span>
              {questionIndex + 1} de {questions.length}
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${
                  ((questionIndex + (submitted ? 1 : 0)) / questions.length) * 100
                }%`,
              }}
            />
          </div>
          <span className="pill-tag">{levelMeta.focus}</span>
          <h4 className="grammar-question-prompt">{question.prompt}</h4>

          {question.kind === "choice" ? (
            <div className="grammar-options-list">
              {orderQuestionOptions(
                question.options!,
                `${sessionId}:${question.id}`,
              ).map((option) => {
                const state = submitted
                  ? option === question.answer
                    ? "correct"
                    : option === selected
                      ? "wrong"
                      : "dimmed"
                  : selected === option
                    ? "selected"
                    : "";
                return (
                  <button
                    className={`quiz-option ${state}`}
                    disabled={submitted}
                    key={option}
                    onClick={() => setSelected(option)}
                    type="button"
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <label className="course-input-answer">
              <span>Sua frase</span>
              <input
                autoCapitalize="sentences"
                autoComplete="off"
                className="input-field"
                disabled={submitted}
                onChange={(event) => setSelected(event.target.value)}
                placeholder="Digite a frase completa"
                spellCheck="false"
                value={selected}
              />
            </label>
          )}

          {submitted && (
            <div
              className={`status-banner ${
                answerIsCorrect ? "status-banner--success" : "status-banner--error"
              }`}
              aria-live="polite"
            >
              <AppIcon name={answerIsCorrect ? "check" : "close"} size={18} />
              <div>
                <strong>
                  {answerIsCorrect ? "Boa!" : `Resposta: ${question.answer}`}
                </strong>{" "}
                <span>
                  {answerIsCorrect
                    ? question.feedback.correct
                    : question.feedback.incorrect}
                </span>
              </div>
            </div>
          )}

          <div className="grammar-runner__actions">
            <button
              className="btn-3d-primary btn-3d-primary--sm"
              disabled={!selected.trim()}
              onClick={submitted ? next : submit}
              type="button"
            >
              {submitted
                ? questionIndex === questions.length - 1
                  ? "Ver resultado"
                  : "Próxima questão"
                : "Conferir resposta"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function ReviewStage({
  courseId,
  courseTitle,
  onStudy,
  questions,
}: {
  courseId: GrammarCourseId;
  courseTitle: string;
  onStudy: () => void;
  questions: GrammarCourseQuestion[];
}) {
  const [started, setStarted] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const engagementWriteRef = useRef<Promise<void>>(Promise.resolve());
  const reviewQuestions = useMemo(
    () => buildReview(questions, attempt),
    [attempt, questions],
  );
  const question = reviewQuestions[index];
  const answerIsCorrect = submitted && isAnswerCorrect(question, selected);

  function restart() {
    setAttempt((current) => current + 1);
    setStarted(true);
    setIndex(0);
    setSelected("");
    setSubmitted(false);
    setCorrectCount(0);
    setFinished(false);
    setStreak(0);
    setBestStreak(0);
    setSessionId(crypto.randomUUID());
    engagementWriteRef.current = Promise.resolve();
  }

  function submit() {
    if (!selected || submitted) return;
    const correct = isAnswerCorrect(question, selected);
    const nextStreak = correct ? streak + 1 : 0;
    setSubmitted(true);
    if (correct) setCorrectCount((current) => current + 1);
    setStreak(nextStreak);
    setBestStreak((current) => Math.max(current, nextStreak));
    recordCourseAnswer(courseId, question.id, correct);
    engagementWriteRef.current = engagementWriteRef.current
      .then(() =>
        recordGrammarAnswerEngagement(
          `course-review-answer:${sessionId}:${question.id}`,
          correct,
        ),
      )
      .then(() => undefined)
      .catch(() => undefined);
  }

  function next() {
    if (index === reviewQuestions.length - 1) {
      const percentage = Math.round((correctCount / reviewQuestions.length) * 100);
      recordCourseCompletion(courseId, "review", percentage);
      setFinished(true);
      void engagementWriteRef.current.then(async () => {
        await recordGrammarSessionEngagement(sessionId, percentage, bestStreak);
      }).catch(() => undefined);
      return;
    }
    setIndex((current) => current + 1);
    setSelected("");
    setSubmitted(false);
  }

  return (
    <section className="grammar-section-card">
      {!started ? (
        <div className="activity-completion">
          <span className="activity-completion__icon" aria-hidden="true">
            <AppIcon name="check" size={30} />
          </span>
          <span className="activity-completion__kicker">Revisão final</span>
          <h3>10 questões, 5 níveis</h3>
          <p>
            A revisão mistura duas questões de cada nível. O feedback continua
            disponível: o objetivo é consolidar, não pegar você numa armadilha.
          </p>
          <div className="filter-row" style={{ justifyContent: "center" }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <span className="pill-tag" key={item}>
                Nível {item}
              </span>
            ))}
          </div>
          <div className="activity-completion__actions">
            <button
              className="btn-3d-primary"
              onClick={() => setStarted(true)}
              type="button"
            >
              Iniciar revisão
            </button>
          </div>
        </div>
      ) : finished ? (
        <ResultCard
          correct={correctCount}
          onPrimary={restart}
          onSecondary={onStudy}
          primaryLabel="Fazer outra tentativa"
          secondaryLabel="Rever a explicação"
          title={`Revisão · ${courseTitle}`}
          total={reviewQuestions.length}
        />
      ) : (
        <div className="grammar-runner">
          <div className="grammar-runner__meta">
            <span>Revisão · Nível {question.level}</span>
            <span>
              {index + 1} de {reviewQuestions.length}
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${
                  ((index + (submitted ? 1 : 0)) / reviewQuestions.length) * 100
                }%`,
              }}
            />
          </div>
          <h4 className="grammar-question-prompt">{question.prompt}</h4>

          {question.kind === "choice" ? (
            <div className="grammar-options-list">
              {orderQuestionOptions(
                question.options!,
                `${sessionId}:${question.id}`,
              ).map((option) => {
                const state = submitted
                  ? option === question.answer
                    ? "correct"
                    : option === selected
                      ? "wrong"
                      : "dimmed"
                  : selected === option
                    ? "selected"
                    : "";
                return (
                  <button
                    className={`quiz-option ${state}`}
                    disabled={submitted}
                    key={option}
                    onClick={() => setSelected(option)}
                    type="button"
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <label className="course-input-answer">
              <span>Sua frase</span>
              <input
                autoCapitalize="sentences"
                autoComplete="off"
                className="input-field"
                disabled={submitted}
                onChange={(event) => setSelected(event.target.value)}
                placeholder="Digite a frase completa"
                spellCheck="false"
                value={selected}
              />
            </label>
          )}

          {submitted && (
            <div
              aria-live="polite"
              className={`status-banner ${
                answerIsCorrect ? "status-banner--success" : "status-banner--error"
              }`}
            >
              <AppIcon name={answerIsCorrect ? "check" : "close"} size={18} />
              <div>
                <strong>
                  {answerIsCorrect ? "Correto." : `Resposta: ${question.answer}`}
                </strong>{" "}
                <span>
                  {answerIsCorrect
                    ? question.feedback.correct
                    : question.feedback.incorrect}
                </span>
              </div>
            </div>
          )}

          <div className="grammar-runner__actions">
            <button
              className="btn-3d-primary btn-3d-primary--sm"
              disabled={!selected.trim()}
              onClick={submitted ? next : submit}
              type="button"
            >
              {submitted
                ? index === reviewQuestions.length - 1
                  ? "Ver resultado"
                  : "Próxima questão"
                : "Conferir resposta"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function ResultCard({
  correct,
  onPrimary,
  onSecondary,
  primaryLabel,
  secondaryLabel,
  title,
  total,
}: {
  correct: number;
  onPrimary: () => void;
  onSecondary: () => void;
  primaryLabel: string;
  secondaryLabel: string;
  title: string;
  total: number;
}) {
  const percentage = Math.round((correct / total) * 100);
  const message =
    percentage >= 80
      ? "Bom resultado nesta rodada."
      : percentage >= 60
        ? "Boa base. Mais uma rodada deve firmar o conteúdo."
        : "Vale revisar a explicação e tentar de novo.";
  return (
    <div className="activity-completion" role="status">
      <div
        className="score-ring-visual"
        style={{ "--score": percentage } as React.CSSProperties}
      >
        <div className="score-ring-visual__inner">
          <strong>{percentage}%</strong>
          <span>
            {correct}/{total}
          </span>
        </div>
      </div>
      <span className="activity-completion__kicker">Rodada concluída</span>
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="activity-completion__actions">
        <button className="btn-3d-primary" onClick={onPrimary} type="button">
          {primaryLabel}
        </button>
        <button className="btn-pill-outline" onClick={onSecondary} type="button">
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}

function buildReview(questions: GrammarCourseQuestion[], attempt = 0) {
  const selected = [1, 2, 3, 4, 5].flatMap((level) => {
    const items = questions.filter((question) => question.level === level);
    const offset = attempt % 2;
    return [items[offset], items[offset + 2]];
  });
  return selected.sort(
    (a, b) => reviewOrder(a.id, attempt) - reviewOrder(b.id, attempt),
  );
}

function reviewOrder(id: string, attempt: number) {
  return (
    [...`${id}-${attempt}`].reduce(
      (total, character) => total + character.charCodeAt(0) * 17,
      0,
    ) % 97
  );
}

function normalizeAnswer(answer: string) {
  return answer
    .trim()
    .toLocaleLowerCase("en")
    .replace(/[’]/g, "'")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ");
}

function isAnswerCorrect(question: GrammarCourseQuestion, answer: string) {
  const accepted = question.acceptedAnswers ?? [question.answer];
  return accepted.some(
    (candidate) => normalizeAnswer(candidate) === normalizeAnswer(answer),
  );
}
