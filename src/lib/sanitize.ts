// Validation, backup parsing and export building. Pure functions only (no React, no browser
// APIs) so they can be unit-tested with `node --test`.
import type { PhaseStatus } from '../types/index.ts';
import { SCHEMA_VERSION, isRecord, migrateState } from './migrations.ts';

/** The saved (non-function) part of the progress store. */
export interface ProgressData {
  activePhaseId: string | null;
  phaseStatus: Record<string, PhaseStatus>;
  deliverables: Record<string, boolean>;
  workbench: Record<string, Record<string, unknown>>;
  timeTracking: Record<string, number>;
  notes: Record<string, string>;
  completedModules: Record<string, boolean>;
}

export const MAX_BACKUP_CHARS = 5_000_000;
export const MAX_NOTE_CHARS = 100_000;
export const MAX_HOURS_PER_PHASE = 10_000;

const STATUSES: ReadonlySet<string> = new Set(['not_started', 'in_progress', 'completed']);
const BLOCKED_KEYS: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype']);
const WORKBENCH_KEY = /^[A-Za-z0-9_-]{1,40}$/;
const DATA_KEYS = [
  'activePhaseId', 'phaseStatus', 'deliverables', 'workbench', 'timeTracking', 'notes', 'completedModules',
] as const;

export function emptyProgress(): ProgressData {
  return {
    activePhaseId: null,
    phaseStatus: {},
    deliverables: {},
    workbench: {},
    timeTracking: {},
    notes: {},
    completedModules: {},
  };
}

/** Picks only the saved fields from a store state (drops actions). */
export function pickProgressData(state: ProgressData): ProgressData {
  return {
    activePhaseId: state.activePhaseId,
    phaseStatus: state.phaseStatus,
    deliverables: state.deliverables,
    workbench: state.workbench,
    timeTracking: state.timeTracking,
    notes: state.notes,
    completedModules: state.completedModules,
  };
}

/** Copies the entries of `value` that pass `keep`, skipping prototype-polluting keys. */
function filterRecord<T>(
  value: unknown,
  keepKey: (key: string) => boolean,
  mapValue: (item: unknown) => T | undefined,
): Record<string, T> {
  const out: Record<string, T> = {};
  if (!isRecord(value)) return out;
  for (const [key, item] of Object.entries(value)) {
    if (BLOCKED_KEYS.has(key) || !keepKey(key)) continue;
    const mapped = mapValue(item);
    if (mapped !== undefined) out[key] = mapped;
  }
  return out;
}

/**
 * Validates an untrusted state object. Unknown/invalid entries are dropped, never thrown on.
 * When `phaseIds` is given, entries for phases that do not exist are dropped too.
 */
export function sanitizeState(raw: unknown, phaseIds?: readonly string[]): ProgressData {
  const source = isRecord(raw) ? raw : {};
  const known = phaseIds ? new Set(phaseIds) : null;
  const knownPhase = (key: string) => !known || known.has(key);
  const knownModuleKey = (key: string) => {
    if (!known) return true;
    const cut = key.lastIndexOf('_');
    return cut > 0 && known.has(key.slice(0, cut)) && key.length > cut + 1;
  };

  const activePhaseId = typeof source.activePhaseId === 'string' && knownPhase(source.activePhaseId)
    ? source.activePhaseId
    : null;

  return {
    activePhaseId,
    phaseStatus: filterRecord<PhaseStatus>(
      source.phaseStatus,
      knownPhase,
      (item) => (typeof item === 'string' && STATUSES.has(item) ? (item as PhaseStatus) : undefined),
    ),
    deliverables: filterRecord<boolean>(
      source.deliverables,
      knownPhase,
      (item) => (typeof item === 'boolean' ? item : undefined),
    ),
    // Workbench data is keyed by tool id ('1'..'8'), not by phase id.
    workbench: filterRecord<Record<string, unknown>>(
      source.workbench,
      (key) => WORKBENCH_KEY.test(key),
      (item) => (isRecord(item) ? item : undefined),
    ),
    timeTracking: filterRecord<number>(
      source.timeTracking,
      knownPhase,
      (item) => (
        typeof item === 'number' && Number.isFinite(item) && item >= 0
          ? Math.min(item, MAX_HOURS_PER_PHASE)
          : undefined
      ),
    ),
    notes: filterRecord<string>(
      source.notes,
      knownPhase,
      (item) => (typeof item === 'string' ? item.slice(0, MAX_NOTE_CHARS) : undefined),
    ),
    completedModules: filterRecord<boolean>(
      source.completedModules,
      knownModuleKey,
      (item) => (typeof item === 'boolean' ? item : undefined),
    ),
  };
}

