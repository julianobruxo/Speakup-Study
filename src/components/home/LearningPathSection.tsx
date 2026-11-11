import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../AppIcon";
import type { ProgressSummary } from "../../services/progress/progress";

interface LearningPathSectionProps {
  loading: boolean;
  summary: ProgressSummary | null;
}

export default function LearningPathSection({
  loading,
  summary,
}: LearningPathSectionProps) {
  const navigate = useNavigate();
  const practiced = summary?.uniqueQuestions ?? 0;
  const percentage = Math.round((practiced / 130) * 100);
  const hasStarted = practiced > 0;

  return (
    <section className="learning-path-section">
      <div className="section-heading">
        <div>
          <span>Continue por aqui</span>
          <h2>Seu caminho de prática</h2>
        </div>
      </div>
      <div className="learning-path-grid">
        <motion.button
          className="learning-path-card"
          onClick={() => navigate("/gramatica/present_tobe")}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.985 }}
        >
          <span className="learning-path-icon grammar">
            <AppIcon name="book" size={22} />
          </span>
          <span className="learning-path-copy">
            <span className="eyebrow">Gramática</span>
            <strong>Verbo TO BE — presente</strong>
            {loading ? (
              <span className="learning-path-status">
                Carregando seu progresso...
              </span>
            ) : (
              <>
                <span>
                  {hasStarted
                    ? `${practiced} de 130 questões praticadas`
                    : "Afirmações, negativas, perguntas e respostas curtas."}
                </span>
                <span
                  aria-label={`${percentage}% das questões praticadas`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={percentage}
                  className="learning-path-progress"
                  role="progressbar"
                >
                  <i style={{ width: `${percentage}%` }} />
                </span>
              </>
            )}
          </span>
          <span className="learning-path-action">
            {hasStarted ? "Continuar" : "Começar agora"}
            <AppIcon name="chevron-right" size={17} />
          </span>
        </motion.button>

        <motion.button
          className="learning-path-card"
          onClick={() => navigate("/vocabulario/body/flashcards")}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.985 }}
        >
          <span className="learning-path-icon vocabulary">
            <AppIcon name="grid" size={22} />
          </span>
          <span className="learning-path-copy">
            <span className="eyebrow">Vocabulário</span>
            <strong>Partes do corpo</strong>
            <span>24 flashcards com imagem e pronúncia.</span>
          </span>
          <span className="learning-path-action">
            Estudar
            <AppIcon name="chevron-right" size={17} />
          </span>
        </motion.button>
      </div>
    </section>
  );
}

