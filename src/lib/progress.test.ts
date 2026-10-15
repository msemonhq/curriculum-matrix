import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatHours, isModuleChecked, jdReadiness, overallProgress, phaseProgress, phaseSummary, toggleModuleUpdate,
} from './progress.ts';
import type { PhaseLike, ProgressInputs } from './progress.ts';

const mods = (n: number, extra: Array<{ id: string; kind: string }> = []) => [
  ...Array.from({ length: n }, (_, i) => ({ id: `m${i + 1}` })),
  ...extra,
];

// Same hoursMax weights as the real curriculum (total 92.5).
const PHASES: PhaseLike[] = [
  { id: 'phase_1', hoursMax: 5.5, modules: mods(4, [{ id: 'm5', kind: 'note' }]), jdLinesServed: ['R1', 'C1'] },
  { id: 'phase_2', hoursMax: 2, modules: mods(3, [{ id: 'm4', kind: 'note' }]), jdLinesServed: ['C5'] },
  { id: 'phase_3', hoursMax: 16, modules: mods(5, [{ id: 'm6', kind: 'optional' }]), jdLinesServed: ['C2', 'R5'] },
  { id: 'phase_4', hoursMax: 18, modules: mods(3, [{ id: 'm4', kind: 'optional' }, { id: 'm5', kind: 'core' }]), jdLinesServed: ['C3'] },
  { id: 'phase_5', hoursMax: 6, modules: mods(5), jdLinesServed: ['R2'] },
  { id: 'phase_6', hoursMax: 6, modules: mods(5), jdLinesServed: ['R3'] },
  { id: 'phase_7', hoursMax: 19, modules: mods(6), jdLinesServed: ['R4'] },
  { id: 'phase_8', hoursMax: 20, modules: mods(5), jdLinesServed: ['R5', 'C4'] },
];
const empty = (): ProgressInputs => ({ phaseStatus: {}, completedModules: {} });

test('empty state is 0% everywhere', () => {
  assert.deepEqual(overallProgress(PHASES, empty()), { fraction: 0, percent: 0 });
  assert.deepEqual(phaseProgress(PHASES[2], empty()), { done: 0, total: 5, percent: 0 });
});

test('optional and note modules do not count toward the total', () => {
  assert.equal(phaseProgress(PHASES[0], empty()).total, 4); // note excluded
  assert.equal(phaseProgress(PHASES[2], empty()).total, 5); // optional excluded
  assert.equal(phaseProgress(PHASES[3], empty()).total, 4); // 3 + core m5, optional m4 excluded
});

test('partial progress is done / core total', () => {
  const inputs = { ...empty(), completedModules: { phase_3_m1: true, phase_3_m2: true, phase_3_m6: true } };
  assert.deepEqual(phaseProgress(PHASES[2], inputs), { done: 2, total: 5, percent: 40 });
});

test('a completed phase always reads 100%, even with an explicit untick', () => {
  const inputs: ProgressInputs = { phaseStatus: { phase_3: 'completed' }, completedModules: { phase_3_m2: false } };
  const result = phaseProgress(PHASES[2], inputs);
  assert.equal(result.percent, 100);
  assert.equal(result.done, 4); // the checkboxes still show what is actually ticked
});

test('overall progress is hours-weighted: only Phase 3 completed is 16 / 92.5 = 17%', () => {
  const inputs: ProgressInputs = { phaseStatus: { phase_3: 'completed' }, completedModules: {} };
  const result = overallProgress(PHASES, inputs);
  assert.equal(result.percent, 17);
  assert.ok(Math.abs(result.fraction - 16 / 92.5) < 1e-12);
  // equal weighting would have said 12.5% for one of eight phases
});

test('ticked modules in an in-progress phase move the overall number', () => {
  const inputs: ProgressInputs = {
    phaseStatus: { phase_7: 'in_progress' },
    completedModules: { phase_7_m1: true, phase_7_m2: true, phase_7_m3: true }, // 3 of 6 = 50% of 19h
  };
  assert.equal(overallProgress(PHASES, inputs).percent, Math.round((19 * 0.5 / 92.5) * 100)); // 10%
});

test('everything completed is 100%', () => {
  const status = Object.fromEntries(PHASES.map((p) => [p.id, 'completed' as const]));
  assert.equal(overallProgress(PHASES, { phaseStatus: status, completedModules: {} }).percent, 100);
});

test('overall progress with no weight does not divide by zero', () => {
  assert.deepEqual(overallProgress([], empty()), { fraction: 0, percent: 0 });
});

test('isModuleChecked: explicit value wins, completed phase is the default', () => {
  const inputs: ProgressInputs = { phaseStatus: { phase_1: 'completed' }, completedModules: { phase_1_m2: false } };
  assert.equal(isModuleChecked(inputs, 'phase_1', 'm1'), true);
  assert.equal(isModuleChecked(inputs, 'phase_1', 'm2'), false);
  assert.equal(isModuleChecked(inputs, 'phase_2', 'm1'), false);
});

