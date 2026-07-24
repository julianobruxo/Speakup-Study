import { useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/AppIcon";
import { PrimaryButton } from "../../components/AppShell";
import { BODY_GROUPS, getBodyEntries, toSortingChallenge, type BodyGroupId } from "../adapters/bodyVocabularyAdapter";
import { ROUND_SIZES } from "../core/roundConfig";
import { shuffleWithSeed } from "../core/shuffle";
import { createRoundState, finalizeRound, recordOutcome, type GameRoundState } from "../core/sessionEngine";
import { useGameCompletion } from "../core/useGameCompletion";
import { GameProgressBar, GameShell } from "../components/GameShell";
import { GameResultScreen } from "../components/GameResultScreen";
import { VisualAsset } from "../assets/visualResolver";
import type { SortingChallenge } from "../core/challengeTypes";

const roundSize = ROUND_SIZES.sorting_station.count;
const itemsPerGroup = roundSize / BODY_GROUPS.length;

function buildChallenges(seed: number): SortingChallenge[] {
  const entries = getBodyEntries();
  const byGroup = new Map<BodyGroupId, SortingChallenge[]>();
  for (const entry of entries) {
    const challenge = toSortingChallenge(entry);
    const groupId = challenge.groupId as BodyGroupId;
    const list = byGroup.get(groupId) ?? [];
    list.push(challenge);
    byGroup.set(groupId, list);
  }
  const selected = BODY_GROUPS.flatMap((group) =>
    shuffleWithSeed(byGroup.get(group.id) ?? [], seed + group.id.length).slice(0, itemsPerGroup),
  );
  return shuffleWithSeed(selected, seed + 3);
}

export default function SortingStationGame() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => Date.now());
  const challenges = useMemo(() => buildChallenges(seed), [seed]);
  const [index, setIndex] = useState(0);
  const [placedGroup, setPlacedGroup] = useState<BodyGroupId | null>(null);
  const [roundState, setRoundState] = useState<GameRoundState>(() => createRoundState("sorting_station"));
  const [finished, setFinished] = useState(false);
  const { complete, resetSession } = useGameCompletion("sorting_station", "vocabulary");

  const activeChallenge = challenges[index];

  if (!activeChallenge && !finished) {
    return (
      <GameShell onBack={() => navigate("/jogos")} title="Cada coisa no seu lugar">
        <p className="game-empty-state">Não há itens suficientes para esta rodada no momento.</p>
      </GameShell>
    );
  }

  function placeInGroup(groupId: BodyGroupId) {
    if (placedGroup || !activeChallenge) return;
    setPlacedGroup(groupId);
    const correct = groupId === activeChallenge.groupId;
    setRoundState((current) => recordOutcome(current, activeChallenge.id, correct));
  }

  function advance() {
    if (index === challenges.length - 1) {
      const result = finalizeRound(roundState);
      setFinished(true);
      void complete(result);
      return;
    }
    setPlacedGroup(null);
    setIndex((current) => current + 1);
  }

  if (finished) {
    const result = finalizeRound(roundState);
    return (
      <GameResultScreen
        gameTitle="Cada coisa no seu lugar"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onPlayAgain={() => {
          resetSession();
          setSeed(Date.now());
          setIndex(0);
          setPlacedGroup(null);
          setRoundState(createRoundState("sorting_station"));
          setFinished(false);
        }}
        reduceMotion={Boolean(reduceMotion)}
        result={result}
      />
    );
  }

  const isCorrect = placedGroup === activeChallenge.groupId;

  return (
    <GameShell onBack={() => navigate("/jogos")} title="Cada coisa no seu lugar">
      <section className="session-meta">
        <span>
          Item {index + 1} de {challenges.length}
        </span>
      </section>
      <GameProgressBar current={index + (placedGroup ? 1 : 0)} total={challenges.length} />

      <section className="question-card sorting-station-card">
        <div className="sorting-station-item">
          <VisualAsset label={activeChallenge.translation} visualKey={activeChallenge.visualKey} />
          <strong>{activeChallenge.term}</strong>
          <span>{activeChallenge.translation}</span>
        </div>

        <div className="sorting-station-groups" role="group" aria-label="Grupos anatômicos">
          {BODY_GROUPS.map((group) => {
            const isSelected = placedGroup === group.id;
            const isTarget = Boolean(placedGroup) && group.id === activeChallenge.groupId;
            const isWrong = Boolean(placedGroup) && isSelected && !isTarget;
            return (
              <button
                className={[
                  "sorting-station-group",
                  isSelected ? "selected" : "",
                  isTarget ? "correct" : "",
                  isWrong ? "wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={Boolean(placedGroup)}
                key={group.id}
                onClick={() => placeInGroup(group.id)}
                type="button"
              >
                {group.label}
              </button>
            );
          })}
        </div>

        {placedGroup && (
          <div className={`answer-feedback ${isCorrect ? "correct" : "wrong"}`} role="status" aria-live="polite">
            <span className="feedback-icon">
              <AppIcon name={isCorrect ? "check" : "close"} size={20} />
            </span>
            <div>
              <strong>{isCorrect ? "Correto!" : "Quase lá."}</strong>
              <p>Grupo certo: {BODY_GROUPS.find((group) => group.id === activeChallenge.groupId)?.label}</p>
            </div>
          </div>
        )}

        <div className="session-action">
          <PrimaryButton disabled={!placedGroup} icon={<AppIcon name="chevron-right" />} onClick={advance}>
            {index === challenges.length - 1 ? "Ver resultado" : "Continuar"}
          </PrimaryButton>
        </div>
      </section>
    </GameShell>
  );
}
