import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppDialog from "../components/AppDialog";
import AppIcon from "../components/AppIcon";
import { AppCard, AppShell } from "../components/AppShell";
import HomeHero from "../components/home/HomeHero";
import HomeProgressSummary from "../components/home/HomeProgressSummary";
import LearningPathSection from "../components/home/LearningPathSection";
import PersonalRecordsSection from "../components/home/PersonalRecordsSection";
import QuickGamesSection from "../components/home/QuickGamesSection";
import Toast from "../components/Toast";
import { useProgressSummary } from "../services/progress/useProgressSummary";

export default function HomePage() {
  const navigate = useNavigate();
  const { summary, loading, error } = useProgressSummary();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [notice, setNotice] = useState("");

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <AppShell activeNav="home" className="home-page" dialogOpen={sheetOpen}>
      <div className="home-hero-layout">
        <HomeHero
          onExploreClick={() => navigate("/praticar")}
          onPracticeClick={() => setSheetOpen(true)}
        />
        <HomeProgressSummary error={error} loading={loading} summary={summary} />
      </div>

      <LearningPathSection loading={loading} summary={summary} />

      <QuickGamesSection
        onLocked={(title) => showNotice(`${title}: disponível em breve.`)}
      />

      <PersonalRecordsSection summary={summary} />

      <AppDialog
        className="bottom-sheet-dialog"
        description="Depois você escolhe o tópico, a dificuldade e a quantidade de questões."
        onClose={() => setSheetOpen(false)}
        open={sheetOpen}
        title="O que você quer praticar?"
      >
        <div className="sheet-choices">
          <AppCard
            description="TO BE, Simple Present, passado, futuro e mais."
            icon={<AppIcon name="book" />}
            onClick={() => navigate("/gramatica")}
            title="Gramática"
            trailing={<span className="count-pill">8 tópicos</span>}
          />
          <AppCard
            description="Explore palavras organizadas por categoria."
            icon={<AppIcon name="grid" />}
            onClick={() => navigate("/vocabulario")}
            title="Vocabulário"
            trailing={<span className="count-pill">9 categorias</span>}
          />
        </div>
      </AppDialog>
      <Toast message={notice} />
    </AppShell>
  );
}
