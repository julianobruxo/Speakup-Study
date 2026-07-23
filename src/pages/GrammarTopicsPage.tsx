import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import {
  AppCard,
  AppShell,
  LockedCard,
  PageHeader,
} from "../components/AppShell";
import Toast from "../components/Toast";
import { ACTIVE_GRAMMAR_TOPICS } from "../content/taxonomy";

export default function GrammarTopicsPage() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");

  function showLocked(title: string) {
    setNotice(`${title} estará disponível em breve.`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <AppShell className="standard-page">
      <PageHeader backTo="/praticar" title="Gramática" />
      <section className="page-lead compact">
        <span className="eyebrow">8 tópicos de gramática</span>
        <h2>Escolha um tópico</h2>
        <p>Comece pelo presente do verbo TO BE. Os próximos já têm lugar reservado.</p>
      </section>

      <div className="curriculum-control" aria-label="Nível curricular">
        <button aria-pressed="true">Iniciante</button>
        <button
          aria-disabled="true"
          onClick={() => showLocked("Nível avançado")}
        >
          Avançado <AppIcon name="lock" size={14} />
        </button>
      </div>

      <div className="topic-list">
        {ACTIVE_GRAMMAR_TOPICS.map((topic) =>
          topic.id === "present_tobe" ? (
            <AppCard
              className="available-topic"
              description="Afirmações, negativas, perguntas e respostas curtas."
              eyebrow="Disponível agora"
              icon={<span className="topic-number">01</span>}
              key={topic.id}
              onClick={() => navigate("/gramatica/present_tobe")}
              title="Verbo TO BE — presente"
              trailing={<span className="count-pill">130 questões</span>}
            />
          ) : (
            <LockedCard
              description="Conteúdo em preparação."
              key={topic.id}
              onClick={() => showLocked(topic.title)}
              title={topic.title}
            />
          ),
        )}
      </div>
      <Toast message={notice} />
    </AppShell>
  );
}
