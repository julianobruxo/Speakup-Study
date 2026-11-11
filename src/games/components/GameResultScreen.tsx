import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import AppIcon from "../../components/AppIcon";
import { AppShell, PrimaryButton } from "../../components/AppShell";
import type { GameRoundResult } from "../core/sessionEngine";

interface GameResultScreenProps {
  gameTitle: string;
  result: GameRoundResult;
  reduceMotion: boolean;
  onPlayAgain: () => void;
  onChangeGame: () => void;
  onHome: () => void;
}

export function GameResultScreen({
  gameTitle,
  onChangeGame,
  onHome,
  onPlayAgain,
  reduceMotion,
  result,
}: GameResultScreenProps) {
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
          <h1>{message}</h1>
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

