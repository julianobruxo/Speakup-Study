import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import { SCHOOL_ACTION_VERBS } from "../content/school/actionVerbs";
import { SCHOOL_ALPHABET } from "../content/school/alphabet";
import { SCHOOL_GRAMMAR_TOPICS } from "../content/school/grammarTopics";
import { SCHOOL_NUMBERS } from "../content/school/numbers";
import { SCHOOL_VOCABULARY_SETS } from "../content/school/vocabularySets";
import { cancelPronunciation, speakEnglish } from "../services/audio/pronunciation";

/**
 * Topics pending teacher review are excluded from student-facing views.
 * See `BACKLOG.md` and `src/content/school/CORRECTIONS.md`.
 */
export const TEACHER_REVIEW_PENDING_IDS = new Set<string>([
  "there-is-there-are",
]);

const APPROVED_SCHOOL_GRAMMAR = SCHOOL_GRAMMAR_TOPICS.filter(
  (topic) => !TEACHER_REVIEW_PENDING_IDS.has(topic.id),
);

type SchoolSection = "vocabulario" | "verbos" | "gramatica" | "base";

const SECTIONS: { id: SchoolSection; label: string }[] = [
  { id: "vocabulario", label: "Vocabulário (10)" },
  { id: "verbos", label: "Verbos de ação (50)" },
  { id: "gramatica", label: "Guias de gramática (9)" },
  { id: "base", label: "Alfabeto e números" },
];

export default function SchoolStudyPage() {
  const navigate = useNavigate();
  const { section } = useParams();
  const activeSection: SchoolSection = SECTIONS.some((s) => s.id === section)
    ? (section as SchoolSection)
    : "vocabulario";
  const [selectedSetId, setSelectedSetId] = useState(
    SCHOOL_VOCABULARY_SETS[0]?.id ?? "",
  );
  const [selectedTopicId, setSelectedTopicId] = useState(
    APPROVED_SCHOOL_GRAMMAR[0]?.id ?? "",
  );

  useEffect(() => cancelPronunciation, [activeSection, selectedSetId, selectedTopicId]);

  const activeSet =
    SCHOOL_VOCABULARY_SETS.find((item) => item.id === selectedSetId) ??
    SCHOOL_VOCABULARY_SETS[0];
  const activeTopic =
    APPROVED_SCHOOL_GRAMMAR.find((item) => item.id === selectedTopicId) ??
    APPROVED_SCHOOL_GRAMMAR[0];

  return (
    <AppShell activeNav="study" className="standard-page">
      <PageHeader backTo="/praticar" title="Acervo da escola" />
      <section className="page-lead compact">
        <span className="eyebrow">Speak Up English School</span>
        <h2>Material complementar com pronúncia</h2>
        <p>
          Explore conjuntos de vocabulário, verbos de ação, guias rápidos de
          gramática, alfabeto e números. Toque em qualquer termo para ouvir em
          inglês americano.
        </p>
      </section>

      <div className="filter-row" role="tablist" aria-label="Seções do acervo">
        {SECTIONS.map((item) => (
          <button
            aria-selected={activeSection === item.id}
            className={`filter-chip ${activeSection === item.id ? "active" : ""}`}
            key={item.id}
            onClick={() => navigate(`/escola/${item.id}`)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {activeSection === "vocabulario" && activeSet && (
        <section className="section-card" aria-label="Vocabulário da escola">
          <div className="filter-row">
            {SCHOOL_VOCABULARY_SETS.map((set) => (
              <button
                aria-pressed={set.id === activeSet.id}
                className={`filter-chip ${set.id === activeSet.id ? "active" : ""}`}
                key={set.id}
                onClick={() => setSelectedSetId(set.id)}
                type="button"
              >
                {set.title} ({set.items.length})
              </button>
            ))}
          </div>
          <div className="word-preview-grid">
            {activeSet.items.map((item) => (
              <button
                className="word-preview"
                key={`${activeSet.id}-${item.term}`}
                onClick={() => speakEnglish(item.term)}
                type="button"
              >
                {item.imagePath ? (
                  <img
                    alt={item.term}
                    loading="lazy"
                    src={item.imagePath}
                    style={{ width: "100%", height: 96, objectFit: "cover", borderRadius: 10 }}
                  />
                ) : item.visual ? (
                  <span aria-hidden="true" style={{ fontSize: 28 }}>{item.visual}</span>
                ) : null}
                <strong>
                  {item.term} <AppIcon name="volume" size={14} />
                </strong>
                <span>{item.translation}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {activeSection === "verbos" && (
        <section className="section-card" aria-label="Verbos de ação">
          <div className="word-preview-grid">
            {SCHOOL_ACTION_VERBS.map((verb) => (
              <button
                className="word-preview"
                key={verb.term}
                onClick={() => speakEnglish(verb.term, { form: "base" })}
                type="button"
              >
                {verb.imagePath ? (
                  <img
                    alt={verb.term}
                    loading="lazy"
                    src={verb.imagePath}
                    style={{ width: "100%", height: 96, objectFit: "cover", borderRadius: 10 }}
                  />
                ) : null}
                <strong>
                  {verb.term} <AppIcon name="volume" size={14} />
                </strong>
                <span>{verb.translation}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {activeSection === "gramatica" && activeTopic && (
        <section className="section-card" aria-label="Guias de gramática">
          <div className="filter-row">
            {APPROVED_SCHOOL_GRAMMAR.map((topic) => (
              <button
                aria-pressed={topic.id === activeTopic.id}
                className={`filter-chip ${topic.id === activeTopic.id ? "active" : ""}`}
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                type="button"
              >
                {topic.title}
              </button>
            ))}
          </div>
          <article className="study-guide-content">
            <h3>{activeTopic.title}</h3>
            <p>{activeTopic.summary}</p>
            {activeTopic.explanation.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <h4>Exemplos</h4>
            <div className="study-examples">
              {activeTopic.examples.affirmative.slice(0, 4).map((ex) => (
                <button
                  className="word-preview"
                  key={ex.english}
                  onClick={() => speakEnglish(ex.english)}
                  type="button"
                >
                  <strong>{ex.english}</strong>
                  <span>{ex.portuguese}</span>
                </button>
              ))}
            </div>
            <h4>Erro comum</h4>
            <p>
              <strong>Evite:</strong> {activeTopic.commonMistake.wrong} ·{" "}
              <strong>Use:</strong> {activeTopic.commonMistake.correct} —{" "}
              {activeTopic.commonMistake.note}
            </p>
          </article>
        </section>
      )}

      {activeSection === "base" && (
        <section className="section-card" aria-label="Alfabeto e números">
          <h3>Alfabeto (A–Z)</h3>
          <div className="word-preview-grid">
            {SCHOOL_ALPHABET.map((item) => (
              <button
                className="word-preview"
                key={item.letter}
                onClick={() => speakEnglish(item.letter)}
                type="button"
              >
                <strong>{item.letter}</strong>
                <span>
                  /{item.pronunciation}/ · {item.example}
                </span>
              </button>
            ))}
          </div>
          <h3 style={{ marginTop: 24 }}>Números</h3>
          <div className="word-preview-grid">
            {[
              ...SCHOOL_NUMBERS.zeroToTwenty,
              ...SCHOOL_NUMBERS.twentyToOneHundred,
              ...SCHOOL_NUMBERS.hundredToTwoThousand,
            ].map((entry) => (
              <button
                className="word-preview"
                key={`${entry.number}-${entry.word}`}
                onClick={() => speakEnglish(entry.word)}
                type="button"
              >
                <strong>{entry.number}</strong>
                <span>{entry.word}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
