import { CalendarPlus, Save, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

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

  if (!state) {
    return null;
  }

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

  return (
    <div className="modal-backdrop" role="presentation">
      <form
        className="modal-panel"
        aria-label={state.mode === 'edit' ? 'Edit period' : 'Add period'}
        onSubmit={handleSubmit}
      >
        <div className="modal-header">
          <h2>
            <CalendarPlus aria-hidden="true" size={20} />
            <span>{state.mode === 'edit' ? 'Edit period' : 'Add period'}</span>
          </h2>
          <button className="icon-button" type="button" title="Close" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <label className="field">
          <span>Name</span>
          <input
            data-testid="period-name-input"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            maxLength={120}
            required
            autoFocus
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Start date</span>
            <input
              data-testid="period-start-input"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.currentTarget.value)}
              required
            />
          </label>
          <label className="field">
            <span>End date</span>
            <input
              data-testid="period-end-input"
              type="date"
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
    </div>
  );
}
