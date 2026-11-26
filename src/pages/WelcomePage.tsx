import { useNavigate } from "react-router-dom";
import { BrandMegaphoneIcon } from "../components/AppIcon";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";
import GradientText from "../components/GradientText";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand__badge" aria-hidden="true">
          <BrandMegaphoneIcon size={44} />
        </div>
        <GradientText as="h1" className="auth-brand__title">
          Bem-vindo(a)!
        </GradientText>
      </div>

      <GlassCard className="auth-card">
        <p className="auth-card__text">
          Aqui você revisa os tópicos que aprendeu em aula, pratica com
          quizzes e fixa o vocabulário com flashcards — no seu tempo, do seu
          jeito.
        </p>
        <GlowButton onClick={() => navigate("/tutorial")} className="w-full">
          Continuar
        </GlowButton>
      </GlassCard>
    </div>
  );
}
