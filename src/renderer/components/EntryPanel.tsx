import { Save, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { clampDateToRange, formatDateRange, todayDateString } from '../../shared/date';
import type { Entry, EntryInput, EntryUpdateInput, TimelinePeriod } from '../../shared/types';

export type EntryPanelState =
  | {
      mode: 'create';
      period: TimelinePeriod;
    }
  | {
      mode: 'edit';
      period: TimelinePeriod;
      entry: Entry;
    }
  | null;

type EntryPanelProps = {
  state: EntryPanelState;
  onClose: () => void;
  onSave: (input: EntryInput | EntryUpdateInput) => Promise<void>;
  onDelete: (entry: Entry) => void;
};

export function EntryPanel({ state, onClose, onSave, onDelete }: EntryPanelProps) {
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!state) {
      return;
    }

    if (state.mode === 'edit') {
      setCompany(state.entry.company);
      setTitle(state.entry.title);
      setEntryDate(state.entry.entryDate);
      setLink(state.entry.link);
      setNotes(state.entry.notes);
      return;
    }

    setCompany('');
    setTitle('');
    setEntryDate(clampDateToRange(todayDateString(), state.period.startDate, state.period.endDate));
    setLink('');
    setNotes('');
  }, [state]);

  if (!state) {
    return null;
  }

  const activeState = state;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);

    const baseInput: EntryInput = {
      periodId: activeState.period.id,
      company,
      title,
      entryDate,
      link,
      notes,
    };

    try {
      await onSave(
        activeState.mode === 'edit' ? { ...baseInput, id: activeState.entry.id } : baseInput,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <aside
      className="side-panel"
      aria-label={activeState.mode === 'edit' ? 'Edit entry' : 'Add entry'}
    >
      <form onSubmit={handleSubmit}>
        <div className="side-panel-header">
          <div>
            <h2>{activeState.mode === 'edit' ? 'Edit entry' : 'Add entry'}</h2>
            <p>
              {activeState.period.name} ·{' '}
              {formatDateRange(activeState.period.startDate, activeState.period.endDate)}
            </p>
          </div>
          <button className="icon-button" type="button" title="Close" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <label className="field">
          <span>Company or institution</span>
          <input
            data-testid="entry-company-input"
            value={company}
            onChange={(event) => setCompany(event.currentTarget.value)}
            maxLength={160}
            required
            autoFocus
          />
        </label>

        <label className="field">
          <span>Title</span>
          <input
            data-testid="entry-title-input"
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            maxLength={180}
            required
          />
        </label>

        <label className="field">
          <span>Date</span>
          <input
            data-testid="entry-date-input"
            type="date"
            value={entryDate}
            min={activeState.period.startDate}
            max={activeState.period.endDate}
            onChange={(event) => setEntryDate(event.currentTarget.value)}
            required
          />
        </label>

        <label className="field">
          <span>Link</span>
          <input
            data-testid="entry-link-input"
            value={link}
            onChange={(event) => setLink(event.currentTarget.value)}
            maxLength={2048}
            placeholder="https://example.com"
          />
        </label>

        <label className="field">
          <span>Description or notes</span>
          <textarea
            data-testid="entry-notes-input"
            value={notes}
            onChange={(event) => setNotes(event.currentTarget.value)}
            maxLength={6000}
            rows={8}
          />
        </label>

        <div className="side-panel-actions">
          {activeState.mode === 'edit' ? (
            <button
              className="secondary-button danger"
              type="button"
              data-testid="entry-delete-button"
              onClick={() => onDelete(activeState.entry)}
            >
              <Trash2 aria-hidden="true" size={17} />
              <span>Delete</span>
            </button>
          ) : (
            <span />
          )}
          <button
            className="primary-button"
            type="submit"
            data-testid="entry-save-button"
            disabled={submitting}
          >
            <Save aria-hidden="true" size={17} />
            <span>Save entry</span>
          </button>
        </div>
      </form>
    </aside>
  );
}
