import { Edit3, Plus, Trash2 } from 'lucide-react';

import { formatDateRange } from '../../shared/date';
import type { Entry, TimelinePeriod } from '../../shared/types';
import { EntryCard } from './EntryCard';

type PeriodSectionProps = {
  period: TimelinePeriod;
  onAddEntry: (period: TimelinePeriod) => void;
  onEditPeriod: (period: TimelinePeriod) => void;
  onDeletePeriod: (period: TimelinePeriod) => void;
  onEditEntry: (entry: Entry) => void;
  onOpenLink: (url: string) => void;
};

export function PeriodSection({
  period,
  onAddEntry,
  onEditPeriod,
  onDeletePeriod,
  onEditEntry,
  onOpenLink,
}: PeriodSectionProps) {
  return (
    <article className="period-section" data-testid="period-section">
      <div className="timeline-marker" aria-hidden="true" />
      <div className="period-content">
        <div className="period-header">
          <div>
            <h2>{period.name}</h2>
            <p>{formatDateRange(period.startDate, period.endDate)}</p>
          </div>
          <div className="period-actions">
            <span className="count-pill">
              {period.entryCount} {period.entryCount === 1 ? 'entry' : 'entries'}
            </span>
            <button
              className="icon-button"
              type="button"
              title="Add entry"
              aria-label={`Add entry to ${period.name}`}
              data-testid={`add-entry-${period.id}`}
              onClick={() => onAddEntry(period)}
            >
              <Plus aria-hidden="true" size={17} />
            </button>
            <button
              className="icon-button"
              type="button"
              title="Edit period"
              aria-label={`Edit ${period.name}`}
              onClick={() => onEditPeriod(period)}
            >
              <Edit3 aria-hidden="true" size={16} />
            </button>
            <button
              className="icon-button danger"
              type="button"
              title="Delete period"
              aria-label={`Delete ${period.name}`}
              onClick={() => onDeletePeriod(period)}
            >
              <Trash2 aria-hidden="true" size={16} />
            </button>
          </div>
        </div>

        {period.entries.length > 0 ? (
          <div className="entry-grid">
            {period.entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={onEditEntry}
                onOpenLink={onOpenLink}
              />
            ))}
          </div>
        ) : (
          <button className="empty-period" type="button" onClick={() => onAddEntry(period)}>
            <Plus aria-hidden="true" size={16} />
            <span>Add the first entry for this period</span>
          </button>
        )}
      </div>
    </article>
  );
}
