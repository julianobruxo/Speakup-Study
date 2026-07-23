import { useState } from "react";
import AppIcon from "../components/AppIcon";
import {
  AppShell,
} from "../components/AppShell";
import {
  isSoundEnabled,
  playSound,
  setSoundEnabled,
} from "../services/audio/sound";

export default function ProfilePage() {
  const [sound, setSound] = useState(isSoundEnabled);

  function toggleSound() {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
    if (next) playSound("select");
  }

  return (
    <AppShell activeNav="profile" className="standard-page">
      <header className="main-page-heading">
        <span className="eyebrow">Perfil</span>
        <h1>Preferências da experiência</h1>
      </header>
      <section className="profile-intro">
        <span className="profile-avatar" aria-hidden="true">
          <AppIcon name="user" size={28} />
        </span>
        <div>
          <span className="eyebrow">Modo visitante</span>
          <h2>Olá!</h2>
          <p>Você pode praticar sem criar conta.</p>
        </div>
      </section>

      <section className="settings-section">
        <h3>Preferências</h3>
        <button
          aria-pressed={sound}
          className="setting-row"
          onClick={toggleSound}
        >
          <span className="setting-icon">
            <AppIcon name={sound ? "volume" : "volume-off"} />
          </span>
          <span>
            <strong>Sons da prática</strong>
            <small>Efeitos leves de resposta e conclusão</small>
          </span>
          <span className={`toggle ${sound ? "on" : ""}`} aria-hidden="true">
            <i />
          </span>
        </button>
        <div className="setting-row static">
          <span className="setting-icon">
            <AppIcon name="settings" />
          </span>
          <span>
            <strong>Conta e sincronização</strong>
            <small>Salve suas conquistas em uma próxima etapa</small>
          </span>
          <span className="status-pill">Em breve</span>
        </div>
      </section>
    </AppShell>
  );
}
