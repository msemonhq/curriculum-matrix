import { useMemo } from 'react';
import { describeSegment, hoursStripLayout } from '../lib/hoursStrip';
import type { StripInputs, StripPhase, StripSegment } from '../lib/hoursStrip';

interface HoursStripProps extends StripInputs {
  phases: readonly StripPhase[];
  className?: string;
}

/**
 * Progress as a length: one segment per phase, as wide as the phase's hours, filled by that phase's
 * progress. Done and current phases get a Signal edge, the rest a hollow edge. The current phase
 * carries a Clock tick where its tracked hours reach. The numbers underneath are for sighted
 * scanning only: each segment already says everything to a screen reader.
 */
export function HoursStrip({ phases, phaseStatus, completedModules, activePhaseId, timeTracking, className = '' }: HoursStripProps) {
  const { segments } = useMemo(
    () => hoursStripLayout(phases, { phaseStatus, completedModules, activePhaseId, timeTracking }),
    [phases, phaseStatus, completedModules, activePhaseId, timeTracking],
  );

  return (
    <div role="group" aria-label="Hours by phase" className={className}>
      <div className="flex gap-1">
        {segments.map((segment) => (
          <Segment key={segment.id} segment={segment} />
        ))}
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

function Segment({ segment }: { segment: StripSegment }) {
  const { state, fillPercent, tracked, widthPercent } = segment;
  return (
    // flex-grow is the hours share, so the gaps between segments come off the total and the widths stay proportional.
    <div
      role="img"
      aria-label={describeSegment(segment)}
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
