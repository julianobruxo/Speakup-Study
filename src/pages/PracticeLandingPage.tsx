import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import {
  AppCard,
  AppShell,
} from "../components/AppShell";

export default function PracticeLandingPage() {
  const navigate = useNavigate();
  return (
    <AppShell activeNav="study" className="standard-page">
      <header className="main-page-heading">
        <span className="eyebrow">Estudar</span>
        <h1>Escolha seu próximo desafio</h1>
      </header>
      <section className="page-lead">
        <h2>O que você quer praticar?</h2>
        <p>Comece por gramática ou explore as categorias de vocabulário.</p>
      </section>
      <div className="feature-list">
        <AppCard
          description="Escolha o tópico, a dificuldade e a duração da sessão."
          icon={<AppIcon name="book" />}
          onClick={() => navigate("/gramatica")}
          title="Gramática"
          trailing={<span className="count-pill">1 disponível</span>}
        />
        <AppCard
          description="Estude Partes do corpo com imagens e pronúncia."
          icon={<AppIcon name="grid" />}
          onClick={() => navigate("/vocabulario")}
          title="Vocabulário"
          trailing={<span className="count-pill">1 disponível</span>}
        />
        <AppCard
          description="Seis experiências rápidas já desenhadas para o app."
          icon={<AppIcon name="game" />}
          onClick={() => navigate("/jogos")}
          title="Jogos"
          trailing={<span className="status-pill">Em breve</span>}
        />
      </div>
    </AppShell>
  );
}
