import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell } from "../components/AppShell";
import Toast from "../components/Toast";
import { getCompatibleGames, type ContentSelector, type GameId } from "../games/core/catalog";
import beatTheClockImage from "../assets/game-card-images/cards/beat-the-clock.webp";
import crosswordImage from "../assets/game-card-images/cards/crossword.webp";
import errorHuntImage from "../assets/game-card-images/cards/error-hunt.webp";
import listeningEarImage from "../assets/game-card-images/cards/listening-ear.webp";
import matchingPairsImage from "../assets/game-card-images/cards/matching-pairs.webp";
import memoryMatchImage from "../assets/game-card-images/cards/memory-match.webp";
import secretWordImage from "../assets/game-card-images/cards/secret-word.webp";
import sentenceBuilderImage from "../assets/game-card-images/cards/sentence-builder.webp";
import sortingStationImage from "../assets/game-card-images/cards/sorting-station.webp";

const games: {
  gameId: GameId;
  icon: Parameters<typeof AppIcon>[0]["name"];
  title: string;
  copy: string;
  image: string | null;
  preview?: string;
  tone: string;
  route: string;
}[] = [
  {
    gameId: "sentence_builder",
    icon: "book",
    title: "Monte a frase",
    copy: "Organize palavras para formar frases corretas em inglês.",
    image: sentenceBuilderImage,
    tone: "blue",
    route: "/jogos/monte-a-frase",
  },
  {
    gameId: "error_hunt",
    icon: "check",
    title: "Caça ao erro",
    copy: "Encontre rapidamente o ponto incorreto da frase.",
    image: errorHuntImage,
    tone: "rose",
    route: "/jogos/caca-ao-erro",
  },
  {
    gameId: "beat_the_clock",
    icon: "clock",
    title: "Contra o relógio",
    copy: "Responda o máximo de questões antes do tempo acabar.",
    image: beatTheClockImage,
    tone: "gold",
    route: "/jogos/contra-o-relogio",
  },
  {
    gameId: "sorting_station",
    icon: "grid",
    title: "Cada coisa no seu lugar",
    copy: "Arraste cada palavra até a imagem correspondente.",
    image: sortingStationImage,
    tone: "green",
    route: "/jogos/cada-coisa-no-seu-lugar",
  },
  {
    gameId: "secret_word",
    icon: "sparkles",
    title: "Palavra secreta",
    copy: "Use pistas para descobrir a palavra antes de revelar tudo.",
    image: secretWordImage,
    tone: "violet",
    route: "/jogos/palavra-secreta",
  },
  {
    gameId: "matching_pairs",
    icon: "game",
    title: "Conectando",
    copy: "Associe palavra em inglês e imagem para fixar vocabulário.",
    image: matchingPairsImage,
    tone: "coral",
    route: "/jogos/conectando",
  },
  {
    gameId: "crossword",
    icon: "grid",
    title: "Cruzando palavras",
    copy: "Complete o quebra-cabeça de palavras cruzadas.",
    image: crosswordImage,
    tone: "blue",
    route: "/jogos/cruzando-palavras",
  },
  {
    gameId: "memory_match",
    icon: "sparkles",
    title: "Par perfeito",
    copy: "Encontre os pares de cartas iguais.",
    image: memoryMatchImage,
    tone: "rose",
    route: "/jogos/par-perfeito",
  },
  {
    gameId: "listening_ear",
    icon: "volume",
    title: "Ouvido afiado",
    copy: "Ouça e responda: imagem, palavra ou frase.",
    image: listeningEarImage,
    tone: "gold",
    route: "/jogos/ouvido-afiado",
  },
  {
    gameId: "bubble_shooter",
    icon: "game",
    title: "Bubble Shooter",
    copy: "Mire na palavra certa e derrube os grupos de bolhas.",
    image: null,
    tone: "violet",
    route: "/jogos/bubble-shooter",
  },
  {
    gameId: "word_slice",
    icon: "sparkles",
    title: "Corte a palavra",
    copy: "Faça um corte preciso na palavra que corresponde à pista.",
    image: null,
    preview: "word-slice",
    tone: "coral",
    route: "/jogos/corte-a-palavra",
  },
  {
    gameId: "ninja",
    icon: "game",
    title: "Ninja",
    copy: "Corra, escolha a placa certa e salte para a resposta.",
    image: null,
    preview: "ninja",
    tone: "blue",
    route: "/jogos/ninja",
  },
  {
    gameId: "solo_race",
    icon: "clock",
    title: "Corrida individual",
    copy: "Acelere escolhendo a faixa com a resposta correta.",
    image: null,
    preview: "solo-race",
    tone: "gold",
    route: "/jogos/corrida-individual",
  },
];

