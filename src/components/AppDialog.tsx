import {
  useEffect,
  useId,
  useRef,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import AppIcon from "./AppIcon";

interface AppDialogProps {
  actions?: ReactNode;
  className?: string;
  description?: string;
  onClose: () => void;
  open: boolean;
  title: string;
}

export default function AppDialog({
  actions,
  children,
  className = "",
  description,
  onClose,
  open,
  title,
}: PropsWithChildren<AppDialogProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.classList.add("dialog-open");
    }
    if (!open && dialog.open) {
      dialog.close();
      document.body.classList.remove("dialog-open");
    }
    return () => document.body.classList.remove("dialog-open");
  }, [open]);

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      aria-modal="true"
      className={`app-dialog ${className}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={dialogRef}
    >
      <div className="dialog-panel">
        <div className="dialog-header">
          <button
            aria-label="Fechar"
            className="dialog-close icon-button"
            onClick={onClose}
          >
            <AppIcon name="close" size={20} />
          </button>
          <h2 id={titleId}>{title}</h2>
          {description && <p id={descriptionId}>{description}</p>}
        </div>
        {children && <div className="dialog-content">{children}</div>}
        {actions && <div className="dialog-actions">{actions}</div>}
      </div>
    </dialog>
  );
}
