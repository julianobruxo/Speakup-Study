import type Phaser from "phaser";
import type {
  ArcadeAnswer,
  ArcadeSceneFactory,
  PreparedArcadeChallenge,
} from "../bridge/arcadeBridge";
import {
  findFirstSlice,
  getWordSliceDifficulty,
  interpolateTrail,
  pointDistance,
  triangleWave,
  WORD_SLICE_GESTURE_THRESHOLD,
  WORD_SLICE_TRAIL_LIMIT,
  type SliceCircle,
  type SlicePoint,
} from "./wordSliceModel";

interface MovingWord {
  choiceId: string;
  circle: Phaser.GameObjects.Arc;
  container: Phaser.GameObjects.Container;
  phase: number;
}

interface TimedTrailPoint extends SlicePoint {
  createdAt: number;
}

const WORD_COLORS = [0x36c6d9, 0x8b6cf6, 0xf5b642];

export const createWordSliceScene: ArcadeSceneFactory = (
  PhaserRuntime,
  settings,
  events,
) => {
  return class WordSliceScene extends PhaserRuntime.Scene {
    private activePointerId: number | string | null = null;
    private challengeIndex = 0;
    private gestureArmed = false;
    private gestureDistance = 0;
    private inputLocked = false;
    private keyboardSelectionVisible = false;
    private keyboardHost?: HTMLElement;
    private keyboardKeys?: {
      down: Phaser.Input.Keyboard.Key;
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
      slice: Phaser.Input.Keyboard.Key;
      sliceAlt: Phaser.Input.Keyboard.Key;
      up: Phaser.Input.Keyboard.Key;
    };
    private lastPointerPoint: SlicePoint | null = null;
    private movingWords: MovingWord[] = [];
    private reducedMotion = settings.reducedMotion;
    private selectedIndex = 0;
    private selectionGraphics?: Phaser.GameObjects.Graphics;
    private statusText?: Phaser.GameObjects.Text;
    private trail: TimedTrailPoint[] = [];
    private trailGraphics?: Phaser.GameObjects.Graphics;
    private waveStartedAt = 0;

    constructor() {
      super({ key: `word-slice:${settings.round.id}` });
    }

    create() {
      this.cameras.main.setBackgroundColor("#101a42");
      this.scale.on(PhaserRuntime.Scale.Events.RESIZE, this.handleResize, this);
      this.game.events.on("arcade-reduced-motion", this.setReducedMotion, this);
      this.events.once(PhaserRuntime.Scenes.Events.SHUTDOWN, this.teardown, this);
      this.events.on(PhaserRuntime.Scenes.Events.PAUSE, this.cancelGesture, this);
      this.events.on(PhaserRuntime.Scenes.Events.SLEEP, this.cancelGesture, this);
      this.input.on("pointerdown", this.handlePointerDown, this);
      this.input.on("pointermove", this.handlePointerMove, this);
      this.input.on("pointerup", this.handlePointerUp, this);
      this.input.on("gameout", this.cancelGesture, this);
      this.game.canvas.addEventListener("pointerdown", this.handleNativePointerDown, true);
      this.game.canvas.addEventListener("pointermove", this.handleNativePointerMove, true);
      this.game.canvas.addEventListener("pointerup", this.handleNativePointerUp, true);
      this.game.canvas.addEventListener("pointercancel", this.handleNativePointerCancel, true);
      this.keyboardHost = this.game.canvas.parentElement ?? undefined;
      this.keyboardHost?.addEventListener("focus", this.handleHostFocus, true);
      this.keyboardHost?.addEventListener("blur", this.handleHostBlur, true);

      if (this.input.keyboard) {
        this.keyboardKeys = {
          down: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.DOWN),
          left: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.LEFT),
          right: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.RIGHT),
          slice: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.SPACE),
          sliceAlt: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.ENTER),
          up: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.UP),
        };
        this.keyboardKeys.down.on("down", this.selectNext, this);
        this.keyboardKeys.right.on("down", this.selectNext, this);
        this.keyboardKeys.left.on("down", this.selectPrevious, this);
        this.keyboardKeys.up.on("down", this.selectPrevious, this);
        this.keyboardKeys.slice.on("down", this.sliceSelected, this);
        this.keyboardKeys.sliceAlt.on("down", this.sliceSelected, this);
      }

      this.renderChallenge();
      events.onReady();
    }

    update(time: number) {
      if (!this.inputLocked) this.positionMovingWords(time);
      this.pruneAndDrawTrail(time);
    }

    private handleNativePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.beginGesture(`native:${event.pointerId}`, this.nativePoint(event));
    };

    private handleNativePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.continueGesture(`native:${event.pointerId}`, this.nativePoint(event));
    };

    private handleNativePointerUp = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (this.activePointerId === `native:${event.pointerId}`) this.cancelGesture();
    };

    private handleNativePointerCancel = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (this.activePointerId === `native:${event.pointerId}`) this.cancelGesture();
    };

    private handleHostFocus = () => {
      this.keyboardSelectionVisible = true;
      this.drawSelection();
    };

    private handleHostBlur = () => {
      this.keyboardSelectionVisible = false;
      this.drawSelection();
    };

    private setReducedMotion(value: boolean) {
      this.reducedMotion = value;
      if (value) this.tweens.killAll();
      this.positionMovingWords(this.time.now);
      this.emitRuntimeState();
    }

    private handleResize() {
      const elapsed = Math.max(0, this.time.now - this.waveStartedAt);
      this.cancelGesture();
      if (!this.inputLocked) this.renderChallenge(elapsed);
    }

    private renderChallenge(preservedElapsed = 0) {
      this.cancelGesture(false);
      this.children.removeAll(true);
      this.movingWords = [];
      const challenge = this.currentChallenge();
      if (!challenge) return;

      const width = this.logicalWidth();
      this.cameras.main.setOrigin(0, 0).setZoom(settings.renderResolution);
      this.add.text(18, 15, `${this.challengeIndex + 1}/${settings.round.challenges.length}`, {
        color: "#7de5ef",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "13px",
        fontStyle: "bold",
        resolution: settings.renderResolution,
      });
      this.add.text(width / 2, 48, challenge.prompt, {
        align: "center",
        color: "#ffffff",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: width < 520 ? "18px" : "21px",
        fontStyle: "bold",
        resolution: settings.renderResolution,
        wordWrap: { width: width - 42 },
      }).setOrigin(0.5);

      challenge.choices.forEach((choice, index) => {
        const radius = this.wordRadius();
        const shadow = this.add.circle(4, 6, radius, 0x080d24, 0.42);
        const circle = this.add.circle(0, 0, radius, WORD_COLORS[index], 1)
          .setStrokeStyle(3, 0xffffff, 0.88);
        const label = this.add.text(0, 0, choice.label.toUpperCase(), {
          align: "center",
          color: index === 0 || index === 2 ? "#17234b" : "#ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: radius < 38 ? "11px" : "13px",
          fontStyle: "bold",
          resolution: settings.renderResolution,
          wordWrap: { width: radius * 1.58 },
        }).setOrigin(0.5);
        const container = this.add.container(0, 0, [shadow, circle, label]);
        this.movingWords.push({
          choiceId: choice.id,
          circle,
          container,
          phase: (index * 0.31 + this.challengeIndex * 0.07) % 1,
        });
      });

      this.selectionGraphics = this.add.graphics();
      this.trailGraphics = this.add.graphics();
      this.statusText = this.add.text(width / 2, this.logicalHeight() - 24, "", {
        align: "center",
        color: "#aeb8d2",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "13px",
        fontStyle: "bold",
        resolution: settings.renderResolution,
      }).setOrigin(0.5);
      this.waveStartedAt = this.time.now - preservedElapsed;
      this.positionMovingWords(this.waveStartedAt);
      this.drawSelection();
      this.emitRuntimeState();
    }

    private positionMovingWords(time: number) {
      const difficulty = getWordSliceDifficulty(this.challengeIndex);
      const radius = this.wordRadius();
      const left = radius + 22;
      const right = this.logicalWidth() - radius - 22;
      const boardTop = 112 + radius;
      const boardBottom = this.logicalHeight() - 70 - radius;
      const laneGap = Math.max(0, (boardBottom - boardTop) / 2);
      const elapsed = Math.max(0, time - this.waveStartedAt);
      const cycle = elapsed / (5200 / difficulty.speed);

      this.movingWords.forEach((word, index) => {
        if (this.reducedMotion) {
          const staticColumns = [0.24, 0.7, 0.4];
          word.container.setPosition(
            left + (right - left) * staticColumns[index],
            boardTop + laneGap * index,
          );
          return;
        }
        const directionPhase = index % 2 === 0 ? cycle + word.phase : 1 - cycle + word.phase;
        const horizontal = triangleWave(directionPhase);
        const sway = Math.sin((cycle + word.phase) * Math.PI * 2) * 8 * difficulty.sway;
        word.container.setPosition(
          left + (right - left) * horizontal,
          boardTop + laneGap * index + sway,
        );
      });
      this.drawSelection();
    }

    private handlePointerDown(pointer: Phaser.Input.Pointer) {
      this.beginGesture(pointer.id, { x: pointer.worldX, y: pointer.worldY });
    }

    private beginGesture(pointerId: number | string, point: SlicePoint) {
      if (this.inputLocked || this.activePointerId !== null) return;
      this.activePointerId = pointerId;
      this.gestureArmed = false;
      this.gestureDistance = 0;
      this.lastPointerPoint = point;
      this.trail = [{ ...this.lastPointerPoint, createdAt: this.time.now }];
      this.emitRuntimeState();
    }

    private handlePointerMove(pointer: Phaser.Input.Pointer) {
      if (!pointer.isDown) {
        if (this.activePointerId === pointer.id) this.cancelGesture();
        return;
      }
      this.continueGesture(pointer.id, { x: pointer.worldX, y: pointer.worldY });
    }

    private continueGesture(pointerId: number | string, next: SlicePoint) {
      if (
        this.inputLocked ||
        this.activePointerId !== pointerId ||
        !this.lastPointerPoint
      ) return;

      const previous = this.lastPointerPoint;
      this.gestureDistance += pointDistance(previous, next);
      this.lastPointerPoint = next;
      const samples = interpolateTrail(previous, next).map((point) => ({
        ...point,
        createdAt: this.time.now,
      }));
      this.trail.push(...samples);
      this.trail = this.trail.slice(-WORD_SLICE_TRAIL_LIMIT);

      if (!this.gestureArmed && this.gestureDistance >= WORD_SLICE_GESTURE_THRESHOLD) {
        this.gestureArmed = true;
        this.emitRuntimeState();
      }
      if (!this.gestureArmed) return;

      const hit = findFirstSlice(previous, next, this.sliceCircles(), 4);
      if (hit) this.resolveSlice(hit.object.choiceId);
    }

    private handlePointerUp(pointer: Phaser.Input.Pointer) {
      if (this.activePointerId === pointer.id) this.cancelGesture();
    }

    private nativePoint(event: PointerEvent): SlicePoint {
      const bounds = this.game.canvas.getBoundingClientRect();
      return {
        x: (event.clientX - bounds.left) * (this.logicalWidth() / bounds.width),
        y: (event.clientY - bounds.top) * (this.logicalHeight() / bounds.height),
      };
    }

    private cancelGesture(emit = true) {
      this.activePointerId = null;
      this.gestureArmed = false;
      this.gestureDistance = 0;
      this.lastPointerPoint = null;
      this.trail = [];
      this.trailGraphics?.clear();
      if (emit) this.emitRuntimeState();
    }

    private selectNext() {
      if (this.inputLocked || this.movingWords.length === 0) return;
      this.keyboardSelectionVisible = true;
      this.selectedIndex = (this.selectedIndex + 1) % this.movingWords.length;
      this.drawSelection();
      this.emitRuntimeState();
    }

    private selectPrevious() {
      if (this.inputLocked || this.movingWords.length === 0) return;
      this.keyboardSelectionVisible = true;
      this.selectedIndex = (this.selectedIndex - 1 + this.movingWords.length) % this.movingWords.length;
      this.drawSelection();
      this.emitRuntimeState();
    }

    private sliceSelected() {
      if (this.inputLocked) return;
      const selected = this.movingWords[this.selectedIndex];
      if (selected) this.resolveSlice(selected.choiceId);
    }

    private resolveSlice(choiceId: string) {
      const challenge = this.currentChallenge();
      const word = this.movingWords.find((candidate) => candidate.choiceId === choiceId);
      if (!challenge || !word || this.inputLocked) return;

      const answer: ArcadeAnswer = {
        answeredAt: new Date().toISOString(),
        challengeId: challenge.id,
        choiceId,
      };
      const outcome = events.onAnswer(answer);
      if (!outcome) return;

      this.inputLocked = true;
      this.cancelGesture(false);
      this.drawSelection();
      word.container.setVisible(false);
      const correctLabel = challenge.choices.find(
        (choice) => choice.id === challenge.correctChoiceId,
      )?.label;
      this.statusText
        ?.setColor(outcome.correct ? "#7de5ef" : "#ffd2dc")
        .setText(outcome.correct ? "Corte certeiro!" : `Corte incorreto • resposta: ${correctLabel}`);
      this.showSliceBurst(word.container.x, word.container.y, outcome.correct);
      this.emitRuntimeState({
        lastAnswerCorrect: outcome.correct,
        lastSlicedChoiceId: choiceId,
      });

      this.time.delayedCall(this.reducedMotion ? 260 : 760, () => {
        this.challengeIndex += 1;
        if (this.challengeIndex >= settings.round.challenges.length) {
          this.statusText?.setColor("#7de5ef").setText("Rodada concluída!");
          this.emitRuntimeState({
            lastAnswerCorrect: outcome.correct,
            lastSlicedChoiceId: choiceId,
          });
          return;
        }
        this.inputLocked = false;
        this.selectedIndex = 0;
        this.renderChallenge();
      });
    }

    private showSliceBurst(x: number, y: number, correct: boolean) {
      if (this.reducedMotion) return;
      const particles = Array.from({ length: 7 }, () => this.add.circle(
        x,
        y,
        4,
        correct ? 0x7de5ef : 0xff8ea8,
        0.95,
      ).setDepth(5));
      particles.forEach((particle, index) => {
        const angle = (Math.PI * 2 * index) / particles.length;
        this.tweens.add({
          alpha: 0,
          duration: 360,
          ease: "Quad.easeOut",
          onComplete: () => particle.destroy(),
          targets: particle,
          x: x + Math.cos(angle) * 54,
          y: y + Math.sin(angle) * 54,
        });
      });
    }

    private sliceCircles(): SliceCircle[] {
      const radius = this.wordRadius();
      return this.movingWords
        .filter((word) => word.container.visible)
        .map((word) => ({
          center: { x: word.container.x, y: word.container.y },
          choiceId: word.choiceId,
          id: `moving:${word.choiceId}`,
          radius,
        }));
    }

    private pruneAndDrawTrail(time: number) {
      this.trail = this.trail.filter((point) => time - point.createdAt <= 150);
      const graphics = this.trailGraphics;
      if (!graphics) return;
      graphics.clear();
      if (this.trail.length < 2) return;
      graphics.lineStyle(6, 0x7de5ef, 0.9);
      graphics.beginPath();
      graphics.moveTo(this.trail[0].x, this.trail[0].y);
      this.trail.slice(1).forEach((point) => graphics.lineTo(point.x, point.y));
      graphics.strokePath();
      graphics.lineStyle(2, 0xffffff, 0.9);
      graphics.strokePath();
    }

    private drawSelection() {
      const graphics = this.selectionGraphics;
      const selected = this.movingWords[this.selectedIndex];
      if (!graphics) return;
      graphics.clear();
      if (!selected || this.inputLocked || !this.keyboardSelectionVisible) return;
      graphics.lineStyle(3, 0xffffff, 0.76);
      graphics.strokeCircle(selected.container.x, selected.container.y, this.wordRadius() + 7);
    }

    private currentChallenge(): PreparedArcadeChallenge | undefined {
      return settings.round.challenges[this.challengeIndex];
    }

    private wordRadius() {
      return Math.min(48, Math.max(34, this.logicalWidth() * 0.09));
    }

    private logicalWidth() {
      return this.scale.width / settings.renderResolution;
    }

    private logicalHeight() {
      return this.scale.height / settings.renderResolution;
    }

    private emitRuntimeState(
      detail: {
        lastAnswerCorrect?: boolean;
        lastSlicedChoiceId?: string;
      } = {},
    ) {
      events.onRuntimeState({
        activeObjectCount: this.movingWords.filter((word) => word.container.visible).length,
        gestureActive: this.activePointerId !== null,
        renderResolution: settings.renderResolution,
        reducedMotion: this.reducedMotion,
        selectedChoiceId: this.movingWords[this.selectedIndex]?.choiceId,
        trailPointCount: this.trail.length,
        tweenCount: this.tweens.getTweens().length,
        waveIndex: this.challengeIndex,
        ...detail,
      });
    }

    private teardown() {
      this.scale.off(PhaserRuntime.Scale.Events.RESIZE, this.handleResize, this);
      this.game.events.off("arcade-reduced-motion", this.setReducedMotion, this);
      this.input.off("pointerdown", this.handlePointerDown, this);
      this.input.off("pointermove", this.handlePointerMove, this);
      this.input.off("pointerup", this.handlePointerUp, this);
      this.input.off("gameout", this.cancelGesture, this);
      this.events.off(PhaserRuntime.Scenes.Events.PAUSE, this.cancelGesture, this);
      this.events.off(PhaserRuntime.Scenes.Events.SLEEP, this.cancelGesture, this);
      this.game.canvas.removeEventListener("pointerdown", this.handleNativePointerDown, true);
      this.game.canvas.removeEventListener("pointermove", this.handleNativePointerMove, true);
      this.game.canvas.removeEventListener("pointerup", this.handleNativePointerUp, true);
      this.game.canvas.removeEventListener("pointercancel", this.handleNativePointerCancel, true);
      this.keyboardHost?.removeEventListener("focus", this.handleHostFocus, true);
      this.keyboardHost?.removeEventListener("blur", this.handleHostBlur, true);
      this.keyboardKeys?.down.off("down", this.selectNext, this);
      this.keyboardKeys?.right.off("down", this.selectNext, this);
      this.keyboardKeys?.left.off("down", this.selectPrevious, this);
      this.keyboardKeys?.up.off("down", this.selectPrevious, this);
      this.keyboardKeys?.slice.off("down", this.sliceSelected, this);
      this.keyboardKeys?.sliceAlt.off("down", this.sliceSelected, this);
      this.tweens.killAll();
    }
  };
};
