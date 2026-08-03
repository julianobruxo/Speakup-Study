import { motion } from "framer-motion";
import { useEffect, useRef, type CSSProperties } from "react";
import AppIcon from "../../components/AppIcon";
import { AppShell, PrimaryButton } from "../../components/AppShell";
import type { GameRoundResult } from "../core/sessionEngine";

interface GameResultScreenProps {
  completionError: Error | null;
  gameTitle: string;
  onRetryPersistence: () => void;
  result: GameRoundResult;
  reduceMotion: boolean;
  onPlayAgain: () => void;
  onChangeGame: () => void;
  onHome: () => void;
}

export function GameResultScreen({
  completionError,
  gameTitle,
  onChangeGame,
  onHome,
  onPlayAgain,
  onRetryPersistence,
  reduceMotion,
  result,
}: GameResultScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const percentage =
    result.totalChallenges > 0
      ? Math.round((result.correctCount / result.totalChallenges) * 100)
      : 0;
  const message =
    percentage >= 90
      ? "Excelente rodada!"
      : percentage >= 70
        ? "Você está no caminho certo!"
        : "Cada rodada deixa a habilidade mais afiada.";

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <AppShell className="result-page game-result-page" hideNavigation>
      <div className="result-layout">
        <motion.section
          animate={{ scale: 1 }}
          className="result-hero"
          initial={{ scale: reduceMotion ? 1 : 0.98 }}
          transition={{ duration: reduceMotion ? 0 : 0.28 }}
        >
          <span className="result-burst" aria-hidden="true" />
          <span className="result-icon">
            <AppIcon name="trophy" size={40} />
          </span>
          <span className="eyebrow">Rodada concluída</span>
          <h1 ref={headingRef} tabIndex={-1}>{message}</h1>
          <p>Você completou {gameTitle}.</p>
        </motion.section>

        <div className="result-summary">
          <section className="score-panel">
            <div className="score-ring" style={{ "--score": percentage } as CSSProperties}>
              <strong>{percentage}%</strong>
              <span>de acertos</span>
            </div>
            <div className="score-stats">
              <div>
                <strong>{result.totalChallenges}</strong>
                <span>Total</span>
              </div>
              <div>
                <strong>{result.correctCount}</strong>
                <span>Acertos</span>
              </div>
              <div>
                <strong>{result.score}</strong>
                <span>Pontuação</span>
              </div>
              <div>
                <strong>+{result.xpEarned}</strong>
                <span>XP na rodada</span>
              </div>
            </div>
          </section>

          {completionError && (
            <section className="result-save-error" role="alert">
              <span className="feedback-icon">
                <AppIcon name="close" size={20} />
              </span>
              <div>
                <strong>O resultado ainda não foi salvo.</strong>
                <p>Confira o armazenamento do navegador e tente novamente.</p>
              </div>
              <PrimaryButton
                icon={<AppIcon name="refresh" size={18} />}
                onClick={onRetryPersistence}
                variant="secondary"
              >
                Tentar salvar novamente
              </PrimaryButton>
            </section>
          )}

          <div className="result-actions">
            <PrimaryButton icon={<AppIcon name="refresh" />} onClick={onPlayAgain}>
              Jogar novamente
            </PrimaryButton>
            <PrimaryButton onClick={onChangeGame} variant="secondary">
              Escolher outro jogo
            </PrimaryButton>
            <PrimaryButton icon={<AppIcon name="home" size={19} />} onClick={onHome} variant="quiet">
              Voltar à home
            </PrimaryButton>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
