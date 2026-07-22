import { useParams } from "react-router-dom";
import GlassCard from "../components/GlassCard";

// TODO: migrar a state machine dos 7 jogos (English Challenge, Beat the
// Clock, Memória, Palavras Embaralhadas, Verdadeiro ou Falso, Revelação,
// Soletrando) do HTML antigo pra cá. Gate de 75%/roleta NÃO entra mais
// (mecânica de feira, descartada). Sorteio sem repetição continua valendo.
export default function PracticePage() {
  const { topic } = useParams();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 gap-4 text-center">
      <GlassCard className="max-w-sm">
        <h2 className="font-display font-semibold text-lg mb-2">
          Prática {topic ? `— ${decodeURIComponent(topic)}` : ""}
        </h2>
        <p className="text-cream/70 text-sm">
          Jogos ainda não migrados pra cá — esqueleto de rota pronto.
        </p>
      </GlassCard>
    </div>
  );
}
