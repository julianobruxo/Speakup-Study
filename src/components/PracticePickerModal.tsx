import { useEffect, type ReactNode } from "react";
import AppIcon from "./AppIcon";
import "../styles/estudar.css";

const OPTION_TONES = ["orange", "green", "cyan", "purple"] as const;

export interface PracticePickerOption {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  onSelect: () => void;
}

interface PracticePickerModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  options: PracticePickerOption[];
  onClose: () => void;
}

export default function PracticePickerModal({
  open,
  title,
  subtitle,
  options,
  onClose,
}: PracticePickerModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="practice-picker-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        aria-labelledby="practice-picker-title"
        aria-modal="true"
        className="practice-picker-modal"
        role="dialog"
      >
        <div className="practice-picker-head">
          <div className="practice-picker-head__copy">
            <span className="practice-picker-kicker">Escolha o formato</span>
            <h2 id="practice-picker-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            aria-label="Fechar"
            className="practice-picker-close"
            onClick={onClose}
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="20"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="20"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="practice-picker-options">
          {options.map((option, idx) => {
            const tone = OPTION_TONES[idx % 4];
            return (
              <button
                className="practice-picker-option"
                key={option.id}
                onClick={option.onSelect}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className={`category-badge category-badge--sm category-badge--${tone}`}
                  style={{ color: "#FFFFFF" }}
                >
                  {option.icon}
                </span>
                <span className="practice-picker-copy">
                  <strong>{option.title}</strong>
                  <span>{option.description}</span>
                </span>
                <span className="practice-picker-arrow" aria-hidden="true">
                  <AppIcon name="chevron-right" size={18} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
