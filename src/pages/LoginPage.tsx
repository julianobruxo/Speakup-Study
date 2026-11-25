import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";
import GradientText from "../components/GradientText";

// TODO: trocar pelo login Google de verdade (decisão já tomada, falta
// implementar — ver anotações do legado speakup-english-challenge.
export default function LoginPage() {
  const navigate = useNavigate();

  function handleLogin() {
    // placeholder — hoje só avança o fluxo
    navigate("/bem-vindo");
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center gap-8">
      <div className="flex flex-col items-center gap-3">
        {/* TODO: substituir por <img> com o logo real da escola */}
        <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center text-3xl font-display font-bold">
          SU
        </div>
        <GradientText as="h1" className="text-3xl">
          Speak Up Study
        </GradientText>
        <p className="text-cream/70 max-w-xs">
          Estude e pratique inglês no seu ritmo, feito para os alunos da
          Speak UP.
        </p>
      </div>

      <GlassCard className="w-full max-w-sm">
        <GlowButton onClick={handleLogin} className="w-full">
          Entrar com Google
        </GlowButton>
      </GlassCard>
    </div>
  );
}

