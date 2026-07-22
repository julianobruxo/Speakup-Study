import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import GradientText from "../components/GradientText";

// TODO: puxar de data/topics.ts (migração do topics_bank.json do HTML antigo)
const TOPICS = [
  "Verbo TO BE (presente)",
  "Verbo TO BE (passado)",
  "Simple Present",
  "Present Continuous",
  "Be Going To (futuro)",
  "Simple Past",
  "There Is / There Are",
  "In / On / At",
  "Action Verbs",
  "Routine Verbs",
];

export default function TopicsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col items-center px-6 py-10 gap-6">
      <GradientText as="h1" className="text-2xl">
        Escolha um tópico
      </GradientText>
      <div className="w-full max-w-sm flex flex-col gap-3">
        {TOPICS.map((topic) => (
          <GlassCard
            key={topic}
            onClick={() => navigate(`/estudar/${encodeURIComponent(topic)}`)}
          >
            <h3 className="font-display font-medium">{topic}</h3>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
