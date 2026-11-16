# Backlog

## Alta prioridade

### Usar a voz do navegador (speechSynthesis) no áudio

- **Situação:** Decidido, ainda não implementado.
- **Decisão mudou:** não haverá serviço pago nem chave de API. O app passa a usar a voz grátis do navegador (`speechSynthesis`), em inglês americano.
- **Atenção:** a qualidade varia conforme o aparelho e o navegador.
- **Item antigo revogado:** o item anterior ("Substituir o TTS atual por voz neural de alta qualidade") foi substituído. A frase "não usar `speechSynthesis`" dele foi revogada pelo Juliano.
- **Contexto:** os 482 MP3 atuais foram gerados com a voz SLT do Flite/FFmpeg, avaliada em **5/10**. A pronúncia de formas como `read` /riːd/ × /red/ precisa ser conferida com a voz do navegador.

## Decisões a implementar

Todos os itens abaixo estão com situação **Decidido, não implementado**, salvo onde indicado.

- **Sentence lab:** deve marcar "I went home tomorrow." como erro.
- **Present TO BE:** os itens B2 viram desafio opcional.
- **Simple Past:** lie/lay e afins viram desafio opcional.
- **Idioma das instruções:** português no nível mais básico e inglês no B1.
- **Sotaque americano em todo o app:** inclui trocar "travelled" por "traveled" no quiz e trocar os links de gramática britânica.
- **Liga:** ranking com jogadores reais mais bots. Depende de login.
- **Jogos complexos:** remover o código (`src/games`).
- **Nome do app:** trocar "Inglês em Jogo" por "Speak Up Study" no logotipo e em `package.json` (hoje o pacote se chama `ingles-em-jogo`).
- **Conteúdo da escola:** ligar o conteúdo de `src/content/school/` ao app.
- **24 fotos das partes do corpo:** decisão em aberto sobre o que fazer com as fotos atuais.

## Pendências técnicas

- 6 áudios MP3 desatualizados.
- `node checks/verify.cjs` falhando.
- `dist/index.html` versionado no Git.
- Os 3 logs do Vite (`.codex-vite.log`, `vite-dev.stderr.log`, `vite-dev.stdout.log`) estão fora do `.gitignore`.
- Criar um validador para `src/content/school/`.
- Existem dois arquivos `irregularVerbs.ts` (um em `src/content/data/` e outro em `src/content/school/`).
- A referência local `refs/remotes/bundle/temp` já pode ser removida.

## Revisão do professor

- Tópico There is / There are (`src/content/school/`): o texto foi escrito do zero e precisa de revisão antes de ir para os alunos.
