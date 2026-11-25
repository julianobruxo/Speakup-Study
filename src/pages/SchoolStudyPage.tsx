import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import { SCHOOL_ACTION_VERBS } from "../content/school/actionVerbs";
import { SCHOOL_ALPHABET } from "../content/school/alphabet";
import { SCHOOL_GRAMMAR_TOPICS } from "../content/school/grammarTopics";
import { SCHOOL_NUMBERS } from "../content/school/numbers";
import type { SchoolExample, SchoolGrammarTopic } from "../content/school/types";
import { SCHOOL_VOCABULARY_SETS } from "../content/school/vocabularySets";
import { cancelPronunciation, speakEnglish } from "../services/audio/pronunciation";

type SchoolSection = "vocabulario" | "verbos" | "gramatica" | "base";

const SECTIONS: { id: SchoolSection; label: string }[] = [
  { id: "vocabulario", label: "Vocabulário (10)" },
  { id: "verbos", label: "Verbos de ação (50)" },
  { id: "gramatica", label: `Guias de gramática (${SCHOOL_GRAMMAR_TOPICS.length})` },
  { id: "base", label: "Alfabeto e números" },
];

const STRUCTURE_LABELS: Record<string, string> = {
  affirmative: "Afirmativa",
  negative: "Negativa",
  interrogative: "Interrogativa",
  singular: "Singular",
  plural: "Plural",
};

function getStructureLines(
  structure: SchoolGrammarTopic["structure"],
): { label: string; text: string }[] {
  if ("lines" in structure && Array.isArray(structure.lines)) {
    return structure.lines;
  }
  return Object.entries(structure).map(([key, text]) => ({
    label: STRUCTURE_LABELS[key] ?? key,
    text,
  }));
}

function ExampleGroup({
  title,
  examples,
}: {
  title: string;
  examples: SchoolExample[];
}) {
  if (!examples.length) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <h5>{title}</h5>
      <div className="study-examples">
        {examples.map((ex) => (
          <button
            className="word-preview"
            key={`${title}-${ex.english}`}
            onClick={() => speakEnglish(ex.english)}
            type="button"
          >
            <strong>
              {ex.english} <AppIcon name="volume" size={14} />
            </strong>
            <span>{ex.portuguese}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

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
    SCHOOL_GRAMMAR_TOPICS[0]?.id ?? "",
  );

  useEffect(() => cancelPronunciation, [activeSection, selectedSetId, selectedTopicId]);

  const activeSet =
    SCHOOL_VOCABULARY_SETS.find((item) => item.id === selectedSetId) ??
    SCHOOL_VOCABULARY_SETS[0];
  const activeTopic =
    SCHOOL_GRAMMAR_TOPICS.find((item) => item.id === selectedTopicId) ??
    SCHOOL_GRAMMAR_TOPICS[0];
  const structureLines = activeTopic ? getStructureLines(activeTopic.structure) : [];

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
            {SCHOOL_GRAMMAR_TOPICS.map((topic) => (
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

            {structureLines.length > 0 && (
              <section style={{ marginTop: 18 }}>
                <h4>Estrutura</h4>
                <div className="study-examples">
                  {structureLines.map((line) => (
                    <div className="word-preview" key={`${line.label}-${line.text}`}>
                      <strong>{line.label}</strong>
                      <span>{line.text}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section style={{ marginTop: 18 }}>
              <h4>Exemplos</h4>
              <ExampleGroup
                examples={activeTopic.examples.affirmative}
                title="Afirmativas"
              />
              <ExampleGroup
                examples={activeTopic.examples.negative}
                title="Negativas"
              />
              <ExampleGroup
                examples={activeTopic.examples.interrogative}
                title="Perguntas"
              />
            </section>

            {activeTopic.shortAnswers.length > 0 && (
              <section style={{ marginTop: 18 }}>
                <h4>Respostas curtas</h4>
                <div className="study-examples">
                  {activeTopic.shortAnswers.map((item) => (
                    <button
                      className="word-preview"
                      key={item.question}
                      onClick={() =>
                        speakEnglish(`${item.question} ${item.yes} ${item.no}`)
                      }
                      type="button"
                    >
                      <strong>
                        {item.question} <AppIcon name="volume" size={14} />
                      </strong>
                      <span>
                        {item.yes} · {item.no}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {activeTopic.extraSections && activeTopic.extraSections.length > 0 && (
              <section style={{ marginTop: 18 }}>
                <h4>Pontos importantes</h4>
                {activeTopic.extraSections.map((extra) => (
                  <div key={extra.title} style={{ marginTop: 14 }}>
                    <h5>{extra.title}</h5>
                    {extra.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {extra.examples && extra.examples.length > 0 && (
                      <div className="study-examples">
                        {extra.examples.map((ex) => (
                          <button
                            className="word-preview"
                            key={`${extra.title}-${ex.english}`}
                            onClick={() => speakEnglish(ex.english)}
                            type="button"
                          >
                            <strong>
                              {ex.english} <AppIcon name="volume" size={14} />
                            </strong>
                            <span>{ex.portuguese}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            <section style={{ marginTop: 18 }}>
              <h4>Erro comum</h4>
              <p>
                <strong>Evite:</strong> {activeTopic.commonMistake.wrong} ·{" "}
                <strong>Use:</strong> {activeTopic.commonMistake.correct} —{" "}
                {activeTopic.commonMistake.note}
              </p>
            </section>
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