const CONTENT_SELECTORS: Record<string, ContentSelector> = {
  present_tobe: { domain: "grammar", grammarTopicId: "present_tobe" },
  body: { domain: "vocabulary", vocabularyCategoryId: "body" },
};

const CONTENT_LABELS: Record<string, string> = {
  present_tobe: "Verbo TO BE — presente",
  body: "Partes do corpo",
};

export default function GamesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [notice, setNotice] = useState("");
  function showNotice(title: string) {
    setNotice(`${title} estará disponível em breve.`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  const contentParam = searchParams.get("content") ?? "";
  const selector = CONTENT_SELECTORS[contentParam];
  const compatibleGameIds = useMemo(
    () => (selector ? new Set(getCompatibleGames(selector).map((game) => game.id)) : null),
    [selector],
  );
  const visibleGames = compatibleGameIds
    ? games.filter((game) => compatibleGameIds.has(game.gameId))
    : games;

  return (
    <AppShell activeNav="games" className="standard-page games-page">
      {selector ? (
        <section className="page-lead compact">
          <span className="eyebrow">Jogos compatíveis</span>
          <h2>{CONTENT_LABELS[contentParam]}</h2>
          <p>
            Estes jogos praticam o mesmo conteúdo que você estava estudando.{" "}
            <Link to="/jogos">Ver o catálogo completo</Link>
          </p>
        </section>
      ) : (
        <section className="page-lead compact">
          <span className="eyebrow">Catálogo oficial de jogos</span>
          <h2>Mais maneiras de praticar</h2>
          <p>Jogue com Present TO BE e Partes do corpo enquanto expandimos o catálogo.</p>
        </section>
      )}
      <div className="quick-games-grid">
        {visibleGames.map((game, index) => (
          <motion.button
            aria-disabled={game.route ? undefined : "true"}
            className={`quick-game-card tone-${game.tone}`}
            key={game.title}
            onClick={() =>
              game.route ? navigate(game.route) : showNotice(game.title)
            }
          >
            {game.image ? (
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
            ) : (
              game.preview === "word-slice" ? (
                <span aria-hidden="true" className="game-card-image-wrap word-slice-card-preview">
                  <span className="slice-preview-word word-one">SHOULDER</span>
                  <span className="slice-preview-word word-two">KNEE</span>
                  <span className="slice-preview-word word-three">HAND</span>
                  <span className="slice-preview-trail" />
                </span>
              ) : game.preview === "ninja" ? (
                <span aria-hidden="true" className="game-card-image-wrap ninja-card-preview">
                  <span className="ninja-preview-moon" />
                  <span className="ninja-preview-skyline" />
                  <span className="ninja-preview-runner" />
                  <span className="ninja-preview-sign sign-one">AM</span>
                  <span className="ninja-preview-sign sign-two">IS</span>
                </span>
              ) : game.preview === "solo-race" ? (
                <span aria-hidden="true" className="game-card-image-wrap solo-race-card-preview">
                  <span className="solo-race-preview-road" />
                  <span className="solo-race-preview-portal portal-one">IS</span>
                  <span className="solo-race-preview-portal portal-two">AM</span>
                  <span className="solo-race-preview-portal portal-three">ARE</span>
                  <span className="solo-race-preview-car" />
                </span>
              ) : (
                <span aria-hidden="true" className="game-card-image-wrap arcade-card-preview">
                  <span className="arcade-preview-bubble bubble-one">HEAD</span>
                  <span className="arcade-preview-bubble bubble-two">EYE</span>
                  <span className="arcade-preview-bubble bubble-three">HAND</span>
                  <span className="arcade-preview-shot" />
                  <span className="arcade-preview-aim" />
                </span>
              )
            )}
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
