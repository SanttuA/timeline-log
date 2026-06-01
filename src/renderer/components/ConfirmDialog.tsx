import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

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

  if (!state) {
    return null;
  }

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

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel compact" role="alertdialog" aria-label={state.title}>
        <div className="modal-header">
          <h2>
            <AlertTriangle aria-hidden="true" size={20} />
            <span>{state.title}</span>
          </h2>
        </div>
        <p className="confirm-message">{state.message}</p>
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
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
      </section>
    </div>
  );
}
