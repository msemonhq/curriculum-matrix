import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MODULE_KEY_MAP, migrateCompletedModules, migrateState } from './migrations.ts';

const fixture = (name: string) => readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), 'utf8');

test('converts position-based keys to module ids, fanning one old module out to several', () => {
  const out = migrateCompletedModules({
    phase_3_0: true, // old module 0 became m1, m2, m3
    phase_3_1: false,
    phase_3_2: true,
    phase_5_3: true, // old module 3 became m4, m5
  });
  assert.deepEqual(out, {
    phase_3_m1: true,
    phase_3_m2: true,
    phase_3_m3: true,
    phase_3_m4: false,
    phase_3_m5: true,
    phase_5_m4: true,
    phase_5_m5: true,
  });
});

test('keeps explicit unchecked values (they override a completed phase default)', () => {
  assert.deepEqual(migrateCompletedModules({ phase_1_2: false }), { phase_1_m3: false });
});

test('never overwrites an id-based key that already exists', () => {
  const out = migrateCompletedModules({ phase_3_0: true, phase_3_m2: false });
  assert.equal(out.phase_3_m2, false);
  assert.equal(out.phase_3_m1, true);
  assert.equal(out.phase_3_m3, true);
});

test('is idempotent', () => {
  const once = migrateCompletedModules({ phase_1_0: true, phase_3_2: true, phase_4_m5: true });
  assert.deepEqual(migrateCompletedModules(once), once);
});

test('drops legacy keys with no known position and ignores non-boolean values', () => {
  const out = migrateCompletedModules({ phase_1_9: true, phase_9_0: true, phase_1_0: 'yes', phase_2_m1: true });
  assert.deepEqual(out, { phase_2_m1: true });
});

test('tolerates garbage input', () => {
  assert.deepEqual(migrateCompletedModules(null), {});
  assert.deepEqual(migrateCompletedModules([true]), {});
  assert.deepEqual(migrateCompletedModules('x'), {});
});

test('map covers every phase and only references ids in the pattern m<number>', () => {
  assert.equal(Object.keys(MODULE_KEY_MAP).length, 8);
  for (const ids of Object.values(MODULE_KEY_MAP).flat(2)) assert.match(ids, /^m\d+$/);
});

test('each new module id comes from exactly one old position', () => {
  for (const [phase, positions] of Object.entries(MODULE_KEY_MAP)) {
    const flat = positions.flat();
    assert.equal(new Set(flat).size, flat.length, `${phase} maps an id twice`);
  }
});

test('migrateState only rewrites modules below schema 1 and keeps other fields', () => {
  const raw = { notes: { phase_1: 'hi' }, completedModules: { phase_1_0: true } };
  const v0 = migrateState(raw, 0);
  assert.deepEqual(v0.completedModules, { phase_1_m1: true });
  assert.deepEqual(v0.notes, { phase_1: 'hi' });
  assert.deepEqual(migrateState(raw, 1).completedModules, { phase_1_0: true });
});

test('real 3.2.0-format fixture migrates as expected', () => {
  const { state, version } = JSON.parse(fixture('backup-3.2.json'));
  assert.equal(version, 0);
  const out = migrateState(state, version);
  assert.deepEqual(out.completedModules, {
    phase_1_m1: true,
    phase_1_m2: true,
    phase_1_m3: false,
    phase_2_m1: true,
    phase_3_m1: true,
    phase_3_m2: true,
    phase_3_m3: true,
    phase_3_m5: true,
    phase_5_m4: true,
    phase_5_m5: true,
  });
});
