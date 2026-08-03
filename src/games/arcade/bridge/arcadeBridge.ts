import type Phaser from "phaser";
import type { ChallengeOutcome } from "../../core/sessionEngine";

export const ARCADE_RUNTIME_DESTROYED_EVENT = "ingles-em-jogo:arcade-runtime-destroyed";

export type ArcadeGameId =
  | "bridge_technical"
  | "bubble_shooter"
  | "word_slice"
  | "ninja"
  | "solo_race";

export interface ArcadeChoice {
  id: string;
  label: string;
}

export interface PreparedArcadeChallenge {
  id: string;
  prompt: string;
  choices: ArcadeChoice[];
  correctChoiceId: string;
  feedback?: string;
  stage?: {
    id: string;
    index: number;
    label: string;
    total: number;
  };
}

export interface PreparedArcadeRound {
  id: string;
  gameId: ArcadeGameId;
  challenges: PreparedArcadeChallenge[];
  precedingStageId?: string;
}

export interface ArcadeAnswer {
  challengeId: string;
  choiceId: string;
  answeredAt: string;
}

export interface ArcadeAnswerReceipt extends ChallengeOutcome {
  combo?: number;
  remainingLives?: number;
  runEnded?: boolean;
  speedMultiplier?: number;
}

export interface ArcadeSceneEvents {
  onAnswer: (answer: ArcadeAnswer) => ArcadeAnswerReceipt | null;
  onReady: () => void;
  onRuntimeState: (state: ArcadeSceneRuntimeState) => void;
}

export interface ArcadeSceneRuntimeState {
  activeObjectCount?: number;
  autoRunning?: boolean;
  boardBubbleCount?: number;
  cameraX?: number;
  challengeIndex?: number;
  disconnectedDropped?: number;
  impactId?: string;
  gestureActive?: boolean;
  laneIndex?: number;
  lastSlicedChoiceId?: string;
  lastAnswerCorrect?: boolean;
  pooledReuseCount?: number;
  removedGroupSize?: number;
  resizeDeferred?: boolean;
  selectedChoiceId?: string;
  renderResolution: number;
  reducedMotion: boolean;
  shotInFlight?: boolean;
  shotSnapColumn?: number;
  shotSnapRow?: number;
  runnerDistance?: number;
  runEnded?: boolean;
  speedMultiplier?: number;
  tweenCount: number;
  trailPointCount?: number;
  trackPoolSize?: number;
  wallBounceCount?: number;
  waveIndex?: number;
  portalProgress?: number;
}

export interface ArcadeSceneSettings {
  renderResolution: number;
  reducedMotion: boolean;
  round: PreparedArcadeRound;
}

export type PhaserRuntime = typeof Phaser;
export type ArcadeSceneFactory = (
  PhaserRuntime: PhaserRuntime,
  settings: ArcadeSceneSettings,
  events: ArcadeSceneEvents,
) => typeof Phaser.Scene;

export function resolveArcadeAnswer(
  round: PreparedArcadeRound,
  answer: ArcadeAnswer,
): ChallengeOutcome | null {
  const challenge = round.challenges.find((candidate) => candidate.id === answer.challengeId);
  if (!challenge?.choices.some((choice) => choice.id === answer.choiceId)) return null;
  return {
    challengeId: challenge.id,
    correct: answer.choiceId === challenge.correctChoiceId,
    answeredAt: answer.answeredAt,
  };
}

export function acceptFirstArcadeOutcome(
  current: ChallengeOutcome | null,
  round: PreparedArcadeRound,
  answer: ArcadeAnswer,
): ChallengeOutcome | null {
  if (current) return current;
  return resolveArcadeAnswer(round, answer);
}

export function createArcadeAnswerGate(
  round: PreparedArcadeRound,
  onAccepted: (outcome: ChallengeOutcome) => void,
) {
  let acceptedOutcome: ChallengeOutcome | null = null;

  return (answer: ArcadeAnswer): ChallengeOutcome | null => {
    if (acceptedOutcome) return null;
    const nextOutcome = resolveArcadeAnswer(round, answer);
    if (!nextOutcome) return null;
    acceptedOutcome = nextOutcome;
    onAccepted(nextOutcome);
    return nextOutcome;
  };
}

export function createArcadeRoundAnswerGate(
  round: PreparedArcadeRound,
  onAccepted: (outcome: ChallengeOutcome) => void,
) {
  const acceptedChallengeIds = new Set<string>();
  let nextChallengeIndex = 0;

  return (answer: ArcadeAnswer): ChallengeOutcome | null => {
    if (round.challenges[nextChallengeIndex]?.id !== answer.challengeId) return null;
    if (acceptedChallengeIds.has(answer.challengeId)) return null;
    const outcome = resolveArcadeAnswer(round, answer);
    if (!outcome) return null;
    acceptedChallengeIds.add(answer.challengeId);
    nextChallengeIndex += 1;
    onAccepted(outcome);
    return outcome;
  };
}
