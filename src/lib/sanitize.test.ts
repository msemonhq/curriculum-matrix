import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  MAX_BACKUP_CHARS, buildBackup, emptyProgress, normalizeState, parseBackup, sanitizeState, summarize,
} from './sanitize.ts';
import { SCHEMA_VERSION } from './migrations.ts';

const NOW = new Date(2026, 9, 12, 13, 0, 0);
const PHASES = ['phase_1', 'phase_2', 'phase_3', 'phase_4', 'phase_5', 'phase_6', 'phase_7', 'phase_8'];
const fixture = (name: string) => readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), 'utf8');

test('sanitizeState drops invalid values and unknown phases', () => {
  const out = sanitizeState({
    activePhaseId: 'phase_99',
    phaseStatus: { phase_1: 'completed', phase_2: 'done', phase_77: 'completed' },
    deliverables: { phase_1: true, phase_2: 'yes' },
    timeTracking: { phase_1: 3, phase_2: -1, phase_3: Number.NaN, phase_4: 1e9 },
    notes: { phase_1: 'ok', phase_2: 42 },
    completedModules: { phase_1_m1: true, phase_1_m2: 'x', phase_42_m1: true, loose: true },
    workbench: { '5': { events: [] }, '8': { campaignName: 'x' }, '9': 'nope', 'bad key!': { a: 1 }, '7': [1] },
  }, PHASES);
  assert.equal(out.activePhaseId, null);
  assert.deepEqual(out.phaseStatus, { phase_1: 'completed' });
  assert.deepEqual(out.deliverables, { phase_1: true });
  assert.deepEqual(out.timeTracking, { phase_1: 3, phase_4: 10_000 });
  assert.deepEqual(out.notes, { phase_1: 'ok' });
  assert.deepEqual(out.completedModules, { phase_1_m1: true });
  // workbench is keyed by tool id ('1'..'8'), so it is not filtered by phase id
  assert.deepEqual(out.workbench, { '5': { events: [] }, '8': { campaignName: 'x' } });
});

test('sanitizeState keeps a valid active phase and never throws on garbage', () => {
  assert.equal(sanitizeState({ activePhaseId: 'phase_2' }, PHASES).activePhaseId, 'phase_2');
  for (const junk of [null, undefined, 7, 'x', [], true]) assert.deepEqual(sanitizeState(junk, PHASES), emptyProgress());
});

test('sanitizeState blocks prototype-polluting keys', () => {
  const raw = JSON.parse('{"notes":{"__proto__":"x","constructor":"y","phase_1":"fine"}}');
  const out = sanitizeState(raw);
  assert.deepEqual(Object.keys(out.notes), ['phase_1']);
  assert.equal(({} as Record<string, unknown>).x, undefined);
});

test('parseBackup reads a 3.2.0 export, migrating module keys', () => {
  const result = parseBackup(fixture('backup-3.2.json'), PHASES, NOW);
  assert.ok(result.ok);
  assert.equal(result.sourceVersion, 0);
  assert.deepEqual(result.state.workbench['5'].events, [
    { date: '2026-10-15', title: 'Q4 Webinar' },
    { date: '', title: 'Eid sale' },
  ]);
  assert.equal(result.state.activePhaseId, 'phase_2');
  assert.equal(result.state.completedModules.phase_3_m3, true);
  assert.equal(result.state.completedModules.phase_8_9, undefined);
  assert.equal(result.summary.phasesCompleted, 1);
  assert.equal(result.summary.phasesInProgress, 1);
  assert.equal(result.summary.hoursLogged, 6.75);
  assert.equal(result.summary.notes, 1);
  assert.equal(result.summary.workbenchPhases, 2);
});

test('parseBackup accepts a bare state object and a BOM', () => {
  const bare = String.fromCharCode(0xfeff) + JSON.stringify({ notes: { phase_1: 'hello' } });
  const result = parseBackup(bare, PHASES);
  assert.ok(result.ok);
  assert.equal(result.state.notes.phase_1, 'hello');
});

