import { useEffect, useRef, useState } from "react";
import AppDialog from "../components/AppDialog";
import AppIcon from "../components/AppIcon";
import { AppShell, PrimaryButton } from "../components/AppShell";
import Toast from "../components/Toast";
import {
  getAvatarEmoji,
  getLevelSummary,
  mergeRemoteUserState,
  PRESET_AVATARS,
  resetAllLocalData,
  updateLocalProfile,
  type AvatarId,
} from "../services/progress/engagement";
import { useEngagement } from "../services/progress/useEngagement";
import { useProgressSummary } from "../services/progress/useProgressSummary";
import {
  isSoundEnabled,
  playSound,
  setSoundEnabled,
} from "../services/audio/sound";
import {
  connectGoogleAccount,
  signOutToAnonymous,
  subscribeAuthStatus,
  type AuthStatus,
} from "../services/firebase/auth";
import {
  enqueueLeaderboardSync,
  pullRemoteUserState,
} from "../services/firebase/leaderboardSync";

const AVATAR_TONES = ["cyan", "wine", "violet", "green", "orange"];

export default function ProfilePage() {
  const { snapshot, reload } = useEngagement();
  const { summary } = useProgressSummary();
  const [sound, setSound] = useState(isSoundEnabled);
  const [animations, setAnimations] = useState(
    () => localStorage.getItem("ingles-em-jogo-animations") !== "false",
  );
  const [editing, setEditing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [name, setName] = useState("Jogador");
  const [tone, setTone] = useState("cyan");
  const [avatarId, setAvatarId] = useState<AvatarId>("fox");
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    configured: false,
    ready: false,
    uid: null,
    isAnonymous: false,
    isGoogleLinked: false,
  });
  const [googleBusy, setGoogleBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const level = getLevelSummary(snapshot?.state.totalXp ?? 0);
  const profile = snapshot?.profile ?? {
    displayName: "Jogador",
    avatarInitial: "J",
    avatarId: "fox" as AvatarId,
    avatarTone: "cyan",
  };

  useEffect(() => {
    setName(profile.displayName);
    setTone(profile.avatarTone);
    setAvatarId(profile.avatarId);
  }, [profile.avatarId, profile.avatarTone, profile.displayName]);

  useEffect(() => subscribeAuthStatus(setAuthStatus), []);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current !== null) {
        clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = null;
      }
    };
  }, []);

  function showNotice(message: string) {
    if (noticeTimerRef.current !== null) {
      clearTimeout(noticeTimerRef.current);
    }
    setNotice(message);
    noticeTimerRef.current = setTimeout(() => {
      noticeTimerRef.current = null;
      setNotice("");
    }, 3200);
  }

  function toggleSound() {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
    if (next) playSound("select");
  }

  function toggleAnimations() {
    const next = !animations;
    setAnimations(next);
    localStorage.setItem("ingles-em-jogo-animations", String(next));
    document.documentElement.dataset.animations = next ? "on" : "off";
  }

  async function saveProfile() {
    await updateLocalProfile(name, tone, avatarId);
    await reload();
    setEditing(false);
    showNotice("Perfil atualizado.");
  }

  async function handleGoogleConnect() {
    if (googleBusy) return;
    setGoogleBusy(true);
    try {
      const result = await connectGoogleAccount();
      if (result.status === "signed_in_existing" && result.uid) {
        const remote = await pullRemoteUserState(result.uid);
        if (remote) {
          const merged = await mergeRemoteUserState(remote);
          await enqueueLeaderboardSync(merged);
        } else if (snapshot) {
          await enqueueLeaderboardSync(snapshot);
        }
        await reload();
      } else if (result.status === "linked" && snapshot) {
        await enqueueLeaderboardSync(snapshot);
      }
      showNotice(result.message);
    } finally {
      setGoogleBusy(false);
    }
  }

  async function handleGoogleSignOut() {
    if (googleBusy) return;
    setGoogleBusy(true);
    try {
      await signOutToAnonymous();
      showNotice("Sessão Google desconectada. Você continua no modo anônimo.");
    } finally {
      setGoogleBusy(false);
    }
  }

  async function resetData() {
    await resetAllLocalData();
    setConfirmReset(false);
    await reload();
  }

  return (
    <AppShell activeNav="profile" className="standard-page profile-page">
      <div className="profile-layout">
        <section className="profile-main">
          <div
            aria-hidden="true"
            className={`profile-big-avatar avatar-${profile.avatarTone}`}
          >
            {getAvatarEmoji(profile.avatarId)}
          </div>
          <h1>{profile.displayName}</h1>
          <p>
            {level.title} · Nível {level.level}
            <br />
            {authStatus.isGoogleLinked
              ? "Conta Google conectada · progresso sincronizado."
              : "Seu progresso funciona offline e sincroniza na liga semanal."}
          </p>
          <div className="level-progress" aria-label={`${level.progress}% do nível atual`}>
            <span style={{ width: `${level.progress}%` }} />
          </div>
          <div className="profile-stats">
            <div><strong>{snapshot?.state.totalXp ?? 0}</strong><span>XP</span></div>
            <div><strong>{snapshot?.state.currentStreak ?? 0}</strong><span>dias</span></div>
            <div><strong>{summary?.completedSessions ?? 0}</strong><span>sessões</span></div>
          </div>
          <button className="profile-edit-button" onClick={() => setEditing(true)}>
            Editar perfil e avatar
          </button>
        </section>

        <section className="settings-card">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Preferências</div>
              <h2>Personalize sua experiência</h2>
            </div>
          </div>

          <div className="google-account-card">
            <div className="google-account-copy">
              <strong>
                {authStatus.isGoogleLinked
                  ? "Conta Google conectada"
                  : "Salvar progresso com Google (opcional)"}
              </strong>
              <small>
                {!authStatus.configured
                  ? "Sincronização em nuvem desativada neste ambiente local."
                  : authStatus.isGoogleLinked
                    ? "Seu apelido e avatar continuam privados — seu e-mail e foto do Google nunca aparecem no ranking."
                    : "O app funciona sem login. Vincule o Google só se quiser recuperar seu XP em outro celular ou computador."}
              </small>
            </div>
            {authStatus.configured && (
              authStatus.isGoogleLinked ? (
                <button
                  className="secondary-button"
                  disabled={googleBusy}
                  onClick={handleGoogleSignOut}
                  type="button"
                >
                  Desconectar Google
                </button>
              ) : (
                <button
                  className="primary-button"
                  disabled={googleBusy}
                  onClick={handleGoogleConnect}
                  type="button"
                >
                  {googleBusy ? "Conectando..." : "Entrar / Vincular com Google"}
                </button>
              )
            )}
          </div>

          <SettingToggle
            checked={sound}
            description="Feedback sonoro e leitura dos flashcards."
            icon={sound ? "volume" : "volume-off"}
            label="Sons e pronúncia"
            onClick={toggleSound}
          />
          <SettingToggle
            checked={animations}
            description="Movimentos, transições e celebrações."
            icon="sparkles"
            label="Animações"
            onClick={toggleAnimations}
          />
          <div className="setting-row static">
            <span className="setting-icon"><AppIcon name="chart" /></span>
            <span>
              <strong>Meta semanal</strong>
              <small>Praticar em 5 dias por semana.</small>
            </span>
            <b>5 dias</b>
          </div>
          <div className="setting-row static">
            <span className="setting-icon"><AppIcon name="settings" /></span>
            <span>
              <strong>Privacidade no ranking</strong>
              <small>Apenas seu apelido e avatar escolhido aparecem na liga semanal.</small>
            </span>
          </div>
          <button className="setting-row danger" onClick={() => setConfirmReset(true)}>
            <span className="setting-icon"><AppIcon name="refresh" /></span>
            <span>
              <strong>Resetar dados locais</strong>
              <small>Apaga progresso, XP, perfil e conquistas deste navegador.</small>
            </span>
          </button>
        </section>
      </div>

      <AppDialog
        actions={<PrimaryButton onClick={saveProfile}>Salvar perfil</PrimaryButton>}
        description="Escolha seu apelido, avatar e cor para aparecer no ranking semanal."
        onClose={() => setEditing(false)}
        open={editing}
        title="Editar perfil e avatar"
      >
        <label className="profile-name-field">
          <span>Apelido de exibição</span>
          <input
            maxLength={28}
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>

        <fieldset className="avatar-tone-field">
          <legend>Avatar</legend>
          <div className="avatar-preset-grid">
            {PRESET_AVATARS.map((preset) => (
              <button
                aria-label={`Avatar ${preset.label}`}
                aria-pressed={avatarId === preset.id}
                className={`avatar-preset-btn avatar-${tone} ${avatarId === preset.id ? "selected" : ""}`}
                key={preset.id}
                onClick={() => setAvatarId(preset.id)}
                type="button"
              >
                <span aria-hidden="true">{preset.emoji}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="avatar-tone-field">
          <legend>Cor de fundo</legend>
          <div>
            {AVATAR_TONES.map((option) => (
              <button
                aria-label={`Usar cor ${option}`}
                aria-pressed={tone === option}
                className={`avatar-${option}`}
                key={option}
                onClick={() => setTone(option)}
                type="button"
              >
                {getAvatarEmoji(avatarId)}
              </button>
            ))}
          </div>
        </fieldset>
      </AppDialog>

      <AppDialog
        actions={
          <>
            <PrimaryButton onClick={() => setConfirmReset(false)} variant="secondary">
              Cancelar
            </PrimaryButton>
            <PrimaryButton onClick={resetData} variant="quiet">
              Apagar dados locais
            </PrimaryButton>
          </>
        }
        description="Esta ação não pode ser desfeita e afeta somente este navegador."
        onClose={() => setConfirmReset(false)}
        open={confirmReset}
        title="Resetar todo o progresso local?"
      />
      <Toast message={notice} />
    </AppShell>
  );
}

function SettingToggle({
  checked,
  description,
  icon,
  label,
  onClick,
}: {
  checked: boolean;
  description: string;
  icon: "volume" | "volume-off" | "sparkles";
  label: string;
  onClick: () => void;
}) {
  return (
    <button aria-pressed={checked} className="setting-row" onClick={onClick}>
      <span className="setting-icon"><AppIcon name={icon} /></span>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span className={`toggle ${checked ? "on" : ""}`} aria-hidden="true"><i /></span>
    </button>
  );
}
