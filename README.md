# Speak Up Study

App web de estudo de inglês para os alunos da escola, do nível básico ao intermediário. Reúne explicações de gramática, atividades, vocabulário e jogos simples (embaralhar palavras, flashcards e jogo da memória).

O laboratório Simple Past (`public/past`) está integrado à navegação do app. Origem: repositório `julianobruxo/Speakup-Study`, commit `2547adda3db0a05959f2fa1cf377918d5df6b6eb`.

## Conteúdo

- 104 verbos do PDF fornecido pelo usuário, com áudio separado de base, passado e particípio.
- Laboratório de Simple Past com 60 lacunas, expressões de tempo, revisão de escrita por regras e revisão final em 5 níveis.
- Cursos de Simple Present, Present Continuous, Be Going To e There Is / There Are. Cada curso tem 4 explicações, 20 questões em 5 níveis e revisão final de 10 questões. Os níveis 3–5 combinam múltipla escolha com produção escrita de negativas, perguntas e frases completas.
- 130 questões de Present TO BE (50 fáceis / 80 médias) e 24 flashcards de partes do corpo.
- Progresso original preservado em `speakup-past-v1`; os indicadores do laboratório aparecem também na área Progresso. Os novos cursos salvam respostas, precisão, níveis e revisões em `speakup-grammar-courses-v1` e participam do XP e da missão diária.

Os jogos e os 5 sets de memória continuam no repositório para possível retomada, mas as rotas, cards e itens de navegação estão desativados. Conteúdo incompleto não entra na biblioteca principal; quando aparece como parte do roadmap, recebe o label **Em breve**.

Decidido, ainda não implementado: os jogos complexos saem do app; ficam apenas embaralhar palavras, flashcards e jogo da memória. O código dos jogos complexos (`src/games`) continua no repositório até a remoção.

### Conteúdo importado da escola

Foi importado o conteúdo do app da escola (repositório `speakup-school-manager`, commit `4c897ce`):

- `src/content/school/`: 10 tópicos de gramática, 10 conjuntos de vocabulário (229 itens), 50 verbos de ação, 100 verbos irregulares, alfabeto e números.
- `public/study-area/flashcards/`: 151 imagens JPG da Pixabay e 15 SVG, com os créditos em `ATTRIBUTIONS.md`.

Esse conteúdo ainda **não** está ligado ao app. As correções feitas na importação estão listadas em `src/content/school/CORRECTIONS.md`. O texto do tópico There is / There are foi escrito do zero e precisa de revisão do professor antes de ir para os alunos.

## Áudio

482 arquivos MP3 de TTS em inglês, gerados com a voz SLT do Flite disponível no FFmpeg. O aluno pode ouvir cada forma ou a sequência completa e escolher velocidade normal ou lenta. `read` tem áudio /riːd/ para base e /red/ para passado/particípio. A qualidade atual foi avaliada em 5/10 (ver `BACKLOG.md`).

Decidido, ainda não implementado: o app passará a usar a voz grátis do navegador (speechSynthesis), em inglês americano, sem chave de API e sem serviço pago.

`node scripts/generate-audio.mjs` reproduz os arquivos. Navegadores podem bloquear reprodução automática; o botão Ouvir inicia a reprodução pelo gesto do aluno.

## Integração

O shell React e os bancos vêm da referência; o código dos jogos complexos continua no repositório até ser removido (decidido, ainda não implementado). O módulo anterior vive em `public/past` e é exibido como conteúdo da mesma navegação. Eventos de navegação e altura validam origem e janela remetente. Não foram feitas alterações no repositório GitHub original.

A revisão de escrita é limitada a regras de Simple Past e sinaliza casos não reconhecidos. A liga da referência é local, com participantes simulados, explicitamente identificados.

Decidido, ainda não implementado: ranking com os jogadores que usam o app mais avatares fictícios (bots). O ranking com jogadores reais depende de login e de um lugar para guardar pontuações, que o app ainda não tem.

## Verificação

- `node checks/verify.cjs`
- `node checks/validate-repo-content.mjs`
- `node checks/verify-audio.mjs`
- `node checks/validate-learning-path.mjs`
- `npm run build`
- QA de navegação, áudio, gramática, flashcards, feedback e revisão pelo navegador.

Observações:

- `node checks/verify.cjs` já falhava antes e continua pendente.
- Nenhum validador cobre `src/content/school/`.
