import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";

// TODO: tornar de fato swipável (framer-motion drag / biblioteca de carrossel).
// Por ora, navegação por botão como esqueleto funcional.
const SLIDES = [
  { title: "Estudar", text: "Revise a explicação de cada tópico no seu ritmo." },
  { title: "Praticar", text: "Faça quizzes rápidos — pode pular direto pra cá se quiser." },
  { title: "Vocabulário", text: "Flashcards com som, tradução e imagem pra fixar palavras novas." },
];

export default function TutorialPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 gap-6">
      <GlassCard className="w-full max-w-sm text-center">
        <h2 className="font-display font-bold text-xl mb-2">{slide.title}</h2>
        <p className="text-cream/80">{slide.text}</p>
      </GlassCard>

      <div className="flex gap-2">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${i === step ? "bg-red" : "bg-cream/30"}`}
          />
        ))}
      </div>

      <GlowButton
        onClick={() =>
          isLast ? navigate("/hub") : setStep((s) => s + 1)
        }
      >
        {isLast ? "Começar" : "Próximo"}
      </GlowButton>
    </div>
  );
}
