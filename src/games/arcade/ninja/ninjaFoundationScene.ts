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
    private pooledReuseCount = 0;
    private reducedMotion = settings.reducedMotion;
    private runner?: Phaser.GameObjects.Container;
    private runnerStartX = 0;
    private runnerParts?: {
      backLeg: Phaser.GameObjects.Rectangle;
      frontLeg: Phaser.GameObjects.Rectangle;
      scarf: Phaser.GameObjects.Triangle;
    };
    private sky?: Phaser.GameObjects.Rectangle;
    private sun?: Phaser.GameObjects.Arc;
    private track: NinjaTrackSegment[] = [];
    private trackVisuals = new Map<number, TrackVisual>();

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

      this.scale.on(PhaserRuntime.Scale.Events.RESIZE, this.handleResize, this);
      this.game.events.on("arcade-reduced-motion", this.setReducedMotion, this);
      this.events.once(PhaserRuntime.Scenes.Events.SHUTDOWN, this.teardown, this);
      events.onReady();
      this.emitRuntimeState();
    }

    update(time: number) {
      const runner = this.runner;
      const layout = this.layout;
      if (!runner || !layout) return;

      const body = runner.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(this.reducedMotion ? 0 : NINJA_RUN_SPEED);
      runner.y = layout.groundY - 7;
      if (!this.reducedMotion) {
        this.cameras.main.scrollX = Math.max(0, runner.x - layout.runnerStartX);
      }
      this.animateRunner(time);
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
      this.emitRuntimeState();
    }

    private setReducedMotion(value: boolean) {
      this.reducedMotion = value;
      const body = this.runner?.body as Phaser.Physics.Arcade.Body | undefined;
      body?.setVelocityX(value ? 0 : NINJA_RUN_SPEED);
      this.animateRunner(0);
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

    private emitRuntimeState() {
      const runner = this.runner;
      events.onRuntimeState({
        activeObjectCount: this.track.length + (runner ? 1 : 0),
        autoRunning: Boolean(runner && (runner.body as Phaser.Physics.Arcade.Body).velocity.x > 0),
        cameraX: Math.round(this.cameras.main.scrollX),
        pooledReuseCount: this.pooledReuseCount,
        renderResolution: settings.renderResolution,
        reducedMotion: this.reducedMotion,
        runnerDistance: Math.max(0, Math.round((runner?.x ?? 0) - this.runnerStartX)),
        trackPoolSize: this.track.length,
        tweenCount: this.tweens.getTweens().length,
      });
    }

    private teardown() {
      this.scale.off(PhaserRuntime.Scale.Events.RESIZE, this.handleResize, this);
      this.game.events.off("arcade-reduced-motion", this.setReducedMotion, this);
      this.tweens.killAll();
      this.trackVisuals.clear();
    }
  };
};
