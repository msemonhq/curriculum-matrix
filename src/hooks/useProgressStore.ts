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

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      phaseStatus: {},
      deliverables: {},
      workbench: {},
      timeTracking: {},
      notes: {},
      completedModules: {},
      
      setPhaseStatus: (phaseId, status) => set((state) => ({
        phaseStatus: { ...state.phaseStatus, [phaseId]: status }
      })),
      
      toggleDeliverable: (phaseId) => set((state) => ({
        deliverables: { ...state.deliverables, [phaseId]: !state.deliverables[phaseId] }
      })),

      toggleModule: (phaseId, moduleIndex) => set((state) => {
        const key = `${phaseId}_${moduleIndex}`;
        return {
          completedModules: {
            ...state.completedModules,
            [key]: !state.completedModules[key]
          }
        };
      }),
      
      updateWorkbench: (phaseId, data) => set((state) => ({
        workbench: {
          ...state.workbench,
          [phaseId]: { ...(state.workbench[phaseId] || {}), ...data }
        }
      })),

      setPhaseTime: (phaseId, hours) => set((state) => ({
        timeTracking: { ...state.timeTracking, [phaseId]: hours }
      })),

      setPhaseNote: (phaseId, note) => set((state) => ({
        notes: { ...state.notes, [phaseId]: note }
      })),

      importProgress: (data) => set((state) => ({
        phaseStatus: data.phaseStatus || state.phaseStatus,
        deliverables: data.deliverables || state.deliverables,
        workbench: data.workbench || state.workbench,
        timeTracking: data.timeTracking || state.timeTracking,
        notes: data.notes || state.notes,
        completedModules: data.completedModules || state.completedModules,
      })),
      
      resetProgress: () => set({ phaseStatus: {}, deliverables: {}, workbench: {}, timeTracking: {}, notes: {}, completedModules: {} }),
    }),
    {
      name: 'bspr-curriculum-storage',
    }
  )
);
