import type Phaser from "phaser";
import type {
  ArcadeAnswer,
  ArcadeSceneFactory,
  PreparedArcadeChallenge,
} from "../bridge/arcadeBridge";
import {
  createChallengeBoard,
  getChoiceColor,
  getHexCellCenter,
  resolveBubbleShot,
  type BubbleCell,
  type BubbleColor,
} from "./bubbleShooterModel";

const COLORS: Record<BubbleColor, number> = {
  cyan: 0x36c6d9,
  violet: 0x8b6cf6,
  wine: 0xb42f50,
  gold: 0xf5b642,
  neutral: 0xf7f9ff,
};

interface BubbleVisual {
  circle: Phaser.GameObjects.Arc;
  decorations: Phaser.GameObjects.GameObject[];
  label?: Phaser.GameObjects.Text;
}

export const createBubbleShooterScene: ArcadeSceneFactory = (
  PhaserRuntime,
  settings,
  events,
) => {
  return class BubbleShooterScene extends PhaserRuntime.Scene {
    private aimAngle = -Math.PI / 2;
    private aimGraphics?: Phaser.GameObjects.Graphics;
    private board: BubbleCell[] = [];
    private bubbleGroup?: Phaser.Physics.Arcade.StaticGroup;
    private bubbleVisuals = new Map<string, BubbleVisual>();
    private challengeIndex = 0;
    private combo = 0;
    private inputLocked = false;
    private keyboardKeys?: {
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
      shoot: Phaser.Input.Keyboard.Key;
      shootAlt: Phaser.Input.Keyboard.Key;
    };
    private launcher?: Phaser.GameObjects.Arc;
    private projectile?: Phaser.GameObjects.Arc;
    private projectileCollider?: Phaser.Physics.Arcade.Collider;
    private radius = 30;
    private reducedMotion = settings.reducedMotion;
    private shotInFlight = false;
    private statusText?: Phaser.GameObjects.Text;
    private wallBounceCount = 0;

    constructor() {
      super({ key: `bubble-shooter:${settings.round.id}` });
    }

    create() {
      this.cameras.main.setBackgroundColor("#101a42");
      this.scale.on(PhaserRuntime.Scale.Events.RESIZE, this.handleResize, this);
      this.game.events.on("arcade-reduced-motion", this.setReducedMotion, this);
      this.physics.world.on("worldbounds", this.handleWorldBounds, this);
      this.events.once(PhaserRuntime.Scenes.Events.SHUTDOWN, this.teardown, this);
      this.input.on("pointermove", this.handlePointerMove, this);
      this.input.on("pointerup", this.handlePointerUp, this);

      if (this.input.keyboard) {
        this.keyboardKeys = {
          left: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.LEFT),
          right: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.RIGHT),
          shoot: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.SPACE),
          shootAlt: this.input.keyboard.addKey(PhaserRuntime.Input.Keyboard.KeyCodes.ENTER),
        };
        this.keyboardKeys.left.on("down", this.aimLeft, this);
        this.keyboardKeys.right.on("down", this.aimRight, this);
        this.keyboardKeys.shoot.on("down", this.launchProjectile, this);
        this.keyboardKeys.shootAlt.on("down", this.launchProjectile, this);
      }

      this.renderChallenge();
      events.onReady();
    }

    update() {
      if (this.projectile && this.shotInFlight) {
        const body = this.projectile.body as Phaser.Physics.Arcade.Body;
        if (body.blocked.up || this.projectile.y <= this.radius + 4) {
          const nearest = this.findNearestTarget(this.projectile.x);
          if (nearest) this.settleAgainst(nearest);
        }
      }
    }

    private aimLeft() {
      if (this.inputLocked || this.shotInFlight) return;
      this.aimAngle = Math.max(-Math.PI + 0.28, this.aimAngle - 0.12);
      this.drawAimGuide();
    }

    private aimRight() {
      if (this.inputLocked || this.shotInFlight) return;
      this.aimAngle = Math.min(-0.28, this.aimAngle + 0.12);
      this.drawAimGuide();
    }

    private setReducedMotion(value: boolean) {
      this.reducedMotion = value;
      this.emitRuntimeState();
    }

    private handleResize() {
      if (!this.shotInFlight) {
        this.renderChallenge();
        return;
      }
      this.physics.world.setBounds(0, 0, this.logicalWidth(), this.logicalHeight());
      this.emitRuntimeState({ resizeDeferred: true });
    }

    private handleWorldBounds(
      body: Phaser.Physics.Arcade.Body,
      _up: boolean,
      _down: boolean,
      left: boolean,
      right: boolean,
    ) {
      if (body.gameObject !== this.projectile || (!left && !right)) return;
      this.wallBounceCount += 1;
      this.emitRuntimeState();
    }

    private renderChallenge() {
      this.clearSceneObjects();
      const challenge = this.currentChallenge();
      if (!challenge) return;

      const width = this.logicalWidth();
      const height = this.logicalHeight();
      this.cameras.main.setOrigin(0, 0).setZoom(settings.renderResolution);
      this.physics.world.setBounds(0, 0, width, height);
      this.radius = Math.min(52, Math.max(24, (width - 24) / 13));
      this.board = createChallengeBoard(challenge);
      this.bubbleGroup = this.physics.add.staticGroup();

      this.add.text(18, 16, `${this.challengeIndex + 1}/${settings.round.challenges.length}`, {
        color: "#7de5ef",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "13px",
        fontStyle: "bold",
        resolution: settings.renderResolution,
      });
      this.add.text(width / 2, 50, challenge.prompt, {
        align: "center",
        color: "#ffffff",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: width < 520 ? "17px" : "20px",
        fontStyle: "bold",
        resolution: settings.renderResolution,
        wordWrap: { width: width - 44 },
      }).setOrigin(0.5);

      this.board.forEach((bubble) => this.addBubbleVisual(bubble));

      const launcherY = height - this.radius - 18;
      this.aimGraphics = this.add.graphics();
      this.launcher = this.add.circle(width / 2, launcherY, this.radius + 7, 0x17234b)
        .setStrokeStyle(3, 0x7de5ef, 0.9);
      this.add.circle(width / 2, launcherY, this.radius - 3, COLORS.neutral)
        .setStrokeStyle(3, 0x36c6d9, 1);
      this.statusText = this.add.text(width / 2, launcherY - this.radius - 20, "", {
        align: "center",
        color: "#ffffff",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        resolution: settings.renderResolution,
        wordWrap: { width: width - 40 },
      }).setOrigin(0.5);
      this.drawAimGuide();
      this.emitRuntimeState({ resizeDeferred: false });
    }

    private clearSceneObjects() {
      this.projectileCollider?.destroy();
      this.projectileCollider = undefined;
      this.projectile = undefined;
      this.shotInFlight = false;
      this.bubbleGroup?.destroy(true);
      this.bubbleGroup = undefined;
      this.bubbleVisuals.clear();
      this.children.removeAll(true);
    }

    private addBubbleVisual(bubble: BubbleCell): BubbleVisual {
      const position = this.cellPosition(bubble.row, bubble.column);
      const circle = this.add.circle(position.x, position.y, this.radius - 2, COLORS[bubble.color])
        .setStrokeStyle(3, 0xffffff, 0.82);
      this.physics.add.existing(circle, true);
      const body = circle.body as Phaser.Physics.Arcade.StaticBody;
      body.setCircle(this.radius - 3);
      body.updateFromGameObject();
      circle.setData("bubbleId", bubble.id);
      this.bubbleGroup?.add(circle);

      let label: Phaser.GameObjects.Text | undefined;
      const decorations: Phaser.GameObjects.GameObject[] = [];
      if (bubble.label) {
        label = this.add.text(position.x, position.y, bubble.label, {
          align: "center",
          color: bubble.color === "cyan" || bubble.color === "gold" ? "#17234b" : "#ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: this.radius < 30 ? "10px" : this.radius > 44 ? "14px" : "12px",
          fontStyle: "bold",
          resolution: settings.renderResolution,
          wordWrap: { width: this.radius * 1.7 },
        }).setOrigin(0.5);
      } else {
        decorations.push(this.add.circle(
          position.x - this.radius * 0.28,
          position.y - this.radius * 0.3,
          Math.max(3, this.radius * 0.12),
          0xffffff,
          0.42,
        ));
      }
      const visual = { circle, decorations, label };
      this.bubbleVisuals.set(bubble.id, visual);
      return visual;
    }

    private handlePointerMove(pointer: Phaser.Input.Pointer) {
      if (this.inputLocked || this.shotInFlight) return;
      this.updateAim(pointer.worldX, pointer.worldY);
    }

    private handlePointerUp(pointer: Phaser.Input.Pointer) {
      if (this.inputLocked || this.shotInFlight) return;
      this.updateAim(pointer.worldX, pointer.worldY);
      this.launchProjectile();
    }

    private updateAim(x: number, y: number) {
      if (!this.launcher || y >= this.launcher.y - 8) return;
      const angle = Math.atan2(y - this.launcher.y, x - this.launcher.x);
      this.aimAngle = Math.min(-0.28, Math.max(-Math.PI + 0.28, angle));
      this.drawAimGuide();
    }

    private drawAimGuide() {
      if (!this.aimGraphics || !this.launcher) return;
      this.aimGraphics.clear();
      this.aimGraphics.lineStyle(3, 0x7de5ef, 0.78);
      for (let distance = this.radius + 16; distance < Math.min(190, this.logicalHeight() * 0.34); distance += 18) {
        const x = this.launcher.x + Math.cos(this.aimAngle) * distance;
        const y = this.launcher.y + Math.sin(this.aimAngle) * distance;
        this.aimGraphics.strokeCircle(x, y, 2);
      }
    }

    private launchProjectile() {
      if (!this.launcher || this.inputLocked || this.shotInFlight) return;
      this.shotInFlight = true;
      this.statusText?.setText("");
      const projectile = this.add.circle(
        this.launcher.x,
        this.launcher.y,
        this.radius - 3,
        COLORS.neutral,
      ).setStrokeStyle(3, 0x36c6d9, 1);
      this.physics.add.existing(projectile);
      const body = projectile.body as Phaser.Physics.Arcade.Body;
      body.setCircle(this.radius - 4);
      body.setBounce(1, 1);
      body.setCollideWorldBounds(true);
      body.onWorldBounds = true;
      const speed = Math.max(420, Math.min(590, this.logicalHeight() * 0.92));
      body.setVelocity(Math.cos(this.aimAngle) * speed, Math.sin(this.aimAngle) * speed);
      this.projectile = projectile;
      this.projectileCollider = this.physics.add.overlap(
        projectile,
        this.bubbleGroup!,
        (_projectile, target) => this.settleAgainst(target as Phaser.GameObjects.Arc),
      );
      this.emitRuntimeState();
    }

    private settleAgainst(target: Phaser.GameObjects.Arc) {
      if (!this.projectile || !this.shotInFlight || this.inputLocked) return;
      const impactId = String(target.getData("bubbleId") ?? "");
      const impact = this.board.find((bubble) => bubble.id === impactId);
      const challenge = this.currentChallenge();
      if (!impact?.choiceId || !challenge) return;

      const answer: ArcadeAnswer = {
        challengeId: challenge.id,
        choiceId: impact.choiceId,
        answeredAt: new Date().toISOString(),
      };
      const outcome = events.onAnswer(answer);
      if (!outcome) return;

      this.inputLocked = true;
      this.shotInFlight = false;
      const impactPoint = this.normalizedGridPoint(this.projectile.x, this.projectile.y);
      const body = this.projectile.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      this.projectileCollider?.destroy();
      this.projectileCollider = undefined;
      this.projectile.destroy();
      this.projectile = undefined;

      const correct = outcome.correct;
      const correctColor = getChoiceColor(challenge, challenge.correctChoiceId);
      const resolution = resolveBubbleShot(
        this.board,
        impact.id,
        impactPoint,
        correct ? correctColor : "neutral",
        `shot:${challenge.id}`,
      );
      if (!resolution) {
        this.advanceAfterFeedback(correct, challenge, 0, 0, impact.id);
        return;
      }

      this.board = resolution.boardWithShot;
      this.addBubbleVisual(resolution.shot);
      if (correct) {
        this.combo += 1;
      } else {
        this.combo = 0;
      }
      this.animateResolution(resolution.removedGroupIds, resolution.disconnectedIds);
      this.advanceAfterFeedback(
        correct,
        challenge,
        resolution.removedGroupIds.length,
        resolution.disconnectedIds.length,
        impact.id,
        resolution.shot.row,
        resolution.shot.column,
      );
    }

    private animateResolution(removedIds: string[], disconnectedIds: string[]) {
      const duration = this.reducedMotion ? 1 : 260;
      removedIds.forEach((id) => {
        const visual = this.bubbleVisuals.get(id);
        if (!visual) return;
        this.tweens.add({
          targets: [visual.circle, visual.label, ...visual.decorations].filter(Boolean),
          alpha: 0,
          duration,
          scale: 0.15,
        });
      });
      disconnectedIds.forEach((id, index) => {
        const visual = this.bubbleVisuals.get(id);
        if (!visual) return;
        this.tweens.add({
          targets: [visual.circle, visual.label, ...visual.decorations].filter(Boolean),
          alpha: 0,
          delay: this.reducedMotion ? 0 : 80 + index * 35,
          duration,
          ease: "Quad.in",
          y: this.logicalHeight() + this.radius * 2,
        });
      });
    }

    private advanceAfterFeedback(
      correct: boolean,
      challenge: PreparedArcadeChallenge,
      removedGroupSize: number,
      disconnectedDropped: number,
      impactId?: string,
      shotSnapRow?: number,
      shotSnapColumn?: number,
    ) {
      const correctLabel = challenge.choices.find(
        (choice) => choice.id === challenge.correctChoiceId,
      )?.label;
      this.statusText?.setColor(correct ? "#7de5ef" : "#ffd2dc");
      this.statusText?.setText(
        correct
          ? `Boa! ${correctLabel}. Combo x${this.combo}`
          : `Quase. A resposta era ${correctLabel}.`,
      );
      this.emitRuntimeState({
        disconnectedDropped,
        impactId,
        lastAnswerCorrect: correct,
        removedGroupSize,
        shotSnapColumn,
        shotSnapRow,
      });

      const delay = this.reducedMotion ? 260 : 900;
      this.time.delayedCall(delay, () => {
        this.challengeIndex += 1;
        if (this.challengeIndex >= settings.round.challenges.length) {
          this.statusText?.setColor("#7de5ef").setText("Rodada concluída!");
          this.emitRuntimeState({
            disconnectedDropped,
            lastAnswerCorrect: correct,
            removedGroupSize,
          });
          return;
        }
        this.inputLocked = false;
        this.renderChallenge();
      });
    }

    private findNearestTarget(x: number): Phaser.GameObjects.Arc | undefined {
      return [...this.bubbleVisuals.entries()]
        .filter(([id]) => id.startsWith("target:"))
        .sort((left, right) =>
          Math.abs(left[1].circle.x - x) - Math.abs(right[1].circle.x - x)
        )[0]?.[1].circle;
    }

    private currentChallenge(): PreparedArcadeChallenge | undefined {
      return settings.round.challenges[this.challengeIndex];
    }

    private cellPosition(row: number, column: number) {
      const width = this.logicalWidth();
      const left = (width - this.radius * 13) / 2;
      const center = getHexCellCenter(row, column);
      return {
        x: left + center.x * this.radius,
        y: 116 + center.y * this.radius,
      };
    }

    private normalizedGridPoint(x: number, y: number) {
      const left = (this.logicalWidth() - this.radius * 13) / 2;
      return {
        x: (x - left) / this.radius,
        y: (y - 116) / this.radius,
      };
    }

    private logicalWidth() {
      return this.scale.width / settings.renderResolution;
    }

    private logicalHeight() {
      return this.scale.height / settings.renderResolution;
    }

    private emitRuntimeState(
      detail: {
        disconnectedDropped?: number;
        impactId?: string;
        lastAnswerCorrect?: boolean;
        removedGroupSize?: number;
        resizeDeferred?: boolean;
        shotSnapColumn?: number;
        shotSnapRow?: number;
      } = {},
    ) {
      events.onRuntimeState({
        boardBubbleCount: this.board.length,
        challengeIndex: this.challengeIndex,
        renderResolution: settings.renderResolution,
        reducedMotion: this.reducedMotion,
        shotInFlight: this.shotInFlight,
        tweenCount: this.tweens.getTweens().length,
        wallBounceCount: this.wallBounceCount,
        ...detail,
      });
    }

    private teardown() {
      this.scale.off(PhaserRuntime.Scale.Events.RESIZE, this.handleResize, this);
      this.game.events.off("arcade-reduced-motion", this.setReducedMotion, this);
      this.physics.world.off("worldbounds", this.handleWorldBounds, this);
      this.input.off("pointermove", this.handlePointerMove, this);
      this.input.off("pointerup", this.handlePointerUp, this);
      this.keyboardKeys?.left.off("down", this.aimLeft, this);
      this.keyboardKeys?.right.off("down", this.aimRight, this);
      this.keyboardKeys?.shoot.off("down", this.launchProjectile, this);
      this.keyboardKeys?.shootAlt.off("down", this.launchProjectile, this);
      this.projectileCollider?.destroy();
      this.tweens.killAll();
    }
  };
};
