import { useState } from "react";
import { motion } from "framer-motion";
import AppIcon from "../components/AppIcon";
import { AppShell } from "../components/AppShell";
import Toast from "../components/Toast";

const games = [
  {
    icon: "book" as const,
    title: "Monte a frase",
    copy: "Organize palavras para formar frases corretas em inglês.",
    tone: "blue",
  },
  {
    icon: "check" as const,
    title: "Caça ao erro",
    copy: "Encontre rapidamente o ponto incorreto da frase.",
    tone: "rose",
  },
  {
    icon: "clock" as const,
    title: "Contra o relógio",
    copy: "Responda o máximo de questões antes do tempo acabar.",
    tone: "gold",
  },
  {
    icon: "grid" as const,
    title: "Cada coisa no seu lugar",
    copy: "Coloque palavras, imagens e sentidos nos lugares certos.",
    tone: "green",
  },
  {
    icon: "sparkles" as const,
    title: "Palavra secreta",
    copy: "Use pistas para descobrir a palavra antes de revelar tudo.",
    tone: "violet",
  },
  {
    icon: "game" as const,
    title: "Conectando",
    copy: "Associe palavra em inglês e imagem para fixar vocabulário.",
    tone: "coral",
  },
];

export default function GamesPage() {
  const [notice, setNotice] = useState("");
  function showNotice(title: string) {
    setNotice(`${title} estará disponível em breve.`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <AppShell activeNav="games" className="standard-page games-page">
      <section className="page-lead compact">
        <span className="eyebrow">Primeiras experiências planejadas</span>
        <h2>Mais maneiras de praticar</h2>
        <p>Conheça os desafios que vão trazer novos ritmos para a prática.</p>
      </section>
      <div className="quick-games-grid">
        {games.map((game) => (
          <motion.button
            aria-disabled="true"
            className={`quick-game-card tone-${game.tone}`}
            key={game.title}
            onClick={() => showNotice(game.title)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.985 }}
          >
            <span className="game-card-top">
              <span className="quick-game-icon">
                <AppIcon name={game.icon} size={24} />
              </span>
              <span className="locked-badge">
                <AppIcon name="lock" size={12} />
                Em breve
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
      <Toast message={notice} />
    </AppShell>
  );
}
