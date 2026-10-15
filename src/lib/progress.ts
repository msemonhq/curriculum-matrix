// Progress maths and formatting. Pure functions only (no React, no JSON import) so they can be
// unit-tested with `node --test`; callers pass the curriculum in.
import type { PhaseStatus } from '../types/index.ts';

export interface ProgressInputs {
  phaseStatus: Record<string, PhaseStatus>;
  completedModules: Record<string, boolean>;
}

export interface PhaseLike {
  id: string;
  hoursMax: number;
  modules: ReadonlyArray<{ id: string; kind?: string }>;
  jdLinesServed?: ReadonlyArray<string>;
}

export interface PhaseProgress {
  done: number;
  total: number;
  percent: number;
}

export const moduleKey = (phaseId: string, moduleId: string) => `${phaseId}_${moduleId}`;

/** Only core modules (the default) count toward progress. */
export const isCoreModule = (module: { kind?: string }) => module.kind === undefined || module.kind === 'core';

/** Explicit tick wins; otherwise a completed phase counts all its modules as done. */
export function isModuleChecked(inputs: ProgressInputs, phaseId: string, moduleId: string): boolean {
  return inputs.completedModules[moduleKey(phaseId, moduleId)] ?? inputs.phaseStatus[phaseId] === 'completed';
}

/**
 * Progress of one phase. A phase marked completed always reads 100% (the manual override);
 * `done` still counts the core modules that are actually ticked so the "3/5" label matches the checkboxes.
 */
export function phaseProgress(phase: PhaseLike, inputs: ProgressInputs): PhaseProgress {
  const core = phase.modules.filter(isCoreModule);
  const done = core.filter((m) => isModuleChecked(inputs, phase.id, m.id)).length;
  const total = core.length;
  const completed = inputs.phaseStatus[phase.id] === 'completed';
  const percent = completed ? 100 : total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

/** Hours-weighted average of phase progress, weighting each phase by its hoursMax. */
export function overallProgress(phases: readonly PhaseLike[], inputs: ProgressInputs): { fraction: number; percent: number } {
  const totalWeight = phases.reduce((sum, p) => sum + p.hoursMax, 0);
  if (totalWeight <= 0) return { fraction: 0, percent: 0 };
  const earned = phases.reduce((sum, p) => sum + p.hoursMax * (phaseProgress(p, inputs).percent / 100), 0);
  const fraction = earned / totalWeight;
  return { fraction, percent: Math.round(fraction * 100) };
}

/** Readiness for one JD line: the plain average progress of the phases that serve it. */
export function jdReadiness(
  jdLineId: string,
  phases: readonly PhaseLike[],
  inputs: ProgressInputs,
): { percent: number; phaseCount: number } {
  const serving = phases.filter((p) => p.jdLinesServed?.includes(jdLineId));
  if (serving.length === 0) return { percent: 0, phaseCount: 0 };
  const sum = serving.reduce((acc, p) => acc + phaseProgress(p, inputs).percent, 0);
  return { percent: Math.round(sum / serving.length), phaseCount: serving.length };
}

const trim = (value: number) => String(Math.round(value * 10) / 10);

/** "~16h" for a single value, "~15–18h" for a range (the dash is written as an escape on purpose). */
export function formatHours(min: number, max: number): string {
  return min === max ? `~${trim(max)}h` : `~${trim(min)}–${trim(max)}h`;
}

export interface PhaseSummaryInput {
  done: number;
  total: number;
  /** In progress, or at least one module ticked. */
  started: boolean;
  trackedHours: number;
  hoursMin: number;
  hoursMax: number;
}

/**
 * The line under a phase title: "2 of 4 modules done · 6h of ~15–18h" once it is under way,
 * "4 modules to go · ~15–18h" before. Tracked hours show whenever there are some.
 */
export function phaseSummary({ done, total, started, trackedHours, hoursMin, hoursMax }: PhaseSummaryInput): string {
  const noun = total === 1 ? 'module' : 'modules';
  const budget = formatHours(hoursMin, hoursMax);
  const tracked = Math.round(trackedHours * 10) / 10;
  const parts: string[] = [];
  if (total > 0) parts.push(started ? `${done} of ${total} ${noun} done` : `${total} ${noun} to go`);
  parts.push(tracked > 0 ? `${trim(tracked)}h of ${budget}` : budget);
  return parts.join(' · ');
}

/**
 * The line under a phase title on the Roadmap: "Done · 5.5h" once finished (tracked hours if any,
 * otherwise the budget), "In progress · 2 of 5 modules done · 3h of ~16h" while under way, and the
 * plain summary before that.
 */
export function phaseRowLine(status: PhaseStatus, input: PhaseSummaryInput): string {
  if (status === 'completed') {
    const tracked = Math.round(input.trackedHours * 10) / 10;
    return `Done · ${tracked > 0 ? `${trim(tracked)}h` : formatHours(input.hoursMin, input.hoursMax)}`;
  }
  const summary = phaseSummary(input);
  return status === 'in_progress' ? `In progress · ${summary}` : summary;
}

export interface ToggleState extends ProgressInputs {
  activePhaseId: string | null;
}

/**
 * State change for ticking/unticking a module. The toggle uses the effective value (so a module
 * that a completed phase shows as ticked unticks on the first tap). Ticking the first module of a
 * not_started phase starts the phase and makes it active; unticking never reverts a status and
 * completing a phase stays a manual step.
 */
export function toggleModuleUpdate(
  state: ToggleState,
  phaseId: string,
  moduleId: string,
): Pick<ToggleState, 'completedModules'> & Partial<Pick<ToggleState, 'phaseStatus' | 'activePhaseId'>> {
  const wasChecked = isModuleChecked(state, phaseId, moduleId);
  const completedModules = { ...state.completedModules, [moduleKey(phaseId, moduleId)]: !wasChecked };
  const status = state.phaseStatus[phaseId] ?? 'not_started';
  if (!wasChecked && status === 'not_started') {
    return {
      completedModules,
      phaseStatus: { ...state.phaseStatus, [phaseId]: 'in_progress' },
      activePhaseId: phaseId,
    };
  }
  return { completedModules };
}
