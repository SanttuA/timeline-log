import { ExternalLink } from 'lucide-react';

import type { Entry } from '../../shared/types';

type EntryCardProps = {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onOpenLink: (url: string) => void;
};

export function EntryCard({ entry, onEdit, onOpenLink }: EntryCardProps) {
  return (
    <article className="entry-card-frame">
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
      </button>
      {entry.link ? (
        <button
          className="entry-link"
          type="button"
          title="Open link"
          aria-label={`Open link for ${entry.title}`}
          onClick={() => onOpenLink(entry.link)}
        >
          <ExternalLink aria-hidden="true" size={15} />
        </button>
      ) : null}
    </article>
  );
}
