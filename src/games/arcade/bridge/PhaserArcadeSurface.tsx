import { useEffect, useRef, useState } from "react";
import {
  ARCADE_RUNTIME_DESTROYED_EVENT,
  type ArcadeAnswer,
  type ArcadeSceneRuntimeState,
  type PreparedArcadeRound,
} from "./arcadeBridge";

interface PhaserArcadeSurfaceProps {
  onAnswer: (answer: ArcadeAnswer) => boolean;
  paused: boolean;
  reducedMotion: boolean;
  round: PreparedArcadeRound;
  soundEnabled: boolean;
}

type PhaserGame = import("phaser").Game;

interface PhaserGameInternals extends PhaserGame {
  pendingDestroy: boolean;
  runDestroy: () => void;
}

interface NativeVisibilityBinding {
  listener: EventListenerOrEventListenerObject;
  options?: AddEventListenerOptions | boolean;
  type: string;
}

interface RuntimeDiagnostics extends ArcadeSceneRuntimeState {
  paused: boolean;
  soundMuted: boolean;
}

function setGamePaused(
  game: PhaserGame,
  paused: boolean,
  hostPausedSceneKeys: Set<string>,
) {
  if (paused) {
    game.scene.getScenes(false).forEach((scene) => {
      const key = scene.scene.key;
      if (!hostPausedSceneKeys.has(key) && game.scene.isActive(key)) {
        game.scene.pause(key);
        hostPausedSceneKeys.add(key);
      }
    });
    return;
  }

  hostPausedSceneKeys.forEach((key) => {
    if (game.scene.isPaused(key)) game.scene.resume(key);
    hostPausedSceneKeys.delete(key);
  });
}

function setGameMuted(game: PhaserGame, muted: boolean) {
  game.sound.mute = muted;
  if (game.sound.mute === muted) return;

  const webAudioSound = game.sound as typeof game.sound & {
    context?: AudioContext;
    masterMuteNode?: GainNode;
  };
  const gain = webAudioSound.masterMuteNode?.gain;
  const context = webAudioSound.context;
  if (!gain || !context) return;

  gain.cancelScheduledValues(0);
  gain.value = muted ? 0 : 1;
  gain.setValueAtTime(muted ? 0 : 1, context.currentTime);
}

function destroyGame(game: PhaserGame) {
  const internals = game as PhaserGameInternals;
  game.destroy(true);
  if (internals.pendingDestroy) internals.runDestroy();
}

