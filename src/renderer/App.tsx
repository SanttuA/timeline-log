import { useCallback, useEffect, useMemo, useState } from 'react';

import { EntryPanel, type EntryPanelState } from './components/EntryPanel';
import { PeriodDialog, type PeriodDialogState } from './components/PeriodDialog';
import { TimelineBoard } from './components/TimelineBoard';
import { Toolbar } from './components/Toolbar';
import { ConfirmDialog, type ConfirmState } from './components/ConfirmDialog';
import type {
  Entry,
  EntryInput,
  EntryUpdateInput,
  PeriodInput,
  TimelinePeriod,
} from '../shared/types';

export function App() {
  const [periods, setPeriods] = useState<TimelinePeriod[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodDialog, setPeriodDialog] = useState<PeriodDialogState>(null);
  const [entryPanel, setEntryPanel] = useState<EntryPanelState>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const loadTimeline = useCallback(
    async (activeQuery = debouncedQuery) => {
      setLoading(true);
      setError(null);

      try {
        const result = await window.timeline.periods.list(activeQuery);
        setPeriods(result);
      } catch (loadError) {
        setError(toErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    },
    [debouncedQuery],
  );

  useEffect(() => {
    loadTimeline(debouncedQuery).catch((loadError: unknown) => {
      setError(toErrorMessage(loadError));
      setLoading(false);
    });
  }, [debouncedQuery, loadTimeline]);

  const periodById = useMemo(() => {
    return new Map(periods.map((period) => [period.id, period]));
  }, [periods]);

  async function savePeriod(input: PeriodInput, id?: number): Promise<void> {
    setError(null);

    try {
      if (id) {
        await window.timeline.periods.update({ ...input, id });
      } else {
        await window.timeline.periods.create(input);
      }

      setPeriodDialog(null);
      await loadTimeline();
    } catch (saveError) {
      setError(toErrorMessage(saveError));
    }
  }

  async function saveEntry(input: EntryInput | EntryUpdateInput): Promise<void> {
    setError(null);

    try {
      if ('id' in input) {
        await window.timeline.entries.update(input);
      } else {
        await window.timeline.entries.create(input);
      }

      setEntryPanel(null);
      await loadTimeline();
    } catch (saveError) {
      setError(toErrorMessage(saveError));
    }
  }

  function requestDeletePeriod(period: TimelinePeriod): void {
    setConfirmState({
      title: 'Delete period',
      message: `Delete "${period.name}" and its ${period.entryCount} entries?`,
      confirmLabel: 'Delete period',
      onConfirm: async () => {
        await window.timeline.periods.delete(period.id);
        setEntryPanel(null);
        await loadTimeline();
      },
    });
  }

  function requestDeleteEntry(entry: Entry): void {
    setConfirmState({
      title: 'Delete entry',
      message: `Delete "${entry.title}" from the timeline?`,
      confirmLabel: 'Delete entry',
      onConfirm: async () => {
        await window.timeline.entries.delete(entry.id);
        setEntryPanel(null);
        await loadTimeline();
      },
    });
  }

  async function openExternalLink(url: string): Promise<void> {
    setError(null);

    try {
      await window.timeline.openExternalLink(url);
    } catch (openError) {
      setError(toErrorMessage(openError));
    }
  }

  return (
    <main className="app-shell">
      <Toolbar
        query={query}
        onQueryChange={setQuery}
        onAddPeriod={() => setPeriodDialog({ mode: 'create' })}
      />

      {error ? (
        <div className="error-banner" role="alert">
          {error}
        </div>
      ) : null}

      <TimelineBoard
        loading={loading}
        periods={periods}
        query={debouncedQuery}
        onAddPeriod={() => setPeriodDialog({ mode: 'create' })}
        onEditPeriod={(period) => setPeriodDialog({ mode: 'edit', period })}
        onDeletePeriod={requestDeletePeriod}
        onAddEntry={(period) => setEntryPanel({ mode: 'create', period })}
        onEditEntry={(entry) => {
          const period = periodById.get(entry.periodId);

          if (period) {
            setEntryPanel({ mode: 'edit', period, entry });
          }
        }}
        onOpenLink={openExternalLink}
      />

      <EntryPanel
        state={entryPanel}
        onClose={() => setEntryPanel(null)}
        onSave={saveEntry}
        onDelete={requestDeleteEntry}
      />

      <PeriodDialog
        state={periodDialog}
        onClose={() => setPeriodDialog(null)}
        onSave={savePeriod}
      />

      <ConfirmDialog
        state={confirmState}
        onClose={() => setConfirmState(null)}
        onError={(message) => setError(message)}
      />
    </main>
  );
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error.';
}
