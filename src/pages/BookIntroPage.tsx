import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import { BookVisual } from "../components/BookVisual";
import { LIVRO_INTRO } from "../content/books/intro";

export default function BookIntroPage({
  section,
}: {
  section: "gramatica" | "vocabulario";
}) {
  const navigate = useNavigate();

  return (
    <AppShell activeNav="study" className="standard-page">
      <PageHeader
        backTo="/praticar"
        title={`${LIVRO_INTRO.title} · ${section === "vocabulario" ? "Vocabulário" : "Gramática"}`}
      />

      <section className="page-lead compact">
        <span className="eyebrow">{LIVRO_INTRO.title}</span>
        <h2>
          {section === "vocabulario"
            ? "Vocabulário com flashcards e memória"
            : "Trilha de gramática (18 tópicos)"}
        </h2>
        <p>
          {section === "vocabulario"
            ? "Escolha um conjunto para estudar com flashcards clássicos (inglês na frente, português no verso) ou praticar no Jogo da Memória."
            : "Escolha qualquer um dos 18 tópicos do Livro Intro para ler a explicação, ouvir os exemplos em inglês americano e praticar no formato que preferir."}
        </p>
      </section>

      <div className="filter-row" role="tablist" aria-label="Áreas do Livro Intro">
        <button
          aria-selected={section === "vocabulario"}
          className={`filter-chip ${section === "vocabulario" ? "active" : ""}`}
          onClick={() => navigate("/livro/intro/vocabulario")}
          role="tab"
          type="button"
        >
          Vocabulário ({LIVRO_INTRO.vocabularySets.length})
        </button>
        <button
          aria-selected={section === "gramatica"}
          className={`filter-chip ${section === "gramatica" ? "active" : ""}`}
          onClick={() => navigate("/livro/intro/gramatica")}
          role="tab"
          type="button"
        >
          Gramática ({LIVRO_INTRO.grammarTopics.length})
        </button>
      </div>

      {section === "vocabulario" ? (
        <div className="topic-grid">
          {LIVRO_INTRO.vocabularySets.map((set) => (
            <article className="section-card" key={set.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {set.items[0] && <BookVisual item={set.items[0]} size={56} />}
                <div>
                  <span className="eyebrow">{set.items.length} palavras</span>
                  <h3 style={{ margin: "4px 0" }}>{set.title}</h3>
                  <p style={{ margin: 0 }}>{set.subtitle}</p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                <button
                  className="primary-button"
                  onClick={() =>
                    navigate(`/livro/intro/vocabulario/${set.id}/flashcards`)
                  }
                  type="button"
                >
                  <AppIcon name="book" size={16} />
                  <span>Flashcards</span>
                </button>
                <button
                  className="secondary-button"
                  onClick={() =>
                    navigate(`/livro/intro/vocabulario/${set.id}/memoria`)
                  }
                  type="button"
                >
                  <AppIcon name="grid" size={16} />
                  <span>Jogo da Memória</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="section-card" aria-label="Tópicos de gramática do Livro Intro">
          <div className="topic-grid">
            {LIVRO_INTRO.grammarTopics.map((topic) => (
              <button
                className="topic-card available"
                key={topic.id}
                onClick={() => navigate(`/livro/intro/gramatica/${topic.id}`)}
                type="button"
              >
                <span className="tag">3 atividades</span>
                <strong>
                  {String(topic.order).padStart(2, "0")}. {topic.title}
                </strong>
                <p>{topic.summary}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