test('parseBackup round-trips what buildBackup writes', () => {
  const data = {
    ...emptyProgress(),
    activePhaseId: 'phase_4',
    phaseStatus: { phase_4: 'in_progress' as const },
    completedModules: { phase_4_m1: true, phase_4_m2: false },
    timeTracking: { phase_4: 2.5 },
  };
  const text = buildBackup(data, '4.0.0', new Date('2026-10-12T00:00:00Z'));
  const meta = JSON.parse(text);
  assert.equal(meta.version, SCHEMA_VERSION);
  assert.equal(meta.appVersion, '4.0.0');
  assert.equal(meta.exportedAt, '2026-10-12T00:00:00.000Z');
  const result = parseBackup(text, PHASES);
  assert.ok(result.ok);
  assert.deepEqual(result.state, data);
});

test('parseBackup rejects bad input with a readable error', () => {
  const cases: Array<[string, RegExp]> = [
    ['', /Paste or choose/],
    ['   ', /Paste or choose/],
    ['{not json', /not valid JSON/],
    ['[1,2]', /does not look like/],
    ['"hi"', /does not look like/],
    ['{"hello":"world"}', /does not look like/],
    ['{"state":{},"version":0}', /no progress/],
    ['{"state":{"notes":{"phase_1":"   "}},"version":1}', /no progress/],
    [JSON.stringify({ state: { notes: { phase_1: 'x' } }, version: SCHEMA_VERSION + 1 }), /newer version/],
    ['x'.repeat(MAX_BACKUP_CHARS + 1), /too large/],
  ];
  for (const [text, pattern] of cases) {
    const result = parseBackup(text, PHASES);
    assert.equal(result.ok, false, `expected failure for ${text.slice(0, 30)}`);
    if (!result.ok) assert.match(result.error, pattern);
  }
});

test('normalizeState is idempotent for current-schema data', () => {
  const once = normalizeState(JSON.parse(fixture('backup-3.2.json')).state, 0, PHASES);
  assert.deepEqual(normalizeState(once, SCHEMA_VERSION, PHASES), once);
  assert.deepEqual(normalizeState(once, 0, PHASES), once);
});

test('summarize counts only what is set', () => {
  const summary = summarize({
    ...emptyProgress(),
    phaseStatus: { phase_1: 'completed', phase_2: 'completed', phase_3: 'in_progress', phase_4: 'not_started' },
    completedModules: { a_m1: true, a_m2: false, a_m3: true },
    deliverables: { phase_1: true, phase_2: false },
    timeTracking: { phase_1: 1.5, phase_2: 2 },
    notes: { phase_1: ' ', phase_2: 'real' },
    workbench: { phase_1: {}, phase_2: { x: 1 } },
  });
  assert.deepEqual(summary, {
    phasesCompleted: 2, phasesInProgress: 1, modulesChecked: 2, deliverablesDone: 1,
    hoursLogged: 3.5, notes: 1, workbenchPhases: 1,
  });
});

test('reminders are validated on load but never travel in a backup', () => {
  const kept = sanitizeState({
    reminders: {
      phase_1: { at: '2026-10-13T03:00:00.000Z', label: 'Tomorrow' },
      phase_2: { at: 'not a date', label: 'x' },
      phase_3: 'nope',
      phase_99: { at: '2026-10-13T03:00:00.000Z', label: 'unknown phase' },
      phase_4: { at: '2026-10-13T03:00:00.000Z' },
    },
  }, PHASES);
  assert.deepEqual(kept.reminders, {
    phase_1: { at: '2026-10-13T03:00:00.000Z', label: 'Tomorrow' },
    phase_4: { at: '2026-10-13T03:00:00.000Z', label: '' },
  });

  const data = { ...emptyProgress(), notes: { phase_1: 'hi' }, reminders: kept.reminders };
  assert.equal('reminders' in JSON.parse(buildBackup(data, '4.0.0')).state, false);

  const imported = parseBackup(JSON.stringify({ state: data, version: 1 }), PHASES, NOW);
  assert.ok(imported.ok);
  assert.deepEqual(imported.state.reminders, {});
});
