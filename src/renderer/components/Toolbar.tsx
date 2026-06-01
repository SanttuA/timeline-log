import { Plus, Search } from 'lucide-react';

type ToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onAddPeriod: () => void;
};

export function Toolbar({ query, onQueryChange, onAddPeriod }: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="brand-block">
        <h1>Timeline Log</h1>
      </div>

      <label className="search-field" htmlFor="timeline-search">
        <Search aria-hidden="true" size={18} />
        <input
          id="timeline-search"
          data-testid="search-input"
          value={query}
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder="Search company, title, date, link, or notes"
        />
      </label>

      <button
        className="primary-button"
        type="button"
        title="Add period"
        data-testid="add-period-button"
        onClick={onAddPeriod}
      >
        <Plus aria-hidden="true" size={18} />
        <span>Add period</span>
      </button>
    </header>
  );
}
