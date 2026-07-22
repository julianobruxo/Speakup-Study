import { Routes, Route, Navigate } from "react-router-dom";
import AppBackground from "./components/AppBackground";
import LoginPage from "./pages/LoginPage";
import WelcomePage from "./pages/WelcomePage";
import TutorialPage from "./pages/TutorialPage";
import HubPage from "./pages/HubPage";
import TopicsPage from "./pages/TopicsPage";
import TopicChoicePage from "./pages/TopicChoicePage";
import PracticePage from "./pages/PracticePage";
import VocabularyPage from "./pages/VocabularyPage";

export default function App() {
  return (
    <>
      <AppBackground />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/bem-vindo" element={<WelcomePage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/hub" element={<HubPage />} />

        <Route path="/estudar" element={<TopicsPage />} />
        <Route path="/estudar/:topic" element={<TopicChoicePage />} />
        <Route path="/estudar/:topic/conteudo" element={<PracticePage />} />

        <Route path="/praticar" element={<TopicsPage />} />
        <Route path="/praticar/:topic" element={<PracticePage />} />

        <Route path="/vocabulario" element={<VocabularyPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
