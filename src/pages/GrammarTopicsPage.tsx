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
import { GRAMMAR_COURSE_IDS } from "../content/data/grammarCourses";
import { ACTIVE_GRAMMAR_TOPICS } from "../content/taxonomy";

export default function GrammarTopicsPage() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");

  function showLocked(title: string) {
    setNotice(`${title} estará disponível em breve.`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <AppShell activeNav="study" className="standard-page">
      <PageHeader backTo="/praticar" title="Gramática" />
      <section className="page-lead compact">
        <span className="eyebrow">6 tópicos disponíveis</span>
        <h2>Escolha um tópico</h2>
        <p>Aprenda a estrutura, pratique em 5 níveis e conclua com uma revisão final.</p>
      </section>

      <div className="topic-list">
        {ACTIVE_GRAMMAR_TOPICS.map((topic) =>
          topic.id === "present_tobe" ? (
            <AppCard
              className="available-topic"
              description={topic.description}
              eyebrow="Disponível agora"
              icon={<span className="topic-number">01</span>}
              key={topic.id}
              onClick={() => navigate("/gramatica/present_tobe")}
              title="Verbo TO BE — presente"
              trailing={<span className="count-pill">130 questões</span>}
            />
          ) : GRAMMAR_COURSE_IDS.includes(topic.id as (typeof GRAMMAR_COURSE_IDS)[number]) ? (
            <AppCard
              className="available-topic"
              description={topic.description}
              eyebrow="Explicação + prática"
              icon={<span className="topic-number">{String(topic.sequence).padStart(2, "0")}</span>}
              key={topic.id}
              onClick={() => navigate(`/gramatica/${topic.id}`)}
              title={topic.title}
              trailing={<span className="count-pill">5 níveis</span>}
            />
          ) : topic.id === "simple_past" ? (
            <AppCard key={topic.id} className="available-topic" description="104 verbos com áudio, lacunas, expressões de tempo, escrita e revisão final." eyebrow="Disponível agora" icon={<AppIcon name="clock" />} onClick={() => navigate("/passado/home")} title="Simple Past" trailing={<span className="count-pill">5 atividades</span>} />
          ) : (
            <LockedCard
              description={topic.description}
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

