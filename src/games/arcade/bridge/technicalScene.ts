import type Phaser from "phaser";
import type {
  ArcadeAnswer,
  ArcadeSceneEvents,
  PreparedArcadeRound,
} from "./arcadeBridge";

interface TechnicalSceneSettings {
  renderResolution: number;
  reducedMotion: boolean;
  round: PreparedArcadeRound;
}

type PhaserRuntime = typeof Phaser;

export function createTechnicalScene(
  PhaserRuntime: PhaserRuntime,
  settings: TechnicalSceneSettings,
  events: ArcadeSceneEvents,
) {
  return class TechnicalBridgeScene extends PhaserRuntime.Scene {
    private answerLocked = false;
    private reducedMotion = settings.reducedMotion;
    private renderedObjects: Phaser.GameObjects.GameObject[] = [];

    constructor() {
      super({ key: `bridge-technical:${settings.round.id}` });
    }

    create() {
      this.cameras.main.setBackgroundColor("#101a42");
      this.scale.on(PhaserRuntime.Scale.Events.RESIZE, this.renderScene, this);
      this.game.events.on("arcade-reduced-motion", this.setReducedMotion, this);
      this.events.once(PhaserRuntime.Scenes.Events.SHUTDOWN, this.teardown, this);
      this.renderScene();
      events.onReady();
    }

    private setReducedMotion(value: boolean) {
      this.reducedMotion = value;
      this.renderScene();
    }

    private renderScene() {
      this.tweens.killAll();
      this.renderedObjects.forEach((object) => object.destroy());
      this.renderedObjects = [];

      const width = this.scale.width / settings.renderResolution;
      const height = this.scale.height / settings.renderResolution;
      this.cameras.main.setOrigin(0, 0).setZoom(settings.renderResolution);
      const challenge = settings.round.challenges[0];
      if (!challenge) return;

      const heading = this.add.text(width / 2, 48, "Bridge React + Phaser", {
        color: "#7de5ef",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: width < 520 ? "16px" : "19px",
        fontStyle: "bold",
        resolution: settings.renderResolution,
      }).setOrigin(0.5);
      const prompt = this.add.text(width / 2, 92, challenge.prompt, {
        align: "center",
        color: "#ffffff",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: width < 520 ? "22px" : "29px",
        fontStyle: "bold",
        resolution: settings.renderResolution,
        wordWrap: { width: Math.max(260, width - 64) },
      }).setOrigin(0.5);
      const hint = this.add.text(width / 2, height - 34, "Escolha uma resposta", {
        color: "#aeb8d2",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "14px",
        resolution: settings.renderResolution,
      }).setOrigin(0.5);
      this.renderedObjects.push(heading, prompt, hint);

      const isNarrow = width < 560;
      const gap = 14;
      const targetWidth = isNarrow ? Math.min(300, width - 48) : Math.min(220, (width - 80) / 3);
      const targetHeight = isNarrow ? 64 : 88;
      const totalWidth = isNarrow
        ? targetWidth
        : challenge.choices.length * targetWidth + (challenge.choices.length - 1) * gap;
      const startX = isNarrow ? width / 2 : (width - totalWidth) / 2 + targetWidth / 2;
      const startY = isNarrow ? 158 : height / 2 + 18;

      challenge.choices.forEach((choice, index) => {
        const x = isNarrow ? startX : startX + index * (targetWidth + gap);
        const y = isNarrow ? startY + index * (targetHeight + gap) : startY;
        const target = this.add.rectangle(x, y, targetWidth, targetHeight, 0xf7f9ff)
          .setStrokeStyle(2, 0x7de5ef, 0.75)
          .setInteractive({ useHandCursor: true });
        const label = this.add.text(x, y, choice.label, {
          align: "center",
          color: "#17234b",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: isNarrow ? "18px" : "20px",
          fontStyle: "bold",
          resolution: settings.renderResolution,
          wordWrap: { width: targetWidth - 24 },
        }).setOrigin(0.5);

        target.on("pointerover", () => target.setFillStyle(0xe6f7fa));
        target.on("pointerout", () => target.setFillStyle(0xf7f9ff));
        target.on("pointerup", () => this.submitAnswer({
          challengeId: challenge.id,
          choiceId: choice.id,
          answeredAt: new Date().toISOString(),
        }));
        this.renderedObjects.push(target, label);

        if (!this.reducedMotion) {
          this.tweens.add({
            targets: [target, label],
            y: y - 7,
            duration: 900 + index * 120,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut",
          });
        }
      });

      events.onRuntimeState({
        renderResolution: heading.style.resolution,
        reducedMotion: this.reducedMotion,
        tweenCount: this.tweens.getTweens().length,
      });
    }

    private submitAnswer(answer: ArcadeAnswer) {
      if (this.answerLocked) return;
      this.answerLocked = events.onAnswer(answer);
    }

    private teardown() {
      this.scale.off(PhaserRuntime.Scale.Events.RESIZE, this.renderScene, this);
      this.game.events.off("arcade-reduced-motion", this.setReducedMotion, this);
      this.tweens.killAll();
    }
  };
}
