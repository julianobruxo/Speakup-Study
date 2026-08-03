import type Phaser from "phaser";
import type {
  ArcadeSceneFactory,
  PreparedArcadeChallenge,
} from "../bridge/arcadeBridge";
import {
  getSoloRaceLayout,
  isHorizontalRaceSwipe,
  laneAfterSwipe,
  laneFromPosition,
  SOLO_RACE_SWIPE_THRESHOLD,
} from "./soloRaceModel";

interface PortalVisual {
  choiceId: string;
  container: Phaser.GameObjects.Container;
  frame: Phaser.GameObjects.Rectangle;
  glow: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  lane: Phaser.GameObjects.Text;
}

type RacePhase = "approach" | "decision" | "feedback" | "complete";

const LANE_COLORS = [0x36c6d9, 0x8b6cf6, 0xf5c85b];

export const createSoloRaceScene: ArcadeSceneFactory = (
  PhaserRuntime,
  settings,
  events,
) => {
  return class SoloRaceScene extends PhaserRuntime.Scene {
    private challengeIndex = 0;
    private feedbackTimer?: Phaser.Time.TimerEvent;
    private feedbackText?: Phaser.GameObjects.Text;
    private keyboardHost?: HTMLElement;
    private keyboardKeys?: {
      confirm: Phaser.Input.Keyboard.Key;
      confirmAlt: Phaser.Input.Keyboard.Key;
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
    };
    private laneIndex = 1;
    private phase: RacePhase = "approach";
    private pointerStart?: { id: number; x: number; y: number };
    private portalProgress = 0;
    private portals: PortalVisual[] = [];
    private reducedMotion = settings.reducedMotion;
    private roadOffset = 0;
    private sceneGraphics?: Phaser.GameObjects.Graphics;
    private speedMultiplier = 1;
    private statusText?: Phaser.GameObjects.Text;
    private vehicle?: Phaser.GameObjects.Container;

    constructor() {
      super({ key: `solo-race:${settings.round.id}` });
    }

    create() {
      this.cameras.main.setBackgroundColor("#cceff4");
      this.cameras.main.setZoom(settings.renderResolution);
      this.sceneGraphics = this.add.graphics().setDepth(0);
      this.createVehicle();
      this.createControls();
      this.createStatus();
      this.renderPortals();
      if (this.reducedMotion) {
        this.portalProgress = 1;
        this.phase = "decision";
      }
      this.layoutScene();

      this.scale.on(PhaserRuntime.Scale.Events.RESIZE, this.handleResize, this);
      this.game.events.on("arcade-reduced-motion", this.setReducedMotion, this);
      this.events.once(PhaserRuntime.Scenes.Events.SHUTDOWN, this.teardown, this);
      this.input.on("pointerdown", this.handlePointerDown, this);
      this.input.on("pointerup", this.handlePointerUp, this);
      this.input.on("pointerupoutside", this.cancelPointer, this);
      this.input.on("gameout", this.cancelPointer, this);
      this.game.canvas.addEventListener("pointercancel", this.handleNativePointerCancel, true);
      events.onReady();
      this.emitRuntimeState();
    }

    update(_time: number, delta: number) {
      if (!this.reducedMotion && this.phase !== "complete") {
        this.roadOffset = (this.roadOffset + delta * 0.00032 * this.speedMultiplier) % 1;
      }
      if (this.phase === "approach") {
        this.portalProgress = Math.min(
          1,
          this.portalProgress + delta / (1_150 / this.speedMultiplier),
        );
        if (this.portalProgress >= 1) {
          this.phase = "decision";
          this.statusText?.setText("Escolha uma faixa.");
          this.emitRuntimeState();
        }
      }
      this.drawWorld();
      this.positionPortals();
      this.positionVehicle();
    }

    private createVehicle() {
      const shadow = this.add.ellipse(0, 22, 78, 22, 0x071128, 0.3);
      const body = this.add.polygon(0, 0, [-34, 20, -24, -22, 24, -22, 34, 20], 0x8d1d30)
        .setStrokeStyle(3, 0xffffff, 0.92);
      const cockpit = this.add.polygon(0, -12, [-17, 7, -10, -12, 10, -12, 17, 7], 0x36c6d9)
        .setStrokeStyle(2, 0x17234b);
      const stripe = this.add.rectangle(0, 10, 10, 24, 0xf5c85b);
      const leftWheel = this.add.rectangle(-31, 13, 10, 24, 0x101a42);
      const rightWheel = this.add.rectangle(31, 13, 10, 24, 0x101a42);
      const leftLight = this.add.circle(-20, 17, 4, 0xffffff);
      const rightLight = this.add.circle(20, 17, 4, 0xffffff);
      this.vehicle = this.add.container(0, 0, [
        shadow,
        leftWheel,
        rightWheel,
        body,
        cockpit,
        stripe,
        leftLight,
        rightLight,
      ]).setDepth(6);
    }

    private createControls() {
      this.keyboardHost = this.game.canvas.parentElement ?? undefined;
      if (!this.input.keyboard) return;
      this.keyboardKeys = {
        confirm: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.SPACE, false),
        confirmAlt: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.ENTER, false),
        left: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.LEFT, false),
        right: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.RIGHT, false),
      };
      this.keyboardKeys.left.on("down", this.selectPreviousLane, this);
      this.keyboardKeys.right.on("down", this.selectNextLane, this);
      this.keyboardKeys.confirm.on("down", this.confirmLane, this);
      this.keyboardKeys.confirmAlt.on("down", this.confirmLane, this);
    }

    private createStatus() {
      this.statusText = this.add.text(
        this.logicalWidth() / 2,
        this.logicalHeight() - 22,
        this.reducedMotion ? "Escolha uma faixa." : "Os portais estão chegando...",
        {
          align: "center",
          color: "#ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "14px",
          fontStyle: "bold",
          resolution: settings.renderResolution,
        },
      ).setOrigin(0.5).setDepth(8);
      this.feedbackText = this.add.text(this.logicalWidth() / 2, 28, "", {
        align: "center",
        color: "#ffffff",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
        resolution: settings.renderResolution,
      }).setOrigin(0.5).setDepth(9);
    }

    private renderPortals() {
      this.clearPortals();
      const challenge = this.currentChallenge();
      if (!challenge) return;
      const portalWidth = this.portalWidth();
      const portalHeight = this.portalHeight();
      challenge.choices.forEach((choice, index) => {
        const glow = this.add.rectangle(0, 0, portalWidth + 10, portalHeight + 10, LANE_COLORS[index], 0.18)
          .setStrokeStyle(2, LANE_COLORS[index], 0.42);
        const frame = this.add.rectangle(0, 0, portalWidth, portalHeight, 0xffffff, 0.96)
          .setStrokeStyle(5, LANE_COLORS[index]);
        const lane = this.add.text(0, -portalHeight * 0.27, `FAIXA ${index + 1}`, {
          align: "center",
          color: "#53607f",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "10px",
          fontStyle: "bold",
          resolution: settings.renderResolution,
        }).setOrigin(0.5);
        const label = this.add.text(0, portalHeight * 0.08, choice.label, {
          align: "center",
          color: "#17234b",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: this.logicalWidth() < 520 ? "17px" : "20px",
          fontStyle: "bold",
          resolution: settings.renderResolution,
          wordWrap: { width: portalWidth - 16 },
        }).setOrigin(0.5);
        const container = this.add.container(0, 0, [glow, frame, lane, label]).setDepth(4);
        this.portals.push({ choiceId: choice.id, container, frame, glow, label, lane });
      });
      this.drawLaneSelection();
    }

    private handlePointerDown(pointer: Phaser.Input.Pointer) {
      if (this.phase !== "approach" && this.phase !== "decision") return;
      this.keyboardHost?.focus();
      this.pointerStart = { id: pointer.id, x: pointer.worldX, y: pointer.worldY };
    }

    private handlePointerUp(pointer: Phaser.Input.Pointer) {
      const start = this.pointerStart;
      this.pointerStart = undefined;
      if (!start || start.id !== pointer.id || (this.phase !== "approach" && this.phase !== "decision")) {
        return;
      }
      const horizontalSwipe = isHorizontalRaceSwipe(
        start.x,
        start.y,
        pointer.worldX,
        pointer.worldY,
      );
      const movedDistance = Math.hypot(pointer.worldX - start.x, pointer.worldY - start.y);
      if (!horizontalSwipe && movedDistance >= SOLO_RACE_SWIPE_THRESHOLD) return;
      const nextLane = horizontalSwipe
        ? laneAfterSwipe(this.laneIndex, start.x, pointer.worldX)
        : laneFromPosition(pointer.worldX, this.logicalWidth());
      this.laneIndex = nextLane;
      this.drawLaneSelection();
      this.emitRuntimeState();
      if (this.phase === "decision") this.resolveLane();
    }

    private cancelPointer() {
      this.pointerStart = undefined;
    }

    private handleNativePointerCancel = () => {
      this.cancelPointer();
    };

    private selectPreviousLane() {
      if (!this.keyboardHasFocus() || (this.phase !== "approach" && this.phase !== "decision")) return;
      this.laneIndex = Math.max(0, this.laneIndex - 1);
      this.drawLaneSelection();
      this.emitRuntimeState();
    }

    private selectNextLane() {
      if (!this.keyboardHasFocus() || (this.phase !== "approach" && this.phase !== "decision")) return;
      this.laneIndex = Math.min(2, this.laneIndex + 1);
      this.drawLaneSelection();
      this.emitRuntimeState();
    }

    private confirmLane() {
      if (!this.keyboardHasFocus() || this.phase !== "decision") return;
      this.resolveLane();
    }

    private resolveLane() {
      const challenge = this.currentChallenge();
      const portal = this.portals[this.laneIndex];
      if (!challenge || !portal || this.phase !== "decision") return;
      const outcome = events.onAnswer({
        answeredAt: new Date().toISOString(),
        challengeId: challenge.id,
        choiceId: portal.choiceId,
      });
      if (!outcome) return;

      this.phase = "feedback";
      this.speedMultiplier = outcome.speedMultiplier ?? this.speedMultiplier;
      const correctIndex = challenge.choices.findIndex(
        (choice) => choice.id === challenge.correctChoiceId,
      );
      this.portals.forEach((candidate, index) => {
        if (index === correctIndex) {
          candidate.frame.setFillStyle(0xdff7ef).setStrokeStyle(6, 0x23705b);
        } else if (index === this.laneIndex) {
          candidate.frame.setFillStyle(0xffe4e8).setStrokeStyle(6, 0x8d1d30);
        }
      });
      const correctLabel = challenge.choices[correctIndex]?.label;
      this.feedbackText
        ?.setColor(outcome.correct ? "#23705b" : "#8d1d30")
        .setText(outcome.correct ? "BOOST!" : `DESACELEROU · ${correctLabel}`);
      this.statusText?.setText(
        outcome.correct ? `Combo ${outcome.combo ?? 0}. Mantenha o ritmo!` : "A próxima reta é uma nova chance.",
      );
      this.emitRuntimeState({ lastAnswerCorrect: outcome.correct });
      this.feedbackTimer?.remove(false);
      this.feedbackTimer = this.time.delayedCall(
        this.reducedMotion ? 260 : outcome.correct ? 900 : 1_800,
        this.advanceChallenge,
        [],
        this,
      );
    }

    private advanceChallenge() {
      if (this.phase !== "feedback") return;
      this.challengeIndex += 1;
      this.feedbackText?.setText("");
      if (this.challengeIndex >= settings.round.challenges.length) {
        this.phase = "complete";
        this.clearPortals();
        this.statusText?.setText("Linha de chegada!");
        this.emitRuntimeState();
        return;
      }
      this.phase = this.reducedMotion ? "decision" : "approach";
      this.portalProgress = this.reducedMotion ? 1 : 0;
      this.renderPortals();
      this.statusText?.setText(
        this.reducedMotion ? "Escolha uma faixa." : "Os portais estão chegando...",
      );
      this.layoutScene();
      this.emitRuntimeState();
    }

    private drawWorld() {
      const graphics = this.sceneGraphics;
      if (!graphics) return;
      const width = this.logicalWidth();
      const height = this.logicalHeight();
      const layout = getSoloRaceLayout(width, height);
      const horizonHalf = layout.roadHorizonHalf;
      const bottomHalf = layout.roadBottomHalf;
      const centerX = width / 2;

      graphics.clear();
      graphics.fillStyle(0xcceff4, 1).fillRect(0, 0, width, height);
      graphics.fillStyle(0xf5c85b, 0.94).fillCircle(width * 0.82, height * 0.14, Math.max(30, width * 0.045));
      graphics.fillStyle(0x6e8fa4, 0.72);
      for (let index = 0; index < 10; index += 1) {
        const buildingWidth = width / 9;
        const buildingHeight = 26 + (index % 4) * 13;
        graphics.fillRect(index * buildingWidth - 8, layout.horizonY - buildingHeight, buildingWidth - 5, buildingHeight);
      }
      graphics.fillStyle(0x17234b, 1).fillPoints([
        { x: centerX - horizonHalf, y: layout.horizonY },
        { x: centerX + horizonHalf, y: layout.horizonY },
        { x: centerX + bottomHalf, y: layout.roadBottomY },
        { x: centerX - bottomHalf, y: layout.roadBottomY },
      ], true);
      graphics.lineStyle(5, 0x8d1d30, 1);
      graphics.strokeLineShape(new PhaserRuntime.Geom.Line(
        centerX - horizonHalf,
        layout.horizonY,
        centerX - bottomHalf,
        layout.roadBottomY,
      ));
      graphics.strokeLineShape(new PhaserRuntime.Geom.Line(
        centerX + horizonHalf,
        layout.horizonY,
        centerX + bottomHalf,
        layout.roadBottomY,
      ));

      graphics.lineStyle(3, 0xffffff, 0.72);
      for (const boundary of [1, 2]) {
        for (let marker = 0; marker < 7; marker += 1) {
          const start = ((marker / 7 + this.roadOffset) % 1) ** 1.65;
          const end = Math.min(1, start + 0.075 + start * 0.05);
          const startY = PhaserRuntime.Math.Linear(layout.horizonY, layout.roadBottomY, start);
          const endY = PhaserRuntime.Math.Linear(layout.horizonY, layout.roadBottomY, end);
          const startHalf = PhaserRuntime.Math.Linear(horizonHalf, bottomHalf, start);
          const endHalf = PhaserRuntime.Math.Linear(horizonHalf, bottomHalf, end);
          const laneRatio = boundary / 3;
          graphics.strokeLineShape(new PhaserRuntime.Geom.Line(
            centerX - startHalf + startHalf * 2 * laneRatio,
            startY,
            centerX - endHalf + endHalf * 2 * laneRatio,
            endY,
          ));
        }
      }
      graphics.fillStyle(0x101a42, 0.92).fillRect(0, height - 44, width, 44);
    }

    private positionPortals() {
      if (this.portals.length === 0) return;
      const width = this.logicalWidth();
      const height = this.logicalHeight();
      const layout = getSoloRaceLayout(width, height);
      const progress = this.phase === "feedback" ? 1 : this.portalProgress;
      const perspective = 0.16 + progress * 0.84;
      const y = PhaserRuntime.Math.Linear(layout.horizonY + 22, layout.portalY, progress);
      const roadHalf = PhaserRuntime.Math.Linear(width * 0.08, width * 0.5, progress);
      this.portals.forEach((portal, index) => {
        const x = width / 2 - roadHalf + roadHalf * 2 * ((index + 0.5) / 3);
        portal.container.setPosition(x, y).setScale(perspective);
      });
    }

    private positionVehicle() {
      const vehicle = this.vehicle;
      if (!vehicle) return;
      const width = this.logicalWidth();
      const layout = getSoloRaceLayout(width, this.logicalHeight());
      const x = width * ((this.laneIndex + 0.5) / 3);
      vehicle.setPosition(x, layout.vehicleY).setScale(
        width < 520 ? 0.84 : width < 900 ? 1.05 : 1.2,
      );
    }

    private drawLaneSelection() {
      this.portals.forEach((portal, index) => {
        if (this.phase === "feedback") return;
        portal.frame.setStrokeStyle(index === this.laneIndex ? 7 : 4, LANE_COLORS[index]);
      });
    }

    private layoutScene() {
      this.cameras.main.setZoom(settings.renderResolution);
      this.statusText?.setPosition(this.logicalWidth() / 2, this.logicalHeight() - 22);
      this.feedbackText?.setPosition(this.logicalWidth() / 2, 28);
      this.resizePortals();
      this.positionPortals();
      this.positionVehicle();
      this.drawWorld();
    }

    private handleResize() {
      this.layoutScene();
      this.emitRuntimeState();
    }

    private setReducedMotion(value: boolean) {
      this.reducedMotion = value;
      if (value && this.phase === "approach") {
        this.portalProgress = 1;
        this.phase = "decision";
        this.statusText?.setText("Escolha uma faixa.");
      }
      this.layoutScene();
      this.emitRuntimeState();
    }

    private currentChallenge(): PreparedArcadeChallenge | undefined {
      return settings.round.challenges[this.challengeIndex];
    }

    private portalWidth() {
      return Math.max(92, Math.min(190, (this.logicalWidth() - 36) / 3));
    }

    private portalHeight() {
      return this.logicalWidth() < 520 ? 86 : 96;
    }

    private logicalWidth() {
      return this.scale.width / settings.renderResolution;
    }

    private logicalHeight() {
      return this.scale.height / settings.renderResolution;
    }

    private keyboardHasFocus() {
      return document.activeElement === this.keyboardHost;
    }

    private clearPortals() {
      this.portals.forEach((portal) => portal.container.destroy(true));
      this.portals = [];
    }

    private resizePortals() {
      const width = this.portalWidth();
      const height = this.portalHeight();
      this.portals.forEach((portal) => {
        portal.glow.setSize(width + 10, height + 10);
        portal.frame.setSize(width, height);
        portal.lane.setY(-height * 0.27);
        portal.label
          .setY(height * 0.08)
          .setFontSize(this.logicalWidth() < 520 ? 17 : 20)
          .setWordWrapWidth(width - 16);
      });
    }

    private emitRuntimeState(detail: { lastAnswerCorrect?: boolean } = {}) {
      events.onRuntimeState({
        activeObjectCount: this.portals.length + (this.vehicle ? 1 : 0),
        autoRunning: this.phase !== "decision" && this.phase !== "complete" && !this.reducedMotion,
        challengeIndex: this.challengeIndex,
        laneIndex: this.laneIndex,
        portalProgress: Number(this.portalProgress.toFixed(3)),
        reducedMotion: this.reducedMotion,
        renderResolution: settings.renderResolution,
        selectedChoiceId: this.portals[this.laneIndex]?.choiceId,
        speedMultiplier: this.speedMultiplier,
        tweenCount: this.tweens.getTweens().length,
        ...detail,
      });
    }

    private teardown() {
      this.scale.off(PhaserRuntime.Scale.Events.RESIZE, this.handleResize, this);
      this.game.events.off("arcade-reduced-motion", this.setReducedMotion, this);
      this.input.off("pointerdown", this.handlePointerDown, this);
      this.input.off("pointerup", this.handlePointerUp, this);
      this.input.off("pointerupoutside", this.cancelPointer, this);
      this.input.off("gameout", this.cancelPointer, this);
      this.game.canvas.removeEventListener("pointercancel", this.handleNativePointerCancel, true);
      this.feedbackTimer?.remove(false);
      this.keyboardKeys?.left.off("down", this.selectPreviousLane, this);
      this.keyboardKeys?.right.off("down", this.selectNextLane, this);
      this.keyboardKeys?.confirm.off("down", this.confirmLane, this);
      this.keyboardKeys?.confirmAlt.off("down", this.confirmLane, this);
      this.keyboardHost = undefined;
      this.pointerStart = undefined;
      this.clearPortals();
      this.tweens.killAll();
    }
  };
};
