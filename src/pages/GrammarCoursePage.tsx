import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import {
  getGrammarCourse,
  type CourseLevel,
  type GrammarCourseId,
  type GrammarCourseQuestion,
} from "../content/data/grammarCourses";
import {
  recordCourseAnswer,
  recordCourseCompletion,
} from "../services/progress/grammarCourseProgress";
import {
  recordGrammarAnswerEngagement,
  recordGrammarSessionEngagement,
} from "../services/progress/engagement";

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
        <section className="empty-state">
          <h2>Conteúdo não encontrado</h2>
          <button className="primary-button" onClick={() => navigate("/gramatica")}>Ver tópicos</button>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="study" className="standard-page grammar-course-page">
      <PageHeader backTo="/gramatica" title={course.shortTitle} />
      <section
        className="course-hero"
        style={{ "--course-accent": course.accent } as CSSProperties}
      >
        <div>
          <span className="eyebrow">Trilha de gramática · 5 níveis</span>
          <h1>{course.title}</h1>
          <p>{course.summary}</p>
        </div>
        <div className="course-goal">
          <AppIcon name="sparkles" size={20} />
          <span><small>Ao concluir</small>{course.goal}</span>
        </div>
      </section>

      <nav className="course-tabs" aria-label="Etapas do conteúdo">
        <CourseTab active={view === "learn"} onClick={() => setView("learn")} label="1. Aprender" />
        <CourseTab active={view === "practice"} onClick={() => setView("practice")} label="2. Praticar" />
        <CourseTab active={view === "review"} onClick={() => setView("review")} label="3. Revisão final" />
      </nav>

      {view === "learn" && (
        <section className="course-stage">
          <header className="stage-heading">
            <span className="section-eyebrow">Explicação para iniciantes</span>
            <h2>Entenda antes de praticar</h2>
            <p>Leia os quatro blocos na ordem. Os exemplos mostram a estrutura em uso, não só a regra solta.</p>
          </header>
          <div className="study-section-grid">
            {course.studySections.map((section, index) => (
              <article className="study-section-card" key={section.title}>
                <span className="study-section-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{section.title}</h3>
                <p>{section.explanation}</p>
                <code>{section.formula}</code>
                <div className="course-examples">
                  {section.examples.map((example) => <span key={example}>{example}</span>)}
                </div>
                {section.watchOut && <div className="watch-out"><strong>Atenção:</strong> {section.watchOut}</div>}
              </article>
            ))}
          </div>
          <div className="course-source-row">
            <a href={course.cambridgeUrl} target="_blank" rel="noreferrer">
              Aprofundar na Cambridge Grammar <AppIcon name="chevron-right" size={17} />
            </a>
            <button className="primary-button" onClick={() => setView("practice")}>Começar a praticar</button>
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
    </AppShell>
  );
}

function CourseTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button aria-current={active ? "step" : undefined} className={active ? "active" : ""} onClick={onClick}>{label}</button>;
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
      .then(() => recordGrammarAnswerEngagement(
        `course-answer:${sessionId}:${question.id}`,
        correct,
      ))
      .then(() => undefined)
      .catch(() => undefined);
  }

  function next() {
    if (questionIndex === questions.length - 1) {
      const percentage = Math.round((correctCount / questions.length) * 100);
      recordCourseCompletion(courseId, `level-${level}`, percentage);
      setComplete(true);
      void engagementWriteRef.current.then(async () => {
        await recordGrammarSessionEngagement(
          sessionId,
          percentage,
          bestStreak,
        );
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
    <section className="course-stage practice-stage">
      <header className="stage-heading">
        <span className="section-eyebrow">Prática progressiva</span>
        <h2>Escolha o nível</h2>
        <p>Comece no 1 se o conteúdo for novo. Os níveis 4 e 5 exigem que você entenda a frase inteira.</p>
      </header>
      <div className="level-picker" role="group" aria-label="Nível de prática">
        {levels.map((item) => (
          <button
            aria-pressed={level === item.level}
            className={level === item.level ? "active" : ""}
            key={item.level}
            onClick={() => chooseLevel(item.level)}
          >
            <b>{item.level}</b><span>{item.title}</span>
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
        <div className="course-question-card">
          <div className="question-meta">
            <span>Nível {level} · {levelMeta.title}</span>
            <span>{questionIndex + 1} de {questions.length}</span>
          </div>
          <div className="question-progress"><span style={{ width: `${((questionIndex + (submitted ? 1 : 0)) / questions.length) * 100}%` }} /></div>
          <p className="level-focus">{levelMeta.focus}</p>
          <h3>{question.prompt}</h3>
          {question.kind === "choice" ? (
            <div className="course-options">
            {question.options!.map((option) => {
              const state = submitted
                ? option === question.answer
                  ? "correct"
                  : option === selected
                    ? "wrong"
                    : ""
                : selected === option
                  ? "selected"
                  : "";
              return <button className={state} disabled={submitted} key={option} onClick={() => setSelected(option)}>{option}</button>;
            })}
            </div>
          ) : (
            <label className="course-input-answer">
              <span>Sua frase</span>
              <input
                autoCapitalize="sentences"
                autoComplete="off"
                disabled={submitted}
                onChange={(event) => setSelected(event.target.value)}
                placeholder="Digite a frase completa"
                spellCheck="false"
                value={selected}
              />
            </label>
          )}
          {submitted && (
            <div className={`course-feedback ${answerIsCorrect ? "correct" : "wrong"}`} aria-live="polite">
              <strong>{answerIsCorrect ? "Boa!" : `Resposta: ${question.answer}`}</strong>
              <span>{answerIsCorrect ? question.feedback.correct : question.feedback.incorrect}</span>
            </div>
          )}
          <button className="primary-button question-action" disabled={!selected.trim()} onClick={submitted ? next : submit}>
            {submitted ? (questionIndex === questions.length - 1 ? "Ver resultado" : "Próxima questão") : "Conferir resposta"}
          </button>
        </div>
      )}
    </section>
  );
}

function ReviewStage({ courseId, courseTitle, onStudy, questions }: { courseId: GrammarCourseId; courseTitle: string; onStudy: () => void; questions: GrammarCourseQuestion[] }) {
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
  const reviewQuestions = useMemo(() => buildReview(questions, attempt), [attempt, questions]);
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
      .then(() => recordGrammarAnswerEngagement(
        `course-review-answer:${sessionId}:${question.id}`,
        correct,
      ))
      .then(() => undefined)
      .catch(() => undefined);
  }

  function next() {
    if (index === reviewQuestions.length - 1) {
      const percentage = Math.round((correctCount / reviewQuestions.length) * 100);
      recordCourseCompletion(courseId, "review", percentage);
      setFinished(true);
      void engagementWriteRef.current.then(async () => {
        await recordGrammarSessionEngagement(
          sessionId,
          percentage,
          bestStreak,
        );
      }).catch(() => undefined);
      return;
    }
    setIndex((current) => current + 1);
    setSelected("");
    setSubmitted(false);
  }

  return (
    <section className="course-stage review-stage">
      {!started ? (
        <div className="review-intro">
          <span className="review-mark">✓</span>
          <div><span className="section-eyebrow">Revisão final</span><h2>10 questões, 5 níveis</h2></div>
          <p>A revisão mistura duas questões de cada nível. O feedback continua disponível: o objetivo é consolidar, não pegar você numa armadilha.</p>
          <div className="review-levels">{[1, 2, 3, 4, 5].map((item) => <span key={item}>Nível {item}</span>)}</div>
          <button className="primary-button" onClick={() => setStarted(true)}>Iniciar revisão</button>
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
        <div className="course-question-card review-question">
          <div className="question-meta"><span>Revisão · Nível {question.level}</span><span>{index + 1} de {reviewQuestions.length}</span></div>
          <div className="question-progress"><span style={{ width: `${((index + (submitted ? 1 : 0)) / reviewQuestions.length) * 100}%` }} /></div>
          <h3>{question.prompt}</h3>
          {question.kind === "choice" ? (
            <div className="course-options">
            {question.options!.map((option) => {
              const state = submitted ? option === question.answer ? "correct" : option === selected ? "wrong" : "" : selected === option ? "selected" : "";
              return <button className={state} disabled={submitted} key={option} onClick={() => setSelected(option)}>{option}</button>;
            })}
            </div>
          ) : (
            <label className="course-input-answer">
              <span>Sua frase</span>
              <input autoCapitalize="sentences" autoComplete="off" disabled={submitted} onChange={(event) => setSelected(event.target.value)} placeholder="Digite a frase completa" spellCheck="false" value={selected} />
            </label>
          )}
          {submitted && <div aria-live="polite" className={`course-feedback ${answerIsCorrect ? "correct" : "wrong"}`}><strong>{answerIsCorrect ? "Correto." : `Resposta: ${question.answer}`}</strong><span>{answerIsCorrect ? question.feedback.correct : question.feedback.incorrect}</span></div>}
          <button className="primary-button question-action" disabled={!selected.trim()} onClick={submitted ? next : submit}>{submitted ? (index === reviewQuestions.length - 1 ? "Ver resultado" : "Próxima questão") : "Conferir resposta"}</button>
        </div>
      )}
    </section>
  );
}

function ResultCard({ correct, onPrimary, onSecondary, primaryLabel, secondaryLabel, title, total }: { correct: number; onPrimary: () => void; onSecondary: () => void; primaryLabel: string; secondaryLabel: string; title: string; total: number }) {
  const percentage = Math.round((correct / total) * 100);
  const message = percentage >= 80 ? "Bom resultado nesta rodada." : percentage >= 60 ? "Boa base. Mais uma rodada deve firmar o conteúdo." : "Vale revisar a explicação e tentar de novo.";
  return (
    <div className="course-result-card">
      <div className="result-score"><strong>{percentage}%</strong><span>{correct} de {total} acertos</span></div>
      <div><span className="section-eyebrow">Rodada concluída</span><h2>{title}</h2><p>{message}</p></div>
      <div className="result-actions"><button className="primary-button" onClick={onPrimary}>{primaryLabel}</button><button className="secondary-button" onClick={onSecondary}>{secondaryLabel}</button></div>
    </div>
  );
}

function buildReview(questions: GrammarCourseQuestion[], attempt = 0) {
  const selected = [1, 2, 3, 4, 5].flatMap((level) => {
    const items = questions.filter((question) => question.level === level);
    const offset = attempt % 2;
    return [items[offset], items[offset + 2]];
  });
  return selected.sort((a, b) => reviewOrder(a.id, attempt) - reviewOrder(b.id, attempt));
}

function reviewOrder(id: string, attempt: number) {
  return [...`${id}-${attempt}`].reduce(
    (total, character) => total + character.charCodeAt(0) * 17,
    0,
  ) % 97;
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
