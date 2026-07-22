import GlassCard from "../components/GlassCard";

// TODO: flashcards (termo em inglês + som na frente, tradução + imagem/emoji
// no verso), no formato do speakit-app. Conteúdo e áudio ainda não migrados.
export default function VocabularyPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 gap-4 text-center">
      <GlassCard className="max-w-sm">
        <h2 className="font-display font-semibold text-lg mb-2">Vocabulário</h2>
        <p className="text-cream/70 text-sm">
          Flashcards ainda não implementados — esqueleto de rota pronto.
        </p>
      </GlassCard>
    </div>
  );
}
