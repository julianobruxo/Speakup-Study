import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/AppIcon";
import { PrimaryButton } from "../../components/AppShell";
import { cancelPronunciation, isPronunciationAvailable, speakEnglish } from "../../services/audio/pronunciation";
import { buildListeningChallenges } from "../adapters/listeningAdapter";
import { ROUND_SIZES } from "../core/roundConfig";
import { selectChallenges } from "../core/selectChallenges";
import { shuffleWithSeed } from "../core/shuffle";
import { createRoundState, finalizeRound, recordOutcome, type GameRoundState } from "../core/sessionEngine";
import { useGameCompletion } from "../core/useGameCompletion";
import { GameProgressBar, GameShell } from "../components/GameShell";
import { GameResultScreen } from "../components/GameResultScreen";
import { VisualAsset } from "../assets/visualResolver";

const roundSize = ROUND_SIZES.listening_ear.count;
const speechAvailable = isPronunciationAvailable();

export default function ListeningEarGame() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => Date.now());
  const challenges = useMemo(() => selectChallenges(buildListeningChallenges(seed), roundSize, seed), [seed]);
  const [index, setIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [roundState, setRoundState] = useState<GameRoundState>(() => createRoundState("listening_ear"));
  const [finished, setFinished] = useState(false);
  const { complete, resetSession } = useGameCompletion("listening_ear", "vocabulary");

  const challenge = challenges[index];

  useEffect(() => {
    if (!challenge) return;
    setTypedAnswer("");
    setSelectedImage(null);
    setChecked(false);
    if (challenge.mode === "assemble-sentence" && challenge.tokens) {
      setBank(shuffleWithSeed(challenge.tokens, seed + index * 31));
      setPlaced([]);
    }
    if (speechAvailable) speakEnglish(challenge.audioText);
    return cancelPronunciation;
  }, [challenge, index, seed]);

  if (!challenge && !finished) {
    return (
      <GameShell onBack={() => navigate("/jogos")} title="Ouvido afiado">
        <p className="game-empty-state">Não há desafios suficientes para esta rodada no momento.</p>
      </GameShell>
    );
  }

  function replayAudio() {
    if (challenge && speechAvailable) speakEnglish(challenge.audioText);
  }

  function submitTypeWord() {
    if (checked || !challenge?.expectedWord) return;
    const correct = typedAnswer.trim().toLowerCase() === challenge.expectedWord.toLowerCase();
    setChecked(true);
    setRoundState((current) => recordOutcome(current, challenge.id, correct));
  }

  function selectImageOption(visualKey: string) {
    if (checked || !challenge) return;
    setSelectedImage(visualKey);
    setChecked(true);
    const correct = visualKey === challenge.visualKey;
    setRoundState((current) => recordOutcome(current, challenge.id, correct));
  }

  function pickToken(token: string, fromBank: boolean) {
    if (checked) return;
    if (fromBank) {
      const position = bank.indexOf(token);
      if (position === -1) return;
      setBank((current) => current.filter((_, i) => i !== position));
      setPlaced((current) => [...current, token]);
    } else {
      const position = placed.indexOf(token);
      if (position === -1) return;
      setPlaced((current) => current.filter((_, i) => i !== position));
      setBank((current) => [...current, token]);
    }
  }

  function checkSentence() {
    if (checked || !challenge?.correctOrder) return;
    const correct = placed.join(" ") === challenge.correctOrder.join(" ");
    setChecked(true);
    setRoundState((current) => recordOutcome(current, challenge.id, correct));
  }

  function advance() {
    if (index === challenges.length - 1) {
      const result = finalizeRound(roundState);
      setFinished(true);
      void complete(result);
      return;
    }
    setIndex((current) => current + 1);
  }

  if (finished) {
    const result = finalizeRound(roundState);
    return (
      <GameResultScreen
        gameTitle="Ouvido afiado"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onPlayAgain={() => {
          resetSession();
          setSeed(Date.now());
          setIndex(0);
          setRoundState(createRoundState("listening_ear"));
          setFinished(false);
        }}
        reduceMotion={Boolean(reduceMotion)}
        result={result}
      />
    );
  }

  return (
    <GameShell onBack={() => navigate("/jogos")} title="Ouvido afiado">
      <section className="session-meta">
        <span>
          Desafio {index + 1} de {challenges.length}
        </span>
      </section>
      <GameProgressBar current={index + (checked ? 1 : 0)} total={challenges.length} />

      <section className="question-card listening-ear-card">
        <div className="listening-ear-audio">
          <button
            aria-label="Ouvir novamente"
            className="listening-ear-play"
            disabled={!speechAvailable}
            onClick={replayAudio}
            type="button"
          >
            <AppIcon name="volume" size={26} />
            <span>Ouvir</span>
          </button>
          {!speechAvailable && (
            <p className="speech-fallback">
              A reprodução de áudio não está disponível neste dispositivo. O texto do desafio aparece
              abaixo para continuar a prática.
            </p>
          )}
        </div>

        {!speechAvailable && challenge.mode !== "assemble-sentence" && (
          <p className="listening-ear-text-fallback">{challenge.audioText}</p>
        )}

        {challenge.mode === "select-image" && (
          <div className="matching-pairs-options listening-image-options" role="group" aria-label="Selecione a imagem correta">
            {challenge.imageOptions?.map((option) => {
              const isSelected = selectedImage === option.visualKey;
              const isTarget = checked && option.visualKey === challenge.visualKey;
              const isWrong = checked && isSelected && !isTarget;
              return (
                <button
                  className={[
                    "listening-image-option",
                    isSelected ? "selected" : "",
                    isTarget ? "correct" : "",
                    isWrong ? "wrong" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={checked}
                  key={option.visualKey}
                  onClick={() => selectImageOption(option.visualKey)}
                  type="button"
                >
                  <VisualAsset label={option.label} visualKey={option.visualKey} />
                </button>
              );
            })}
          </div>
        )}

        {challenge.mode === "type-word" && (
          <div className="listening-type-word">
            <input
              aria-label="Digite a palavra ouvida"
              disabled={checked}
              onChange={(event) => setTypedAnswer(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitTypeWord();
              }}
              value={typedAnswer}
            />
            {!checked && (
              <PrimaryButton disabled={!typedAnswer.trim()} onClick={submitTypeWord}>
                Confirmar
              </PrimaryButton>
            )}
          </div>
        )}

        {challenge.mode === "assemble-sentence" && (
          <>
            <div
              aria-label="Frase montada"
              className={`sentence-builder-slot ${checked ? "" : ""}`}
            >
              {placed.length === 0 && <span className="sentence-builder-hint">Toque nas palavras abaixo</span>}
              {placed.map((token, position) => (
                <button
                  className="sentence-token placed"
                  disabled={checked}
                  key={`${token}-${position}`}
                  onClick={() => pickToken(token, false)}
                  type="button"
                >
                  {token}
                </button>
              ))}
            </div>
            <div aria-label="Banco de palavras" className="sentence-builder-bank">
              {bank.map((token, position) => (
                <button
                  className="sentence-token"
                  disabled={checked}
                  key={`${token}-${position}`}
                  onClick={() => pickToken(token, true)}
                  type="button"
                >
                  {token}
                </button>
              ))}
            </div>
            {!checked && (
              <PrimaryButton disabled={placed.length !== challenge.tokens?.length} onClick={checkSentence}>
                Confirmar frase
              </PrimaryButton>
            )}
          </>
        )}

        {checked && (
          <div
            className={`answer-feedback ${
              (challenge.mode === "type-word" &&
                typedAnswer.trim().toLowerCase() === challenge.expectedWord?.toLowerCase()) ||
              (challenge.mode === "select-image" && selectedImage === challenge.visualKey) ||
              (challenge.mode === "assemble-sentence" && placed.join(" ") === challenge.correctOrder?.join(" "))
                ? "correct"
                : "wrong"
            }`}
            role="status"
            aria-live="polite"
          >
            <span className="feedback-icon">
              <AppIcon name="check" size={20} />
            </span>
            <div>
              <strong>Resposta:</strong>
              <p>{challenge.audioText}</p>
            </div>
          </div>
        )}

        {checked && (
          <div className="session-action">
            <PrimaryButton icon={<AppIcon name="chevron-right" />} onClick={advance}>
              {index === challenges.length - 1 ? "Ver resultado" : "Continuar"}
            </PrimaryButton>
          </div>
        )}
      </section>
    </GameShell>
  );
}

