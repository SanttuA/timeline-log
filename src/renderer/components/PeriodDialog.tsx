import { CalendarPlus, Save, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';

import type { PeriodInput, TimelinePeriod } from '../../shared/types';

export type PeriodDialogState =
  | {
      mode: 'create';
    }
  | {
      mode: 'edit';
      period: TimelinePeriod;
    }
  | null;

type PeriodDialogProps = {
  state: PeriodDialogState;
  onClose: () => void;
  onSave: (input: PeriodInput, id?: number) => Promise<void>;
};

export function PeriodDialog({ state, onClose, onSave }: PeriodDialogProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state) {
      return;
    }

    if (state.mode === 'edit') {
      setName(state.period.name);
      setStartDate(state.period.startDate);
      setEndDate(state.period.endDate);
      return;
    }

    setName('');
    setStartDate('');
    setEndDate('');
  }, [state]);

  useEffect(() => {
    if (state) {
      nameInputRef.current?.focus();
    }
  }, [state]);

  if (!state) {
    return null;
  }

  const titleId = 'period-dialog-title';
  const nameLabelId = 'period-name-label';
  const startDateLabelId = 'period-start-date-label';
  const endDateLabelId = 'period-end-date-label';

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSave(
        {
          name,
          startDate,
          endDate,
        },
        state?.mode === 'edit' ? state.period.id : undefined,
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={handleBackdropClick}>
      <dialog
        className="modal-panel"
        open
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2 id={titleId}>
              <CalendarPlus aria-hidden="true" size={20} />
              <span>{state.mode === 'edit' ? 'Edit period' : 'Add period'}</span>
            </h2>
            <button
              className="icon-button"
              type="button"
              title="Close"
              aria-label="Close period dialog"
              onClick={onClose}
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>

          <label className="field">
            <span id={nameLabelId}>Name</span>
            <input
              ref={nameInputRef}
              data-testid="period-name-input"
              aria-labelledby={nameLabelId}
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              maxLength={120}
              required
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span id={startDateLabelId}>Start date</span>
              <input
                data-testid="period-start-input"
                type="date"
                aria-labelledby={startDateLabelId}
                value={startDate}
                onChange={(event) => setStartDate(event.currentTarget.value)}
                required
              />
            </label>
            <label className="field">
              <span id={endDateLabelId}>End date</span>
              <input
                data-testid="period-end-input"
                type="date"
                aria-labelledby={endDateLabelId}
                value={endDate}
                onChange={(event) => setEndDate(event.currentTarget.value)}
                required
              />
            </label>
          </div>

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="primary-button"
              type="submit"
              data-testid="period-save-button"
              disabled={submitting}
            >
              <Save aria-hidden="true" size={17} />
              <span>Save period</span>
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
