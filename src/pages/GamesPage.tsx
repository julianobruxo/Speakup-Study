import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell } from "../components/AppShell";
import Toast from "../components/Toast";

const games = [
  {
    icon: "book" as const,
    title: "Monte a frase",
    copy: "Organize palavras para formar frases corretas em inglês.",
    tone: "blue",
    route: "/jogos/monte-a-frase",
  },
  {
    icon: "check" as const,
    title: "Caça ao erro",
    copy: "Encontre rapidamente o ponto incorreto da frase.",
    tone: "rose",
    route: "/jogos/caca-ao-erro",
  },
  {
    icon: "clock" as const,
    title: "Contra o relógio",
    copy: "Responda o máximo de questões antes do tempo acabar.",
    tone: "gold",
    route: "/jogos/contra-o-relogio",
  },
  {
    icon: "grid" as const,
    title: "Cada coisa no seu lugar",
    copy: "Coloque palavras, imagens e sentidos nos lugares certos.",
    tone: "green",
    route: "/jogos/cada-coisa-no-seu-lugar",
  },
  {
    icon: "sparkles" as const,
    title: "Palavra secreta",
    copy: "Use pistas para descobrir a palavra antes de revelar tudo.",
    tone: "violet",
    route: "/jogos/palavra-secreta",
  },
  {
    icon: "game" as const,
    title: "Conectando",
    copy: "Associe palavra em inglês e imagem para fixar vocabulário.",
    tone: "coral",
    route: "/jogos/conectando",
  },
  {
    icon: "grid" as const,
    title: "Cruzando palavras",
    copy: "Complete o quebra-cabeça de palavras cruzadas.",
    tone: "blue",
    route: "/jogos/cruzando-palavras",
  },
  {
    icon: "sparkles" as const,
    title: "Par perfeito",
    copy: "Encontre os pares de cartas iguais.",
    tone: "rose",
    route: "/jogos/par-perfeito",
  },
  {
    icon: "volume" as const,
    title: "Ouvido afiado",
    copy: "Ouça e responda: imagem, palavra ou frase.",
    tone: "gold",
    route: "/jogos/ouvido-afiado",
  },
];

export default function GamesPage() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");
  function showNotice(title: string) {
    setNotice(`${title} estará disponível em breve.`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <AppShell activeNav="games" className="standard-page games-page">
      <section className="page-lead compact">
        <span className="eyebrow">Catálogo oficial de jogos</span>
        <h2>Mais maneiras de praticar</h2>
        <p>Jogue com Present TO BE e Partes do corpo enquanto expandimos o catálogo.</p>
      </section>
      <div className="quick-games-grid">
        {games.map((game) => (
          <motion.button
            aria-disabled={game.route ? undefined : "true"}
            className={`quick-game-card tone-${game.tone}`}
            key={game.title}
            onClick={() =>
              game.route ? navigate(game.route) : showNotice(game.title)
            }
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.985 }}
          >
            <span className="game-card-top">
              <span className="quick-game-icon">
                <AppIcon name={game.icon} size={24} />
              </span>
              {!game.route && (
                <span className="locked-badge">
                  <AppIcon name="lock" size={12} />
                  Em breve
                </span>
              )}
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
