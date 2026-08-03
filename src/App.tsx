import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import GrammarTopicsPage from "./pages/GrammarTopicsPage";
import HomePage from "./pages/HomePage";
import PracticeLandingPage from "./pages/PracticeLandingPage";
import PracticeSessionPage from "./pages/PracticeSessionPage";
import PracticeSetupPage from "./pages/PracticeSetupPage";
import ProfilePage from "./pages/ProfilePage";
import ProgressPage from "./pages/ProgressPage";
import VocabularyCategoryPage from "./pages/VocabularyCategoryPage";
import VocabularyFlashcardPage from "./pages/VocabularyFlashcardPage";
import VocabularyPage from "./pages/VocabularyPage";

const GamesPage = lazy(() => import("./pages/GamesPage"));
const SentenceBuilderGame = lazy(() => import("./games/mechanics/SentenceBuilderGame"));
const ErrorHuntGame = lazy(() => import("./games/mechanics/ErrorHuntGame"));
const SecretWordGame = lazy(() => import("./games/mechanics/SecretWordGame"));
const MatchingPairsGame = lazy(() => import("./games/mechanics/MatchingPairsGame"));
const MemoryMatchGame = lazy(() => import("./games/mechanics/MemoryMatchGame"));
const SortingStationGame = lazy(() => import("./games/mechanics/SortingStationGame"));
const CrosswordGame = lazy(() => import("./games/mechanics/CrosswordGame"));
const ListeningEarGame = lazy(() => import("./games/mechanics/ListeningEarGame"));
const BeatTheClockGame = lazy(() => import("./games/mechanics/BeatTheClockGame"));
const ArcadeBridgeLabPage = lazy(() => import("./games/arcade/bridge/ArcadeBridgeLabPage"));
const BubbleShooterGame = lazy(() => import("./games/arcade/bubbleShooter/BubbleShooterGame"));
const WordSliceGame = lazy(() => import("./games/arcade/wordSlice/WordSliceGame"));
const NinjaFoundationGame = lazy(() => import("./games/arcade/ninja/NinjaFoundationGame"));

function RouteLoading() {
  return (
    <main aria-live="polite" className="route-loading" role="status">
      Carregando...
    </main>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/praticar" element={<PracticeLandingPage />} />
        <Route path="/gramatica" element={<GrammarTopicsPage />} />
        <Route
          path="/gramatica/present_tobe"
          element={<PracticeSetupPage />}
        />
        <Route
          path="/praticar/present_tobe/sessao"
          element={<PracticeSessionPage />}
        />
        <Route path="/vocabulario" element={<VocabularyPage />} />
        <Route
          path="/vocabulario/body/flashcards"
          element={<VocabularyFlashcardPage />}
        />
        <Route
          path="/vocabulario/:categoryId"
          element={<VocabularyCategoryPage />}
        />
        <Route path="/jogos" element={<GamesPage />} />
        <Route path="/jogos/monte-a-frase" element={<SentenceBuilderGame />} />
        <Route path="/jogos/caca-ao-erro" element={<ErrorHuntGame />} />
        <Route path="/jogos/palavra-secreta" element={<SecretWordGame />} />
        <Route path="/jogos/conectando" element={<MatchingPairsGame />} />
        <Route path="/jogos/par-perfeito" element={<MemoryMatchGame />} />
        <Route path="/jogos/cada-coisa-no-seu-lugar" element={<SortingStationGame />} />
        <Route path="/jogos/cruzando-palavras" element={<CrosswordGame />} />
        <Route path="/jogos/ouvido-afiado" element={<ListeningEarGame />} />
        <Route path="/jogos/contra-o-relogio" element={<BeatTheClockGame />} />
        <Route path="/jogos/bridge-tecnica" element={<ArcadeBridgeLabPage />} />
        <Route path="/jogos/bubble-shooter" element={<BubbleShooterGame />} />
        <Route path="/jogos/corte-a-palavra" element={<WordSliceGame />} />
        <Route path="/jogos/ninja" element={<NinjaFoundationGame />} />
        <Route path="/progresso" element={<ProgressPage />} />
        <Route path="/perfil" element={<ProfilePage />} />

        <Route path="/bem-vindo" element={<Navigate to="/" replace />} />
        <Route path="/tutorial" element={<Navigate to="/" replace />} />
        <Route path="/hub" element={<Navigate to="/" replace />} />
        <Route path="/estudar" element={<Navigate to="/praticar" replace />} />
        <Route
          path="/estudar/:topic"
          element={<Navigate to="/gramatica" replace />}
        />
        <Route
          path="/estudar/:topic/conteudo"
          element={<Navigate to="/gramatica" replace />}
        />
        <Route
          path="/praticar/:topic"
          element={<Navigate to="/gramatica/present_tobe" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
