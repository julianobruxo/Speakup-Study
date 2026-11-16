import type Phaser from "phaser";
import type {
  ArcadeAnswer,
  ArcadeSceneFactory,
  PreparedArcadeChallenge,
} from "../bridge/arcadeBridge";
import {
  collectRoundWords,
  countOccupiedRows,
  createInitialBoard,
  createSeededRandom,
  createWave,
  DANGER_ROW,
  DEFEAT_ROW,
  detectDanger,
  detectDefeat,
  findChallengeForContent,
  findDisconnectedBubbleIds,
  getActiveColors,
  getHexCellCenter,
  getWordBubbles,
  GRID_COLS,
  insertCeilingRow,
  INITIAL_FILL_ROWS,
  MISSES_BEFORE_NEW_ROW,
  needsDensityTopUp,
  pickQueueColor,
  reassignWordToConnectedBubble,
  replenishWordBubbles,
  resolveBubbleShot,
  segmentCircleFirstHit,
  selectNextObjective,
  TARGET_PLAYABLE_ROWS,
  TARGET_WORD_COUNT,
  WAVE_ROWS,
  type BubbleCell,
  type BubbleColor,
  type RandomSource,
  type RoundWord,
} from "./bubbleShooterModel";
import { resolvePedagogy } from "./bubbleShooterPedagogy";

import {
  CLUSTER_DROP,
  COLORS,
  DARK,
  FEEDBACK_MS,
  getClusterFallDurationMs,
  getLauncherFillColor,
  getNewRowLabel,
  getPressureTimeLabel,
  getPreviewFillColor,
  HIGHLIGHT,
  MAX_BOUNCES_PER_FRAME,
  NEW_ROW_TWEEN_MS,
  NEW_ROW_TWEEN_REDUCED_MS,
  PRESSURE_INTERVAL_MS,
  PROJECTILE_SPEED_MAX,
  PROJECTILE_SPEED_MIN,
  segmentWallCrossing,
  SLOT_Y,
  T_EPSILON,
  TIME_EPSILON,
  WALL_EPSILON,
} from "./bubbleShooterPresentation.ts";

/* ── visual helpers ── */

function hashString(value: string): number {
  let hash = 5381;
  for (let index = 0; index < value.length; index++) {
    hash = ((hash << 5) + hash + value.charCodeAt(index)) >>> 0;
  }
  return hash || 1;
}

interface BubbleVisual {
  container: Phaser.GameObjects.Container;
  mainCircle: Phaser.GameObjects.Arc;
  label?: Phaser.GameObjects.Text;
}

interface BubbleHitbox {
  id: string;
  x: number;
  y: number;
}

/* ── scene factory ── */

