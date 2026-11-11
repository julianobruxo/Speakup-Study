import type { ReactNode, RefObject } from "react";
import type { GrammarPracticeQuestion } from "../content/model/content";
import { getPresentTobeStudyContext } from "../services/sessions/presentTobeStudy";
import AppDialog from "./AppDialog";
import { PrimaryButton } from "./AppShell";

interface PresentTobeStudyDialogProps {
  onClose: () => void;
  open: boolean;
  question: GrammarPracticeQuestion;
  selectedAnswer: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export default function PresentTobeStudyDialog({
  onClose,
  open,
  question,
  selectedAnswer,
  triggerRef,
}: PresentTobeStudyDialogProps) {
  const context = getPresentTobeStudyContext(question, selectedAnswer);

  function closeAndRestoreFocus() {
    onClose();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <AppDialog
      actions={
        <PrimaryButton onClick={closeAndRestoreFocus}>
          Voltar ao jogo
        </PrimaryButton>
      }
      className="study-dialog"
      description="Revise a regra relacionada ao erro e consulte o guia completo."
      onClose={closeAndRestoreFocus}
      open={open}
      title="Verbo TO BE — presente"
    >
      <div className="study-guide-content">
        <section className="study-context" aria-labelledby="study-context-title">
          <span>{context.categoryLabel}</span>
          <h3 id="study-context-title">Entenda esta questão</h3>
          {context.subject && (
            <p>
              Nesta questão, o sujeito aparente é <b>“{context.subject}”</b>.
            </p>
          )}
          <p>
            A resposta correta é <b>“{question.correctAnswer}”</b>. Você escolheu{" "}
            <b>“{selectedAnswer}”</b>.
          </p>
          <p>{context.rule}</p>
          <div className="study-examples">
            {context.examples.map((example) => (
              <code key={example}>{example}</code>
            ))}
          </div>
        </section>

        <section className="study-guide" aria-labelledby="study-guide-title">
          <div className="study-guide-heading">
            <span>Guia completo</span>
            <h3 id="study-guide-title">Como usar o Present TO BE</h3>
          </div>

          <StudySection title="Am, is e are">
            <ul>
              <li><b>I</b> → am</li>
              <li><b>he / she / it</b> → is</li>
              <li><b>you / we / they</b> → are</li>
            </ul>
            <p>
              Um substantivo singular normalmente usa <b>is</b>; um plural usa{" "}
              <b>are</b>. Dois sujeitos ligados por <b>and</b> normalmente usam{" "}
              <b>are</b>.
            </p>
          </StudySection>

          <StudySection title="Frases afirmativas">
            <ExampleList
              examples={[
                "I am ready.",
                "She is a teacher.",
                "The books are new.",
                "Pedro and Ana are at school.",
              ]}
            />
          </StudySection>

          <StudySection title="Frases negativas">
            <p>Coloque <b>not</b> depois de am, is ou are.</p>
            <ExampleList
              examples={[
                "I am not tired.",
                "He is not at home.",
                "He isn't at home.",
                "They are not busy.",
                "They aren't busy.",
              ]}
            />
          </StudySection>

          <StudySection title="Perguntas">
            <p>Inverta a ordem: am, is ou are vem antes do sujeito.</p>
            <ExampleList
              examples={["Am I late?", "Is she your sister?", "Are they ready?"]}
            />
          </StudySection>

          <StudySection title="Respostas curtas">
            <ExampleList
              examples={[
                "Yes, I am.",
                "No, I'm not.",
                "Yes, he is.",
                "No, she isn't.",
                "Yes, they are.",
                "No, they aren't.",
              ]}
            />
          </StudySection>

          <StudySection title="Contrações">
            <p>
              Formas padrão: <b>I'm, you're, he's, she's, it's, we're, they're,
              isn't</b> e <b>aren't</b>.
            </p>
          </StudySection>

          <StudySection title="Concordância com o sujeito">
            <p>
              Encontre o núcleo do sujeito. Palavras depois de <b>of</b> ou{" "}
              <b>in</b> podem dar contexto sem controlar o verbo.
            </p>
            <ExampleList
              examples={[
                "The list of names is here.",
                "The names on the list are correct.",
              ]}
            />
          </StudySection>

          <StudySection title="Erros comuns">
            <div className="common-errors">
              <ErrorPair wrong="I is ready." correct="I am ready." />
              <ErrorPair wrong="They is here." correct="They are here." />
              <ErrorPair wrong="She are tired." correct="She is tired." />
              <ErrorPair wrong="Are she ready?" correct="Is she ready?" />
            </div>
          </StudySection>
        </section>
      </div>
    </AppDialog>
  );
}

function StudySection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="study-section">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function ExampleList({ examples }: { examples: string[] }) {
  return (
    <div className="study-examples">
      {examples.map((example) => (
        <code key={example}>{example}</code>
      ))}
    </div>
  );
}

function ErrorPair({ correct, wrong }: { correct: string; wrong: string }) {
  return (
    <div>
      <span><b aria-hidden="true">×</b> {wrong}</span>
      <span><b aria-hidden="true">✓</b> {correct}</span>
    </div>
  );
}

