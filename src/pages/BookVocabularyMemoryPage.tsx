import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import { BookVisual } from "../components/BookVisual";
import {
  getIntroVocabularySet,
  type BookVocabularyItem,
} from "../content/books/intro";
import { recordGameRoundEngagement } from "../services/progress/engagement";
import "../styles/activities.css";

interface MemoryCard {
  uid: string;
  pairId: string;
  side: "en" | "pt";
  item: BookVocabularyItem;
}

const PAIRS_PER_ROUND = 6;
const MISMATCH_DELAY_MS = 850;
const ROUND_XP = 30;

function shuffleCards<T>(source: readonly T[]): T[] {
  const result = [...source];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildDeck(items: readonly BookVocabularyItem[]): MemoryCard[] {
  const chosen = shuffleCards(items).slice(
    0,
    Math.min(PAIRS_PER_ROUND, items.length),
  );
  const cards: MemoryCard[] = chosen.flatMap((item) => [
    { uid: `${item.id}:en`, pairId: item.id, side: "en", item },
    { uid: `${item.id}:pt`, pairId: item.id, side: "pt", item },
  ]);
  return shuffleCards(cards);
}

export default function BookVocabularyMemoryPage() {
  const navigate = useNavigate();
  const { setId } = useParams();
  const vocabSet = getIntroVocabularySet(setId);

  const [cards, setCards] = useState<MemoryCard[]>(() =>
    vocabSet ? buildDeck(vocabSet.items) : [],
  );
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [locked, setLocked] = useState(false);
  const [feedbackFx, setFeedbackFx] = useState<{
    id: number;
    kind: "match" | "mismatch";
  } | null>(null);

  const lockedRef = useRef(false);
  const mismatchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef(crypto.randomUUID());
  const completionRecordedRef = useRef(false);

  const clearPendingTimer = useCallback(() => {
    if (mismatchTimerRef.current !== null) {
      clearTimeout(mismatchTimerRef.current);
      mismatchTimerRef.current = null;
    }
  }, []);

  const resetRound = useCallback(
    (items: readonly BookVocabularyItem[]) => {
      clearPendingTimer();
      lockedRef.current = false;
      completionRecordedRef.current = false;
      sessionIdRef.current = crypto.randomUUID();
      setLocked(false);
      setOpenIndices([]);
      setMatchedIds([]);
      setMoves(0);
      setCombo(0);
      setFeedbackFx(null);
      setCards(buildDeck(items));
    },
    [clearPendingTimer],
  );

  useEffect(() => {
    if (vocabSet) {
      resetRound(vocabSet.items);
    }
    return () => {
      clearPendingTimer();
    };
  }, [clearPendingTimer, resetRound, vocabSet]);

  if (!vocabSet) {
    return (
      <AppShell activeNav="study" className="standard-page">
        <PageHeader backTo="/livro/intro/vocabulario" title="Jogo da Memória" />
        <div className="activity-page-container">
          <section className="empty-state">
            <h2 className="empty-state__title">Conjunto não encontrado</h2>
            <p className="empty-state__body">
              Volte ao vocabulário do Livro Intro para escolher um conjunto.
            </p>
            <button
              className="btn-3d-primary"
              onClick={() => navigate("/livro/intro/vocabulario")}
              type="button"
            >
              Voltar ao vocabulário
            </button>
          </section>
        </div>
      </AppShell>
    );
  }

  const totalPairs = Math.floor(cards.length / 2);
  const done = totalPairs > 0 && matchedIds.length === totalPairs;
  const progress =
    totalPairs > 0 ? Math.round((matchedIds.length / totalPairs) * 100) : 0;

  function handleCardClick(index: number) {
    if (lockedRef.current || done) return;
    const card = cards[index];
    if (!card) return;
    if (matchedIds.includes(card.pairId) || openIndices.includes(index)) return;

    const nextOpen = [...openIndices, index];
    setOpenIndices(nextOpen);

    if (nextOpen.length < 2) return;

    lockedRef.current = true;
    setLocked(true);
    setMoves((prev) => prev + 1);

    const [firstIdx, secondIdx] = nextOpen;
    const first = cards[firstIdx];
    const second = cards[secondIdx];

    if (
      first &&
      second &&
      first.pairId === second.pairId &&
      first.side !== second.side
    ) {
      const nextMatched = [...matchedIds, first.pairId];
      setMatchedIds(nextMatched);
      setOpenIndices([]);
      setCombo((prev) => prev + 1);
      setFeedbackFx({ id: Date.now(), kind: "match" });
      lockedRef.current = false;
      setLocked(false);

      if (nextMatched.length === totalPairs && !completionRecordedRef.current) {
        completionRecordedRef.current = true;
        void recordGameRoundEngagement(
          sessionIdRef.current,
          "vocabulary",
          ROUND_XP,
          totalPairs,
        );
      }
      return;
    }

    setCombo(0);
    setFeedbackFx({ id: Date.now(), kind: "mismatch" });
    clearPendingTimer();
    mismatchTimerRef.current = setTimeout(() => {
      mismatchTimerRef.current = null;
      setOpenIndices([]);
      setFeedbackFx(null);
      lockedRef.current = false;
      setLocked(false);
    }, MISMATCH_DELAY_MS);
  }

  return (
    <AppShell className="memory-session-page" hideNavigation>
      <header className="fc-topbar">
        <button
          aria-label="Voltar para Vocabulário"
          className="icon-btn-minimal"
          onClick={() => navigate("/livro/intro/vocabulario")}
          type="button"
        >
          <AppIcon name="close" size={20} strokeWidth={1.8} />
        </button>

        <div
          aria-label={`Pares encontrados: ${matchedIds.length} de ${totalPairs}`}
          aria-valuemax={totalPairs}
          aria-valuemin={0}
          aria-valuenow={matchedIds.length}
          className="fc-topbar__progress"
          role="progressbar"
        >
          <span className="fc-topbar__fill" style={{ width: `${progress}%` }} />
        </div>

        <span className="fc-counter-pill">
          {matchedIds.length}/{totalPairs}
        </span>
      </header>

      <div className="memory-body">
        <div className="memory-stats">
          <span>
            <strong>{vocabSet.title}</strong> · Combine {totalPairs} pares
          </span>
          {combo >= 2 && (
            <span className="combo-pill" aria-live="polite">
              {combo} pares seguidos!
            </span>
          )}
          <span>
            Tentativas: <strong>{moves}</strong>
          </span>
        </div>

        {done && (
          <section className="activity-completion" role="status">
            <span className="activity-completion__icon" aria-hidden="true">
              <AppIcon name="check" size={30} />
            </span>
            <span className="activity-completion__kicker">
              Rodada concluída · +{ROUND_XP} XP
            </span>
            <h3>Todos os pares encontrados em {moves} tentativas!</h3>
            <p>Continue treinando para fixar o vocabulário em inglês.</p>
            <div className="activity-completion__actions">
              <button
                className="btn-3d-primary"
                onClick={() => resetRound(vocabSet.items)}
                type="button"
              >
                <AppIcon name="refresh" size={18} />
                <span>Jogar novamente</span>
              </button>
              <button
                className="btn-pill-outline"
                onClick={() => navigate("/livro/intro/vocabulario")}
                type="button"
              >
                <AppIcon name="book" size={18} />
                <span>Outros conjuntos</span>
              </button>
            </div>
          </section>
        )}

        <div className="memory-grid">
          {cards.map((card, index) => {
            const isMatched = matchedIds.includes(card.pairId);
            const isOpen = openIndices.includes(index);
            const isRevealed = isMatched || isOpen;
            const isMismatching =
              isOpen && locked && feedbackFx?.kind === "mismatch";
            return (
              <button
                aria-label={
                  isRevealed
                    ? `${card.side === "en" ? card.item.en : card.item.pt}`
                    : `Virar carta ${index + 1}`
                }
                aria-pressed={isRevealed}
                className={`memory-tile${isRevealed ? " is-revealed" : ""}${
                  isMatched ? " is-matched" : ""
                }${isMismatching ? " is-mismatching" : ""}`}
                disabled={isMatched || locked || openIndices.includes(index)}
                key={card.uid}
                onClick={() => handleCardClick(index)}
                type="button"
              >
                {isRevealed ? (
                  card.side === "en" ? (
                    <>
                      <BookVisual item={card.item} size={46} />
                      <strong className="memory-tile__text">{card.item.en}</strong>
                      <small className="memory-tile__lang">EN-US</small>
                    </>
                  ) : (
                    <>
                      <span className="memory-tile__lang">PT-BR</span>
                      <strong className="memory-tile__text">{card.item.pt}</strong>
                    </>
                  )
                ) : (
                  <span className="memory-tile__back-emblem" aria-hidden="true">
                    <AppIcon name="grid" size={20} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
