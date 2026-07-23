# Speak UP Study

Aplicacao publica e guest-first para pratica de ingles. O MVP atual oferece
sessoes completas de Present TO BE com feedback pedagogico e progresso local.

## Requisitos

- Node.js 22 ou versao compativel com Vite 8
- npm

## Instalacao

```bash
npm ci
```

## Desenvolvimento

```bash
npm run dev
```

O Vite informa a URL local ao iniciar.

## Validacao

Com o servidor de desenvolvimento ativo:

```bash
node scripts/validateContent.mjs
npm run lint
npm run build
node scripts/smokeUi.mjs
```

## Estado Atual

- `present_tobe` e o unico topico gramatical funcional.
- O banco possui 130 questoes: 50 `easy` e 80 `medium`.
- Outros topicos, jogos e pratica de vocabulario permanecem em "Em breve".
- O progresso e salvo somente no navegador/dispositivo atual.
- Nao ha login, backend, sincronizacao, analytics ou ranking global.
