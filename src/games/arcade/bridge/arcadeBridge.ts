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
}

export interface PreparedArcadeRound {
  id: string;
  gameId: ArcadeGameId;
  challenges: PreparedArcadeChallenge[];
}

export interface ArcadeAnswer {
  challengeId: string;
  choiceId: string;
  answeredAt: string;
}

export interface ArcadeSceneEvents {
  onAnswer: (answer: ArcadeAnswer) => boolean;
  onReady: () => void;
  onRuntimeState: (state: ArcadeSceneRuntimeState) => void;
}

export interface ArcadeSceneRuntimeState {
  renderResolution: number;
  reducedMotion: boolean;
  tweenCount: number;
}

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

  return (answer: ArcadeAnswer): boolean => {
    if (acceptedOutcome) return false;
    const nextOutcome = resolveArcadeAnswer(round, answer);
    if (!nextOutcome) return false;
    acceptedOutcome = nextOutcome;
    onAccepted(nextOutcome);
    return true;
  };
}
