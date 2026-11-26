import { useNavigate } from "react-router-dom";
import { BrandMegaphoneIcon } from "../components/AppIcon";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";
import GradientText from "../components/GradientText";

export default function LoginPage() {
  const navigate = useNavigate();

  function handleLogin() {
    navigate("/bem-vindo");
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand__badge" aria-hidden="true">
          <BrandMegaphoneIcon size={44} />
        </div>
        <GradientText as="h1" className="auth-brand__title">
          Speak UP Study
        </GradientText>
        <p className="auth-brand__subtitle">
          Estude e pratique inglês no seu ritmo, feito para os alunos da
          Speak UP.
        </p>
      </div>

      <GlassCard className="auth-card">
        <GlowButton onClick={handleLogin} className="w-full">
          Entrar com Google
        </GlowButton>
      </GlassCard>
    </div>
  );
}
