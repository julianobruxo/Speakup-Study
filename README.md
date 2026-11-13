# Speak Up · Study App

Site de estudo que integra o laboratório Simple Past ao conteúdo funcional de `julianobruxo/Speakup-Study`, referência lida no commit `2547adda3db0a05959f2fa1cf377918d5df6b6eb`.

## Conteúdo

- 104 verbos do PDF fornecido pelo usuário, com áudio separado de base, passado e particípio.
- Laboratório de Simple Past com 60 lacunas, expressões de tempo, revisão de escrita por regras e revisão final em 5 níveis.
- Cursos de Simple Present, Present Continuous, Be Going To e There Is / There Are. Cada curso tem 4 explicações, 20 questões em 5 níveis e revisão final de 10 questões. Os níveis 3–5 combinam múltipla escolha com produção escrita de negativas, perguntas e frases completas.
- 130 questões de Present TO BE (50 fáceis / 80 médias) e 24 flashcards de partes do corpo.
- Progresso original preservado em `speakup-past-v1`; os indicadores do laboratório aparecem também na área Progresso. Os novos cursos salvam respostas, precisão, níveis e revisões em `speakup-grammar-courses-v1` e participam do XP e da missão diária.

Os jogos e os 5 sets de memória continuam no repositório para possível retomada, mas as rotas, cards e itens de navegação estão desativados. Conteúdo incompleto não entra na biblioteca principal; quando aparece como parte do roadmap, recebe o label **Em breve**.

## Áudio

482 arquivos MP3 de TTS em inglês, gerados com a voz SLT do Flite disponível no FFmpeg. Não usa Web Speech API ou serviço externo em execução. O aluno pode ouvir cada forma ou a sequência completa e escolher velocidade normal ou lenta. `read` tem áudio /riːd/ para base e /red/ para passado/particípio. A substituição por uma voz neural está registrada no `BACKLOG.md` porque a qualidade atual foi avaliada em 5/10.

`node scripts/generate-audio.mjs` reproduz os arquivos. Navegadores podem bloquear reprodução automática; o botão Ouvir inicia a reprodução pelo gesto do aluno.

## Integração

O shell React, os bancos e os jogos vêm da referência. O módulo anterior vive em `public/past` e é exibido como conteúdo da mesma navegação. Eventos de navegação e altura validam origem e janela remetente. Não foram feitas alterações no repositório GitHub original.

A revisão de escrita é limitada a regras de Simple Past e sinaliza casos não reconhecidos. A liga da referência é local, com participantes simulados, explicitamente identificados.

## Verificação

- `node checks/verify.cjs`
- `node checks/validate-repo-content.mjs`
- `node checks/verify-audio.mjs`
- `node checks/validate-learning-path.mjs`
- `npm run build`
- QA de navegação, áudio, gramática, flashcards, feedback e revisão pelo navegador.
