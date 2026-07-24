import { Navigate, Route, Routes } from "react-router-dom";
import GamesPage from "./pages/GamesPage";
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
import SentenceBuilderGame from "./games/mechanics/SentenceBuilderGame";
import ErrorHuntGame from "./games/mechanics/ErrorHuntGame";
import SecretWordGame from "./games/mechanics/SecretWordGame";
import MatchingPairsGame from "./games/mechanics/MatchingPairsGame";
import MemoryMatchGame from "./games/mechanics/MemoryMatchGame";
import SortingStationGame from "./games/mechanics/SortingStationGame";
import CrosswordGame from "./games/mechanics/CrosswordGame";
import ListeningEarGame from "./games/mechanics/ListeningEarGame";
import BeatTheClockGame from "./games/mechanics/BeatTheClockGame";

export default function App() {
  return (
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
  );
}
