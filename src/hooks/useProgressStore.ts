import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PhaseStatus, WorkbenchData } from '../types';

interface ProgressState {
  phaseStatus: Record<string, PhaseStatus>;
  deliverables: Record<string, boolean>;
  workbench: WorkbenchData;
  setPhaseStatus: (phaseId: string, status: PhaseStatus) => void;
  toggleDeliverable: (phaseId: string) => void;
  updateWorkbench: (phaseId: string, data: any) => void;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      phaseStatus: {},
      deliverables: {},
      workbench: {},
      
      setPhaseStatus: (phaseId, status) => set((state) => ({
        phaseStatus: { ...state.phaseStatus, [phaseId]: status }
      })),
      
      toggleDeliverable: (phaseId) => set((state) => ({
        deliverables: { ...state.deliverables, [phaseId]: !state.deliverables[phaseId] }
      })),
      
      updateWorkbench: (phaseId, data) => set((state) => ({
        workbench: {
          ...state.workbench,
          [phaseId]: { ...(state.workbench[phaseId] || {}), ...data }
        }
      })),
      
      resetProgress: () => set({ phaseStatus: {}, deliverables: {}, workbench: {} }),
    }),
    {
      name: 'bspr-curriculum-storage',
    }
  )
);
