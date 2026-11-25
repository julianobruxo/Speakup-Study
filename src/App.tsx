import { Navigate, Route, Routes, useParams } from "react-router-dom";
import PastStudioPage from "./pages/PastStudioPage";
import AudioNotice from "./components/AudioNotice";
import GrammarTopicsPage from "./pages/GrammarTopicsPage";
import GrammarCoursePage from "./pages/GrammarCoursePage";
import HomePage from "./pages/HomePage";
import PracticeLandingPage from "./pages/PracticeLandingPage";
import PracticeSessionPage from "./pages/PracticeSessionPage";
import PracticeSetupPage from "./pages/PracticeSetupPage";
import ProfilePage from "./pages/ProfilePage";
import ProgressPage from "./pages/ProgressPage";
import SchoolStudyPage from "./pages/SchoolStudyPage";
import VocabularyCategoryPage from "./pages/VocabularyCategoryPage";
import VocabularyFlashcardPage from "./pages/VocabularyFlashcardPage";
import VocabularyPage from "./pages/VocabularyPage";
import { getGrammarCourse } from "./content/data/grammarCourses";

export default function App() {
  return (
    <>
    <AudioNotice />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/passado/:activity?" element={<PastStudioPage />} />
      <Route path="/praticar" element={<PracticeLandingPage />} />
      <Route path="/gramatica" element={<GrammarTopicsPage />} />
      <Route
        path="/gramatica/present_tobe"
        element={<PracticeSetupPage />}
      />
      <Route path="/gramatica/:topicId" element={<GrammarCoursePage />} />
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
      <Route path="/escola/:section?" element={<SchoolStudyPage />} />
      <Route path="/progresso" element={<ProgressPage />} />
      <Route path="/perfil" element={<ProfilePage />} />

      <Route path="/bem-vindo" element={<Navigate to="/" replace />} />
      <Route path="/tutorial" element={<Navigate to="/" replace />} />
      <Route path="/hub" element={<Navigate to="/" replace />} />
      <Route path="/estudar" element={<Navigate to="/praticar" replace />} />
      <Route
        path="/estudar/:topic"
        element={<LegacyTopicRedirect />}
      />
      <Route
        path="/estudar/:topic/conteudo"
        element={<LegacyTopicRedirect />}
      />
      <Route
        path="/praticar/:topic"
        element={<LegacyTopicRedirect />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

function LegacyTopicRedirect() {
  const { topic } = useParams();
  if (topic === "present_tobe") return <Navigate to="/gramatica/present_tobe" replace />;
  if (topic === "simple_past") return <Navigate to="/passado/home" replace />;
  if (getGrammarCourse(topic)) return <Navigate to={`/gramatica/${topic}`} replace />;
  return <Navigate to="/gramatica" replace />;
}

