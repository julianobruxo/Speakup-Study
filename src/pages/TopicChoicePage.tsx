import { useParams, useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import GlowButton from "../components/GlowButton";
import GradientText from "../components/GradientText";

// Fork "Estudar tópico primeiro" x "Apenas praticar" dentro de um tópico
// específico (combinado na conversa). TODO: telas de estudo interativas
// com vídeo/áudio ainda não implementadas — placeholder.
export default function TopicChoicePage() {
  const { topic } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 gap-6 text-center">
      <GradientText as="h1" className="text-xl">
        {decodeURIComponent(topic ?? "")}
      </GradientText>
      <GlassCard className="max-w-sm">
        <p className="text-cream/80">Quer estudar esse tópico antes de praticar?</p>
      </GlassCard>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <GlowButton onClick={() => navigate(`/estudar/${topic}/conteudo`)}>
          Estudar tópico primeiro
        </GlowButton>
        <GlowButton onClick={() => navigate(`/praticar/${topic}`)}>
          Apenas praticar
        </GlowButton>
      </div>
    </div>
  );
}