export const createBubbleShooterScene: ArcadeSceneFactory = (
  PhaserRuntime,
  settings,
  events,
) => {
  return class BubbleShooterScene extends PhaserRuntime.Scene {
    private aimAngle = -Math.PI / 2;
    private aimGraphics?: Phaser.GameObjects.Graphics;
    private board: BubbleCell[] = [];
    private bubbleHitboxes: BubbleHitbox[] = [];
    private bubbleVisuals = new Map<string, BubbleVisual>();
    private combo = 0;
    /* classic loop state */
    private random: RandomSource = createSeededRandom(1);
    private currentColor: BubbleColor = "cyan";
    private nextColor: BubbleColor = "cyan";
    private missesSinceMatch = 0;
    private shotCounter = 0;
    private objective: PreparedArcadeChallenge | null = null;
    private resolvedChallengeIds = new Set<string>();
    private wordPool: RoundWord[] = [];
    private previewGraphics?: Phaser.GameObjects.Graphics;
    private previewLabel?: Phaser.GameObjects.Text;
    private pressureText?: Phaser.GameObjects.Text;
    private roundComplete = false;
    /** Guards so the run can only ever end once. */
    private defeatTriggered = false;
    private runEndEmitted = false;
    private transitioning = false;
    /** Time-based pressure: counts down only while the board is actually playable. */
    private pressureTimeLeftMs = PRESSURE_INTERVAL_MS;
    private lastPressureSecondShown = -1;
    private dangerGraphics?: Phaser.GameObjects.Graphics;
    private dangerActive = false;
    private gameOver = false;
    private gridLeft = 0;
    private gridTop = 0;
    private inputLocked = false;
    private keyboardKeys?: {
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
      shoot: Phaser.Input.Keyboard.Key;
      shootAlt: Phaser.Input.Keyboard.Key;
    };
    private launcherBaseY = 0;
    private launcherX = 0;
    private projContainer?: Phaser.GameObjects.Container;
    private projX = 0;
    private projY = 0;
    private projVx = 0;
    private projVy = 0;
    private radius = 18;
    private reducedMotion = settings.reducedMotion;
    private shotInFlight = false;
    private shotActive = false;
    private resizeDeferredDuringFlight = false;
    private lastScaleW = 0;
    private lastScaleH = 0;
    private wallBounceCount = 0;
    private trailDots: Phaser.GameObjects.Arc[] = [];
    private feedbackTexts: Phaser.GameObjects.Text[] = [];
    private launcherGraphics?: Phaser.GameObjects.Graphics;
    private promptObjects: Phaser.GameObjects.Text[] = [];

    constructor() {
      super({ key: `bubble-shooter:${settings.round.id}` });
    }

    private boundWindowResize = () => this.handleWindowResize();

    create() {
      this.cameras.main.setBackgroundColor("#1a0a2e");
      this.scale.on(PhaserRuntime.Scale.Events.RESIZE, this.handleResize, this);
      this.game.events.on("arcade-reduced-motion", this.setReducedMotion, this);
      this.events.once(PhaserRuntime.Scenes.Events.SHUTDOWN, this.teardown, this);
      this.input.on("pointermove", this.handlePointerMove, this);
      this.input.on("pointerup", this.handlePointerUp, this);
      window.addEventListener("resize", this.boundWindowResize);

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

      this.setupLayout();
      this.renderFirstChallenge();
      events.onReady();
    }

    private handleWindowResize() {
      if (this.shotInFlight) {
        this.resizeDeferredDuringFlight = true;
        this.emitRuntimeState({ resizeDeferred: true });
      }
    }

    update(_time: number, delta: number) {
      this.tickPressureClock(delta);
      if (!this.shotInFlight) return;

      const r = this.radius;
      // Walk the frame's motion budget in segments. A bounce splits the frame,
      // and the remaining travel must be swept along the *reflected* path —
      // mirroring the endpoint instead would test a straight line across the
      // arena and skip bubbles sitting next to the wall.
      let remaining = Math.min(delta, 33) / 1000;
      let bounces = 0;

      while (remaining > TIME_EPSILON && bounces <= MAX_BOUNCES_PER_FRAME) {
        const startX = this.projX;
        const startY = this.projY;
        const endX = startX + this.projVx * remaining;
        const endY = startY + this.projVy * remaining;

        const wallT = this.findWallCrossing(startX, endX);
        const bubbleHit = this.findFirstCollision(startX, startY, endX, endY);

        // The nearest event along the segment always wins. On a tie the bubble
        // takes priority, so a contact in the corner still settles the shot.
        if (bubbleHit && (wallT === null || bubbleHit.t <= wallT + T_EPSILON)) {
          this.projX = bubbleHit.contactX;
          this.projY = bubbleHit.contactY;
          this.updateProjectileVisual();
          this.settleAgainst(bubbleHit.bubbleId, bubbleHit.contactX, bubbleHit.contactY);
          return;
        }

        if (wallT !== null) {
          const contactX = startX + (endX - startX) * wallT;
          const contactY = startY + (endY - startY) * wallT;
          this.projX = contactX;
          this.projY = contactY;
          this.projVx = contactX <= this.logicalWidth() / 2
            ? Math.abs(this.projVx)
            : -Math.abs(this.projVx);
          // Nudge inside the arena so the next sweep cannot re-detect this wall.
          this.projX += this.projVx > 0 ? WALL_EPSILON : -WALL_EPSILON;
          this.wallBounceCount++;
          bounces++;
          remaining *= 1 - wallT;
          continue;
        }

        this.projX = endX;
        this.projY = endY;
        remaining = 0;
      }

      this.updateProjectileVisual();
      const nextY = this.projY;

      if (!this.reducedMotion && this.trailDots.length < 12) {
        const dot = this.add.circle(this.projX, this.projY, r * 0.3, 0x7de5ef, 0.5);
        dot.setDepth(5);
        this.trailDots.push(dot);
        this.tweens.add({
          targets: dot,
          alpha: 0,
          scale: 0.3,
          duration: 250,
          onComplete: () => {
            dot.destroy();
            const idx = this.trailDots.indexOf(dot);
            if (idx >= 0) this.trailDots.splice(idx, 1);
          },
        });
      }

      if (nextY <= this.gridTop + r * 0.5) {
        this.handleCeilingHit();
      }
    }

    /**
     * True only while the learner can actually act on the board. The pressure
     * clock is frozen everywhere else — start screen, pauses, row and wave
     * transitions, and once the run has ended — so no time accrues off-screen.
     */
    private isClockRunning(): boolean {
      return (
        !this.gameOver &&
        !this.roundComplete &&
        !this.transitioning &&
        !this.defeatTriggered &&
        this.board.length > 0
      );
    }

    /**
     * Advances the time-based pressure trigger. Reaching zero requests a row
     * through the same pipeline the miss counter uses, so the two triggers can
     * never produce two rows at once.
     */
    private tickPressureClock(delta: number) {
      if (!this.isClockRunning()) return;

      this.pressureTimeLeftMs -= delta;
      const second = Math.max(0, Math.ceil(this.pressureTimeLeftMs / 1000));
      if (second !== this.lastPressureSecondShown) {
        this.lastPressureSecondShown = second;
        this.drawPressureIndicator();
      }

      if (this.pressureTimeLeftMs <= 0) {
        this.pressureTimeLeftMs = PRESSURE_INTERVAL_MS;
        // A shot resolving this frame already routes through finishShot, which
        // coalesces both triggers into a single row.
        if (!this.shotInFlight) this.requestPressureRow();
      }
    }

    /**
     * Single entry point for pressure. Whichever trigger fires, exactly one row
     * enters and both cycles restart together.
     */
    private requestPressureRow() {
      if (this.transitioning || this.gameOver || this.roundComplete) return;
      this.missesSinceMatch = 0;
      this.pressureTimeLeftMs = PRESSURE_INTERVAL_MS;
      this.lastPressureSecondShown = -1;
      this.pushCeilingRow();
      this.enforceConnectivity();
      if (detectDefeat(this.board)) {
        this.time.delayedCall(500, () => this.triggerDefeat());
        return;
      }
      this.updateDangerState();
      this.drawPressureIndicator();
    }

    /** Restarts both pressure cycles, e.g. after a wave or a new round. */
    private resetPressureCycles() {
      this.missesSinceMatch = 0;
      this.pressureTimeLeftMs = PRESSURE_INTERVAL_MS;
      this.lastPressureSecondShown = -1;
    }

    /* ── collision ── */

    /**
     * Nearest bubble contact along a segment. Every live bubble is tested with
     * the same combined radius — a wordBonus has no physical exception — so the
     * first thing the projectile touches is always what stops it.
     */
    private findFirstCollision(
      x0: number, y0: number, x1: number, y1: number,
    ): { bubbleId: string; contactX: number; contactY: number; t: number } | null {
      let bestT = Infinity;
      let bestId = "";
      const combinedR = this.radius * 1.6;

      for (const hb of this.bubbleHitboxes) {
        const t = segmentCircleFirstHit(x0, y0, x1, y1, hb.x, hb.y, combinedR);
        if (t !== null && t < bestT) {
          bestT = t;
          bestId = hb.id;
        }
      }

      if (bestId) {
        return {
          bubbleId: bestId,
          contactX: x0 + (x1 - x0) * bestT,
          contactY: y0 + (y1 - y0) * bestT,
          t: bestT,
        };
      }
      return null;
    }

    /** Normalised position along the segment where it first meets a side wall. */
    private findWallCrossing(startX: number, endX: number): number | null {
      return segmentWallCrossing(
        startX,
        endX,
        this.radius,
        this.logicalWidth() - this.radius,
      );
    }

    private updateProjectileVisual() {
      if (this.projContainer) {
        this.projContainer.setPosition(this.projX, this.projY);
      }
    }

    /* ── input ── */

    private aimLeft() {
      if (this.inputLocked || this.shotInFlight) return;
      this.aimAngle = Math.max(-Math.PI + 0.18, this.aimAngle - 0.08);
      this.drawAimGuide();
    }

    private aimRight() {
      if (this.inputLocked || this.shotInFlight) return;
      this.aimAngle = Math.min(-0.18, this.aimAngle + 0.08);
      this.drawAimGuide();
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
      if (y >= this.launcherBaseY - 12) return;
      const angle = Math.atan2(y - this.launcherBaseY, x - this.launcherX);
      this.aimAngle = Math.min(-0.18, Math.max(-Math.PI + 0.18, angle));
      this.drawAimGuide();
    }

    /* ── lifecycle ── */

    private setReducedMotion(value: boolean) {
      this.reducedMotion = value;
      this.emitRuntimeState();
    }

    private handleResize() {
      const sw = this.scale.width;
      const sh = this.scale.height;
      const dimensionsChanged = sw !== this.lastScaleW || sh !== this.lastScaleH;
      if (!dimensionsChanged) return;

      if (this.shotInFlight || this.gameOver || this.shotActive) {
        this.resizeDeferredDuringFlight = true;
        this.emitRuntimeState({ resizeDeferred: true });
        return;
      }
      if (this.inputLocked) {
        this.resizeDeferredDuringFlight = true;
        return;
      }
      this.rebuildVisuals();
    }

    /* ── layout setup ── */

    private setupLayout() {
      const w = this.logicalWidth();
      const h = this.logicalHeight();
      this.cameras.main.setOrigin(0, 0).setZoom(settings.renderResolution);

      const maxBubbleDiameter = (w - 16) / GRID_COLS;
      this.radius = Math.min(26, Math.max(12, maxBubbleDiameter / 2));

      const gridWidth = GRID_COLS * this.radius * 2;
      this.gridLeft = (w - gridWidth) / 2 + this.radius;
      this.gridTop = 8;
      this.launcherX = w / 2;

      const gridBottomY = this.gridTop + (INITIAL_FILL_ROWS + 1.5) * this.radius * Math.sqrt(3);
      this.launcherBaseY = Math.min(h - 60, gridBottomY + Math.min(90, (h - gridBottomY) * 0.55));
    }

    /* ── rendering ── */

    private renderFirstChallenge() {
      const w = this.logicalWidth();
      const h = this.logicalHeight();

      this.drawBackground(w, h);

      const seed = hashString(settings.round.id);
      this.random = createSeededRandom(seed);
      const creation = createInitialBoard(settings.round, seed);
      this.board = creation.board;

      const placed = new Set(creation.placedContentIds);
      this.wordPool = collectRoundWords(settings.round).filter(
        (word) => !placed.has(word.contentId),
      );

      this.bubbleHitboxes = [];
      this.board.forEach((bubble) => this.addBubbleVisual(bubble));

      this.refillQueue();
      this.refillQueue();
      this.objective = selectNextObjective(
        settings.round,
        this.board,
        this.resolvedChallengeIds,
      );

      this.drawDangerZone(w);
      this.drawObjective(w);

      this.aimGraphics = this.add.graphics();
      this.aimGraphics.setDepth(50);
      this.drawAimGuide();
      this.refreshShooterHud();
      this.shotActive = false;
      this.resizeDeferredDuringFlight = false;
      this.lastScaleW = this.scale.width;
      this.lastScaleH = this.scale.height;
      this.emitRuntimeState({ resizeDeferred: false });
    }

    /**
     * Advances the Portuguese objective. The board is never rebuilt: it simply
     * points at the next unresolved word that is actually present on the grid.
     */
    private refreshObjective() {
      this.objective = selectNextObjective(
        settings.round,
        this.board,
        this.resolvedChallengeIds,
      );
      this.drawObjective(this.logicalWidth());
    }

    /** Draws the current color and shows the next one, never covering the word. */
    private refillQueue() {
      this.currentColor = this.nextColor;
      const picked = pickQueueColor(this.board, this.random);
      this.nextColor = picked ?? this.currentColor;
      if (!getActiveColors(this.board).includes(this.currentColor)) {
        this.currentColor = this.nextColor;
      }
    }

    /**
     * Repaints everything that reflects queue or pressure state. Called after a
     * shot, a new row, a colour being eliminated and on rebuilds, so the loaded
     * bubble, the NEXT preview and the countdown can never go stale.
     */
    private refreshShooterHud() {
      this.launcherGraphics?.destroy();
      this.drawLauncher(this.logicalWidth());
      this.drawQueuePreview();
      this.drawPressureIndicator();
    }

    private rebuildVisuals() {
      this.clearAllVisuals();
      this.setupLayout();

      const w = this.logicalWidth();
      const h = this.logicalHeight();

      this.drawBackground(w, h);

      this.bubbleHitboxes = [];
      this.board.forEach((bubble) => this.addBubbleVisual(bubble));

      this.drawDangerZone(w);
      this.drawObjective(w);

      this.aimGraphics = this.add.graphics();
      this.aimGraphics.setDepth(50);
      this.refreshShooterHud();
      if (!this.inputLocked) {
        this.drawAimGuide();
      }
      this.shotActive = false;
      this.resizeDeferredDuringFlight = false;
      this.lastScaleW = this.scale.width;
      this.lastScaleH = this.scale.height;
      this.emitRuntimeState();
    }

    private clearAllVisuals() {
      this.projContainer?.destroy(true);
      this.projContainer = undefined;
      this.bubbleVisuals.clear();
      this.bubbleHitboxes = [];
      for (const dot of this.trailDots) dot.destroy();
      this.trailDots.length = 0;
      for (const t of this.feedbackTexts) t.destroy();
      this.feedbackTexts.length = 0;
      for (const obj of this.promptObjects) obj.destroy();
      this.promptObjects.length = 0;
      this.children.removeAll(true);
    }

    private rebuildAllBubbleVisuals() {
      for (const [, vis] of this.bubbleVisuals) {
        vis.container.destroy(true);
      }
      this.bubbleVisuals.clear();
      this.bubbleHitboxes = [];
      this.board.forEach((bubble) => this.addBubbleVisual(bubble));
      this.syncHitboxes();
    }

    private drawBackground(w: number, h: number) {
      const g = this.add.graphics();
      g.fillGradientStyle(0x1a0a2e, 0x1a0a2e, 0x2d1450, 0x2d1450);
      g.fillRect(0, 0, w, h);

      const gridWidth = GRID_COLS * this.radius * 2;
      const gridMargin = (w - gridWidth) / 2;
      const colW = Math.max(16, gridMargin * 0.5);

      const columnPositions = [
        gridMargin * 0.25,
        gridMargin * 0.78,
        w - gridMargin * 0.78,
        w - gridMargin * 0.25,
      ];

      for (const cx of columnPositions) {
        g.fillStyle(0x3a1a5e, 0.85);
        g.fillRoundedRect(cx - colW / 2, 0, colW, h, 4);
        g.fillStyle(0x4c266e, 0.6);
        g.fillRoundedRect(cx - colW * 0.3, 0, colW * 0.6, h, 3);
        g.fillStyle(0x5a3480, 0.35);
        g.fillRoundedRect(cx - colW * 0.12, 0, colW * 0.24, h, 2);
        g.fillStyle(0x5a3480, 0.6);
        g.fillEllipse(cx, colW * 0.5, colW * 1.3, colW * 1.1);
        g.fillStyle(0x4c266e, 0.3);
        g.fillEllipse(cx, h * 0.5, colW * 0.15, h * 0.7);
      }

      const archCenterX = w / 2;
      const archRadius = gridWidth * 0.56;
      g.lineStyle(3, 0x5a3890, 0.5);
      g.beginPath();
      g.arc(archCenterX, archRadius * 0.5, archRadius, Math.PI, 0, false);
      g.strokePath();
      g.lineStyle(2, 0x7048a8, 0.3);
      g.beginPath();
      g.arc(archCenterX, archRadius * 0.5, archRadius * 1.08, Math.PI, 0, false);
      g.strokePath();
      g.lineStyle(1.5, 0x4a2878, 0.2);
      g.beginPath();
      g.arc(archCenterX, archRadius * 0.5, archRadius * 0.9, Math.PI, 0, false);
      g.strokePath();

      const bgGridBottom = this.gridTop + (INITIAL_FILL_ROWS + 2) * this.radius * Math.sqrt(3);
      const arenaLeft = Math.max(2, gridMargin - this.radius * 0.3);
      const arenaWidth = w - arenaLeft * 2;
      g.fillStyle(0x0e0620, 0.3);
      g.fillRect(arenaLeft, 0, arenaWidth, bgGridBottom + 8);
      g.lineStyle(1.5, 0x5a3890, 0.3);
      g.strokeRect(arenaLeft, 0, arenaWidth, bgGridBottom + 8);

      g.fillGradientStyle(0x2d1450, 0x2d1450, 0x1a0a2e, 0x1a0a2e, 0.3, 0.3, 0, 0);
      g.fillRect(0, h - 80, w, 80);

      const floorY = h - 6;
      g.fillStyle(0x5a3890, 0.4);
      g.fillRoundedRect(w * 0.12, floorY, w * 0.76, 5, 3);
    }

    private drawDangerZone(w: number) {
      const g = this.add.graphics();
      this.dangerGraphics = g;
      g.setDepth(3);

      const dangerY = this.cellScreenPosition(DANGER_ROW, 0).y;
      const gridWidth = GRID_COLS * this.radius * 2;
      const gridMargin = (w - gridWidth) / 2;
      const left = Math.max(2, gridMargin - this.radius * 0.3);
      const right = w - left;

      g.lineStyle(1.5, 0xff4444, 0.15);
      g.lineBetween(left, dangerY, right, dangerY);

      g.fillStyle(0xff0000, 0.02);
      const defeatY = this.cellScreenPosition(DEFEAT_ROW, 0).y;
      g.fillRect(left, dangerY, right - left, defeatY - dangerY + this.radius);
    }

    private updateDangerState() {
      const isDanger = detectDanger(this.board);
      if (isDanger && !this.dangerActive) {
        this.dangerActive = true;
        this.pulseDangerZone();
        this.showFeedbackRight("DANGER!", 0xff4444, 24, FEEDBACK_MS.danger, SLOT_Y.danger);
      } else if (!isDanger && this.dangerActive) {
        this.dangerActive = false;
      }
    }

    private pulseDangerZone() {
      if (!this.dangerActive || !this.dangerGraphics || this.reducedMotion) return;
      this.tweens.add({
        targets: this.dangerGraphics,
        alpha: { from: 1, to: 0.4 },
        duration: 600,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          if (this.dangerGraphics) this.dangerGraphics.setAlpha(1);
        },
      });
    }

    /**
     * The Portuguese objective stays under the launcher across many shots. It
     * only changes when its English word bubble is actually collected.
     */
    private drawObjective(w: number) {
      for (const obj of this.promptObjects) obj.destroy();
      this.promptObjects.length = 0;

      const challenge = this.objective;
      if (!challenge) return;

      const promptY = this.launcherBaseY + 32;
      const portugueseWord = this.extractPortugueseWord(challenge.prompt);

      const wordFontSize = w < 380 ? "16px" : w < 520 ? "20px" : "24px";
      const wordText = this.add.text(w / 2, promptY, portugueseWord.toUpperCase(), {
        align: "center",
        color: "#ffffff",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: wordFontSize,
        fontStyle: "bold",
        resolution: settings.renderResolution,
        stroke: "#1a0a2e",
        strokeThickness: 3,
      }).setOrigin(0.5, 0).setDepth(100);
      this.promptObjects.push(wordText);

      const hintFontSize = w < 380 ? "9px" : w < 520 ? "10px" : "11px";
      const hintText = this.add.text(
        w / 2,
        promptY + (wordText.height || 20) + 4,
        "Estoure ou derrube a bolha com a palavra certa.",
        {
          align: "center",
          color: "#a090c0",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: hintFontSize,
          resolution: settings.renderResolution,
        },
      ).setOrigin(0.5, 0).setDepth(100);
      this.promptObjects.push(hintText);
    }

    /**
     * Compact "next bubble" indicator beside the launcher. It sits to the left
     * of the launcher so it never covers the Portuguese objective below it.
     */
    private drawQueuePreview() {
      this.previewGraphics?.destroy();
      this.previewLabel?.destroy();
      const g = this.add.graphics();
      this.previewGraphics = g;
      g.setDepth(45);

      // Half the launcher radius: size and position mark it as secondary, and
      // the NEXT label removes any doubt without relying on colour alone.
      const r = Math.max(7, this.radius * 0.5);
      const cx = this.launcherX - Math.min(this.radius + 2, 24) - r * 2.8;
      const cy = this.launcherBaseY;

      g.fillStyle(0x0e0620, 0.75);
      g.fillCircle(cx, cy, r + 4);
      g.lineStyle(1.5, 0x7de5ef, 0.45);
      g.strokeCircle(cx, cy, r + 4);

      g.fillStyle(getPreviewFillColor(this.nextColor), 1);
      g.fillCircle(cx, cy, r);
      g.lineStyle(1.2, DARK[this.nextColor], 0.7);
      g.strokeCircle(cx, cy, r);
      g.fillStyle(HIGHLIGHT[this.nextColor], 0.45);
      g.fillCircle(cx - r * 0.28, cy - r * 0.3, r * 0.28);

      this.previewLabel = this.add.text(cx, cy + r + 8, "NEXT", {
        align: "center",
        color: "#a9b6e8",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "9px",
        fontStyle: "bold",
        resolution: settings.renderResolution,
        stroke: "#0e0620",
        strokeThickness: 2,
      }).setOrigin(0.5, 0).setDepth(45);
    }

    /**
     * Persistent countdown to the next ceiling row, drawn on the right of the
     * launcher so the learner can always anticipate the pressure step.
     */
    private drawPressureIndicator() {
      this.pressureText?.destroy();
      if (this.gameOver || this.roundComplete) return;

      const r = Math.max(7, this.radius * 0.5);
      const x = this.launcherX + Math.min(this.radius + 2, 24) + r * 1.6;
      const imminent = this.missesSinceMatch >= MISSES_BEFORE_NEW_ROW - 1;

      // Both pressure triggers are shown: the clock and the shot counter.
      const lines = [
        getPressureTimeLabel(this.pressureTimeLeftMs),
        getNewRowLabel(this.missesSinceMatch),
      ];

      this.pressureText = this.add.text(x, this.launcherBaseY, lines, {
        align: "left",
        color: imminent ? "#ffb4c4" : "#a9b6e8",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "10px",
        fontStyle: "bold",
        lineSpacing: 3,
        resolution: settings.renderResolution,
        stroke: "#0e0620",
        strokeThickness: 3,
      }).setOrigin(0, 0.5).setDepth(45);
    }

    private extractPortugueseWord(prompt: string): string {
      const match = prompt.match(/"([^"]+)"/);
      if (match) return match[1];
      const match2 = prompt.match(/significa\s+(.+)\?/i);
      if (match2) return match2[1];
      return prompt;
    }

    private drawLauncher(_w: number) {
      const g = this.add.graphics();
      this.launcherGraphics = g;
      g.setDepth(40);
      const cx = this.launcherX;
      const cy = this.launcherBaseY;
      const lr = Math.min(this.radius + 2, 24);

      g.fillStyle(0x4c266e, 0.7);
      g.fillRoundedRect(cx - lr * 2.2, cy + lr * 0.55, lr * 4.4, lr * 0.6, 4);
      g.fillStyle(0x5a3890, 0.5);
      g.fillRoundedRect(cx - lr * 1.7, cy + lr * 0.5, lr * 3.4, lr * 0.4, 3);

      g.lineStyle(2.5, 0x7de5ef, 0.3);
      g.strokeCircle(cx, cy, lr + 10);

      g.fillStyle(0x0e0620, 1);
      g.fillCircle(cx, cy, lr + 5);
      g.lineStyle(3, 0x7de5ef, 0.85);
      g.strokeCircle(cx, cy, lr + 5);

      // The loaded bubble shows the real colour that will be fired. Highlights
      // stay translucent and off-centre so they never wash the colour out.
      g.fillStyle(getLauncherFillColor(this.currentColor), 1);
      g.fillCircle(cx, cy, lr);
      g.fillStyle(HIGHLIGHT[this.currentColor], 0.3);
      g.fillEllipse(cx - lr * 0.25, cy - lr * 0.32, lr * 0.66, lr * 0.44);
      g.lineStyle(1.8, DARK[this.currentColor], 0.85);
      g.strokeCircle(cx, cy, lr);
      g.fillStyle(0xffffff, 0.3);
      g.fillCircle(cx - lr * 0.32, cy - lr * 0.36, lr * 0.18);

      const arrowLen = lr + 14;
      g.lineStyle(2, 0x7de5ef, 0.6);
      g.lineBetween(cx, cy - lr - 6, cx, cy - arrowLen);
      g.fillStyle(0x7de5ef, 0.6);
      g.fillTriangle(
        cx, cy - arrowLen - 5,
        cx - 4, cy - arrowLen + 2,
        cx + 4, cy - arrowLen + 2,
      );
    }

    private addBubbleVisual(bubble: BubbleCell): BubbleVisual {
      const pos = this.cellScreenPosition(bubble.row, bubble.column);
      const r = this.radius;
      const color = COLORS[bubble.color];
      const highlight = HIGHLIGHT[bubble.color];
      const dark = DARK[bubble.color];
      const container = this.add.container(pos.x, pos.y);
      container.setDepth(10);

      const shadow = this.add.circle(1.5, 1.5, r - 1, 0x000000, 0.25);
      container.add(shadow);

      const mainCircle = this.add.circle(0, 0, r - 1, color);
      mainCircle.setStrokeStyle(1.5, dark, 0.6);
      container.add(mainCircle);

      const shineG = this.add.graphics();
      shineG.fillStyle(highlight, 0.45);
      shineG.fillEllipse(-r * 0.2, -r * 0.32, r * 0.75, r * 0.5);
      shineG.fillStyle(0xffffff, 0.6);
      shineG.fillCircle(-r * 0.28, -r * 0.36, r * 0.18);
      container.add(shineG);

      this.bubbleHitboxes.push({ id: bubble.id, x: pos.x, y: pos.y });

      let label: Phaser.GameObjects.Text | undefined;
      if (bubble.label) {
        const fontSize = r < 16 ? 8 : r < 20 ? 9 : r < 24 ? 10 : 12;
        const textBg = this.add.graphics();
        textBg.fillStyle(0x000000, 0.35);
        textBg.fillRoundedRect(-r * 0.7, -fontSize * 0.7, r * 1.4, fontSize * 1.6, 3);
        container.add(textBg);

        label = this.add.text(0, 0, bubble.label, {
          align: "center",
          color: "#ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: `${fontSize}px`,
          fontStyle: "bold",
          resolution: settings.renderResolution,
          wordWrap: { width: r * 1.6 },
          stroke: "#000000",
          strokeThickness: 2,
        }).setOrigin(0.5);
        container.add(label);

        const glowG = this.add.graphics();
        glowG.lineStyle(2.5, 0xffffff, 0.5);
        glowG.strokeCircle(0, 0, r + 2);
        glowG.lineStyle(1.5, highlight, 0.3);
        glowG.strokeCircle(0, 0, r + 4);
        container.add(glowG);
      }

      const visual: BubbleVisual = { container, mainCircle, label };
      this.bubbleVisuals.set(bubble.id, visual);
      return visual;
    }

    private drawAimGuide() {
      if (!this.aimGraphics) return;
      this.aimGraphics.clear();
      const w = this.logicalWidth();

      let x = this.launcherX;
      let y = this.launcherBaseY;
      let dx = Math.cos(this.aimAngle);
      let dy = Math.sin(this.aimAngle);
      const step = 8;
      const maxSteps = 80;
      let dotIndex = 0;

      for (let i = 0; i < maxSteps; i++) {
        x += dx * step;
        y += dy * step;

        if (x <= this.radius + 4) {
          x = this.radius + 4;
          dx = Math.abs(dx);
        } else if (x >= w - this.radius - 4) {
          x = w - this.radius - 4;
          dx = -Math.abs(dx);
        }

        if (y <= this.gridTop) break;

        if (i % 3 === 0) {
          const alpha = Math.max(0.2, 0.8 - dotIndex * 0.03);
          const dotR = Math.max(1.5, 3.5 - dotIndex * 0.08);
          this.aimGraphics.fillStyle(0x7de5ef, alpha);
          this.aimGraphics.fillCircle(x, y, dotR);
          dotIndex++;
        }
      }
    }

    /* ── shooting ── */

    private launchProjectile() {
      if (
        this.inputLocked ||
        this.shotInFlight ||
        this.gameOver ||
        this.transitioning ||
        this.roundComplete
      ) return;
      this.shotInFlight = true;
      this.shotActive = true;
      this.inputLocked = true;
      this.resizeDeferredDuringFlight = false;
      this.aimGraphics?.clear();
      const r = this.radius;

      this.projX = this.launcherX;
      this.projY = this.launcherBaseY;

      const speed = Math.max(
        PROJECTILE_SPEED_MIN,
        Math.min(PROJECTILE_SPEED_MAX, this.logicalHeight() * 1.045 * 1.1),
      );
      this.projVx = Math.cos(this.aimAngle) * speed;
      this.projVy = Math.sin(this.aimAngle) * speed;

      const container = this.add.container(this.projX, this.projY);
      container.setDepth(30);

      // The projectile carries a normal playable colour and keeps it in flight.
      const mainBall = this.add.circle(0, 0, r - 2, COLORS[this.currentColor]);
      mainBall.setStrokeStyle(1.5, DARK[this.currentColor], 0.7);
      container.add(mainBall);

      const shine = this.add.graphics();
      shine.fillStyle(HIGHLIGHT[this.currentColor], 0.45);
      shine.fillEllipse(-r * 0.2, -r * 0.3, r * 0.6, r * 0.4);
      shine.fillStyle(0xffffff, 0.6);
      shine.fillCircle(-r * 0.3, -r * 0.35, r * 0.18);
      container.add(shine);

      this.projContainer = container;

      if (!this.reducedMotion) {
        this.tweens.add({
          targets: this.launcherGraphics,
          y: 3,
          duration: 60,
          yoyo: true,
          ease: "Quad.out",
        });
      }

      this.emitRuntimeState();
    }

    private handleCeilingHit() {
      if (!this.shotInFlight) return;
      const nearest = this.findNearestBubbleHitbox(this.projX, this.projY);
      if (nearest) {
        this.settleAgainst(nearest.id, this.projX, this.projY);
      } else {
        this.shotInFlight = false;
        this.cleanupProjectile();
        this.inputLocked = false;
        this.drawAimGuide();
        this.emitRuntimeState();
      }
    }

    /**
     * Contact never answers anything. The projectile simply snaps, and only the
     * *physical* result of that snap — an exploded group or a structural drop —
     * can collect a word.
     */
    private settleAgainst(impactBubbleId: string, impactX: number, impactY: number) {
      if (!this.shotInFlight) return;
      const impact = this.board.find((bubble) => bubble.id === impactBubbleId);
      if (!impact) return;

      this.shotInFlight = false;
      const impactPoint = this.normalizedGridPoint(impactX, impactY);
      this.resolveShot(impact, impactPoint, impactX, impactY);
    }

    private resolveShot(
      impact: BubbleCell,
      impactPoint: { x: number; y: number },
      screenX: number,
      screenY: number,
    ) {
      this.cleanupProjectile();

      this.shotCounter += 1;
      const resolution = resolveBubbleShot(
        this.board,
        impact.id,
        impactPoint,
        this.currentColor,
        `shot:${this.shotCounter}`,
      );

      if (!resolution) {
        this.finishShot();
        return;
      }

      this.board = resolution.remainingBoard;
      const shotVisual = this.addBubbleVisual(resolution.shot);
      shotVisual.mainCircle.setFillStyle(COLORS[this.currentColor]);
      shotVisual.mainCircle.setStrokeStyle(1.5, DARK[this.currentColor], 0.6);

      this.emitRuntimeState({
        impactId: impact.id,
        removedGroupSize: resolution.removedGroupIds.length,
        disconnectedDropped: resolution.disconnectedIds.length,
        shotSnapColumn: resolution.shot.column,
        shotSnapRow: resolution.shot.row,
      });

      this.animateResolution(
        resolution.removedGroupIds,
        resolution.disconnectedIds,
        screenX,
        screenY,
      );

      // Pedagogy reads the physical outcome; it never drives it.
      const pedagogy = resolvePedagogy(this.objective, resolution.collectedWords);

      if (pedagogy.returnedToPool.length > 0) {
        // A word knocked down before it was studied must survive the round: it
        // goes back to the pool so it can be re-hosted on a connected bubble.
        for (const contentId of pedagogy.returnedToPool) {
          this.returnWordToPool(contentId);
        }
        this.showFeedbackRight("WORD BONUS!", 0xffe28a, 16, FEEDBACK_MS.bigDrop, SLOT_Y.primary);
        this.scorePoints(50 * pedagogy.bonusWords.length);
      }

      if (pedagogy.shouldEmitOutcome && this.objective) {
        this.emitObjectiveOutcome(this.objective, screenX, screenY, resolution);
      } else if (resolution.matched) {
        this.showFeedbackRight("NICE!", 0x7de5ef, 16, FEEDBACK_MS.score, SLOT_Y.primary);
        this.scorePoints(30 + resolution.removedGroupIds.length * 10);
      }

      if (resolution.matched) {
        this.missesSinceMatch = 0;
      } else {
        this.missesSinceMatch += 1;
      }

      this.finishShot();
    }

    /** Exactly one correct outcome per collected objective. */
    private emitObjectiveOutcome(
      challenge: PreparedArcadeChallenge,
      screenX: number,
      screenY: number,
      resolution: { removedGroupIds: string[]; disconnectedIds: string[] },
    ) {
      const answer: ArcadeAnswer = {
        challengeId: challenge.id,
        choiceId: challenge.correctChoiceId,
        answeredAt: new Date().toISOString(),
      };
      const outcome = events.onAnswer(answer);
      if (!outcome) return;

      this.resolvedChallengeIds.add(challenge.id);
      this.combo += 1;
      this.showFeedback(
        true,
        challenge,
        screenX,
        screenY,
        resolution.removedGroupIds.length,
        resolution.disconnectedIds.length,
      );
      this.emitRuntimeState({ lastAnswerCorrect: true });
    }

    private scorePoints(_points: number) {
      /* Arcade score is owned by React through outcomes; kept for feedback only. */
    }

    /**
     * Closes the shot: applies pressure, checks defeat, refreshes objective and
     * queue, and re-arms input. Every board mutation ends here, so connectivity
     * is validated in a single place.
     */
    private finishShot() {
      // Both triggers funnel through one check, so a shot that exhausts the
      // miss counter at the same moment the clock expires still adds one row.
      const byMisses = this.missesSinceMatch >= MISSES_BEFORE_NEW_ROW;
      const byTime = this.pressureTimeLeftMs <= 0;
      if (byMisses || byTime) {
        this.resetPressureCycles();
        this.pushCeilingRow();
      }

      this.enforceConnectivity();

      if (detectDefeat(this.board)) {
        this.time.delayedCall(500, () => this.triggerDefeat());
        return;
      }

      this.updateDangerState();
      // Re-host words knocked down before they were studied, then top up.
      this.reassignPooledWords();
      this.replenishWords();
      this.refreshObjective();

      if (!this.objective || this.resolvedChallengeIds.size >= settings.round.challenges.length) {
        this.completeRound();
        return;
      }

      // A cleared board must never leave the shooter aiming at nothing.
      if (this.board.length === 0) {
        this.spawnWave();
        return;
      }

      // A sparse board, or one missing the active objective, is restored with
      // connected rows. Content is never loaded into the shooter.
      const objectiveOnBoard = getWordBubbles(this.board).some(
        (bubble) => bubble.contentId === this.objective?.correctChoiceId,
      );
      if (needsDensityTopUp(this.board, this.wordPool.length, objectiveOnBoard)) {
        this.topUpDensity();
        return;
      }

      this.refillQueue();

      const delay = this.reducedMotion ? 260 : 620;
      this.time.delayedCall(delay, () => {
        if (this.gameOver || this.roundComplete) return;
        this.inputLocked = false;
        this.shotActive = false;
        this.resizeDeferredDuringFlight = false;
        this.drawAimGuide();
        this.refreshShooterHud();
        this.emitRuntimeState();
      });
    }

    /**
     * Rebuilds a full playable wave after the board was cleared while words are
     * still owed. Input stays locked until the new board is ready, and the
     * current objective is always among the seeded words so the round can go on.
     */
    private spawnWave() {
      this.transitioning = true;
      this.inputLocked = true;
      this.showFeedbackRight("NEXT WAVE!", 0x7de5ef, 20, FEEDBACK_MS.newRow, SLOT_Y.newRow);

      // The active objective leads the seeding, then any other pending words.
      const pending: RoundWord[] = [];
      const objectiveId = this.objective?.correctChoiceId;
      const allWords = collectRoundWords(settings.round);
      if (objectiveId) {
        const objectiveWord = allWords.find((word) => word.contentId === objectiveId);
        if (objectiveWord) pending.push(objectiveWord);
      }
      for (const word of this.wordPool) {
        if (!pending.some((item) => item.contentId === word.contentId)) {
          pending.push(word);
        }
      }

      const wave = createWave(pending, this.random, WAVE_ROWS);
      this.board = wave.board;
      const placed = new Set(wave.placedContentIds);
      this.wordPool = this.wordPool.filter((word) => !placed.has(word.contentId));
      // Anything the wave could not fit stays owed to the learner.
      for (const contentId of wave.displacedContentIds) {
        this.returnWordToPool(contentId);
      }

      // Top the wave up so it opens with a full complement of words.
      this.reassignPooledWords();
      this.replenishWords();
      this.rebuildAllBubbleVisuals();
      // A fresh wave restarts both pressure cycles.
      this.resetPressureCycles();

      this.refillQueue();
      this.refillQueue();
      this.refreshObjective();

      const delay = this.reducedMotion ? 200 : 520;
      this.time.delayedCall(delay, () => {
        this.transitioning = false;
        if (this.gameOver || this.roundComplete) return;
        this.inputLocked = false;
        this.shotActive = false;
        this.drawAimGuide();
        this.refreshShooterHud();
        this.emitRuntimeState();
      });
    }

    /**
     * Adds connected rows until the board is playable again and the active
     * objective is present. This is the only way missing content is restored —
     * a word is never handed to the shooter as a projectile.
     */
    private topUpDensity() {
      this.transitioning = true;
      this.inputLocked = true;

      let guard = 0;
      while (guard++ < TARGET_PLAYABLE_ROWS + 2) {
        const objectiveOnBoard = getWordBubbles(this.board).some(
          (bubble) => bubble.contentId === this.objective?.correctChoiceId,
        );
        const enoughRows = countOccupiedRows(this.board) >= TARGET_PLAYABLE_ROWS;
        if (objectiveOnBoard && enoughRows) break;

        // The active objective leads the seeding so it returns to the grid.
        const pending: RoundWord[] = [];
        const objectiveId = this.objective?.correctChoiceId;
        if (objectiveId && !objectiveOnBoard) {
          const word = collectRoundWords(settings.round).find(
            (item) => item.contentId === objectiveId,
          );
          if (word) pending.push(word);
        }
        for (const word of this.wordPool) {
          if (!pending.some((item) => item.contentId === word.contentId)) {
            pending.push(word);
          }
        }

        const result = insertCeilingRow(this.board, this.random, pending.slice(0, 1));
        this.board = result.board;
        const placed = new Set(result.placedContentIds);
        this.wordPool = this.wordPool.filter((word) => !placed.has(word.contentId));
        for (const contentId of result.displacedContentIds) {
          this.returnWordToPool(contentId);
        }
      }

      this.reassignPooledWords();
      this.rebuildAllBubbleVisuals();
      this.resetPressureCycles();
      this.refillQueue();
      this.refreshObjective();
      this.showFeedbackRight("NEW ROW!", 0xff8aaa, 18, FEEDBACK_MS.newRow, SLOT_Y.newRow);

      const delay = this.reducedMotion ? 200 : 480;
      this.time.delayedCall(delay, () => {
        this.transitioning = false;
        if (this.gameOver || this.roundComplete) return;
        if (detectDefeat(this.board)) {
          this.triggerDefeat();
          return;
        }
        this.inputLocked = false;
        this.shotActive = false;
        this.drawAimGuide();
        this.refreshShooterHud();
        this.emitRuntimeState();
      });
    }

    /** Pressure: a connected row enters at the ceiling and everything descends. */
    private pushCeilingRow() {
      const pending = this.wordPool.slice(0, Math.max(0, TARGET_WORD_COUNT - getWordBubbles(this.board).length));
      const result = insertCeilingRow(this.board, this.random, pending);
      this.board = result.board;
      if (result.placedContentIds.length > 0) {
        const placed = new Set(result.placedContentIds);
        this.wordPool = this.wordPool.filter((word) => !placed.has(word.contentId));
      }
      // A word pushed off the grid edge must stay available for a later row.
      for (const contentId of result.displacedContentIds) {
        const roundWord = collectRoundWords(settings.round).find(
          (item) => item.contentId === contentId,
        );
        if (roundWord && !this.wordPool.some((w) => w.contentId === contentId)) {
          this.wordPool.push(roundWord);
        }
      }
      this.showFeedbackRight("NEW ROW!", 0xff8aaa, 18, FEEDBACK_MS.newRow, SLOT_Y.newRow);
      this.animateRowDescent();
    }

    /**
     * Slides the existing bubbles down by one row before syncing the visuals to
     * the model, so the board visibly descends instead of teleporting. Input
     * stays locked for the duration, and the final rebuild is authoritative.
     */
    private animateRowDescent() {
      const rowHeight = this.radius * Math.sqrt(3);
      const duration = this.reducedMotion
        ? NEW_ROW_TWEEN_REDUCED_MS
        : NEW_ROW_TWEEN_MS;

      const existing = [...this.bubbleVisuals.values()];
      if (existing.length === 0) {
        this.rebuildAllBubbleVisuals();
        return;
      }

      this.transitioning = true;
      this.inputLocked = true;

      // Start the old containers one row higher, then slide them into place.
      for (const visual of existing) {
        visual.container.y -= rowHeight;
      }

      this.tweens.add({
        targets: existing.map((visual) => visual.container),
        y: `+=${rowHeight}`,
        duration,
        ease: "Quad.out",
        onComplete: () => {
          this.transitioning = false;
          // The model is the source of truth: resync once the slide finishes.
          this.rebuildAllBubbleVisuals();
          if (!this.gameOver && !this.roundComplete) {
            this.inputLocked = false;
            this.drawAimGuide();
            this.refreshShooterHud();
          }
        },
      });
    }

    /**
     * Returns a still-unstudied word to the pool. Words already resolved are
     * ignored, so a bonus can never resurrect finished content.
     */
    private returnWordToPool(contentId: string) {
      const challenge = findChallengeForContent(settings.round, contentId);
      if (challenge && this.resolvedChallengeIds.has(challenge.id)) return;
      if (this.wordPool.some((word) => word.contentId === contentId)) return;

      const roundWord = collectRoundWords(settings.round).find(
        (item) => item.contentId === contentId,
      );
      if (roundWord) this.wordPool.push(roundWord);
    }

    /**
     * Re-hosts pooled words onto ordinary bubbles that are still connected, so
     * a word knocked down by a chain reaction reappears instead of vanishing.
     */
    private reassignPooledWords() {
      if (this.wordPool.length === 0 || this.board.length === 0) return;

      let changed = false;
      for (const word of [...this.wordPool]) {
        if (getWordBubbles(this.board).length >= TARGET_WORD_COUNT) break;
        const result = reassignWordToConnectedBubble(this.board, word, this.random);
        if (!result.placed) continue;
        this.board = result.board;
        this.wordPool = this.wordPool.filter((w) => w.contentId !== word.contentId);
        changed = true;
      }

      if (changed) this.rebuildAllBubbleVisuals();
    }

    /**
     * Tops the board back up to the target word count by converting ordinary
     * connected bubbles, so the next objective is always reachable instead of
     * waiting for a pressure row.
     */
    private replenishWords() {
      if (this.wordPool.length === 0) return;
      const result = replenishWordBubbles(this.board, this.wordPool, this.random);
      if (result.placedContentIds.length === 0) return;
      this.board = result.board;
      const placed = new Set(result.placedContentIds);
      this.wordPool = this.wordPool.filter((word) => !placed.has(word.contentId));
      this.rebuildAllBubbleVisuals();
    }

    /** No bubble — word or not — may remain static without a path to the ceiling. */
    private enforceConnectivity() {
      const floating = findDisconnectedBubbleIds(this.board);
      if (floating.length === 0) return;
      const gone = new Set(floating);
      // Leave the logical board first: the cluster is inert while it falls.
      this.board = this.board.filter((bubble) => !gone.has(bubble.id));
      this.syncHitboxes();
      // Words knocked loose here are still owed to the learner.
      for (const id of floating) {
        if (id.startsWith("word:")) {
          this.returnWordToPool(id.slice("word:".length));
        }
      }
      this.dropCluster(floating);
    }

    private completeRound() {
      if (this.roundComplete) return;
      this.roundComplete = true;
      this.inputLocked = true;
      this.pressureText?.destroy();
      this.pressureText = undefined;
      this.showFeedbackRight("LEVEL CLEAR!", 0x7de5ef, 24, 2000, SLOT_Y.gameOver);
      this.emitRuntimeState({ lastAnswerCorrect: true });
      // React finalises the round; the scene only reports that it is over.
      this.time.delayedCall(1200, () => this.emitRunEnded());
    }


    private showFeedback(
      correct: boolean,
      challenge: PreparedArcadeChallenge,
      x: number,
      y: number,
      removedCount: number,
      droppedCount: number,
    ) {
      if (correct) {
        const label = challenge.choices.find(
          (c) => c.id === challenge.correctChoiceId,
        )?.label ?? "";
        this.showFeedbackRight("CORRECT!", 0x7de5ef, 22, FEEDBACK_MS.correct, SLOT_Y.primary);
        this.showFeedbackRight(label.toUpperCase(), 0xffffff, 15, FEEDBACK_MS.correct, SLOT_Y.primary + 24);

        if (this.combo >= 2) {
          const comboSize = Math.min(26, 18 + this.combo * 2);
          let comboText = `COMBO x${this.combo}`;
          if (this.combo >= 5) comboText = "UNSTOPPABLE!";
          else if (this.combo >= 4) comboText = "AMAZING!";
          else if (this.combo >= 3) comboText = "ON FIRE!";
          this.showFeedbackRight(comboText, 0xf5b642, comboSize, FEEDBACK_MS.combo, SLOT_Y.combo);
          if (this.combo >= 2 && this.combo < 5) {
            this.showFeedbackRight(`COMBO x${this.combo}`, 0xf5b642, 13, FEEDBACK_MS.combo, SLOT_Y.combo + comboSize + 2);
          }
        }

        if (removedCount >= 4) {
          this.showFeedbackRight("CHAIN REACTION!", 0xff8aaa, 16, FEEDBACK_MS.chain, SLOT_Y.score);
        }

        if (droppedCount >= 2) {
          const dropOffset = removedCount >= 4 ? SLOT_Y.score + 24 : SLOT_Y.score;
          this.showFeedbackRight("BIG DROP!", 0xc4aeff, 16, FEEDBACK_MS.bigDrop, dropOffset);
        }

        const points = 100 + Math.min(4, this.combo - 1) * 25;
        this.showFloatingText(x, y - 10, `+${points}`, 0xffe28a, 20, FEEDBACK_MS.score);
      } else {
        const correctLabel = challenge.choices.find(
          (c) => c.id === challenge.correctChoiceId,
        )?.label ?? "";
        this.showFeedbackRight("WRONG!", 0xff8aaa, 22, FEEDBACK_MS.wrong, SLOT_Y.primary);
        this.showFeedbackRight(correctLabel.toUpperCase(), 0xffa0b8, 13, FEEDBACK_MS.wrong, SLOT_Y.primary + 24);
      }
    }

    private showFloatingText(x: number, y: number, text: string, color: number, size: number, holdMs: number) {
      const colorStr = `#${color.toString(16).padStart(6, "0")}`;
      const t = this.add.text(x, y, text, {
        align: "center",
        color: colorStr,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: `${size}px`,
        fontStyle: "bold",
        resolution: settings.renderResolution,
        stroke: "#1a0a2e",
        strokeThickness: Math.max(2, size * 0.15),
      }).setOrigin(0.5).setDepth(200).setAlpha(0);

      this.feedbackTexts.push(t);

      if (this.reducedMotion) {
        t.setAlpha(1);
        this.time.delayedCall(holdMs, () => {
          t.destroy();
          const idx = this.feedbackTexts.indexOf(t);
          if (idx >= 0) this.feedbackTexts.splice(idx, 1);
        });
        return;
      }

      const fadeInDuration = 180;
      const fadeOutDuration = 350;
      const actualHold = Math.max(200, holdMs - fadeInDuration - fadeOutDuration);

      this.tweens.add({
        targets: t,
        alpha: 1,
        y: y - 14,
        scale: { from: 0.5, to: 1.1 },
        duration: fadeInDuration,
        ease: "Back.out",
        onComplete: () => {
          this.tweens.add({
            targets: t,
            scale: 1,
            duration: 80,
            onComplete: () => {
              this.tweens.add({
                targets: t,
                alpha: 0,
                y: y - 36,
                delay: actualHold,
                duration: fadeOutDuration,
                ease: "Quad.in",
                onComplete: () => {
                  t.destroy();
                  const idx = this.feedbackTexts.indexOf(t);
                  if (idx >= 0) this.feedbackTexts.splice(idx, 1);
                },
              });
            },
          });
        },
      });
    }

    /**
     * Renders one message in the right-hand column. `offsetY` is a slot from
     * SLOT_Y, so a lower-priority message can never land on top of GAME OVER,
     * DANGER or NEW ROW.
     */
    private showFeedbackRight(
      text: string,
      color: number,
      size: number,
      holdMs: number,
      offsetY: number = SLOT_Y.primary,
    ) {
      const w = this.logicalWidth();
      const gridWidth = GRID_COLS * this.radius * 2;
      const gridMargin = (w - gridWidth) / 2;
      const rightX = Math.min(w - 12, w - gridMargin * 0.35);
      const baseY = this.gridTop + this.radius * Math.sqrt(3) * 2 + 90;
      const y = baseY + offsetY;

      const colorStr = `#${color.toString(16).padStart(6, "0")}`;
      const t = this.add.text(rightX, y, text, {
        align: "right",
        color: colorStr,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: `${size}px`,
        fontStyle: "bold",
        resolution: settings.renderResolution,
        stroke: "#1a0a2e",
        strokeThickness: Math.max(2, size * 0.15),
      }).setOrigin(1, 0.5).setDepth(210).setAlpha(0);

      this.feedbackTexts.push(t);

      if (this.reducedMotion) {
        t.setAlpha(1);
        this.time.delayedCall(holdMs, () => {
          t.destroy();
          const idx = this.feedbackTexts.indexOf(t);
          if (idx >= 0) this.feedbackTexts.splice(idx, 1);
        });
        return;
      }

      const fadeInDuration = 200;
      const fadeOutDuration = 400;
      const actualHold = Math.max(300, holdMs - fadeInDuration - fadeOutDuration);

      t.setX(rightX + 30);
      this.tweens.add({
        targets: t,
        alpha: 1,
        x: rightX,
        scale: { from: 0.7, to: 1 },
        duration: fadeInDuration,
        ease: "Back.out",
        onComplete: () => {
          this.tweens.add({
            targets: t,
            alpha: 0,
            x: rightX - 8,
            delay: actualHold,
            duration: fadeOutDuration,
            ease: "Quad.in",
            onComplete: () => {
              t.destroy();
              const idx = this.feedbackTexts.indexOf(t);
              if (idx >= 0) this.feedbackTexts.splice(idx, 1);
            },
          });
        },
      });
    }

    private cleanupProjectile() {
      this.projContainer?.destroy(true);
      this.projContainer = undefined;
      this.shotInFlight = false;
      for (const dot of this.trailDots) dot.destroy();
      this.trailDots.length = 0;
    }

    /* ── animations ── */

    private animateResolution(
      removedIds: string[],
      disconnectedIds: string[],
      impactX: number,
      impactY: number,
    ) {
      for (let i = 0; i < removedIds.length; i++) {
        const visual = this.bubbleVisuals.get(removedIds[i]);
        if (!visual) continue;

        if (this.reducedMotion) {
          visual.container.setAlpha(0);
          this.time.delayedCall(100, () => visual.container.destroy(true));
          continue;
        }

        const delay = i * 50;
        this.tweens.add({
          targets: visual.container,
          scale: { from: 1, to: 0.85 },
          duration: 80,
          delay,
          ease: "Quad.in",
          onComplete: () => {
            this.tweens.add({
              targets: visual.container,
              scale: 1.5,
              alpha: 0.9,
              duration: 100,
              ease: "Quad.out",
              onComplete: () => {
                this.spawnBurstParticles(
                  visual.container.x,
                  visual.container.y,
                  visual.mainCircle.fillColor,
                  this.combo,
                );
                this.spawnFragments(visual.container.x, visual.container.y, visual.mainCircle.fillColor);
                this.tweens.add({
                  targets: visual.container,
                  scale: 0,
                  alpha: 0,
                  duration: 80,
                  ease: "Quad.in",
                  onComplete: () => visual.container.destroy(true),
                });
              },
            });
          },
        });
      }

      this.dropCluster(disconnectedIds);

      if (removedIds.length > 0 && !this.reducedMotion) {
        this.spawnImpactFlash(impactX, impactY);
        if (removedIds.length >= 4) {
          this.time.delayedCall(100, () => this.spawnImpactFlash(impactX, impactY));
        }
      }

      this.rebuildHitboxes(removedIds, disconnectedIds);
    }

    /**
     * Option B drop: the cluster breaks away, falls briefly as one body, then
     * separates so every bubble plummets off-screen on its own arc. The bubbles
     * already left the logical board, so these visuals are inert — they take no
     * further collisions and are destroyed only once they clear the arena.
     */
    private dropCluster(disconnectedIds: string[]) {
      if (disconnectedIds.length === 0) return;

      const visuals = disconnectedIds
        .map((id) => this.bubbleVisuals.get(id))
        .filter((visual): visual is BubbleVisual => Boolean(visual));
      if (visuals.length === 0) return;

      // Detach immediately so nothing can look them up as live board bubbles.
      for (const id of disconnectedIds) this.bubbleVisuals.delete(id);
      const containers = visuals.map((visual) => visual.container);
      for (const container of containers) container.setDepth(8);

      if (this.reducedMotion) {
        this.tweens.add({
          targets: containers,
          alpha: 0,
          y: `+=${this.radius * 2}`,
          duration: CLUSTER_DROP.reducedMs,
          onComplete: () => {
            for (const container of containers) container.destroy(true);
          },
        });
        return;
      }

      const bottom = this.logicalHeight() + this.radius * 4;
      const driftX = (Math.random() - 0.5) * 2 * CLUSTER_DROP.breakDriftX;

      // Stage 1 — the cluster lurches free of the ceiling.
      this.tweens.add({
        targets: containers,
        x: `+=${driftX}`,
        y: `+=${CLUSTER_DROP.breakDriftY}`,
        duration: CLUSTER_DROP.breakMs,
        ease: "Quad.out",
        onComplete: () => {
          // Stage 2 — it keeps falling as a single body for a beat.
          this.tweens.add({
            targets: containers,
            y: `+=${this.radius * 1.5}`,
            duration: CLUSTER_DROP.blockMs,
            ease: "Quad.in",
            onComplete: () => this.separateCluster(containers, bottom),
          });
        },
      });
    }

    /** Stage 3 — each bubble picks up its own spin, spread and fall time. */
    private separateCluster(
      containers: Phaser.GameObjects.Container[],
      bottom: number,
    ) {
      for (const container of containers) {
        const distance = Math.max(0, bottom - container.y);
        const duration = getClusterFallDurationMs(distance);
        const spread = (Math.random() - 0.5) * CLUSTER_DROP.spreadX;

        this.tweens.add({
          targets: container,
          y: bottom,
          x: container.x + spread,
          rotation: (Math.random() - 0.5) * 2 * CLUSTER_DROP.spin,
          duration,
          // Accelerating ease stands in for gravity after the initial impulse.
          ease: "Quad.in",
          onComplete: () => container.destroy(true),
        });
      }
    }

    private rebuildHitboxes(removedIds: string[], disconnectedIds: string[]) {
      const gone = new Set([...removedIds, ...disconnectedIds]);
      this.board = this.board.filter((b) => !gone.has(b.id));
      this.syncHitboxes();
    }

    /**
     * Rebuilds the collision set straight from the model, so every live bubble
     * — ordinary or wordBonus — is collidable at its true drawn centre, and no
     * removed bubble can leave a phantom hitbox behind. A word bubble is
     * physically identical to any other; only its metadata differs.
     */
    private syncHitboxes() {
      this.bubbleHitboxes = this.board.map((bubble) => {
        const pos = this.cellScreenPosition(bubble.row, bubble.column);
        return { id: bubble.id, x: pos.x, y: pos.y };
      });
    }

    private spawnBurstParticles(x: number, y: number, color: number, comboLevel: number) {
      const baseCount = 8;
      const count = Math.min(16, baseCount + Math.min(4, comboLevel) * 2);
      const spread = this.radius * (2 + Math.min(3, comboLevel) * 0.5);

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist = spread * (0.6 + Math.random() * 0.4);
        const size = this.radius * (0.15 + Math.random() * 0.15);
        const particle = this.add.circle(x, y, size, color, 0.9);
        particle.setDepth(15);

        this.tweens.add({
          targets: particle,
          x: x + Math.cos(angle) * dist,
          y: y + Math.sin(angle) * dist,
          alpha: 0,
          scale: { from: 1.2, to: 0.2 },
          duration: 500 + Math.random() * 400,
          ease: "Quad.out",
          onComplete: () => particle.destroy(),
        });
      }
    }

    private spawnFragments(x: number, y: number, color: number) {
      const count = 4;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = this.radius * (1.5 + Math.random() * 2);
        const w = this.radius * (0.3 + Math.random() * 0.3);
        const h = this.radius * (0.15 + Math.random() * 0.2);

        const frag = this.add.rectangle(x, y, w, h, color, 0.8);
        frag.setDepth(14);
        frag.setRotation(Math.random() * Math.PI);

        this.tweens.add({
          targets: frag,
          x: x + Math.cos(angle) * dist,
          y: y + Math.sin(angle) * dist + this.radius * 2,
          rotation: frag.rotation + (Math.random() - 0.5) * 6,
          alpha: 0,
          scale: 0.3,
          duration: 600 + Math.random() * 300,
          ease: "Quad.out",
          onComplete: () => frag.destroy(),
        });
      }
    }

    private spawnImpactFlash(x: number, y: number) {
      const flash = this.add.circle(x, y, this.radius * 0.6, 0xffffff, 0.8);
      flash.setDepth(20);
      this.tweens.add({
        targets: flash,
        scale: 3.5,
        alpha: 0,
        duration: 250,
        ease: "Quad.out",
        onComplete: () => flash.destroy(),
      });
    }

    /* ── defeat ── */

    /**
     * Defeat blocks further shots and ends the round once. It never fabricates
     * wrong answers for challenges the learner never reached: outcomes already
     * emitted are preserved, and unreached words simply stay unanswered.
     */
    private triggerDefeat() {
      if (this.defeatTriggered) return;
      this.defeatTriggered = true;
      this.gameOver = true;
      this.inputLocked = true;
      this.shotInFlight = false;
      this.transitioning = false;
      this.cleanupProjectile();

      this.showFeedbackRight(
        "GAME OVER",
        0xff4444,
        28,
        FEEDBACK_MS.gameOver,
        SLOT_Y.gameOver,
      );
      this.emitRuntimeState();

      // React owns navigation and persistence: the scene only reports, once,
      // that the run is over after GAME OVER has been readable.
      this.time.delayedCall(FEEDBACK_MS.gameOver, () => this.emitRunEnded());
    }

    /** Emitted exactly once per scene, whether the run ended in defeat or a clear. */
    private emitRunEnded() {
      if (this.runEndEmitted) return;
      this.runEndEmitted = true;
      this.emitRuntimeState({ runEnded: true });
    }

    /* ── grid helpers ── */

    private findNearestBubbleHitbox(x: number, y: number): BubbleHitbox | undefined {
      let best: { hb: BubbleHitbox; dist: number } | undefined;
      for (const hb of this.bubbleHitboxes) {
        const dist = Math.sqrt((hb.x - x) ** 2 + (hb.y - y) ** 2);
        if (dist < this.radius * 4 && (!best || dist < best.dist)) {
          best = { hb, dist };
        }
      }
      return best?.hb;
    }

    private cellScreenPosition(row: number, column: number) {
      const center = getHexCellCenter(row, column);
      return {
        x: this.gridLeft + center.x * this.radius,
        y: this.gridTop + center.y * this.radius,
      };
    }

    private normalizedGridPoint(x: number, y: number) {
      return {
        x: (x - this.gridLeft) / this.radius,
        y: (y - this.gridTop) / this.radius,
      };
    }

    private logicalWidth() {
      return this.scale.width / settings.renderResolution;
    }

    private logicalHeight() {
      return this.scale.height / settings.renderResolution;
    }

    /* ── cleanup ── */

    private correctTargetScreenPosition(): { x: number; y: number } | null {
      const challenge = this.objective;
      if (!challenge) return null;
      const target = this.board.find(
        (b) => b.role === "wordBonus" && b.contentId === challenge.correctChoiceId,
      );
      if (!target) return null;
      return this.cellScreenPosition(target.row, target.column);
    }

    private emitRuntimeState(
      detail: {
        disconnectedDropped?: number;
        impactId?: string;
        lastAnswerCorrect?: boolean;
        removedGroupSize?: number;
        resizeDeferred?: boolean;
        /** Only ever set by emitRunEnded(), exactly once per scene. */
        runEnded?: boolean;
        shotSnapColumn?: number;
        shotSnapRow?: number;
      } = {},
    ) {
      const targetPos = this.correctTargetScreenPosition();
      events.onRuntimeState({
        boardBubbleCount: this.board.length,
        challengeIndex: this.resolvedChallengeIds.size,
        correctTargetX: targetPos?.x,
        correctTargetY: targetPos?.y,
        renderResolution: settings.renderResolution,
        reducedMotion: this.reducedMotion,
        shotInFlight: this.shotInFlight || this.resizeDeferredDuringFlight,
        tweenCount: this.tweens.getTweens().length,
        wallBounceCount: this.wallBounceCount,
        ...detail,
      });
    }

    private teardown() {
      window.removeEventListener("resize", this.boundWindowResize);
      this.scale.off(PhaserRuntime.Scale.Events.RESIZE, this.handleResize, this);
      this.game.events.off("arcade-reduced-motion", this.setReducedMotion, this);
      this.input.off("pointermove", this.handlePointerMove, this);
      this.input.off("pointerup", this.handlePointerUp, this);
      this.keyboardKeys?.left.off("down", this.aimLeft, this);
      this.keyboardKeys?.right.off("down", this.aimRight, this);
      this.keyboardKeys?.shoot.off("down", this.launchProjectile, this);
      this.keyboardKeys?.shootAlt.off("down", this.launchProjectile, this);
      this.time.removeAllEvents();
      this.tweens.killAll();
      for (const dot of this.trailDots) dot.destroy();
      this.trailDots.length = 0;
      for (const t of this.feedbackTexts) t.destroy();
      this.feedbackTexts.length = 0;
      this.pressureText?.destroy();
      this.pressureText = undefined;
      this.previewLabel?.destroy();
      this.previewLabel = undefined;
    }
  };
};
