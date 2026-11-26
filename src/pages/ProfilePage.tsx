import { useEffect, useRef, useState } from "react";
import AppDialog from "../components/AppDialog";
import AppIcon from "../components/AppIcon";
import { AppShell } from "../components/AppShell";
import Toast from "../components/Toast";
import {
  getLevelSummary,
  mergeRemoteUserState,
  PRESET_AVATARS,
  resetAllLocalData,
  sanitizeAvatarTone,
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
import "../styles/dashboard.css";

const AVATAR_TONE_OPTIONS: { id: string; label: string }[] = [
  { id: "cyan", label: "Azul turquesa" },
  { id: "wine", label: "Rosa coral" },
  { id: "violet", label: "Lavanda" },
  { id: "green", label: "Verde menta" },
  { id: "orange", label: "Laranja solar" },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "J";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function AvatarEmblem({
  avatarId,
  size = 24,
}: {
  avatarId: AvatarId;
  size?: number;
}) {
  switch (avatarId) {
    case "fox":
    case "cat":
      return (
        <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size}>
          <path d="M5 10L7 4L11 7.5H13L17 4L19 10C19 15 16 19 12 19C8 19 5 15 5 10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
          <circle cx="9.5" cy="12" fill="currentColor" r="1" />
          <circle cx="14.5" cy="12" fill="currentColor" r="1" />
        </svg>
      );
    case "owl":
    case "eagle":
      return (
        <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size}>
          <path d="M4 13C4 8.5 7.5 5 12 5C16.5 5 20 8.5 20 13C20 16.5 17 19 12 19C7 19 4 16.5 4 13Z" stroke="currentColor" strokeWidth="1.9" />
          <circle cx="9.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="14.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 13.5L10.8 15.5H13.2L12 13.5Z" fill="currentColor" />
        </svg>
      );
    case "lion":
    case "tiger":
      return (
        <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size}>
          <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.9" />
          <path d="M9 10.5H9.01M15 10.5H15.01M9.5 15C10.3 15.8 11.1 16.1 12 16.1C12.9 16.1 13.7 15.8 14.5 15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
        </svg>
      );
    case "panda":
    case "koala":
      return (
        <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size}>
          <circle cx="6.5" cy="7.5" r="2.2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.5" cy="7.5" r="2.2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="13" r="6.5" stroke="currentColor" strokeWidth="1.9" />
          <circle cx="9.8" cy="12.2" fill="currentColor" r="1.1" />
          <circle cx="14.2" cy="12.2" fill="currentColor" r="1.1" />
        </svg>
      );
    case "dolphin":
    case "dog":
      return (
        <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size}>
          <path d="M4 14C6.5 9 11 6.5 16.5 7.5C18.5 7.9 19.8 9.2 20 11C17 11.5 15 13 13.5 15.5C12.2 17.6 9.5 18.2 7 17.2L4 14Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
          <circle cx="15" cy="10.2" fill="currentColor" r="1" />
        </svg>
      );
    case "rocket":
      return (
        <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size}>
          <path d="M12 3.5C15 6 16.5 9.5 16.5 14L12 18L7.5 14C7.5 9.5 9 6 12 3.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.9" />
          <circle cx="12" cy="10.5" fill="currentColor" r="1.3" />
          <path d="M7.5 13.5L4.5 15.5L6.5 18.5M16.5 13.5L19.5 15.5L17.5 18.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "star":
    default:
      return (
        <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size}>
          <path d="M12 4L14.5 9.1L20 9.9L16 13.8L17 19.3L12 16.6L7 19.3L8 13.8L4 9.9L9.5 9.1L12 4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
        </svg>
      );
  }
}

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
  const safeProfileTone = sanitizeAvatarTone(profile.avatarTone);

  useEffect(() => {
    setName(profile.displayName);
    setTone(sanitizeAvatarTone(profile.avatarTone));
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
    showNotice("Dados locais apagados.");
  }

  return (
    <AppShell
      activeNav="profile"
      className="dash-page dash-profile"
      dialogOpen={editing || confirmReset}
    >
      <div className="dash-profile-grid">
        <section className="surface-card dash-profile-card">
          <div
            aria-hidden="true"
            className={`dash-profile-avatar dash-avatar--${safeProfileTone}`}
          >
            {getInitials(profile.displayName)}
          </div>

          <h1 className="dash-profile-name">{profile.displayName}</h1>

          <span className="pill-tag pill-tag--blue">
            {level.title} · Nível {level.level}
          </span>

          <p className="dash-profile-sub">
            {authStatus.isGoogleLinked
              ? "Conta Google conectada · progresso sincronizado."
              : "Seu progresso funciona offline e sincroniza na liga semanal."}
          </p>

          <div className="dash-level-block">
            <div className="dash-level-meta">
              <span>Progresso do nível</span>
              <span className="tabular-nums">{level.progress}%</span>
            </div>
            <div
              aria-label={`${level.progress}% do nível atual`}
              className="progress-track"
            >
              <div
                className="progress-fill"
                style={{ width: `${level.progress}%` }}
              />
            </div>
          </div>

          <div className="dash-profile-stats">
            <div className="dash-profile-stat">
              <strong className="tabular-nums">
                {snapshot?.state.totalXp ?? 0}
              </strong>
              <span>XP</span>
            </div>
            <div className="dash-profile-stat">
              <strong className="tabular-nums">
                {snapshot?.state.currentStreak ?? 0}
              </strong>
              <span>dias</span>
            </div>
            <div className="dash-profile-stat">
              <strong className="tabular-nums">
                {summary?.completedSessions ?? 0}
              </strong>
              <span>sessões</span>
            </div>
          </div>

          <button
            className="btn-pill-outline dash-profile-edit-btn"
            onClick={() => setEditing(true)}
            type="button"
          >
            Editar perfil e avatar
          </button>
        </section>

        <section className="surface-card dash-settings-card">
          <div className="dash-section-head">
            <div>
              <h2 className="dash-section-title">Preferências</h2>
              <p className="dash-section-subtitle">
                Personalize sua experiência e sincronização
              </p>
            </div>
          </div>

          <div className="dash-google-card">
            <div className="dash-google-card__copy">
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
            {authStatus.configured &&
              (authStatus.isGoogleLinked ? (
                <button
                  className="btn-pill-outline"
                  disabled={googleBusy}
                  onClick={handleGoogleSignOut}
                  type="button"
                >
                  Desconectar Google
                </button>
              ) : (
                <button
                  className="btn-3d-primary btn-3d-primary--sm"
                  disabled={googleBusy}
                  onClick={handleGoogleConnect}
                  type="button"
                >
                  {googleBusy
                    ? "Conectando..."
                    : "Entrar / Vincular com Google"}
                </button>
              ))}
          </div>

          <div className="dash-settings-list">
            <SettingToggle
              badgeClass="category-badge--cyan"
              checked={sound}
              description="Feedback sonoro e leitura dos flashcards."
              icon={sound ? "volume" : "volume-off"}
              label="Sons e pronúncia"
              onClick={toggleSound}
            />
            <SettingToggle
              badgeClass="category-badge--purple"
              checked={animations}
              description="Movimentos, transições e celebrações."
              icon="sparkles"
              label="Animações"
              onClick={toggleAnimations}
            />

            <div className="dash-setting-row">
              <span
                aria-hidden="true"
                className="category-badge category-badge--sm category-badge--green"
              >
                <AppIcon name="chart" size={20} />
              </span>
              <span className="dash-setting-row__copy">
                <strong>Meta semanal</strong>
                <small>Praticar em 5 dias por semana.</small>
              </span>
              <span className="pill-tag pill-tag--blue">5 dias</span>
            </div>

            <div className="dash-setting-row">
              <span
                aria-hidden="true"
                className="category-badge category-badge--sm category-badge--orange"
              >
                <AppIcon name="settings" size={20} />
              </span>
              <span className="dash-setting-row__copy">
                <strong>Privacidade no ranking</strong>
                <small>
                  Apenas seu apelido e avatar escolhido aparecem na liga
                  semanal.
                </small>
              </span>
            </div>

            <button
              className="dash-setting-row dash-setting-row--danger"
              onClick={() => setConfirmReset(true)}
              type="button"
            >
              <span aria-hidden="true" className="dash-danger-icon">
                <AppIcon name="refresh" size={20} />
              </span>
              <span className="dash-setting-row__copy">
                <strong>Resetar dados locais</strong>
                <small>
                  Apaga progresso, XP, perfil e conquistas deste navegador.
                </small>
              </span>
            </button>
          </div>
        </section>
      </div>

      <AppDialog
        actions={
          <button
            className="btn-3d-primary btn-3d-primary--sm"
            onClick={saveProfile}
            type="button"
          >
            Salvar perfil
          </button>
        }
        description="Escolha seu apelido, emblema e cor para aparecer no ranking semanal."
        onClose={() => setEditing(false)}
        open={editing}
        title="Editar perfil e avatar"
      >
        <label className="dash-field">
          <span className="dash-field__label">Apelido de exibição</span>
          <input
            className="input-field"
            maxLength={28}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu apelido"
            type="text"
            value={name}
          />
        </label>

        <fieldset className="dash-field">
          <legend className="dash-field__label">Emblema</legend>
          <div className="dash-avatar-grid">
            {PRESET_AVATARS.map((preset) => (
              <button
                aria-label={`Emblema ${preset.label}`}
                aria-pressed={avatarId === preset.id}
                className={`dash-avatar-option dash-avatar--${sanitizeAvatarTone(tone)} ${
                  avatarId === preset.id ? "is-selected" : ""
                }`}
                key={preset.id}
                onClick={() => setAvatarId(preset.id)}
                type="button"
              >
                <AvatarEmblem avatarId={preset.id} size={22} />
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="dash-field">
          <legend className="dash-field__label">Cor do avatar</legend>
          <div className="dash-tone-grid">
            {AVATAR_TONE_OPTIONS.map((option) => (
              <button
                aria-label={`Usar cor ${option.label}`}
                aria-pressed={tone === option.id}
                className={`dash-tone-swatch dash-avatar--${option.id} ${
                  tone === option.id ? "is-selected" : ""
                }`}
                key={option.id}
                onClick={() => setTone(option.id)}
                type="button"
              >
                {tone === option.id && <AppIcon name="check" size={18} />}
              </button>
            ))}
          </div>
        </fieldset>
      </AppDialog>

      <AppDialog
        actions={
          <>
            <button
              className="btn-pill-outline"
              onClick={() => setConfirmReset(false)}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="btn-danger-outline"
              onClick={resetData}
              type="button"
            >
              Apagar dados locais
            </button>
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
  badgeClass,
  checked,
  description,
  icon,
  label,
  onClick,
}: {
  badgeClass: string;
  checked: boolean;
  description: string;
  icon: "volume" | "volume-off" | "sparkles";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-checked={checked}
      className="dash-setting-row"
      onClick={onClick}
      role="switch"
      type="button"
    >
      <span
        aria-hidden="true"
        className={`category-badge category-badge--sm ${badgeClass}`}
      >
        <AppIcon name={icon} size={20} />
      </span>
      <span className="dash-setting-row__copy">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span
        aria-hidden="true"
        className={`toggle-switch ${checked ? "is-on" : ""}`}
      >
        <span className="toggle-switch__knob" />
      </span>
    </button>
  );
}
