import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PhaseStatus } from '../types';
import curriculumData from '../data/curriculumData.json';
import { BACKUP_KEY, SCHEMA_VERSION, STORAGE_KEY } from '../lib/migrations';
import { toggleModuleUpdate } from '../lib/progress';
import { MAX_NAME_CHARS, emptyProgress, normalizeState, pickProgressData } from '../lib/sanitize';
import type { ProgressData, Reminder } from '../lib/sanitize';

interface ProgressState extends ProgressData {
  setDisplayName: (name: string) => void;
  setActivePhase: (phaseId: string | null) => void;
  setPhaseStatus: (phaseId: string, status: PhaseStatus) => void;
  toggleDeliverable: (phaseId: string) => void;
  toggleModule: (phaseId: string, moduleId: string) => void;
  updateWorkbench: (phaseId: string, data: Record<string, unknown>) => void;
  setPhaseTime: (phaseId: string, hours: number) => void;
  setPhaseNote: (phaseId: string, note: string) => void;
  /** Records (or clears, with null) the reminder scheduled on this device for a phase. */
  setReminder: (phaseId: string, reminder: Reminder | null) => void;
  /** Replaces all saved progress with `data` (validated again here). Reminders are kept: they belong to this device. */
  importProgress: (data: ProgressData) => void;
  resetProgress: () => void;
}

const PHASE_IDS = curriculumData.phases.map((phase) => phase.id);

/**
 * Keeps a copy of the data exactly as it was before a schema migration rewrites it, so a bad
 * migration can never be the only copy. Best effort: storage problems must not block loading.
 */
function snapshotBeforeMigration() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) localStorage.setItem(BACKUP_KEY, raw);
  } catch {
    // Storage unavailable or full: carry on without a snapshot.
  }
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      ...emptyProgress(),

      setDisplayName: (name) => set({ displayName: name.slice(0, MAX_NAME_CHARS) }),
      setActivePhase: (phaseId) => set({ activePhaseId: phaseId }),
      setPhaseStatus: (phaseId, status) => set((state) => ({ phaseStatus: { ...state.phaseStatus, [phaseId]: status }, activePhaseId: status === 'in_progress' ? phaseId : (status === 'completed' && state.activePhaseId === phaseId ? null : state.activePhaseId) })),
      toggleDeliverable: (phaseId) => set((state) => ({ deliverables: { ...state.deliverables, [phaseId]: !state.deliverables[phaseId] } })),
      toggleModule: (phaseId, moduleId) => set((state) => toggleModuleUpdate(state, phaseId, moduleId)),
      updateWorkbench: (phaseId, data) => set((state) => ({ workbench: { ...state.workbench, [phaseId]: { ...(state.workbench[phaseId] || {}), ...data } } })),
      setPhaseTime: (phaseId, hours) => set((state) => ({ timeTracking: { ...state.timeTracking, [phaseId]: Math.max(0, Number.isFinite(hours) ? hours : 0) } })),
      setPhaseNote: (phaseId, note) => set((state) => ({ notes: { ...state.notes, [phaseId]: note } })),

      setReminder: (phaseId, reminder) => set((state) => {
        const reminders = { ...state.reminders };
        if (reminder) reminders[phaseId] = reminder;
        else delete reminders[phaseId];
        return { reminders };
      }),

      importProgress: (data) => set((state) => ({
        ...emptyProgress(),
        ...normalizeState(data, SCHEMA_VERSION, PHASE_IDS),
        reminders: state.reminders,
      })),

      resetProgress: () => set(emptyProgress()),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      // Persist data only, so exports contain no functions and stay stable.
      partialize: (state) => pickProgressData(state),
      migrate: (persisted, fromVersion) => {
        snapshotBeforeMigration();
        return normalizeState(persisted, fromVersion, PHASE_IDS);
      },
      // Validate on every load so a hand-edited or corrupted entry can't crash the app.
      merge: (persisted, current) => ({
        ...current,
        ...normalizeState(persisted, SCHEMA_VERSION, PHASE_IDS),
      }),
    },
  ),
);
