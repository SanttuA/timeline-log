import { ExternalLink } from 'lucide-react';

import type { Entry } from '../../shared/types';

type EntryCardProps = {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onOpenLink: (url: string) => void;
};

export function EntryCard({ entry, onEdit, onOpenLink }: EntryCardProps) {
  return (
    <button
      className="entry-card"
      type="button"
      data-testid="entry-card"
      onClick={() => onEdit(entry)}
    >
      <span className="entry-date">{entry.entryDate}</span>
      <span className="entry-company">{entry.company}</span>
      <span className="entry-title">{entry.title}</span>
      {entry.notes ? <span className="entry-notes">{entry.notes}</span> : null}
      {entry.link ? (
        <span
          className="entry-link"
          role="button"
          tabIndex={0}
          title="Open link"
          aria-label={`Open link for ${entry.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpenLink(entry.link);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              onOpenLink(entry.link);
            }
          }}
        >
          <ExternalLink aria-hidden="true" size={15} />
        </span>
      ) : null}
    </button>
  );
}
