import type Phaser from "phaser";
import type { ArcadeSceneFactory } from "../bridge/arcadeBridge";
import {
  NINJA_RUN_SPEED,
  createNinjaTrackPool,
  getNinjaFoundationLayout,
  getNinjaParallaxOffsets,
  recycleNinjaTrackPool,
  type NinjaFoundationLayout,
  type NinjaTrackSegment,
} from "./ninjaFoundationModel";

interface TrackVisual {
  accent: Phaser.GameObjects.Rectangle;
  lantern: Phaser.GameObjects.Container;
  slab: Phaser.GameObjects.Rectangle;
}

interface SignVisual {
  choiceId: string;
  container: Phaser.GameObjects.Container;
  panel: Phaser.GameObjects.Rectangle;
}

type NinjaPhase = "running" | "decision" | "jumping" | "feedback" | "game_over" | "complete";

const TEXTURE_SIZE = 720;

export const createNinjaFoundationScene: ArcadeSceneFactory = (
  PhaserRuntime,
  settings,
  events,
) => {
  return class NinjaFoundationScene extends PhaserRuntime.Scene {
    private clouds?: Phaser.GameObjects.TileSprite;
    private farLayer?: Phaser.GameObjects.TileSprite;
    private lastDiagnosticsAt = 0;
    private layout?: NinjaFoundationLayout;
    private nearLayer?: Phaser.GameObjects.TileSprite;
    private phase: NinjaPhase = "running";
    private pooledReuseCount = 0;
    private reducedMotion = settings.reducedMotion;
    private runner?: Phaser.GameObjects.Container;
    private runnerStartX = 0;
    private runnerParts?: {
      backLeg: Phaser.GameObjects.Rectangle;
      frontLeg: Phaser.GameObjects.Rectangle;
      scarf: Phaser.GameObjects.Triangle;
    };
    private selectedSignIndex = 0;
    private signs: SignVisual[] = [];
    private sky?: Phaser.GameObjects.Rectangle;
    private sun?: Phaser.GameObjects.Arc;
    private track: NinjaTrackSegment[] = [];
    private trackVisuals = new Map<number, TrackVisual>();
    private transitionTimer?: Phaser.Time.TimerEvent;
    private keyboardKeys?: {
      confirm: Phaser.Input.Keyboard.Key;
      confirmAlt: Phaser.Input.Keyboard.Key;
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
    };
    private keyboardHost?: HTMLElement;
    private jumpTween?: Phaser.Tweens.Tween;
    private pendingSign?: SignVisual;
    private lastOutcomeCorrect?: boolean;
    private pendingGameOver = false;
    private statusText?: Phaser.GameObjects.Text;
    private challengeIndex = 0;

    constructor() {
      super({ key: `ninja-foundation:${settings.round.id}` });
    }

    create() {
      this.cameras.main.setBackgroundColor("#cceff4");
      this.cameras.main.setZoom(settings.renderResolution);
      this.createParallaxTextures();
      this.createBackdrop();
      this.layout = getNinjaFoundationLayout(this.logicalWidth(), this.logicalHeight());
      this.createTrack();
      this.createRunner();
      this.createDecisionControls();

      this.scale.on(PhaserRuntime.Scale.Events.RESIZE, this.handleResize, this);
      this.game.events.on("arcade-reduced-motion", this.setReducedMotion, this);
      this.events.once(PhaserRuntime.Scenes.Events.SHUTDOWN, this.teardown, this);
      this.scheduleDecision();
      events.onReady();
      this.emitRuntimeState();
    }

    update(time: number) {
      const runner = this.runner;
      const layout = this.layout;
      if (!runner || !layout) return;

      const body = runner.body as Phaser.Physics.Arcade.Body;
      const autoRunning = this.phase === "running" && !this.reducedMotion;
      body.setVelocityX(autoRunning ? NINJA_RUN_SPEED : 0);
      if (this.phase === "running" || this.phase === "decision") {
        runner.y = layout.groundY - 7;
      }
      if (autoRunning) {
        this.cameras.main.scrollX = Math.max(0, runner.x - layout.runnerStartX);
      }
      this.animateRunner(this.phase === "running" ? time : 0);
      this.updateParallax();
      this.recycleTrack();

      if (time - this.lastDiagnosticsAt >= 250) {
        this.lastDiagnosticsAt = time;
        this.emitRuntimeState();
      }
    }

    private createParallaxTextures() {
      const suffix = settings.round.id.replace(/[^a-z0-9]/gi, "-");
      const farKey = `ninja-far-${suffix}`;
      const nearKey = `ninja-near-${suffix}`;
      const cloudKey = `ninja-clouds-${suffix}`;

      const far = this.add.graphics();
      far.fillStyle(0x6e8fa4, 1);
      for (let x = -80; x < TEXTURE_SIZE + 120; x += 150) {
        far.fillTriangle(x, 210, x + 92, 42 + (x % 3) * 12, x + 190, 210);
      }
      far.generateTexture(farKey, TEXTURE_SIZE, 220);
      far.destroy();

      const near = this.add.graphics();
      near.fillStyle(0x314f68, 1);
      for (let x = 18; x < TEXTURE_SIZE; x += 138) {
        near.fillRoundedRect(x, 75, 94, 145, 5);
        near.fillTriangle(x - 13, 80, x + 47, 25, x + 107, 80);
        near.fillStyle(0xf5c85b, 0.82);
        near.fillRect(x + 19, 112, 15, 24);
        near.fillRect(x + 60, 112, 15, 24);
        near.fillStyle(0x314f68, 1);
      }
      near.generateTexture(nearKey, TEXTURE_SIZE, 220);
      near.destroy();

      const clouds = this.add.graphics();
      clouds.fillStyle(0xffffff, 0.7);
      for (let x = 30; x < TEXTURE_SIZE; x += 210) {
        clouds.fillCircle(x + 32, 34, 27);
        clouds.fillCircle(x + 64, 27, 34);
        clouds.fillCircle(x + 99, 39, 25);
        clouds.fillRoundedRect(x, 35, 126, 31, 16);
      }
      clouds.generateTexture(cloudKey, TEXTURE_SIZE, 76);
      clouds.destroy();

      this.registry.set("ninja-textures", { cloudKey, farKey, nearKey });
    }

    private createBackdrop() {
      const textures = this.registry.get("ninja-textures") as {
        cloudKey: string;
        farKey: string;
        nearKey: string;
      };
      this.sky = this.add.rectangle(0, 0, 1, 1, 0xcceff4).setOrigin(0).setScrollFactor(0).setDepth(-20);
      this.sun = this.add.circle(0, 0, 54, 0xf5c85b, 0.92).setScrollFactor(0).setDepth(-18);
      this.clouds = this.add.tileSprite(0, 0, 1, 76, textures.cloudKey)
        .setOrigin(0).setScrollFactor(0).setDepth(-17).setAlpha(0.9);
      this.farLayer = this.add.tileSprite(0, 0, 1, 220, textures.farKey)
        .setOrigin(0).setScrollFactor(0).setDepth(-15);
      this.nearLayer = this.add.tileSprite(0, 0, 1, 220, textures.nearKey)
        .setOrigin(0).setScrollFactor(0).setDepth(-12);
      this.layoutBackdrop();
    }

    private createTrack() {
      const layout = this.layout;
      if (!layout) return;
      this.track = createNinjaTrackPool(layout.poolSize, layout.segmentWidth);
      this.track.forEach((segment) => {
        const slab = this.add.rectangle(0, 0, layout.segmentWidth + 2, 86, 0x17234b).setDepth(1);
        slab.setStrokeStyle(1, 0x385077, 1);
        const accent = this.add.rectangle(0, 0, layout.segmentWidth + 2, 8, 0x8d1d30).setDepth(2);
        const post = this.add.rectangle(0, 0, 7, 54, 0x243665);
        const lamp = this.add.rectangle(0, -31, 28, 26, 0xf5c85b).setStrokeStyle(3, 0x8d1d30);
        const cap = this.add.triangle(0, -51, -21, 12, 0, -8, 21, 12, 0x8d1d30);
        const lantern = this.add.container(0, 0, [post, lamp, cap]).setDepth(0);
        this.trackVisuals.set(segment.id, { accent, lantern, slab });
      });
      this.positionTrackVisuals();
    }

    private createRunner() {
      const layout = this.layout;
      if (!layout) return;
      const shadow = this.add.ellipse(0, 3, 56, 15, 0x071128, 0.28);
      const scarf = this.add.triangle(-19, -48, 0, 0, -35, 8, -5, 20, 0x8d1d30);
      const backLeg = this.add.rectangle(-9, -13, 12, 30, 0x243665).setOrigin(0.5, 0);
      const frontLeg = this.add.rectangle(9, -13, 12, 30, 0x17234b).setOrigin(0.5, 0);
      const backFoot = this.add.rectangle(-11, 6, 18, 7, 0x7de5ef);
      const frontFoot = this.add.rectangle(11, 6, 18, 7, 0x7de5ef);
      const torso = this.add.rectangle(0, -42, 38, 43, 0x17234b).setStrokeStyle(3, 0x7de5ef);
      const belt = this.add.rectangle(0, -27, 41, 7, 0x8d1d30);
      const head = this.add.circle(0, -77, 20, 0xf2b895).setStrokeStyle(3, 0x17234b);
      const mask = this.add.rectangle(0, -72, 38, 13, 0x17234b);
      const band = this.add.rectangle(0, -86, 42, 7, 0x8d1d30);
      const eyeLeft = this.add.circle(-7, -74, 2.2, 0xffffff);
      const eyeRight = this.add.circle(7, -74, 2.2, 0xffffff);
      this.runner = this.add.container(layout.runnerStartX, layout.groundY - 7, [
        shadow,
        scarf,
        backLeg,
        frontLeg,
        backFoot,
        frontFoot,
        torso,
        belt,
        head,
        mask,
        band,
        eyeLeft,
        eyeRight,
      ]).setDepth(6).setScale(this.runnerScale());
      this.runnerStartX = layout.runnerStartX;
      this.physics.add.existing(this.runner);
      const body = this.runner.body as Phaser.Physics.Arcade.Body;
      body
        .setAllowGravity(false)
        .setVelocityX(this.reducedMotion ? 0 : NINJA_RUN_SPEED)
        .setSize(34, 82)
        .setOffset(-17, -88);
      this.runnerParts = { backLeg, frontLeg, scarf };
    }

    private animateRunner(time: number) {
      const parts = this.runnerParts;
      if (!parts) return;
      if (this.reducedMotion) {
        parts.backLeg.rotation = 0;
        parts.frontLeg.rotation = 0;
        parts.scarf.rotation = 0;
        return;
      }
      const stride = Math.sin(time * 0.014);
      parts.backLeg.rotation = stride * 0.42;
      parts.frontLeg.rotation = -stride * 0.42;
      parts.scarf.rotation = -0.08 + Math.sin(time * 0.008) * 0.08;
    }

    private createDecisionControls() {
      this.statusText = this.add.text(this.logicalWidth() / 2, this.logicalHeight() - 28, "", {
        align: "center",
        color: "#17234b",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        resolution: settings.renderResolution,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(12);

      if (!this.input.keyboard) return;
      this.keyboardHost = this.game.canvas.parentElement ?? undefined;
      this.keyboardKeys = {
        confirm: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.SPACE, false),
        confirmAlt: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.ENTER, false),
        left: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.LEFT, false),
        right: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.RIGHT, false),
      };
      this.keyboardKeys.left.on("down", this.selectPreviousSign, this);
      this.keyboardKeys.right.on("down", this.selectNextSign, this);
      this.keyboardKeys.confirm.on("down", this.confirmSelectedSign, this);
      this.keyboardKeys.confirmAlt.on("down", this.confirmSelectedSign, this);
    }

    private scheduleDecision() {
      this.phase = "running";
      this.statusText?.setText(this.reducedMotion ? "Escolha uma placa." : "As placas estão chegando...");
      this.transitionTimer?.remove(false);
      if (this.reducedMotion) {
        this.enterDecision();
        return;
      }
      this.transitionTimer = this.time.delayedCall(720, this.enterDecision, [], this);
    }

    private enterDecision() {
      if (this.phase !== "running") return;
      this.phase = "decision";
      const body = this.runner?.body as Phaser.Physics.Arcade.Body | undefined;
      body?.setVelocityX(0);
      this.selectedSignIndex = 0;
      this.renderSigns();
      this.statusText?.setColor("#17234b").setText("Escolha uma placa e salte.");
      this.emitRuntimeState();
    }

    private renderSigns() {
      this.clearSigns();
      const challenge = settings.round.challenges[this.challengeIndex];
      const layout = this.layout;
      if (!challenge || !layout) return;
      const width = this.logicalWidth();
      const signWidth = Math.max(92, Math.min(190, (width - 54) / 3));
      const signY = Math.max(145, layout.groundY - 122);

      challenge.choices.forEach((choice, index) => {
        const x = width * ((index + 0.5) / 3);
        const post = this.add.rectangle(0, 40, 8, 80, 0x243665);
        const panel = this.add.rectangle(0, 0, signWidth, 72, 0xffffff)
          .setStrokeStyle(4, 0x17234b)
          .setInteractive({ useHandCursor: true });
        const label = this.add.text(0, 0, choice.label, {
          align: "center",
          color: "#17234b",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: width < 520 ? "17px" : "20px",
          fontStyle: "bold",
          resolution: settings.renderResolution,
          wordWrap: { width: signWidth - 16 },
        }).setOrigin(0.5);
        const container = this.add.container(x, signY, [post, panel, label])
          .setScrollFactor(0)
          .setDepth(9);
        panel.on("pointerup", () => this.chooseSign(index));
        this.signs.push({ choiceId: choice.id, container, panel });
      });
      this.drawSignSelection();
    }

    private selectPreviousSign() {
      if (!this.keyboardHasFocus() || this.phase !== "decision" || this.signs.length === 0) return;
      this.selectedSignIndex = (this.selectedSignIndex - 1 + this.signs.length) % this.signs.length;
      this.drawSignSelection();
      this.emitRuntimeState();
    }

    private selectNextSign() {
      if (!this.keyboardHasFocus() || this.phase !== "decision" || this.signs.length === 0) return;
      this.selectedSignIndex = (this.selectedSignIndex + 1) % this.signs.length;
      this.drawSignSelection();
      this.emitRuntimeState();
    }

    private confirmSelectedSign() {
      if (!this.keyboardHasFocus()) return;
      this.chooseSign(this.selectedSignIndex);
    }

    private chooseSign(index: number) {
      const sign = this.signs[index];
      const runner = this.runner;
      const layout = this.layout;
      if (this.phase !== "decision" || !sign || !runner || !layout) return;
      this.selectedSignIndex = index;
      this.drawSignSelection();
      this.phase = "jumping";
      this.pendingSign = sign;
      const resolve = () => this.resolveSign(sign);

      if (this.reducedMotion) {
        resolve();
        return;
      }
      this.jumpTween = this.tweens.add({
        targets: runner,
        x: this.cameras.main.scrollX + sign.container.x,
        y: layout.groundY - 112,
        duration: 320,
        ease: "Sine.easeOut",
        yoyo: true,
        onYoyo: resolve,
        onComplete: () => {
          this.jumpTween = undefined;
          this.scheduleAdvance();
        },
      });
      this.emitRuntimeState();
    }

    private resolveSign(sign: SignVisual) {
      const challenge = settings.round.challenges[this.challengeIndex];
      if (!challenge || this.phase !== "jumping") return;
      const outcome = events.onAnswer({
        answeredAt: new Date().toISOString(),
        challengeId: challenge.id,
        choiceId: sign.choiceId,
      });
      if (!outcome) {
        this.phase = "decision";
        return;
      }
      this.phase = "feedback";
      this.pendingSign = undefined;
      this.lastOutcomeCorrect = outcome.correct;
      sign.panel.setFillStyle(outcome.correct ? 0xdff7ef : 0xffe4e8)
        .setStrokeStyle(5, outcome.correct ? 0x23705b : 0x8d1d30);
      const correctLabel = challenge.choices.find(
        (choice) => choice.id === challenge.correctChoiceId,
      )?.label;
      this.statusText
        ?.setColor(outcome.correct ? "#23705b" : "#8d1d30")
        .setText(outcome.correct ? "Correto!" : `Resposta: ${correctLabel}`);
      this.emitRuntimeState({ lastAnswerCorrect: outcome.correct });
      this.pendingGameOver = Boolean(outcome.runEnded);
      if (this.reducedMotion) this.scheduleAdvance();
    }

    private scheduleAdvance() {
      if (this.phase !== "feedback") return;
      this.transitionTimer?.remove(false);
      const feedbackDelay = this.lastOutcomeCorrect === false ? 4_500 : 1_200;
      this.transitionTimer = this.time.delayedCall(feedbackDelay, () => {
        if (this.pendingGameOver) {
          this.pendingGameOver = false;
          this.phase = "game_over";
          this.statusText?.setColor("#8d1d30").setText("Recupere suas vidas para continuar.");
          this.emitRuntimeState();
          return;
        }
        this.challengeIndex += 1;
        this.clearSigns();
        if (this.challengeIndex >= settings.round.challenges.length) {
          this.phase = "complete";
          this.statusText?.setColor("#23705b").setText("Progressão concluída!");
          this.emitRuntimeState();
          return;
        }
        this.scheduleDecision();
        this.emitRuntimeState();
      });
    }

    private drawSignSelection() {
      this.signs.forEach((sign, index) => {
        sign.panel.setStrokeStyle(index === this.selectedSignIndex ? 5 : 3, index === this.selectedSignIndex ? 0x8d1d30 : 0x17234b);
      });
    }

    private keyboardHasFocus() {
      return document.activeElement === this.keyboardHost;
    }

    private settleActiveJump() {
      const sign = this.pendingSign;
      const runner = this.runner;
      const layout = this.layout;
      if (!runner || !layout || !this.jumpTween) return;
      this.jumpTween.stop();
      this.jumpTween = undefined;
      runner.setPosition(this.cameras.main.scrollX + layout.runnerStartX, layout.groundY - 7);
      if (this.phase === "jumping" && sign) {
        this.resolveSign(sign);
        if (!this.reducedMotion) this.scheduleAdvance();
      } else if (this.phase === "feedback") {
        this.scheduleAdvance();
      }
    }

    private positionSigns() {
      const layout = this.layout;
      if (!layout || this.signs.length === 0) return;
      const width = this.logicalWidth();
      const signY = Math.max(145, layout.groundY - 122);
      this.signs.forEach((sign, index) => {
        sign.container.setPosition(width * ((index + 0.5) / 3), signY);
      });
    }

    private clearSigns() {
      this.signs.forEach((sign) => sign.container.destroy(true));
      this.signs = [];
    }

    private recycleTrack() {
      const layout = this.layout;
      if (!layout) return;
      const recycled = recycleNinjaTrackPool(
        this.track,
        this.cameras.main.scrollX,
        layout.segmentWidth,
      );
      if (recycled.reuseCount === 0) return;
      this.track = recycled.segments;
      this.pooledReuseCount += recycled.reuseCount;
      this.positionTrackVisuals();
    }

    private positionTrackVisuals() {
      const layout = this.layout;
      if (!layout) return;
      this.track.forEach((segment) => {
        const visual = this.trackVisuals.get(segment.id);
        if (!visual) return;
        const centerX = segment.x + layout.segmentWidth / 2;
        visual.slab.setPosition(centerX, layout.groundY + 43).setSize(layout.segmentWidth + 2, 86);
        visual.accent.setPosition(centerX, layout.groundY + 4).setSize(layout.segmentWidth + 2, 8);
        visual.lantern
          .setPosition(centerX + layout.segmentWidth * 0.31, layout.groundY)
          .setVisible(segment.id % 2 === 0);
      });
    }

    private updateParallax() {
      const offsets = getNinjaParallaxOffsets(this.cameras.main.scrollX);
      if (this.clouds) this.clouds.tilePositionX = offsets.clouds;
      if (this.farLayer) this.farLayer.tilePositionX = offsets.far;
      if (this.nearLayer) this.nearLayer.tilePositionX = offsets.near;
    }

    private layoutBackdrop() {
      const layout = this.layout ?? getNinjaFoundationLayout(this.logicalWidth(), this.logicalHeight());
      const width = this.logicalWidth();
      const height = this.logicalHeight();
      this.sky?.setSize(width, height);
      this.sun?.setPosition(width * 0.82, Math.max(68, height * 0.16));
      this.clouds?.setPosition(0, Math.max(34, height * 0.11)).setSize(width, 76);
      this.farLayer?.setPosition(0, layout.groundY - 210).setSize(width, 220);
      this.nearLayer?.setPosition(0, layout.groundY - 194).setSize(width, 220);
    }

    private handleResize() {
      const previousLayout = this.layout;
      this.cameras.main.setZoom(settings.renderResolution);
      this.layout = getNinjaFoundationLayout(this.logicalWidth(), this.logicalHeight());
      if (previousLayout && this.layout.segmentWidth !== previousLayout.segmentWidth) {
        this.track = this.track.map((segment, index) => ({
          ...segment,
          x: this.cameras.main.scrollX + (index - 2) * this.layout!.segmentWidth,
        }));
      }
      this.layoutBackdrop();
      this.positionTrackVisuals();
      if (this.runner) {
        this.runner.y = this.layout.groundY - 7;
        this.runner.setScale(this.runnerScale());
      }
      this.settleActiveJump();
      this.positionSigns();
      this.statusText?.setPosition(this.logicalWidth() / 2, this.logicalHeight() - 28);
      if (this.phase === "decision") this.renderSigns();
      this.emitRuntimeState();
    }

    private setReducedMotion(value: boolean) {
      this.reducedMotion = value;
      const body = this.runner?.body as Phaser.Physics.Arcade.Body | undefined;
      body?.setVelocityX(value || this.phase !== "running" ? 0 : NINJA_RUN_SPEED);
      if (value) this.settleActiveJump();
      this.animateRunner(0);
      if (this.phase === "running" && value) this.enterDecision();
      this.emitRuntimeState();
    }

    private logicalWidth() {
      return this.scale.width / settings.renderResolution;
    }

    private logicalHeight() {
      return this.scale.height / settings.renderResolution;
    }

    private runnerScale() {
      return 1.04 + Math.min(0.2, Math.max(0, (this.logicalWidth() - 360) / 3000));
    }

    private emitRuntimeState(detail: { lastAnswerCorrect?: boolean } = {}) {
      const runner = this.runner;
      events.onRuntimeState({
        activeObjectCount: this.track.length + (runner ? 1 : 0),
        autoRunning: Boolean(runner && (runner.body as Phaser.Physics.Arcade.Body).velocity.x > 0),
        cameraX: Math.round(this.cameras.main.scrollX),
        challengeIndex: this.challengeIndex,
        pooledReuseCount: this.pooledReuseCount,
        renderResolution: settings.renderResolution,
        reducedMotion: this.reducedMotion,
        runnerDistance: Math.max(0, Math.round((runner?.x ?? 0) - this.runnerStartX)),
        runEnded: this.phase === "game_over",
        selectedChoiceId: this.signs[this.selectedSignIndex]?.choiceId,
        trackPoolSize: this.track.length,
        tweenCount: this.tweens.getTweens().length,
        ...detail,
      });
    }

    private teardown() {
      this.scale.off(PhaserRuntime.Scale.Events.RESIZE, this.handleResize, this);
      this.game.events.off("arcade-reduced-motion", this.setReducedMotion, this);
      this.transitionTimer?.remove(false);
      this.keyboardKeys?.left.off("down", this.selectPreviousSign, this);
      this.keyboardKeys?.right.off("down", this.selectNextSign, this);
      this.keyboardKeys?.confirm.off("down", this.confirmSelectedSign, this);
      this.keyboardKeys?.confirmAlt.off("down", this.confirmSelectedSign, this);
      this.keyboardHost = undefined;
      this.clearSigns();
      this.tweens.killAll();
      this.trackVisuals.clear();
    }
  };
};
