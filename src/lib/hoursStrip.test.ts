import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describeSegment, hoursStripLayout } from './hoursStrip.ts';
import type { StripInputs, StripPhase } from './hoursStrip.ts';
import { isCoreModule, overallProgress, phaseProgress } from './progress.ts';

// The real curriculum, so these tests fail if a phase's hours change and the strip does not follow.
const data = JSON.parse(readFileSync(fileURLToPath(new URL('../data/curriculumData.json', import.meta.url)), 'utf8')) as {
  phases: StripPhase[];
};
const PHASES = data.phases;
const TOTAL_HOURS = PHASES.reduce((sum, p) => sum + p.hoursMax, 0);

const inputs = (extra: Partial<StripInputs> = {}): StripInputs => ({
  phaseStatus: {},
  completedModules: {},
  activePhaseId: null,
  timeTracking: {},
  ...extra,
});
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} is not ${b}`);

test('the real curriculum weighs 92.5 hours across 8 phases', () => {
  assert.equal(PHASES.length, 8);
  assert.equal(TOTAL_HOURS, 92.5);
});

test('segment widths are each phase\'s hoursMax over the total, and they add up to 100', () => {
  const { segments } = hoursStripLayout(PHASES, inputs());
  assert.equal(segments.length, PHASES.length);
  close(segments.reduce((sum, s) => sum + s.widthPercent, 0), 100);
  segments.forEach((segment, i) => {
    assert.equal(segment.id, PHASES[i].id);
    assert.equal(segment.hours, PHASES[i].hoursMax);
    close(segment.widthPercent, (PHASES[i].hoursMax / TOTAL_HOURS) * 100);
  });
  // A 20-hour phase is ten times as wide as the 2-hour one.
  const byId = Object.fromEntries(segments.map((s) => [s.id, s]));
  close(byId.phase_8.widthPercent / byId.phase_2.widthPercent, 10);
});

test('segments keep the curriculum order and print the phase number', () => {
  const { segments } = hoursStripLayout(PHASES, inputs());
  assert.deepEqual(segments.map((s) => s.label), ['1', '2', '3', '4', '5', '6', '7', '8']);
});

test('an empty strip is 0% filled and every segment is a todo', () => {
  const layout = hoursStripLayout(PHASES, inputs());
  assert.equal(layout.filledPercent, 0);
  assert.ok(layout.segments.every((s) => s.fillPercent === 0 && s.state === 'todo' && s.tracked === null));
});

test('the filled length is exactly the overall hours-weighted progress', () => {
  const scenarios: StripInputs[] = [
    inputs(),
    // Only Phase 3 completed: 16 / 92.5 = 17%
    inputs({ phaseStatus: { phase_3: 'completed' } }),
    // Phase 7 half ticked
    inputs({ phaseStatus: { phase_7: 'in_progress' }, completedModules: { phase_7_m1: true, phase_7_m2: true, phase_7_m3: true } }),
    // Mixed: a completed phase, a partial one, and a completed phase with an explicit untick
    inputs({
      phaseStatus: { phase_1: 'completed', phase_4: 'in_progress', phase_8: 'completed' },
      completedModules: { phase_4_m1: true, phase_4_m2: true, phase_8_m2: false },
    }),
    inputs({ phaseStatus: Object.fromEntries(PHASES.map((p) => [p.id, 'completed' as const])) }),
  ];
  for (const scenario of scenarios) {
    const overall = overallProgress(PHASES, scenario);
    const layout = hoursStripLayout(PHASES, scenario);
    close(layout.filledPercent, overall.fraction * 100);
    assert.equal(Math.round(layout.filledPercent), overall.percent);
  }
});

test('the strip agrees with the overall number at every tick count in every phase', () => {
  for (const phase of PHASES) {
    const core = phase.modules.filter(isCoreModule);
    for (let ticked = 0; ticked <= core.length; ticked++) {
      const completedModules = Object.fromEntries(core.slice(0, ticked).map((m) => [`${phase.id}_${m.id}`, true]));
      const scenario = inputs({ phaseStatus: { [phase.id]: 'in_progress' }, completedModules });
      close(hoursStripLayout(PHASES, scenario).filledPercent, overallProgress(PHASES, scenario).fraction * 100);
    }
  }
});

test('each segment fill is that phase\'s own progress percent', () => {
  const scenario = inputs({
    phaseStatus: { phase_3: 'completed', phase_5: 'in_progress' },
    completedModules: { phase_3_m2: false, phase_5_m1: true, phase_5_m2: true },
  });
  const { segments } = hoursStripLayout(PHASES, scenario);
  segments.forEach((segment, i) => assert.equal(segment.fillPercent, phaseProgress(PHASES[i], scenario).percent));
  // A completed phase is full even with an unticked module, as in the progress maths.
  assert.equal(segments[2].fillPercent, 100);
  assert.equal(segments[4].fillPercent, 40); // 2 of 5 core modules
});

test('done means marked completed; ticking every module alone does not make a phase done', () => {
  const core = PHASES[1].modules.filter(isCoreModule);
  const allTicked = Object.fromEntries(core.map((m) => [`phase_2_${m.id}`, true]));
  const { segments } = hoursStripLayout(PHASES, inputs({ phaseStatus: { phase_1: 'completed' }, completedModules: allTicked }));
  assert.equal(segments[0].state, 'done');
  assert.equal(segments[1].fillPercent, 100);
  assert.equal(segments[1].state, 'todo');
});

test('only the active phase is active, and a completed phase is never active', () => {
  const active = hoursStripLayout(PHASES, inputs({ activePhaseId: 'phase_4' })).segments;
  assert.deepEqual(active.filter((s) => s.state === 'active').map((s) => s.id), ['phase_4']);

  const completed = hoursStripLayout(PHASES, inputs({ activePhaseId: 'phase_4', phaseStatus: { phase_4: 'completed' } })).segments;
  assert.equal(completed[3].state, 'done');
  assert.equal(completed.filter((s) => s.state === 'active').length, 0);

  assert.equal(hoursStripLayout(PHASES, inputs({ activePhaseId: 'nope' })).segments.filter((s) => s.state === 'active').length, 0);
});

test('tracked hours show on the active phase only, as a share of its hours', () => {
  const scenario = inputs({ activePhaseId: 'phase_3', timeTracking: { phase_3: 4, phase_5: 2 } });
  const { segments } = hoursStripLayout(PHASES, scenario);
  assert.deepEqual(segments[2].tracked, { hours: 4, share: 4 / 16 });
  assert.equal(segments[4].tracked, null); // tracked, but not the active phase
});

test('tracked hours past the phase budget stop at the end of the segment; zero tracks nothing', () => {
  const over = hoursStripLayout(PHASES, inputs({ activePhaseId: 'phase_2', timeTracking: { phase_2: 5 } })).segments[1];
  assert.deepEqual(over.tracked, { hours: 5, share: 1 });
  const none = hoursStripLayout(PHASES, inputs({ activePhaseId: 'phase_2', timeTracking: { phase_2: 0 } })).segments[1];
  assert.equal(none.tracked, null);
  const missing = hoursStripLayout(PHASES, inputs({ activePhaseId: 'phase_2' })).segments[1];
  assert.equal(missing.tracked, null);
});

test('no phases, or no hours at all, is an empty strip and never divides by zero', () => {
  assert.deepEqual(hoursStripLayout([], inputs()), { segments: [], filledPercent: 0 });
  const weightless: StripPhase[] = [{ id: 'a', number: 1, hoursMax: 0, modules: [{ id: 'm1' }] }];
  const layout = hoursStripLayout(weightless, inputs({ activePhaseId: 'a', timeTracking: { a: 3 } }));
  assert.equal(layout.segments[0].widthPercent, 0);
  assert.equal(layout.segments[0].tracked, null);
  assert.equal(layout.filledPercent, 0);
});

test('describeSegment reads as plain words', () => {
  const { segments } = hoursStripLayout(PHASES, inputs({
    activePhaseId: 'phase_3',
    phaseStatus: { phase_3: 'in_progress', phase_4: 'in_progress' },
    completedModules: { phase_3_m1: true, phase_3_m2: true },
    timeTracking: { phase_3: 4.25 },
  }));
  // Phase 3 has 5 core modules (m6 is optional), so 2 ticked is 40%.
  assert.equal(describeSegment(segments[2]), 'Phase 3, 40% done, 16 hours, current phase, 4.3 hours tracked');
  assert.equal(describeSegment(segments[3]), 'Phase 4, 0% done, 18 hours');
});

test('tap cells add up to 100, are never negative, and each one contains its own segment\'s centre', () => {
  const { segments } = hoursStripLayout(PHASES, inputs());
  close(segments.reduce((sum, s) => sum + s.hitPercent, 0), 100);
  let cellStart = 0;
  let segmentStart = 0;
  for (const segment of segments) {
    assert.ok(segment.hitPercent >= 0);
    const centre = segmentStart + segment.widthPercent / 2;
    assert.ok(centre >= cellStart - 1e-9 && centre <= cellStart + segment.hitPercent + 1e-9, `${segment.id} centre ${centre} is outside its cell`);
    cellStart += segment.hitPercent;
    segmentStart += segment.widthPercent;
  }
});

test('tap cells: a lone phase takes the whole strip; no weight gives no cells to tap', () => {
  const one: StripPhase[] = [{ id: 'a', number: 1, hoursMax: 4, modules: [{ id: 'm1' }] }];
  assert.equal(hoursStripLayout(one, inputs()).segments[0].hitPercent, 100);
  const weightless: StripPhase[] = [
    { id: 'a', number: 1, hoursMax: 0, modules: [{ id: 'm1' }] },
    { id: 'b', number: 2, hoursMax: 0, modules: [{ id: 'm1' }] },
  ];
  assert.deepEqual(hoursStripLayout(weightless, inputs()).segments.map((s) => s.hitPercent), [0, 0]);
});

test('tap cells follow the hours: the real curriculum\'s first two phases get the small cells', () => {
  const { segments } = hoursStripLayout(PHASES, inputs());
  const sorted = [...segments].sort((a, b) => a.hitPercent - b.hitPercent).map((s) => s.id);
  assert.deepEqual(sorted.slice(0, 2).sort(), ['phase_1', 'phase_2']);
});