test('toggle uses the effective value: first tap on a default-ticked module unticks it', () => {
  const state = { phaseStatus: { phase_1: 'completed' as const }, completedModules: {}, activePhaseId: null };
  const next = toggleModuleUpdate(state, 'phase_1', 'm1');
  assert.deepEqual(next, { completedModules: { phase_1_m1: false } });
});

test('ticking the first module of a not_started phase starts it and makes it active', () => {
  const state = { phaseStatus: {}, completedModules: {}, activePhaseId: 'phase_1' };
  const next = toggleModuleUpdate(state, 'phase_4', 'm1');
  assert.equal(next.completedModules.phase_4_m1, true);
  assert.equal(next.phaseStatus?.phase_4, 'in_progress');
  assert.equal(next.activePhaseId, 'phase_4');
});

test('ticking in an in-progress phase leaves status and active phase alone; unticking never reverts', () => {
  const state = { phaseStatus: { phase_4: 'in_progress' as const }, completedModules: { phase_4_m1: true }, activePhaseId: 'phase_2' };
  const tick = toggleModuleUpdate(state, 'phase_4', 'm2');
  assert.equal(tick.phaseStatus, undefined);
  assert.equal(tick.activePhaseId, undefined);
  const untick = toggleModuleUpdate(state, 'phase_4', 'm1');
  assert.deepEqual(untick, { completedModules: { phase_4_m1: false } });
});

test('a phase with every core module ticked is not auto-completed', () => {
  let state = { phaseStatus: {} as ProgressInputs['phaseStatus'], completedModules: {} as Record<string, boolean>, activePhaseId: null as string | null };
  for (const m of ['m1', 'm2', 'm3', 'm4', 'm5']) {
    state = { ...state, ...toggleModuleUpdate(state, 'phase_3', m) };
  }
  assert.equal(state.phaseStatus.phase_3, 'in_progress');
  assert.equal(phaseProgress(PHASES[2], state).percent, 100);
});

test('JD readiness averages the phases that serve the line', () => {
  const inputs: ProgressInputs = { phaseStatus: { phase_3: 'completed' }, completedModules: { phase_8_m1: true } };
  // R5 is served by phase_3 (100%) and phase_8 (1 of 5 = 20%)
  assert.deepEqual(jdReadiness('R5', PHASES, inputs), { percent: 60, phaseCount: 2 });
  assert.deepEqual(jdReadiness('C3', PHASES, inputs), { percent: 0, phaseCount: 1 });
  assert.deepEqual(jdReadiness('nope', PHASES, inputs), { percent: 0, phaseCount: 0 });
});

test('formatHours writes ranges with an en dash and drops the range when min equals max', () => {
  assert.equal(formatHours(15, 18), '~15–18h');
  assert.equal(formatHours(4.5, 6), '~4.5–6h');
  assert.equal(formatHours(18, 19), '~18–19h');
  assert.equal(formatHours(87, 92.5), '~87–92.5h');
  assert.equal(formatHours(16, 16), '~16h');
});

test('phaseSummary: under way shows modules done and tracked hours against the budget', () => {
  assert.equal(
    phaseSummary({ done: 2, total: 4, started: true, trackedHours: 6, hoursMin: 15, hoursMax: 18 }),
    '2 of 4 modules done · 6h of ~15–18h',
  );
  assert.equal(
    phaseSummary({ done: 1, total: 3, started: true, trackedHours: 1.5, hoursMin: 2, hoursMax: 2 }),
    '1 of 3 modules done · 1.5h of ~2h',
  );
});

test('phaseSummary: before the phase starts it counts the modules to go and gives the budget', () => {
  assert.equal(phaseSummary({ done: 0, total: 4, started: false, trackedHours: 0, hoursMin: 15, hoursMax: 18 }), '4 modules to go · ~15–18h');
});

test('phaseSummary: no tracked hours gives the budget alone; tiny or invalid hours count as none', () => {
  assert.equal(phaseSummary({ done: 2, total: 5, started: true, trackedHours: 0, hoursMin: 16, hoursMax: 16 }), '2 of 5 modules done · ~16h');
  assert.equal(phaseSummary({ done: 2, total: 5, started: true, trackedHours: 0.04, hoursMin: 16, hoursMax: 16 }), '2 of 5 modules done · ~16h');
  assert.equal(phaseSummary({ done: 2, total: 5, started: true, trackedHours: Number.NaN, hoursMin: 16, hoursMax: 16 }), '2 of 5 modules done · ~16h');
});

test('phaseSummary: tracked hours round to one decimal and show even before a module is ticked', () => {
  assert.equal(phaseSummary({ done: 0, total: 5, started: false, trackedHours: 3.46, hoursMin: 4.5, hoursMax: 6 }), '5 modules to go · 3.5h of ~4.5–6h');
});

test('phaseSummary: singular module, and a phase with no core modules gives only the hours', () => {
  assert.equal(phaseSummary({ done: 0, total: 1, started: false, trackedHours: 0, hoursMin: 1, hoursMax: 1 }), '1 module to go · ~1h');
  assert.equal(phaseSummary({ done: 0, total: 0, started: true, trackedHours: 2, hoursMin: 3, hoursMax: 4 }), '2h of ~3–4h');
});
