// Layout of the hours strip: one segment per phase, each as wide as the phase's hours.
// Pure functions only (no React, no JSON import) so `node --test` can check them against the
// progress maths. Every fill comes from phaseProgress() and every width from the same hoursMax
// weight that overallProgress() uses, so the strip can never disagree with the overall number.
import { phaseProgress } from './progress.ts';
import type { PhaseLike, ProgressInputs } from './progress.ts';

export interface StripPhase extends PhaseLike {
  /** Printed under the segment: 1, 2, ... */
  number: number | string;
}

export interface StripInputs extends ProgressInputs {
  /** The phase the person is on (the Dashboard's "Up next" phase). */
  activePhaseId: string | null;
  /** Hours tracked per phase id, as the store keeps them. */
  timeTracking: Readonly<Record<string, number | undefined>>;
}

/** done: marked completed. active: the current phase. todo: everything else. */
export type SegmentState = 'done' | 'active' | 'todo';

export interface StripSegment {
  id: string;
  /** What is printed under the segment. */
  label: string;
  /** The phase's weight, its hoursMax. */
  hours: number;
  /** This segment's share of the whole strip, 0-100. All segments add up to 100. */
  widthPercent: number;
  /** How much of this segment is filled, 0-100: the rounded phase percent the progress maths uses. */
  fillPercent: number;
  state: SegmentState;
  /** Tracked hours on the active phase, with their share of its hours (0-1). Null when none are tracked. */
  tracked: { hours: number; share: number } | null;
}

export interface StripLayout {
  segments: StripSegment[];
  /** The filled share of the whole strip, 0-100. Equals overallProgress(...).fraction * 100. */
  filledPercent: number;
}

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const round1 = (value: number) => Math.round(value * 10) / 10;

export function hoursStripLayout(phases: readonly StripPhase[], inputs: StripInputs): StripLayout {
  const totalWeight = phases.reduce((sum, p) => sum + p.hoursMax, 0);
  const widths = phases.map((p) => (totalWeight > 0 ? (p.hoursMax / totalWeight) * 100 : 0));
  const segments = phases.map<StripSegment>((phase, i) => {
    const completed = inputs.phaseStatus[phase.id] === 'completed';
    const active = !completed && inputs.activePhaseId === phase.id;
    const hours = inputs.timeTracking[phase.id] ?? 0;
    const trackedHours = Number.isFinite(hours) ? hours : 0;
    return {
      id: phase.id,
      label: String(phase.number),
      hours: phase.hoursMax,
      // No weight at all reads as an empty strip, the same way overallProgress reads 0.
      widthPercent: widths[i],
      fillPercent: phaseProgress(phase, inputs).percent,
      state: completed ? 'done' : active ? 'active' : 'todo',
      tracked: active && trackedHours > 0 && phase.hoursMax > 0
        ? { hours: trackedHours, share: clamp01(trackedHours / phase.hoursMax) }
        : null,
    };
  });
  const filledPercent = segments.reduce((sum, s) => sum + (s.widthPercent * s.fillPercent) / 100, 0);
  return { segments, filledPercent };
}

/** What a screen reader hears for one segment, for example "Phase 3, 40% done, 16 hours, current phase". */
export function describeSegment(segment: StripSegment): string {
  const parts = [`Phase ${segment.label}`, `${segment.fillPercent}% done`, `${round1(segment.hours)} hours`];
  if (segment.state === 'active') parts.push('current phase');
  if (segment.tracked) parts.push(`${round1(segment.tracked.hours)} hours tracked`);
  return parts.join(', ');
}
