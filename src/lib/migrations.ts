// Saved-data migrations. Pure functions only (no React, no browser APIs) so they can be
// unit-tested with `node --test`. Relative imports use explicit .ts extensions for that reason.
import { looseDateToYmd } from './dates.ts';

/** Version of the persisted/exported data shape. 0 = anything saved before 4.0.0. */
export const SCHEMA_VERSION = 1;

/** localStorage key used by the zustand persist middleware. */
export const STORAGE_KEY = 'bspr-curriculum-storage';

/** Snapshot of the previous data, written once before a migration runs. */
export const BACKUP_KEY = `${STORAGE_KEY}.bak`;

/**
 * Releases up to 3.2.0 keyed module checkmarks by list position (`phase_3_0`). Modules now
 * have stable ids (`phase_3_m1`) and the curriculum was re-cut from the V5 matrix, so an old
 * position maps to one or more new ids. The array index below IS the old position.
 *
 * Modules that did not exist before (optional/stretch items) are intentionally absent: they
 * start unchecked.
 */
export const MODULE_KEY_MAP: Record<string, string[][]> = {
  phase_1: [['m1'], ['m2'], ['m3'], ['m4']],
  phase_2: [['m1'], ['m2']],
  phase_3: [['m1', 'm2', 'm3'], ['m4'], ['m5']],
  phase_4: [['m1', 'm2', 'm3'], ['m5']],
  phase_5: [['m1'], ['m2'], ['m3'], ['m4', 'm5']],
  phase_6: [['m1', 'm2'], ['m3'], ['m4']],
  phase_7: [['m1', 'm2', 'm3'], ['m5']],
  phase_8: [['m1', 'm2'], ['m5']],
};

const LEGACY_KEY = /^(phase_\d+)_(\d+)$/;

export const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

/**
 * Converts position-based keys to id-based keys.
 * - Only keys shaped `phase_N_<digits>` are touched; everything else passes through.
 * - An id-based key that already exists is never overwritten, so running this twice (or on
 *   data that is already partly migrated) is safe.
 * - Legacy keys that point at a position the map does not know are dropped.
 */
export function migrateCompletedModules(input: unknown): Record<string, boolean> {
  if (!isRecord(input)) return {};
  const out: Record<string, boolean> = {};
  const legacy: Array<[string, string, number, boolean]> = [];

  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== 'boolean') continue;
    const match = LEGACY_KEY.exec(key);
    if (match) legacy.push([key, match[1], Number(match[2]), value]);
    else out[key] = value;
  }

  for (const [, phaseId, position, value] of legacy) {
    const ids = MODULE_KEY_MAP[phaseId]?.[position];
    if (!ids) continue;
    for (const id of ids) {
      const newKey = `${phaseId}_${id}`;
      if (!(newKey in out)) out[newKey] = value;
    }
  }
  return out;
}

/**
 * Demand Calendar events used free text ("Oct 15"). They are now YYYY-MM-DD from a date input:
 * convert each to its next occurrence, and keep unreadable ones with an empty date to fix.
 */
export function migrateWorkbench(workbench: unknown, now: Date): unknown {
  if (!isRecord(workbench)) return workbench;
  const calendar = workbench['5'];
  if (!isRecord(calendar) || !Array.isArray(calendar.events)) return workbench;
  const events = calendar.events.filter(isRecord).map((event) => ({
    ...event,
    date: looseDateToYmd(event.date, now),
    title: typeof event.title === 'string' ? event.title : '',
  }));
  return { ...workbench, '5': { ...calendar, events } };
}

/**
 * Brings a raw persisted/imported state up to the current schema. `fromVersion` is the
 * version the data was saved with (0 when unknown). Input is untrusted; the result still
 * has to go through the sanitizers before use.
 */
export function migrateState(raw: unknown, fromVersion: number, now: Date = new Date()): Record<string, unknown> {
  let state: Record<string, unknown> = isRecord(raw) ? { ...raw } : {};

  if (fromVersion < 1) {
    state = {
      ...state,
      completedModules: migrateCompletedModules(state.completedModules),
      workbench: migrateWorkbench(state.workbench, now),
    };
  }

  return state;
}
