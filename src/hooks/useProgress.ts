import { useMemo } from 'react';
import { useProgressStore } from './useProgressStore';
import { jdLines, phases } from '../data/curriculum';
import { jdReadiness, overallProgress, phaseProgress } from '../lib/progress';
import type { PhaseProgress } from '../lib/progress';

/** Derived progress numbers for the whole curriculum, recomputed when ticks or statuses change. */
export function useProgress() {
  const phaseStatus = useProgressStore((s) => s.phaseStatus);
  const completedModules = useProgressStore((s) => s.completedModules);

  return useMemo(() => {
    const inputs = { phaseStatus, completedModules };
    const byPhase: Record<string, PhaseProgress> = {};
    for (const phase of phases) byPhase[phase.id] = phaseProgress(phase, inputs);
    const byJdLine: Record<string, { percent: number; phaseCount: number }> = {};
    for (const line of jdLines) byJdLine[line.id] = jdReadiness(line.id, phases, inputs);
    return { overall: overallProgress(phases, inputs), byPhase, byJdLine };
  }, [phaseStatus, completedModules]);
}
