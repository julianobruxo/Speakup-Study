import { useEffect, useState } from "react";
import AppDialog from "../components/AppDialog";
import AppIcon from "../components/AppIcon";
import { AppShell, PrimaryButton } from "../components/AppShell";
import {
  getLevelSummary,
  resetAllLocalData,
  updateLocalProfile,
} from "../services/progress/engagement";
import { useEngagement } from "../services/progress/useEngagement";
import { useProgressSummary } from "../services/progress/useProgressSummary";
import {
  isSoundEnabled,
  playSound,
  setSoundEnabled,
} from "../services/audio/sound";

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
  const level = getLevelSummary(snapshot?.state.totalXp ?? 0);
  const profile = snapshot?.profile ?? {
    displayName: "Jogador",
    avatarInitial: "J",
    avatarTone: "cyan",
  };

  useEffect(() => {
    setName(profile.displayName);
    setTone(profile.avatarTone);
  }, [profile.avatarTone, profile.displayName]);

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
    await updateLocalProfile(name, tone);
    await reload();
    setEditing(false);
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
          <div className={`profile-big-avatar avatar-${profile.avatarTone}`}>
            {profile.avatarInitial}
          </div>
          <h1>{profile.displayName}</h1>
          <p>
            {level.title} · Nível {level.level}
            <br />
            Seu progresso está salvo neste dispositivo.
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
            Editar perfil
          </button>
        </section>

        <section className="settings-card">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Preferências</div>
              <h2>Personalize sua experiência</h2>
            </div>
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
              <strong>Armazenamento local</strong>
              <small>Progresso e perfil ficam apenas neste navegador.</small>
            </span>
          </div>
          <button className="setting-row danger" onClick={() => setConfirmReset(true)}>
            <span className="setting-icon"><AppIcon name="refresh" /></span>
            <span>
              <strong>Resetar dados</strong>
              <small>Apaga progresso, XP, perfil e conquistas deste navegador.</small>
            </span>
          </button>
        </section>
      </div>

      <AppDialog
        actions={<PrimaryButton onClick={saveProfile}>Salvar perfil</PrimaryButton>}
        description="Esse nome aparece apenas neste dispositivo."
        onClose={() => setEditing(false)}
        open={editing}
        title="Editar perfil local"
      >
        <label className="profile-name-field">
          <span>Nome de exibição</span>
          <input
            maxLength={28}
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>
        <fieldset className="avatar-tone-field">
          <legend>Cor do avatar</legend>
          <div>
            {AVATAR_TONES.map((option) => (
              <button
                aria-label={`Usar avatar ${option}`}
                aria-pressed={tone === option}
                className={`avatar-${option}`}
                key={option}
                onClick={() => setTone(option)}
                type="button"
              >
                {(name.trim() || "J").charAt(0).toLocaleUpperCase("pt-BR")}
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
        title="Resetar todo o progresso?"
      />
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

