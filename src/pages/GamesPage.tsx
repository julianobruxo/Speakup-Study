import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell } from "../components/AppShell";
import Toast from "../components/Toast";
import beatTheClockImage from "../assets/game-card-images/cards/beat-the-clock.webp";
import crosswordImage from "../assets/game-card-images/cards/crossword.webp";
import errorHuntImage from "../assets/game-card-images/cards/error-hunt.webp";
import listeningEarImage from "../assets/game-card-images/cards/listening-ear.webp";
import matchingPairsImage from "../assets/game-card-images/cards/matching-pairs.webp";
import memoryMatchImage from "../assets/game-card-images/cards/memory-match.webp";
import secretWordImage from "../assets/game-card-images/cards/secret-word.webp";
import sentenceBuilderImage from "../assets/game-card-images/cards/sentence-builder.webp";
import sortingStationImage from "../assets/game-card-images/cards/sorting-station.webp";

const games = [
  {
    icon: "book" as const,
    title: "Monte a frase",
    copy: "Organize palavras para formar frases corretas em inglês.",
    image: sentenceBuilderImage,
    tone: "blue",
    route: "/jogos/monte-a-frase",
  },
  {
    icon: "check" as const,
    title: "Caça ao erro",
    copy: "Encontre rapidamente o ponto incorreto da frase.",
    image: errorHuntImage,
    tone: "rose",
    route: "/jogos/caca-ao-erro",
  },
  {
    icon: "clock" as const,
    title: "Contra o relógio",
    copy: "Responda o máximo de questões antes do tempo acabar.",
    image: beatTheClockImage,
    tone: "gold",
    route: "/jogos/contra-o-relogio",
  },
  {
    icon: "grid" as const,
    title: "Cada coisa no seu lugar",
    copy: "Arraste cada palavra até a imagem correspondente.",
    image: sortingStationImage,
    tone: "green",
    route: "/jogos/cada-coisa-no-seu-lugar",
  },
  {
    icon: "sparkles" as const,
    title: "Palavra secreta",
    copy: "Use pistas para descobrir a palavra antes de revelar tudo.",
    image: secretWordImage,
    tone: "violet",
    route: "/jogos/palavra-secreta",
  },
  {
    icon: "game" as const,
    title: "Conectando",
    copy: "Associe palavra em inglês e imagem para fixar vocabulário.",
    image: matchingPairsImage,
    tone: "coral",
    route: "/jogos/conectando",
  },
  {
    icon: "grid" as const,
    title: "Cruzando palavras",
    copy: "Complete o quebra-cabeça de palavras cruzadas.",
    image: crosswordImage,
    tone: "blue",
    route: "/jogos/cruzando-palavras",
  },
  {
    icon: "sparkles" as const,
    title: "Par perfeito",
    copy: "Encontre os pares de cartas iguais.",
    image: memoryMatchImage,
    tone: "rose",
    route: "/jogos/par-perfeito",
  },
  {
    icon: "volume" as const,
    title: "Ouvido afiado",
    copy: "Ouça e responda: imagem, palavra ou frase.",
    image: listeningEarImage,
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
        {games.map((game, index) => (
          <motion.button
            aria-disabled={game.route ? undefined : "true"}
            className={`quick-game-card tone-${game.tone}`}
            key={game.title}
            onClick={() =>
              game.route ? navigate(game.route) : showNotice(game.title)
            }
          >
            <span className="game-card-image-wrap">
              <img
                alt=""
                aria-hidden="true"
                className="game-card-image"
                decoding="async"
                height="450"
                loading={index < 3 ? "eager" : "lazy"}
                src={game.image}
                width="800"
              />
            </span>
            <span className="game-card-copy">
              <span className="game-card-title-row">
                <span className="quick-game-icon">
                  <AppIcon name={game.icon} size={21} />
                </span>
                <strong>{game.title}</strong>
                {!game.route && (
                  <span className="locked-badge">
                    <AppIcon name="lock" size={12} />
                    Em breve
                  </span>
                )}
              </span>
              <span>{game.copy}</span>
            </span>
          </motion.button>
        ))}
      </div>
      <Toast message={notice} />
    </AppShell>
  );
}
