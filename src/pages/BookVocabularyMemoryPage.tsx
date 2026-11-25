import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader, PrimaryButton } from "../components/AppShell";
import { BookVisual } from "../components/BookVisual";
import {
  getIntroVocabularySet,
  type BookVocabularyItem,
} from "../content/books/intro";
import {
  cancelPronunciation,
  speakEnglish,
} from "../services/audio/pronunciation";
import { recordGameRoundEngagement } from "../services/progress/engagement";

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
  const chosen = shuffleCards(items).slice(0, Math.min(PAIRS_PER_ROUND, items.length));
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
  const [locked, setLocked] = useState(false);

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
      cancelPronunciation();
      lockedRef.current = false;
      completionRecordedRef.current = false;
      sessionIdRef.current = crypto.randomUUID();
      setLocked(false);
      setOpenIndices([]);
      setMatchedIds([]);
      setMoves(0);
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
      cancelPronunciation();
    };
  }, [clearPendingTimer, resetRound, vocabSet]);

  if (!vocabSet) {
    return (
      <AppShell activeNav="study" className="standard-page">
        <PageHeader backTo="/livro/intro/vocabulario" title="Jogo da Memória" />
        <section className="empty-state">
          <h2>Conjunto não encontrado</h2>
          <PrimaryButton onClick={() => navigate("/livro/intro/vocabulario")}>
            Voltar ao vocabulário
          </PrimaryButton>
        </section>
      </AppShell>
    );
  }

  const totalPairs = Math.floor(cards.length / 2);
  const done = totalPairs > 0 && matchedIds.length === totalPairs;

  function handleCardClick(index: number) {
    if (lockedRef.current || done) return;
    const card = cards[index];
    if (!card) return;
    if (matchedIds.includes(card.pairId) || openIndices.includes(index)) return;

    if (card.side === "en") {
      speakEnglish(card.item.en);
    }

    const nextOpen = [...openIndices, index];
    setOpenIndices(nextOpen);

    if (nextOpen.length < 2) return;

    lockedRef.current = true;
    setLocked(true);
    setMoves((prev) => prev + 1);

    const [firstIdx, secondIdx] = nextOpen;
    const first = cards[firstIdx];
    const second = cards[secondIdx];

    if (first && second && first.pairId === second.pairId && first.side !== second.side) {
      const nextMatched = [...matchedIds, first.pairId];
      setMatchedIds(nextMatched);
      setOpenIndices([]);
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

    clearPendingTimer();
    mismatchTimerRef.current = setTimeout(() => {
      mismatchTimerRef.current = null;
      setOpenIndices([]);
      lockedRef.current = false;
      setLocked(false);
    }, MISMATCH_DELAY_MS);
  }

  return (
    <AppShell className="standard-page" hideNavigation>
      <PageHeader
        onBack={() => navigate("/livro/intro/vocabulario")}
        title={`Memória · ${vocabSet.title}`}
      />

      <section className="page-lead compact">
        <span className="eyebrow">Livro Intro · Vocabulário</span>
        <h2>Encontre os {totalPairs} pares</h2>
        <p>
          Combine a carta em inglês com a tradução em português. Tentativas:{" "}
          <strong>{moves}</strong> · Pares encontrados:{" "}
          <strong>
            {matchedIds.length}/{totalPairs}
          </strong>
        </p>
      </section>

      {done && (
        <section className="section-card" role="status" style={{ marginBottom: 18 }}>
          <span className="eyebrow">Rodada concluída · +{ROUND_XP} XP</span>
          <h3>Parabéns! Todos os pares encontrados em {moves} tentativas.</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
            <PrimaryButton
              icon={<AppIcon name="refresh" size={18} />}
              onClick={() => resetRound(vocabSet.items)}
            >
              Jogar novamente
            </PrimaryButton>
            <PrimaryButton
              icon={<AppIcon name="book" size={18} />}
              onClick={() => navigate("/livro/intro/vocabulario")}
              variant="secondary"
            >
              Outros conjuntos
            </PrimaryButton>
          </div>
        </section>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))",
          gap: 12,
        }}
      >
        {cards.map((card, index) => {
          const isMatched = matchedIds.includes(card.pairId);
          const isRevealed = isMatched || openIndices.includes(index);
          return (
            <button
              aria-label={
                isRevealed
                  ? `${card.side === "en" ? card.item.en : card.item.pt}`
                  : `Virar carta ${index + 1}`
              }
              aria-pressed={isRevealed}
              className="section-card"
              disabled={isMatched || locked || openIndices.includes(index)}
              key={card.uid}
              onClick={() => handleCardClick(index)}
              style={{
                minHeight: 132,
                padding: 12,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                gap: 6,
                cursor: isMatched ? "default" : "pointer",
                opacity: isMatched ? 0.72 : 1,
                border: isMatched
                  ? "2px solid #16a34a"
                  : isRevealed
                    ? "2px solid #2563eb"
                    : undefined,
              }}
              type="button"
            >
              {isRevealed ? (
                card.side === "en" ? (
                  <>
                    <BookVisual item={card.item} size={48} />
                    <strong>{card.item.en}</strong>
                    <small>EN-US</small>
                  </>
                ) : (
                  <>
                    <span className="eyebrow">PT-BR</span>
                    <strong>{card.item.pt}</strong>
                  </>
                )
              ) : (
                <AppIcon name="grid" size={24} />
              )}
            </button>
          );
        })}
      </div>
    </AppShell>
  );
}
