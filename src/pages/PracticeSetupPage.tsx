import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import {
  AppShell,
  PageHeader,
  PrimaryButton,
} from "../components/AppShell";
import type {
  MvpGrammarDifficulty,
} from "../content/model/content";
import {
  getPracticePreferences,
  savePracticePreferences,
} from "../services/progress/practicePreferences";

const counts = [10, 20, 30] as const;

export default function PracticeSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preferences = getPracticePreferences();
  const requestedDifficulty = searchParams.get("difficulty");
  const requestedCount = Number(searchParams.get("count"));
  const [difficulty, setDifficulty] =
    useState<MvpGrammarDifficulty>(
      requestedDifficulty === "easy" || requestedDifficulty === "medium"
        ? requestedDifficulty
        : preferences.difficulty,
    );
  const [count, setCount] = useState<(typeof counts)[number]>(
    requestedCount === 10 || requestedCount === 20 || requestedCount === 30
      ? requestedCount
      : preferences.questionCount,
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
    navigate(`/praticar/present_tobe/sessao?${params.toString()}`);
  }

  return (
    <AppShell className="standard-page setup-page">
      <PageHeader backTo="/gramatica" title="Configurar sessão" />
      <div className="setup-layout">
        <section className="challenge-brief">
          <span className="setup-icon">BE</span>
          <div>
            <span className="eyebrow">Gramática</span>
            <h2>Verbo TO BE — presente</h2>
            <p>
              Monte uma rodada do seu tamanho e descubra o resultado ao final.
              As questões não se repetem.
            </p>
          </div>
          <div className="brief-features">
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

        <section className="challenge-builder">
          <fieldset className="choice-fieldset">
            <legend>Escolha a dificuldade</legend>
            <div className="segmented-control two">
              {(["easy", "medium"] as const).map((level) => (
                <motion.button
                  aria-pressed={difficulty === level}
                  className={difficulty === level ? "selected" : ""}
                  key={level}
                  onClick={() => setDifficulty(level)}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="selector-icon">
                    <AppIcon
                      name={level === "easy" ? "sparkles" : "book"}
                      size={20}
                    />
                  </span>
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
            <div className="segmented-control three">
              {counts.map((amount) => (
                <motion.button
                  aria-pressed={count === amount}
                  className={count === amount ? "selected" : ""}
                  key={amount}
                  onClick={() => setCount(amount)}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                >
                  <strong>{amount}</strong>
                  <span>questões</span>
                </motion.button>
              ))}
            </div>
          </fieldset>

          <div className="session-summary">
            <span className="summary-icon">
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

          <PrimaryButton
            icon={<AppIcon name="sparkles" />}
            onClick={startSession}
          >
            Iniciar desafio
          </PrimaryButton>
        </section>
      </div>
    </AppShell>
  );
}
