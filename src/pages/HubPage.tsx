import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import GradientText from "../components/GradientText";

const OPTIONS = [
  {
    key: "estudar",
    label: "Estudar tópicos",
    desc: "Revise a explicação de gramática antes de praticar.",
    to: "/estudar",
  },
  {
    key: "praticar",
    label: "Praticar",
    desc: "Direto pros quizzes — sem precisar estudar antes.",
    to: "/praticar",
  },
  {
    key: "vocabulario",
    label: "Vocabulário",
    desc: "Flashcards com som, tradução e imagem.",
    to: "/vocabulario",
  },
];

export default function HubPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col items-center px-6 py-10 gap-6">
      <GradientText as="h1" className="text-2xl">
        O que vamos fazer hoje?
      </GradientText>

      <div className="w-full max-w-sm flex flex-col gap-4">
        {OPTIONS.map((opt) => (
          <GlassCard
            key={opt.key}
            onClick={() => navigate(opt.to)}
            className="text-left"
          >
            <h3 className="font-display font-semibold text-lg">{opt.label}</h3>
            <p className="text-cream/70 text-sm mt-1">{opt.desc}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

