import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PhaseStatus, WorkbenchData } from '../types';

interface ProgressState {
  phaseStatus: Record<string, PhaseStatus>;
  deliverables: Record<string, boolean>;
  workbench: WorkbenchData;
  timeTracking: Record<string, number>;
  notes: Record<string, string>;
  completedModules: Record<string, boolean>;
  setPhaseStatus: (phaseId: string, status: PhaseStatus) => void;
  toggleDeliverable: (phaseId: string) => void;
  toggleModule: (phaseId: string, moduleIndex: number) => void;
  updateWorkbench: (phaseId: string, data: Record<string, unknown>) => void;
  setPhaseTime: (phaseId: string, hours: number) => void;
  setPhaseNote: (phaseId: string, note: string) => void;
  importProgress: (data: Partial<ProgressState>) => void;
  resetProgress: () => void;
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const validStatuses = new Set<PhaseStatus>(['not_started', 'in_progress', 'completed']);

function sanitizeStatus(value: unknown): Record<string, PhaseStatus> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, status]) => typeof status === 'string' && validStatuses.has(status as PhaseStatus)),
  ) as Record<string, PhaseStatus>;
}

function sanitizeBooleans(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === 'boolean')) as Record<string, boolean>;
}

function sanitizeNumbers(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => typeof item === 'number' && Number.isFinite(item) && item >= 0),
  ) as Record<string, number>;
}

function sanitizeNotes(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === 'string')) as Record<string, string>;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      phaseStatus: {},
      deliverables: {},
      workbench: {},
      timeTracking: {},
      notes: {},
      completedModules: {},

      setPhaseStatus: (phaseId, status) => set((state) => ({ phaseStatus: { ...state.phaseStatus, [phaseId]: status } })),
      toggleDeliverable: (phaseId) => set((state) => ({ deliverables: { ...state.deliverables, [phaseId]: !state.deliverables[phaseId] } })),
      toggleModule: (phaseId, moduleIndex) => set((state) => {
        const key = `${phaseId}_${moduleIndex}`;
        return { completedModules: { ...state.completedModules, [key]: !state.completedModules[key] } };
      }),
      updateWorkbench: (phaseId, data) => set((state) => ({ workbench: { ...state.workbench, [phaseId]: { ...(state.workbench[phaseId] || {}), ...data } } })),
      setPhaseTime: (phaseId, hours) => set((state) => ({ timeTracking: { ...state.timeTracking, [phaseId]: Math.max(0, Number.isFinite(hours) ? hours : 0) } })),
      setPhaseNote: (phaseId, note) => set((state) => ({ notes: { ...state.notes, [phaseId]: note } })),

      importProgress: (data) => set((state) => {
        const incoming = isRecord(data) ? data : {};
        return {
          phaseStatus: Object.keys(sanitizeStatus(incoming.phaseStatus)).length ? sanitizeStatus(incoming.phaseStatus) : state.phaseStatus,
          deliverables: Object.keys(sanitizeBooleans(incoming.deliverables)).length ? sanitizeBooleans(incoming.deliverables) : state.deliverables,
          workbench: isRecord(incoming.workbench) ? incoming.workbench as WorkbenchData : state.workbench,
          timeTracking: Object.keys(sanitizeNumbers(incoming.timeTracking)).length ? sanitizeNumbers(incoming.timeTracking) : state.timeTracking,
          notes: Object.keys(sanitizeNotes(incoming.notes)).length ? sanitizeNotes(incoming.notes) : state.notes,
          completedModules: Object.keys(sanitizeBooleans(incoming.completedModules)).length ? sanitizeBooleans(incoming.completedModules) : state.completedModules,
        };
      }),

      resetProgress: () => set({ phaseStatus: {}, deliverables: {}, workbench: {}, timeTracking: {}, notes: {}, completedModules: {} }),
    }),
    { name: 'bspr-curriculum-storage' },
  ),
);
