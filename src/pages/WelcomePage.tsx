import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";
import GradientText from "../components/GradientText";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center gap-6">
      <GradientText as="h1" className="text-2xl">
        Bem-vindo(a)!
      </GradientText>
      <GlassCard className="max-w-sm">
        <p className="text-cream/85 leading-relaxed">
          {/* TODO: texto final da proposta do app — placeholder por enquanto */}
          Aqui você revisa os tópicos que aprendeu em aula, pratica com
          quizzes e joga com o vocabulário — no seu tempo, do seu jeito.
        </p>
      </GlassCard>
      <GlowButton onClick={() => navigate("/tutorial")}>
        Continuar
      </GlowButton>
    </div>
  );
}
