# Backlog

## Alta prioridade

### Substituir o TTS atual por voz neural de alta qualidade

- **Situação atual:** os áudios foram gerados localmente com a voz SLT do Flite/FFmpeg. A qualidade percebida foi avaliada em **5/10** e não é adequada como modelo de pronúncia para alunos.
- **Escopo:** regenerar os áudios de verbos, vocabulário, exemplos e frases com uma voz neural de inglês natural, mantendo os arquivos pré-gravados para o app não depender do navegador durante o uso.
- **Critérios mínimos:** pronúncia nativa clara, ritmo didático sem soar robótico, distinção correta de formas como `read` /riːd/ × /red/, volume consistente e revisão humana de uma amostra antes da geração completa.
- **Não fazer por enquanto:** não regenerar os 482 arquivos com outra voz provisória e não usar `speechSynthesis` do navegador como solução definitiva.
