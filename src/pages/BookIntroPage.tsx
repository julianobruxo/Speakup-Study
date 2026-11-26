import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell } from "../components/AppShell";
import { CategoryBadgeIcon, OpenBookBadgeIcon } from "../components/BookVisual";
import PracticePickerModal, {
  type PracticePickerOption,
} from "../components/PracticePickerModal";
import { LIVRO_INTRO } from "../content/books/intro";
import {
  getLeagueStandings,
  getWeekRemaining,
  type EngagementSnapshot,
  type LeagueStanding,
} from "../services/progress/engagement";
import { useEngagement } from "../services/progress/useEngagement";
import { fetchGlobalWeeklyStandings } from "../services/firebase/leaderboardSync";
import "../styles/estudar.css";

const BADGE_TONES = ["orange", "green", "cyan", "purple"] as const;

const BOOKS = [
  {
    id: "intro",
    label: LIVRO_INTRO.title,
    active: true,
    route: "/livro/intro/vocabulario",
  },
] as const;

type PickerTarget = {
  kind: "vocabulary";
  setId: string;
  title: string;
  subtitle: string;
} | null;

function ProgressDots({ ratio }: { ratio: number }) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const activeIndex = Math.min(4, Math.floor(clamped * 5));
  const isComplete = clamped >= 1;

  return (
    <div
      aria-label={`Progresso: ${Math.round(clamped * 100)}%`}
      className="progress-dots"
    >
      {[0, 1, 2, 3, 4].map((segment) => {
        if (isComplete) {
          return (
            <span
              className={`progress-dot ${segment === 4 ? "progress-dot--active" : "progress-dot--done"}`}
              key={segment}
            />
          );
        }
        const cls =
          segment < activeIndex
            ? "progress-dot progress-dot--done"
            : segment === activeIndex
              ? "progress-dot progress-dot--active"
              : "progress-dot";
        return <span className={cls} key={segment} />;
      })}
    </div>
  );
}

