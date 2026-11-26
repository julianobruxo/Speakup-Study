import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import type { MvpGrammarDifficulty } from "../content/model/content";
import {
  getPracticePreferences,
  savePracticePreferences,
} from "../services/progress/practicePreferences";
import "../styles/activities.css";

const counts = [10, 20, 30] as const;

export default function PracticeSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preferences = getPracticePreferences();
  const requestedDifficulty = searchParams.get("difficulty");
  const requestedCount = Number(searchParams.get("count"));
  const [difficulty, setDifficulty] = useState<MvpGrammarDifficulty>(
    requestedDifficulty === "easy" || requestedDifficulty === "medium"
      ? requestedDifficulty
      : preferences.difficulty,
  );
  const [count, setCount] = useState<(typeof counts)[number]>(
    requestedCount === 10 || requestedCount === 20 || requestedCount === 30
      ? requestedCount
      : preferences.questionCount,
  );
  const [includeOptionalChallenge, setIncludeOptionalChallenge] = useState(
    searchParams.get("challenge") === "1",
  );

  function startSession() {
    savePracticePreferences({
      topicId: "present_tobe",
      difficulty,
      questionCount: count,
    });
    const params = new URLSearchParams({
      difficulty,
      count: String(count),
      seed: String(Date.now()),
    });
    if (difficulty === "medium" && includeOptionalChallenge) {
      params.set("challenge", "1");
    }
    navigate(`/praticar/present_tobe/sessao?${params.toString()}`);
  }

  return (
    <AppShell activeNav="study" className="standard-page">
      <PageHeader backTo="/gramatica" title="Configurar sessão" />

      <div className="activity-page-container">
        <div className="setup-layout">
          <section className="setup-brief-card">
            <span className="setup-badge-be">BE</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="pill-tag pill-tag--blue" style={{ width: "fit-content" }}>
                Gramática
              </span>
              <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>
                Verbo TO BE — presente
              </h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Monte uma rodada do seu tamanho e descubra o resultado ao final.
                As questões não se repetem.
              </p>
            </div>

            <div className="setup-features-list">
              <span>
                <AppIcon name="check" size={17} />
                Feedback em cada resposta
              </span>
              <span>
                <AppIcon name="refresh" size={17} />
                Nova ordem a cada rodada
              </span>
            </div>
          </section>

          <section className="setup-builder-card">
            <fieldset className="choice-fieldset">
              <legend>Escolha a dificuldade</legend>
              <div className="segmented-grid segmented-grid--two">
                {(["easy", "medium"] as const).map((level) => (
                  <motion.button
                    aria-pressed={difficulty === level}
                    className={`segmented-option${
                      difficulty === level ? " is-selected" : ""
                    }`}
                    key={level}
                    onClick={() => setDifficulty(level)}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                  >
                    <AppIcon
                      name={level === "easy" ? "sparkles" : "book"}
                      size={19}
                    />
                    <strong>{level === "easy" ? "Fácil" : "Médio"}</strong>
                    <span>
                      {level === "easy"
                        ? "Reconhecimento direto"
                        : "Mais contexto e contraste"}
                    </span>
                  </motion.button>
                ))}
              </div>
            </fieldset>

            <fieldset className="choice-fieldset">
              <legend>Defina o tamanho da rodada</legend>
              <div className="segmented-grid segmented-grid--three">
                {counts.map((amount) => (
                  <motion.button
                    aria-pressed={count === amount}
                    className={`segmented-option${
                      count === amount ? " is-selected" : ""
                    }`}
                    key={amount}
                    onClick={() => setCount(amount)}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                  >
                    <strong className="tabular-nums">{amount}</strong>
                    <span>questões</span>
                  </motion.button>
                ))}
              </div>
            </fieldset>

            {difficulty === "medium" && (
              <label className="setup-challenge-toggle">
                <input
                  checked={includeOptionalChallenge}
                  onChange={(event) =>
                    setIncludeOptionalChallenge(event.target.checked)
                  }
                  type="checkbox"
                />
                <span>
                  <strong>Incluir desafio opcional (B2)</strong>
                  <small>
                    Concordância avançada (neither, none of, news, scissors).
                  </small>
                </span>
              </label>
            )}

            <div className="setup-summary-strip">
              <span className="setup-summary-strip__icon" aria-hidden="true">
                <AppIcon name="clock" size={20} />
              </span>
              <span>
                <small>Seu desafio</small>
                <strong>
                  {count} questões · {difficulty === "easy" ? "Fácil" : "Médio"}
                </strong>
                <small>Rodada personalizada, sem limite de tempo</small>
              </span>
            </div>

            <button
              className="btn-3d-primary"
              onClick={startSession}
              type="button"
            >
              <AppIcon name="sparkles" size={19} />
              <span>Iniciar desafio</span>
            </button>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
