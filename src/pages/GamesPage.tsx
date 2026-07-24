import { useState } from "react";
import { motion } from "framer-motion";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import Toast from "../components/Toast";

const games = [
  {
    icon: "clock" as const,
    title: "Contra o tempo",
    copy: "Responda o máximo de questões antes do relógio zerar.",
    tone: "blue",
  },
  {
    icon: "grid" as const,
    title: "Memória",
    copy: "Encontre os pares entre a palavra em inglês e em português.",
    tone: "rose",
  },
  {
    icon: "game" as const,
    title: "Palavras embaralhadas",
    copy: "Reconstrua cada palavra colocando as letras na ordem certa.",
    tone: "gold",
  },
  {
    icon: "check" as const,
    title: "Verdadeiro ou falso",
    copy: "Decida rapidamente se a afirmação em inglês está correta.",
    tone: "green",
  },
  {
    icon: "sparkles" as const,
    title: "Descubra a palavra",
    copy: "Use a tradução e as letras reveladas para adivinhar a palavra.",
    tone: "violet",
  },
  {
    icon: "book" as const,
    title: "Soletrando",
    copy: "Escute a palavra e escreva a soletração correta, sem ajuda.",
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
    <AppShell className="standard-page">
      <PageHeader backTo="/" title="Jogos" />
      <section className="page-lead compact">
        <span className="eyebrow">6 experiências planejadas</span>
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
