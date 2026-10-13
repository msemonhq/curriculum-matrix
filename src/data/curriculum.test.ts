import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MODULE_KEY_MAP } from '../lib/migrations.ts';
import { formatHours } from '../lib/progress.ts';

interface RawPhase {
  id: string;
  hoursMin: number;
  hoursMax: number;
  jdLinesServed: string[];
  modules: Array<{ id: string; kind?: string }>;
}
const data = JSON.parse(readFileSync(fileURLToPath(new URL('./curriculumData.json', import.meta.url)), 'utf8')) as {
  phases: RawPhase[];
  jdLines: Array<{ id: string }>;
  priorityWins: Array<{ id: string; phaseId: string; text: string }>;
};

test('every module id the migration map points at exists in the curriculum', () => {
  for (const [phaseId, positions] of Object.entries(MODULE_KEY_MAP)) {
    const phase = data.phases.find((p) => p.id === phaseId);
    assert.ok(phase, `${phaseId} is missing from curriculumData.json`);
    for (const id of positions.flat()) {
      assert.ok(phase.modules.some((m) => m.id === id), `${phaseId} has no module ${id}`);
    }
  }
});

test('module ids are unique within a phase and kinds are valid', () => {
  for (const phase of data.phases) {
    const ids = phase.modules.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length, `${phase.id} repeats a module id`);
    for (const m of phase.modules) assert.ok([undefined, 'core', 'optional', 'note'].includes(m.kind), `${phase.id} ${m.id} kind`);
  }
});

test('the modules tagged note/optional are exactly the planned ones', () => {
  const tagged = data.phases.flatMap((p) => p.modules.filter((m) => m.kind && m.kind !== 'core').map((m) => `${p.id}.${m.id}=${m.kind}`));
  assert.deepEqual(tagged.sort(), [
    'phase_1.m5=note',
    'phase_2.m4=note',
    'phase_3.m6=optional',
    'phase_4.m4=optional',
    'phase_8.m6=optional',
    'phase_8.m9=optional',
  ]);
});

test('JD lines served by phases exist, and every JD line is served by at least one phase', () => {
  const known = new Set(data.jdLines.map((j) => j.id));
  const served = new Set(data.phases.flatMap((p) => p.jdLinesServed));
  for (const id of served) assert.ok(known.has(id), `unknown JD line ${id}`);
  for (const id of known) assert.ok(served.has(id), `JD line ${id} is not served by any phase`);
});

test('hours add up to the totals shown on the dashboard', () => {
  const min = data.phases.reduce((sum, p) => sum + p.hoursMin, 0);
  const max = data.phases.reduce((sum, p) => sum + p.hoursMax, 0);
  assert.equal(formatHours(min, max), '~87–92.5h');
  assert.equal(max, 92.5);
});

test('every priority win points at a real phase and has text', () => {
  assert.ok(data.priorityWins.length > 0);
  const ids = new Set(data.priorityWins.map((w) => w.id));
  assert.equal(ids.size, data.priorityWins.length, 'win ids must be unique');
  for (const win of data.priorityWins) {
    assert.ok(data.phases.some((p) => p.id === win.phaseId), `${win.id} points at unknown ${win.phaseId}`);
    assert.ok(win.text.trim().length > 0);
  }
});
