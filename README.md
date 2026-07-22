# Speak UP Study (esqueleto)

Nome provisório. Vite + React 19 + TypeScript + Tailwind v4 + React Router +
framer-motion (instalado, ainda não usado nas transições).

## Rodar localmente

```
npm install
npm run dev
```

## O que já existe

- Design tokens da marca SpeakUp em `src/index.css` (navy/red/cream/paper)
  aplicados nos efeitos visuais herdados do projeto SpeakIt: blobs de
  gradiente animados no fundo, glass cards com borda em gradiente, glow
  button com shimmer, texto com gradiente animado.
- Componentes reutilizáveis em `src/components/`: `AppBackground`,
  `GlassCard`, `GlowButton`, `GradientText`.
- Fluxo de rotas completo (esqueleto, sem lógica real ainda):
  Login → Boas-vindas → Tutorial (swipe placeholder) → Hub → (Estudar
  tópicos | Praticar | Vocabulário) → fork "estudar tópico primeiro" vs
  "apenas praticar" dentro de cada tópico.

## O que falta migrar (do HTML antigo / speakit-app)

Ver blocos `// TODO:` espalhados pelas páginas em `src/pages/`. Resumo:

- Login Google de verdade (hoje é um botão placeholder)
- Banco de frases (600 questões, `topics_bank.json` do projeto antigo) →
  `src/data/`
- State machine dos 7 jogos (English Challenge, Beat the Clock, Memória,
  Palavras Embaralhadas, Verdadeiro ou Falso, Revelação, Soletrando) — a
  regra de negócio migra igual, o gate de 75%/roleta de prêmio NÃO migra
  (era mecânica específica da feira Multitec, foi descartada)
- Tela de estudo do tópico: conteúdo didático interativo + vídeo do
  YouTube embutido — ainda não desenhada
- Flashcards de vocabulário (termo + som na frente, tradução + imagem/
  emoji no verso), no formato do speakit-app — ainda não implementado
- Motor de som (efeitos do jogo hoje são beeps via Web Audio API no HTML
  antigo; pronúncia de palavras/verbos pode usar `speechSynthesis`
  nativo do navegador, gratuito, sem precisar de arquivo de áudio)
- Tutorial de fato swipável (hoje é botão "Próximo")
