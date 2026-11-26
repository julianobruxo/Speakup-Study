import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";

const SLIDES = [
  {
    title: "Estudar",
    text: "Revise a explicação de cada tópico no seu ritmo.",
  },
  {
    title: "Praticar",
    text: "Faça quizzes rápidos — pode pular direto pra cá se quiser.",
  },
  {
    title: "Vocabulário",
    text: "Flashcards com som, tradução e imagem pra fixar palavras novas.",
  },
];

export default function TutorialPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="auth-page">
      <GlassCard className="auth-card">
        <h2 className="auth-card__title">{slide.title}</h2>
        <p className="auth-card__text">{slide.text}</p>
      </GlassCard>

      <div className="progress-dots" aria-label={`Passo ${step + 1} de ${SLIDES.length}`}>
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`progress-dot ${
              i === step
                ? "progress-dot--active"
                : i < step
                  ? "progress-dot--done"
                  : ""
            }`}
          />
        ))}
      </div>

      <GlowButton
        onClick={() => (isLast ? navigate("/hub") : setStep((s) => s + 1))}
      >
        {isLast ? "Começar" : "Próximo"}
      </GlowButton>
    </div>
  );
}
