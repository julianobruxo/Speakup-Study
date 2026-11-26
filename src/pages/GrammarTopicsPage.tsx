import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import Toast from "../components/Toast";
import { GRAMMAR_COURSE_IDS } from "../content/data/grammarCourses";
import { ACTIVE_GRAMMAR_TOPICS } from "../content/taxonomy";
import "../styles/estudar.css";

const BADGE_TONES = ["orange", "green", "cyan", "purple"] as const;

export default function GrammarTopicsPage() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");

  function showLocked(title: string) {
    setNotice(`${title} estará disponível em breve.`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <AppShell activeNav="study" className="standard-page">
      <div className="catalog-page">
        <PageHeader backTo="/estudar" title="Gramática" />

        <section className="catalog-lead">
          <span className="catalog-lead__kicker">6 tópicos disponíveis</span>
          <h2 className="catalog-lead__title">Escolha um tópico</h2>
          <p className="catalog-lead__desc">
            Aprenda a estrutura, pratique em 5 níveis e conclua com uma revisão
            final.
          </p>
        </section>

        <div className="catalog-list">
          {ACTIVE_GRAMMAR_TOPICS.map((topic, idx) => {
            const tone = BADGE_TONES[idx % 4];

            if (topic.id === "present_tobe") {
              return (
                <button
                  className="catalog-card"
                  key={topic.id}
                  onClick={() => navigate("/gramatica/present_tobe")}
                  type="button"
                >
                  <span
                    className={`category-badge category-badge--sm category-badge--${tone}`}
                  >
                    <span className="category-badge__order">01</span>
                  </span>
                  <span className="catalog-card__body">
                    <span className="catalog-card__eyebrow">
                      Disponível agora
                    </span>
                    <strong className="catalog-card__title">
                      Verbo TO BE — presente
                    </strong>
                    <span className="catalog-card__desc">
                      {topic.description}
                    </span>
                  </span>
                  <span className="catalog-card__trailing">
                    <span className="pill-tag pill-tag--blue">130 questões</span>
                    <AppIcon name="chevron-right" size={18} />
                  </span>
                </button>
              );
            }

            if (
              GRAMMAR_COURSE_IDS.includes(
                topic.id as (typeof GRAMMAR_COURSE_IDS)[number],
              )
            ) {
              return (
                <button
                  className="catalog-card"
                  key={topic.id}
                  onClick={() => navigate(`/gramatica/${topic.id}`)}
                  type="button"
                >
                  <span
                    className={`category-badge category-badge--sm category-badge--${tone}`}
                  >
                    <span className="category-badge__order">
                      {String(topic.sequence).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="catalog-card__body">
                    <span className="catalog-card__eyebrow">
                      Explicação + prática
                    </span>
                    <strong className="catalog-card__title">
                      {topic.title}
                    </strong>
                    <span className="catalog-card__desc">
                      {topic.description}
                    </span>
                  </span>
                  <span className="catalog-card__trailing">
                    <span className="pill-tag pill-tag--blue">5 níveis</span>
                    <AppIcon name="chevron-right" size={18} />
                  </span>
                </button>
              );
            }

            if (topic.id === "simple_past") {
              return (
                <button
                  className="catalog-card"
                  key={topic.id}
                  onClick={() =>
                    navigate("/livro/intro/gramatica/simple-past")
                  }
                  type="button"
                >
                  <span
                    className={`category-badge category-badge--sm category-badge--${tone}`}
                    style={{ color: "#FFFFFF" }}
                  >
                    <AppIcon name="clock" size={20} />
                  </span>
                  <span className="catalog-card__body">
                    <span className="catalog-card__eyebrow">Livro Intro</span>
                    <strong className="catalog-card__title">Simple Past</strong>
                    <span className="catalog-card__desc">
                      Explicação com exemplos em áudio e 3 formatos de prática no
                      Livro Intro.
                    </span>
                  </span>
                  <span className="catalog-card__trailing">
                    <span className="pill-tag pill-tag--blue">
                      3 atividades
                    </span>
                    <AppIcon name="chevron-right" size={18} />
                  </span>
                </button>
              );
            }

            return (
              <button
                aria-disabled="true"
                className="catalog-card is-locked"
                key={topic.id}
                onClick={() => showLocked(topic.title)}
                type="button"
              >
                <span
                  className="category-badge category-badge--sm"
                  style={{
                    background: "var(--surface-subtle)",
                    color: "var(--text-muted)",
                  }}
                >
                  <AppIcon name="lock" size={18} />
                </span>
                <span className="catalog-card__body">
                  <strong className="catalog-card__title">{topic.title}</strong>
                  <span className="catalog-card__desc">
                    {topic.description}
                  </span>
                </span>
                <span className="catalog-card__trailing">
                  <span className="pill-tag">Em breve</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Toast message={notice} />
    </AppShell>
  );
}
