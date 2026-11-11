import { motion } from "framer-motion";
import AppIcon from "../AppIcon";

interface HomeHeroProps {
  onPracticeClick: () => void;
  onExploreClick: () => void;
}

export default function HomeHero({
  onExploreClick,
  onPracticeClick,
}: HomeHeroProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="home-pitch"
      initial={{ opacity: 0, y: 8 }}
    >
      <div className="home-intro">
        <span className="eyebrow">Prática rápida. Inglês de verdade.</span>
        <h1>Treine inglês no seu ritmo.</h1>
        <p>
          Escolha o desafio, responda e entenda cada regra com feedback
          direto.
        </p>
      </div>

      <motion.button
        className="practice-hero-card"
        onClick={onPracticeClick}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.985 }}
      >
        <span className="practice-hero-icon">
          <AppIcon name="book" size={30} />
        </span>
        <span className="practice-hero-copy">
          <strong>Bora praticar</strong>
          <span>Escolha uma área e monte um desafio do seu jeito.</span>
        </span>
        <span className="card-chevron">
          <AppIcon name="chevron-right" />
        </span>
        <span className="practice-tags">
          <i>Gramática</i>
          <i>Vocabulário</i>
          <i>Rodadas rápidas</i>
        </span>
      </motion.button>

      <button className="home-hero-secondary" onClick={onExploreClick}>
        Explorar conteúdos
        <AppIcon name="chevron-right" size={16} />
      </button>
    </motion.section>
  );
}

