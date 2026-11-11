# Speak Up · Inglês em Jogo

Site de estudo que integra o laboratório Simple Past ao conteúdo funcional de `julianobruxo/Speakup-Study`, referência lida no commit `2547adda3db0a05959f2fa1cf377918d5df6b6eb`.

## Conteúdo

- 104 verbos do PDF fornecido pelo usuário, com áudio separado de base, passado e particípio.
- 5 jogos de memória de irregulares, 60 lacunas, expressões de tempo, revisão de escrita por regras e 5 testes finais.
- 130 questões de Present TO BE (50 fáceis / 80 médias), 24 flashcards de partes do corpo e 9 jogos reutilizados da referência.
- Progresso original preservado em `speakup-past-v1`; os indicadores do laboratório aparecem também na área Progresso. XP e progresso de TO BE/vocabulário usam os serviços IndexedDB da referência.

## Áudio

482 arquivos MP3 de TTS em inglês, gerados com a voz SLT do Flite disponível no FFmpeg. Não usa Web Speech API ou serviço externo em execução. O aluno pode ouvir cada forma ou a sequência completa e escolher velocidade normal ou lenta. `read` tem áudio /riːd/ para base e /red/ para passado/particípio.

`node scripts/generate-audio.mjs` reproduz os arquivos. Navegadores podem bloquear reprodução automática; o botão Ouvir inicia a reprodução pelo gesto do aluno.

## Integração

O shell React, os bancos e os jogos vêm da referência. O módulo anterior vive em `public/past` e é exibido como conteúdo da mesma navegação. Eventos de navegação e altura validam origem e janela remetente. Não foram feitas alterações no repositório GitHub original.

O jogo de palavras cruzadas foi corrigido para não expor respostas antes da verificação e recebeu numeração e rótulos acessíveis.

A revisão de escrita é limitada a regras de Simple Past e sinaliza casos não reconhecidos. A liga da referência é local, com participantes simulados, explicitamente identificados.

## Verificação

- `node checks/verify.cjs`
- `node checks/validate-repo-content.mjs`
- `node checks/verify-audio.mjs`
- `npm run build`
- QA de navegação, áudio, gramática, flashcards e jogos pelo navegador.
