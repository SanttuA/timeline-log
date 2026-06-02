import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';

export type ConfirmState = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
} | null;

type ConfirmDialogProps = {
  state: ConfirmState;
  onClose: () => void;
  onError: (message: string) => void;
};

export function ConfirmDialog({ state, onClose, onError }: ConfirmDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!state) {
      return;
    }

    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    cancelButtonRef.current?.focus();

    return () => {
      previouslyFocusedElementRef.current?.focus();
      previouslyFocusedElementRef.current = null;
    };
  }, [state]);

  if (!state) {
    return null;
  }

  const titleId = 'confirm-dialog-title';
  const messageId = 'confirm-dialog-message';

  async function confirm(): Promise<void> {
    setSubmitting(true);

    try {
      await state?.onConfirm();
      onClose();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unexpected error.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = getFocusableElements(event.currentTarget);

    if (focusableElements.length === 0) {
      event.preventDefault();
      event.currentTarget.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (
        document.activeElement === firstElement ||
        !event.currentTarget.contains(document.activeElement)
      ) {
        event.preventDefault();
        lastElement.focus();
      }

      return;
    }

    if (
      document.activeElement === lastElement ||
      !event.currentTarget.contains(document.activeElement)
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={handleBackdropClick}>
      <dialog
        className="modal-panel compact"
        open
        role="alertdialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onKeyDown={handleKeyDown}
      >
        <div className="modal-header">
          <h2 id={titleId}>
            <AlertTriangle aria-hidden="true" size={20} />
            <span>{state.title}</span>
          </h2>
        </div>
        <p className="confirm-message" id={messageId}>
          {state.message}
        </p>
        <div className="modal-actions">
          <button
            ref={cancelButtonRef}
            className="secondary-button"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="primary-button danger"
            type="button"
            data-testid="confirm-delete-button"
            disabled={submitting}
            onClick={confirm}
          >
            {state.confirmLabel}
          </button>
        </div>
      </dialog>
    </div>
  );
}

function getFocusableElements(element: HTMLElement): HTMLElement[] {
  return Array.from(
    element.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}