export default function BookIntroPage({
  section = "vocabulario",
}: {
  section?: "gramatica" | "vocabulario";
}) {
  const navigate = useNavigate();
  const { snapshot } = useEngagement();
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [bookMenuOpen, setBookMenuOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!bookMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setBookMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setBookMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [bookMenuOpen]);

  const revealedSet = new Set(
    snapshot?.state.dailyMission.vocabularyCardsRevealed ?? [],
  );

  const pickerOptions: PracticePickerOption[] = pickerTarget
    ? [
        {
          id: "flashcards",
          icon: <AppIcon name="book" size={20} />,
          title: "Flashcards",
          description: "Veja a imagem, ouça em inglês e vire para conferir.",
          onSelect: () => {
            const id = pickerTarget.setId;
            setPickerTarget(null);
            navigate(`/livro/intro/vocabulario/${id}/flashcards`);
          },
        },
        {
          id: "memory",
          icon: <AppIcon name="grid" size={20} />,
          title: "Jogo da Memória",
          description: "Encontre os pares entre inglês, imagem e português.",
          onSelect: () => {
            const id = pickerTarget.setId;
            setPickerTarget(null);
            navigate(`/livro/intro/vocabulario/${id}/memoria`);
          },
        },
        {
          id: "quiz",
          icon: <AppIcon name="sparkles" size={20} />,
          title: "Quiz Rápido",
          description: "Veja a imagem e a palavra em inglês e marque a tradução certa.",
          onSelect: () => {
            const id = pickerTarget.setId;
            setPickerTarget(null);
            navigate(`/livro/intro/vocabulario/${id}/quiz`);
          },
        },
      ]
    : [];

  return (
    <AppShell
      activeNav="study"
      className="estudar-shell-content"
      dialogOpen={pickerTarget !== null}
    >
      <div className="estudar-page">
        {/* Top Bar: Clean Book Selector Dropdown (VSoT 1:1) */}
        <div
          className="book-selector-wrap"
          ref={selectorRef}
          role="navigation"
          aria-label="Seletor de livro"
        >
          <button
            aria-expanded={bookMenuOpen}
            aria-haspopup="listbox"
            className="book-selector"
            onClick={() => setBookMenuOpen((open) => !open)}
            type="button"
          >
            <span className="book-selector__left">
              <OpenBookBadgeIcon size={24} />
              <span className="book-selector__label">{LIVRO_INTRO.title}</span>
            </span>
            <span className="book-selector__chevron" aria-hidden="true">
              <svg
                fill="none"
                height="18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="18"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>

          {bookMenuOpen && (
            <div className="book-selector-menu" role="listbox">
              {BOOKS.map((book) => (
                <button
                  aria-selected={book.active}
                  className={`book-selector-option ${book.active ? "is-active" : ""}`}
                  key={book.id}
                  onClick={() => {
                    setBookMenuOpen(false);
                    navigate(
                      section === "gramatica"
                        ? "/livro/intro/gramatica"
                        : "/livro/intro/vocabulario",
                    );
                  }}
                  role="option"
                  type="button"
                >
                  <span>{book.label}</span>
                  <span className="pill-tag pill-tag--blue">Ativo</span>
                </button>
              ))}
              <button
                className="book-selector-option"
                disabled
                role="option"
                type="button"
              >
                <span>Livro 1</span>
                <span className="pill-tag">Em breve</span>
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Underline Tabs (VSoT 1:1) */}
        <div
          aria-label="Áreas do Livro Intro"
          className="estudar-tabs"
          role="tablist"
        >
          <button
            aria-selected={section === "gramatica"}
            className={`estudar-tab ${section === "gramatica" ? "is-active" : ""}`}
            onClick={() => navigate("/livro/intro/gramatica")}
            role="tab"
            type="button"
          >
            Gramática
          </button>
          <button
            aria-selected={section === "vocabulario"}
            className={`estudar-tab ${section === "vocabulario" ? "is-active" : ""}`}
            onClick={() => navigate("/livro/intro/vocabulario")}
            role="tab"
            type="button"
          >
            Vocabulário
          </button>
        </div>

        {/* 2-Column Category Grid + Right-Rail Leaderboard */}
        <div className="estudar-layout">
          <div className="estudar-main-col">
            {section === "vocabulario" ? (
              <div
                aria-label="Conjuntos de vocabulário do Livro Intro"
                className="category-grid"
                role="region"
              >
                {LIVRO_INTRO.vocabularySets.map((set, idx) => {
                  const tone = BADGE_TONES[idx % 4];
                  const variant = set.items[0]?.svgVariant ?? "school";
                  const studiedCount = set.items.filter((it) =>
                    revealedSet.has(it.id),
                  ).length;
                  const ratio =
                    set.items.length > 0 ? studiedCount / set.items.length : 0;

                  return (
                    <button
                      className="category-card"
                      key={set.id}
                      onClick={() =>
                        setPickerTarget({
                          kind: "vocabulary",
                          setId: set.id,
                          title: set.title,
                          subtitle: `${set.items.length} palavras · escolha como praticar`,
                        })
                      }
                      type="button"
                    >
                      <div className={`category-badge category-badge--${tone}`}>
                        <CategoryBadgeIcon size={36} variant={variant} />
                      </div>
                      <h3 className="category-card__title">{set.title}</h3>
                      <p className="category-card__meta">
                        {set.items.length} palavras
                      </p>
                      <div className="category-card__footer">
                        <ProgressDots ratio={ratio} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                aria-label="Tópicos de gramática do Livro Intro"
                className="category-grid"
                role="region"
              >
                {LIVRO_INTRO.grammarTopics.map((topic, idx) => {
                  const tone = BADGE_TONES[idx % 4];
                  const exerciseCount =
                    topic.fill_in_gaps.length +
                    topic.multiple_choice.length +
                    topic.word_scramble.length;

                  return (
                    <button
                      className="category-card"
                      key={topic.id}
                      onClick={() =>
                        navigate(`/livro/intro/gramatica/${topic.id}`)
                      }
                      type="button"
                    >
                      <div className="category-card__top">
                        <div className={`category-badge category-badge--${tone}`}>
                          <span className="category-badge__order">
                            {String(topic.order).padStart(2, "0")}
                          </span>
                        </div>
                        <span className="pill-tag">3 atividades</span>
                      </div>
                      <h3 className="category-card__title">{topic.title}</h3>
                      <p className="category-card__meta">
                        {exerciseCount} exercícios
                      </p>
                      <p className="category-card__summary">{topic.summary}</p>
                      <div className="category-card__footer">
                        <ProgressDots ratio={0} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <EstudarLeaderboardRail snapshot={snapshot} />
        </div>
      </div>

      <PracticePickerModal
        onClose={() => setPickerTarget(null)}
        open={pickerTarget !== null}
        options={pickerOptions}
        subtitle={pickerTarget?.subtitle}
        title={pickerTarget?.title ?? ""}
      />
    </AppShell>
  );
}

function EstudarLeaderboardRail({
  snapshot,
}: {
  snapshot: EngagementSnapshot | null;
}) {
  const localStandings = snapshot ? getLeagueStandings(snapshot) : [];
  const [liveState, setLiveState] = useState<{
    standings: LeagueStanding[];
    mode: "live" | "local";
    realPlayerCount: number;
    outsideTopLimit: boolean;
  } | null>(null);

  const weeklyXp = snapshot?.state.weeklyXp ?? 0;
  const weekKey = snapshot?.state.league.weekKey ?? "";
  const displayName = snapshot?.profile.displayName ?? "";
  const avatarId = snapshot?.profile.avatarId ?? "fox";
  const avatarTone = snapshot?.profile.avatarTone ?? "cyan";

  useEffect(() => {
    if (!snapshot) return;
    let active = true;
    const fallback = getLeagueStandings(snapshot);
    void fetchGlobalWeeklyStandings(snapshot, fallback).then((result) => {
      if (!active) return;
      setLiveState(result);
    });
    return () => {
      active = false;
    };
  }, [snapshot, weeklyXp, weekKey, displayName, avatarId, avatarTone]);

  const standings = liveState?.standings ?? localStandings;
  const mode = liveState?.mode ?? "local";
  const realPlayerCount = liveState?.realPlayerCount ?? 0;
  const outsideTopLimit = liveState?.outsideTopLimit ?? false;
  const topRows = standings.slice(0, 7);
  const playerIndex = standings.findIndex((item) => item.isPlayer);
  const playerRow = playerIndex >= 7 ? standings[playerIndex] : null;
  const rows = playerRow ? [...topRows, playerRow] : topRows;

  return (
    <aside aria-label="Ranking semanal" className="leaderboard-card">
      <div className="leaderboard-card__header">
        <div>
          <h2 className="leaderboard-card__title">Leaderboard</h2>
          <p className="leaderboard-card__subtitle">Liga</p>
        </div>
        <span className="leaderboard-card__timer">{getWeekRemaining()}</span>
      </div>

      <div className="leaderboard-cols">
        <span>Semanal</span>
        <span>Pontos</span>
      </div>

      <div className="leaderboard-list">
        {rows.map((item) => {
          const rankIndex = standings.indexOf(item) + 1;
          const isOutside = item.isPlayer && outsideTopLimit;
          const rankText = isOutside ? "25+" : String(rankIndex);
          const medalClass =
            isOutside
              ? "medal-badge--plain"
              : rankIndex === 1
                ? "medal-badge--gold"
                : rankIndex === 2
                  ? "medal-badge--silver"
                  : rankIndex === 3
                    ? "medal-badge--bronze"
                    : "medal-badge--plain";

          const isHighlighted = item.isPlayer || (!outsideTopLimit && rankIndex === 1);

          return (
            <div
              className={`leaderboard-row ${isHighlighted ? "is-highlighted" : ""}`}
              key={item.id}
            >
              <span className={`medal-badge ${medalClass}`}>{rankText}</span>
              <span
                aria-hidden="true"
                className={`leaderboard-row__avatar tone-${item.tone}`}
              >
                {(item.initial || item.name.trim().charAt(0) || "?").toUpperCase()}
              </span>
              <span className="leaderboard-row__name">
                {item.name}
                {item.isPlayer && (
                  <span className="leaderboard-row__you"> · Você</span>
                )}
              </span>
              <span className="leaderboard-row__points">
                {item.xp.toLocaleString("pt-BR")}
              </span>
            </div>
          );
        })}
      </div>

      <p className="leaderboard-card__footnote">
        {mode === "live"
          ? `Ranking global ativo · ${realPlayerCount} aluno${realPlayerCount === 1 ? "" : "s"} na semana.`
          : "Ranking local — sincroniza automaticamente ao conectar."}
      </p>
    </aside>
  );
}