export function PhaserArcadeSurface({
  onAnswer,
  paused,
  reducedMotion,
  round,
  soundEnabled,
}: PhaserArcadeSurfaceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<PhaserGame | null>(null);
  const hostPausedSceneKeysRef = useRef(new Set<string>());
  const onAnswerRef = useRef(onAnswer);
  const pausedRef = useRef(paused);
  const reducedMotionRef = useRef(reducedMotion);
  const soundEnabledRef = useRef(soundEnabled);
  const [ready, setReady] = useState(false);
  const [runtimeDiagnostics, setRuntimeDiagnostics] = useState<RuntimeDiagnostics>({
    paused: false,
    renderResolution: 1,
    reducedMotion,
    soundMuted: !soundEnabled,
    tweenCount: 0,
  });
  const [version, setVersion] = useState("");

  onAnswerRef.current = onAnswer;
  pausedRef.current = paused;
  reducedMotionRef.current = reducedMotion;
  soundEnabledRef.current = soundEnabled;

  function syncEngineDiagnostics(game: PhaserGame) {
    setRuntimeDiagnostics((current) => ({
      ...current,
      paused: game.scene.getScenes(false).some(
        (scene) => game.scene.isPaused(scene.scene.key),
      ),
      soundMuted: game.sound.mute,
    }));
  }

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;
    const hostPausedSceneKeys = hostPausedSceneKeysRef.current;
    const phaserVisibilityBindings: NativeVisibilityBinding[] = [];
    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;
    let restorePhaserNativeHandlers: (() => void) | null = null;

    async function mountGame(parentElement: HTMLDivElement) {
      const [{ default: Phaser }, { createTechnicalScene }] = await Promise.all([
        import("phaser"),
        import("./technicalScene"),
      ]);
      if (disposed || !parentElement.isConnected) return;

      const bounds = parentElement.getBoundingClientRect();
      const renderResolution = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
      const originalAddEventListener = document.addEventListener;
      const previousOnBlur = window.onblur;
      const previousOnFocus = window.onfocus;
      let nativeHandlersRestored = false;
      restorePhaserNativeHandlers = () => {
        if (nativeHandlersRestored) return;
        nativeHandlersRestored = true;
        document.addEventListener = originalAddEventListener;
        window.onblur = previousOnBlur;
        window.onfocus = previousOnFocus;
      };
      document.addEventListener = ((
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: AddEventListenerOptions | boolean,
      ) => {
        if (type.endsWith("visibilitychange")) {
          phaserVisibilityBindings.push({ listener, options, type });
        }
        originalAddEventListener.call(document, type, listener, options);
      }) as typeof document.addEventListener;

      const Scene = createTechnicalScene(
        Phaser,
        { renderResolution, reducedMotion: reducedMotionRef.current, round },
        {
          onAnswer: (answer) => onAnswerRef.current(answer),
          onReady: () => {
            queueMicrotask(() => {
              restorePhaserNativeHandlers?.();
              if (disposed || gameRef.current !== game) return;
              setGamePaused(
                game,
                pausedRef.current || document.hidden,
                hostPausedSceneKeys,
              );
              syncEngineDiagnostics(game);
              setReady(true);
            });
          },
          onRuntimeState: (state) => {
            if (!disposed) {
              setRuntimeDiagnostics((current) => ({ ...current, ...state }));
            }
          },
        },
      );

      let game: PhaserGame;
      try {
        game = new Phaser.Game({
          type: Phaser.AUTO,
          parent: parentElement,
          width: Math.max(1, Math.round(bounds.width * renderResolution)),
          height: Math.max(1, Math.round(bounds.height * renderResolution)),
          autoFocus: false,
          backgroundColor: "#101a42",
          render: {
            antialias: true,
            pixelArt: false,
            transparent: false,
          },
          scale: {
            mode: Phaser.Scale.NONE,
          },
          scene: [Scene],
        });
      } catch (error) {
        restorePhaserNativeHandlers();
        throw error;
      }
      if (disposed) {
        destroyGame(game);
        return;
      }

      gameRef.current = game;
      setGameMuted(game, !soundEnabledRef.current);
      setGamePaused(
        game,
        pausedRef.current || document.hidden,
        hostPausedSceneKeys,
      );
      syncEngineDiagnostics(game);
      setVersion(Phaser.VERSION);
      resizeObserver = new ResizeObserver(([entry]) => {
        const width = Math.max(1, Math.round(entry.contentRect.width));
        const height = Math.max(1, Math.round(entry.contentRect.height));
        game.scale.resize(width * renderResolution, height * renderResolution);
      });
      resizeObserver.observe(parentElement);
    }

    function handleVisibilityChange() {
      const game = gameRef.current;
      if (game) {
        setGamePaused(
          game,
          pausedRef.current || document.hidden,
          hostPausedSceneKeys,
        );
        syncEngineDiagnostics(game);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    void mountGame(parent);
    return () => {
      disposed = true;
      restorePhaserNativeHandlers?.();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      const removedNativeVisibilityListeners = phaserVisibilityBindings.length;
      phaserVisibilityBindings.forEach(({ listener, options, type }) => {
        document.removeEventListener(type, listener, options);
      });
      resizeObserver?.disconnect();
      setReady(false);
      const game = gameRef.current;
      gameRef.current = null;
      if (game) {
        const canvas = game.canvas;
        game.events.once("destroy", () => {
          window.dispatchEvent(new CustomEvent(ARCADE_RUNTIME_DESTROYED_EVENT, {
            detail: { removedNativeVisibilityListeners },
          }));
        });
        destroyGame(game);
        canvas.remove();
      }
      hostPausedSceneKeys.clear();
      parent.replaceChildren();
    };
  }, [round]);

  useEffect(() => {
    const game = gameRef.current;
    if (game) {
      setGamePaused(
        game,
        paused || document.hidden,
        hostPausedSceneKeysRef.current,
      );
      syncEngineDiagnostics(game);
    }
  }, [paused]);

  useEffect(() => {
    const game = gameRef.current;
    if (game) {
      setGameMuted(game, !soundEnabled);
      syncEngineDiagnostics(game);
    }
  }, [soundEnabled]);

  useEffect(() => {
    gameRef.current?.events.emit("arcade-reduced-motion", reducedMotion);
  }, [reducedMotion]);

  return (
    <div
      aria-label="Cena técnica do motor arcade. As mesmas respostas estão descritas na região de status."
      className="phaser-arcade-surface"
      data-arcade-ready={ready}
      data-phaser-version={version}
      data-runtime-paused={runtimeDiagnostics.paused}
      data-runtime-render-resolution={runtimeDiagnostics.renderResolution}
      data-runtime-reduced-motion={runtimeDiagnostics.reducedMotion}
      data-runtime-sound-muted={runtimeDiagnostics.soundMuted}
      data-runtime-tween-count={runtimeDiagnostics.tweenCount}
      ref={containerRef}
      role="img"
    />
  );
}
