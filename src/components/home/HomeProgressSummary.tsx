import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../AppIcon";
import type { ProgressSummary } from "../../services/progress/progress";

interface HomeProgressSummaryProps {
  error: boolean;
  loading: boolean;
  summary: ProgressSummary | null;
}

export default function HomeProgressSummary({
  error,
  loading,
  summary,
}: HomeProgressSummaryProps) {
  const navigate = useNavigate();
  const practiced = summary?.uniqueQuestions ?? 0;
  const percentage = Math.round((practiced / 130) * 100);

  return (
    <motion.section
      animate={{ opacity: 1, x: 0 }}
      className="home-progress-panel"
      initial={{ opacity: 0, x: 10 }}
    >
      <div className="home-progress-heading">
        <span className="available-mark">
          <AppIcon name="chart" size={20} />
        </span>
        <div>
          <span>Seu progresso</span>
          <h2>{loading ? "Carregando..." : `${practiced} de 130 questões`}</h2>
        </div>
        <strong>{loading ? "—" : `${percentage}%`}</strong>
      </div>
      <div
        aria-label={`${percentage}% das questões praticadas`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={loading ? 0 : percentage}
        className="home-progress-bar"
        role="progressbar"
      >
        <i style={{ width: loading ? "0%" : `${percentage}%` }} />
      </div>
      <div className="home-progress-stats">
        <span>
          <strong>
            {loading || !summary
              ? "—"
              : `${summary.accuracy ?? "—"}${summary.accuracy !== null ? "%" : ""}`}
          </strong>
          Precisão
        </span>
        <span>
          <strong>{loading ? "—" : (summary?.completedSessions ?? 0)}</strong>
          Sessões
        </span>
        <span>
          <strong>{loading ? "—" : (summary?.reviewCount ?? 0)}</strong>
          Para revisar
        </span>
      </div>
      <p>
        {loading
          ? "Carregando seu histórico..."
          : error
            ? "Não foi possível ler o progresso salvo neste dispositivo."
            : practiced
              ? "Continue de onde parou e avance pelas questões."
              : "Seu progresso começa na primeira rodada."}
      </p>
      <button
        className="home-progress-link"
        onClick={() => navigate("/progresso")}
      >
        Ver progresso completo
        <AppIcon name="chevron-right" size={16} />
      </button>
    </motion.section>
  );
}

