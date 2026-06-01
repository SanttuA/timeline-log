import { Plus } from 'lucide-react';

type EmptyStateProps = {
  query: string;
  onAddPeriod: () => void;
};

export function EmptyState({ query, onAddPeriod }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <h2>{query ? 'No matching entries' : 'No periods yet'}</h2>
      <p>
        {query
          ? 'Try a different search term or add another entry.'
          : 'Create the first timerange period to start logging entries.'}
      </p>
      {!query ? (
        <button className="primary-button" type="button" onClick={onAddPeriod}>
          <Plus aria-hidden="true" size={18} />
          <span>Add period</span>
        </button>
      ) : null}
    </section>
  );
}
