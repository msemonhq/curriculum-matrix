import { useMemo } from 'react';
import { describeSegment, hoursStripLayout } from '../lib/hoursStrip';
import type { StripInputs, StripPhase, StripSegment } from '../lib/hoursStrip';

interface HoursStripProps extends StripInputs {
  phases: readonly StripPhase[];
  className?: string;
  /** Makes each segment a button that reports its phase id, for screens where the strip is a table of contents. */
  onSelect?: (phaseId: string) => void;
}

/**
 * Progress as a length: one segment per phase, as wide as the phase's hours, filled by that phase's
 * progress. Done and current phases get a Signal edge, the rest a hollow edge. The current phase
 * carries a Clock tick where its tracked hours reach. The numbers underneath are for sighted
 * scanning only: each segment already says everything to a screen reader, or, when the strip is
 * interactive, each button does.
 */
export function HoursStrip({ phases, phaseStatus, completedModules, activePhaseId, timeTracking, className = '', onSelect }: HoursStripProps) {
  const { segments } = useMemo(
    () => hoursStripLayout(phases, { phaseStatus, completedModules, activePhaseId, timeTracking }),
    [phases, phaseStatus, completedModules, activePhaseId, timeTracking],
  );

  return (
    <div role="group" aria-label="Hours by phase" className={className}>
      <div className="relative">
        <div className="flex gap-1">
          {segments.map((segment) => (
            <Segment key={segment.id} segment={segment} interactive={!!onSelect} />
          ))}
        </div>
        {onSelect && (
          // Same flex model and gap as the segments, so each button sits over the segment it names. Cells are
          // 44px tall; the narrowest phases cannot be 44px wide, which is why they are cut at the midpoints
          // between neighbouring centres rather than at the segment edges.
          <div className="absolute inset-x-0 top-1/2 flex h-11 -translate-y-1/2 gap-1">
            {segments.map((segment) => (
              <button
                key={segment.id}
                type="button"
                aria-label={`Go to ${describeSegment(segment)}`}
                style={{ flexGrow: segment.hitPercent }}
                className="min-w-0 basis-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                onClick={() => onSelect(segment.id)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="mt-1.5 flex gap-1" aria-hidden="true">
        {segments.map((segment) => (
          <span
            key={segment.id}
            style={{ flexGrow: segment.widthPercent }}
            className={`flex min-w-0 basis-0 justify-center text-kicker tabular ${segment.state === 'active' ? 'text-ink-primary' : 'text-ink-tertiary'}`}
          >
            {segment.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Segment({ segment, interactive }: { segment: StripSegment; interactive: boolean }) {
  const { state, fillPercent, tracked, widthPercent } = segment;
  return (
    // flex-grow is the hours share, so the gaps between segments come off the total and the widths stay proportional.
    <div
      {...(interactive ? { 'aria-hidden': true } : { role: 'img', 'aria-label': describeSegment(segment) })}
      style={{ flexGrow: widthPercent }}
      className="relative h-3 min-w-0 basis-0"
    >
      <div className={`h-full overflow-hidden rounded-sm border ${state === 'todo' ? 'border-edge' : 'border-accent'}`}>
        <div className="h-full bg-accent" style={{ width: `${fillPercent}%` }} />
      </div>
      {tracked && (
        <span
          aria-hidden="true"
          className="absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full bg-clock"
          style={{ left: `${tracked.share * 100}%` }}
        />
      )}
    </div>
  );
}