/** Migrate then sanitize: the one entry point for stored or imported state. */
export function normalizeState(raw: unknown, fromVersion: number, phaseIds?: readonly string[]): ProgressData {
  return sanitizeState(migrateState(raw, fromVersion), phaseIds);
}

export interface BackupSummary {
  phasesCompleted: number;
  phasesInProgress: number;
  modulesChecked: number;
  deliverablesDone: number;
  hoursLogged: number;
  notes: number;
  workbenchPhases: number;
}

export function summarize(data: ProgressData): BackupSummary {
  const statuses = Object.values(data.phaseStatus);
  const hours = Object.values(data.timeTracking).reduce((sum, h) => sum + h, 0);
  return {
    phasesCompleted: statuses.filter((s) => s === 'completed').length,
    phasesInProgress: statuses.filter((s) => s === 'in_progress').length,
    modulesChecked: Object.values(data.completedModules).filter(Boolean).length,
    deliverablesDone: Object.values(data.deliverables).filter(Boolean).length,
    hoursLogged: Math.round(hours * 100) / 100,
    notes: Object.values(data.notes).filter((n) => n.trim().length > 0).length,
    workbenchPhases: Object.values(data.workbench).filter((w) => Object.keys(w).length > 0).length,
  };
}

export function isEmptySummary(summary: BackupSummary): boolean {
  return Object.values(summary).every((n) => n === 0);
}

export type ParsedBackup =
  | { ok: true; state: ProgressData; summary: BackupSummary; sourceVersion: number }
  | { ok: false; error: string };

/**
 * Reads a backup file/paste. Accepts the full export (`{ state, version, ... }`, which is also
 * what the raw saved data looks like) or a bare state object. Never throws.
 */
export function parseBackup(text: string, phaseIds?: readonly string[]): ParsedBackup {
  if (typeof text !== 'string' || !text.trim()) return { ok: false, error: 'Paste or choose a backup first.' };
  if (text.length > MAX_BACKUP_CHARS) return { ok: false, error: 'This file is too large to be a backup.' };

  let parsed: unknown;
  try {
    // Strip a UTF-8 BOM so files saved by some editors still parse.
    parsed = JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
  } catch {
    return { ok: false, error: 'The backup is not valid JSON.' };
  }
  if (!isRecord(parsed)) return { ok: false, error: 'This does not look like a Curriculum Matrix backup.' };

  let rawState: unknown;
  let sourceVersion = 0;
  if (isRecord(parsed.state)) {
    rawState = parsed.state;
    if (typeof parsed.version === 'number' && Number.isInteger(parsed.version) && parsed.version >= 0) {
      sourceVersion = parsed.version;
    }
  } else if (DATA_KEYS.some((key) => key in parsed)) {
    rawState = parsed;
  } else {
    return { ok: false, error: 'This does not look like a Curriculum Matrix backup.' };
  }

  if (sourceVersion > SCHEMA_VERSION) {
    return { ok: false, error: 'This backup was made by a newer version of the app. Update the app, then try again.' };
  }

  const state = normalizeState(rawState, sourceVersion, phaseIds);
  const summary = summarize(state);
  if (isEmptySummary(summary)) {
    return { ok: false, error: 'This backup has no progress in it, so importing it would only erase your data.' };
  }
  return { ok: true, state, summary, sourceVersion };
}

/** Serializes the data in the export format (a superset of the persisted `{ state, version }`). */
export function buildBackup(data: ProgressData, appVersion: string, now: Date = new Date()): string {
  return JSON.stringify(
    {
      app: 'bspr-curriculum',
      version: SCHEMA_VERSION,
      appVersion,
      exportedAt: now.toISOString(),
      state: pickProgressData(data),
    },
    null,
    2,
  );
}
