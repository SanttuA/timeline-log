import type { Entry, TimelinePeriod } from '../../shared/types';
import { EmptyState } from './EmptyState';
import { PeriodSection } from './PeriodSection';

type TimelineBoardProps = {
  loading: boolean;
  periods: TimelinePeriod[];
  query: string;
  onAddPeriod: () => void;
  onEditPeriod: (period: TimelinePeriod) => void;
  onDeletePeriod: (period: TimelinePeriod) => void;
  onAddEntry: (period: TimelinePeriod) => void;
  onEditEntry: (entry: Entry) => void;
  onOpenLink: (url: string) => void;
};

export function TimelineBoard({
  loading,
  periods,
  query,
  onAddPeriod,
  onEditPeriod,
  onDeletePeriod,
  onAddEntry,
  onEditEntry,
  onOpenLink,
}: TimelineBoardProps) {
  if (loading) {
    return <div className="board-state">Loading timeline...</div>;
  }

  if (periods.length === 0) {
    return <EmptyState query={query} onAddPeriod={onAddPeriod} />;
  }

  return (
    <section className="timeline-board" aria-label="Timeline periods">
      {periods.map((period) => (
        <PeriodSection
          key={period.id}
          period={period}
          onAddEntry={onAddEntry}
          onEditPeriod={onEditPeriod}
          onDeletePeriod={onDeletePeriod}
          onEditEntry={onEditEntry}
          onOpenLink={onOpenLink}
        />
      ))}
    </section>
  );
}
