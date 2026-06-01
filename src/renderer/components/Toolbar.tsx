import { Moon, Plus, Search, Sun } from 'lucide-react';

type ToolbarProps = {
  query: string;
  theme: 'dark' | 'light';
  onQueryChange: (query: string) => void;
  onToggleTheme: () => void;
  onAddPeriod: () => void;
};

export function Toolbar({ query, theme, onQueryChange, onToggleTheme, onAddPeriod }: ToolbarProps) {
  const themeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

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

      <div className="toolbar-actions">
        <button
          className="icon-button"
          type="button"
          title={themeLabel}
          aria-label={themeLabel}
          data-testid="theme-toggle-button"
          onClick={onToggleTheme}
        >
          <ThemeIcon aria-hidden="true" size={18} />
        </button>
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
      </div>
    </header>
  );
}
