import { ChevronRight } from 'lucide-react';

/**
 * Sits in the app header on the screens you wander off to (Workbenches, Audit): the phase you are on and
 * how far along it is, one tap from its row on the Roadmap. The words after the comma are for screen readers.
 */
export function ResumeChip({ phaseNumber, percent, onClick }: { phaseNumber: number | string; percent: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-edge pl-3 pr-2 text-meta font-semibold text-ink-primary transition-colors active:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
    >
      <span className="tabular">Phase {phaseNumber} · {percent}%</span>
      <span className="sr-only">, open on the Roadmap</span>
      <ChevronRight className="h-4 w-4 text-ink-tertiary" aria-hidden="true" />
    </button>
  );
}
