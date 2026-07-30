import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../AppIcon";

const quickGames = [
  {
    icon: "clock" as const,
    title: "Contra o relógio",
    copy: "Responda antes do tempo acabar.",
    tone: "blue",
    route: "/jogos/contra-o-relogio",
  },
  {
    icon: "grid" as const,
    title: "Conectando",
    copy: "Associe palavra em inglês e imagem.",
    tone: "rose",
    route: "/jogos/conectando",
  },
  {
    icon: "game" as const,
    title: "Monte a frase",
    copy: "Organize as palavras na ordem certa.",
    tone: "gold",
    route: "/jogos/monte-a-frase",
  },
];

export default function QuickGamesSection() {
  const navigate = useNavigate();

  return (
    <section className="games-section">
      <div className="section-heading">
        <div>
          <span>Novos jeitos de treinar</span>
          <h2>Jogos rápidos</h2>
        </div>
        <button onClick={() => navigate("/jogos")}>Ver todos</button>
      </div>
      <div className="quick-games-grid">
        {quickGames.map((game) => (
          <motion.button
            className={`quick-game-card tone-${game.tone}`}
            key={game.title}
            onClick={() => navigate(game.route)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.985 }}
          >
            <span className="game-card-top">
              <span className="quick-game-icon">
                <AppIcon name={game.icon} size={24} />
              </span>
            </span>
            <span className="game-card-copy">
              <strong>{game.title}</strong>
              <span>{game.copy}</span>
            </span>
            <span className="game-card-pattern" aria-hidden="true" />
          </motion.button>
        ))}
      </div>
    </section>
  );
}
