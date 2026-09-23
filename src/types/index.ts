export type PhaseStatus = 'not_started' | 'in_progress' | 'in_review' | 'completed';

export interface JDLine {
  id: string;
  text: string;
  type: 'Responsibility' | 'Competency';
}

export interface Phase {
  id: string;
  number: number | string; // e.g. 1, 2, "Optional 1"
  title: string;
  course: string;
  modules: string[];
  application: string;
  jdLinesServed: string[];
  deliverable: string;
  estimatedHours: string;
  isOptional?: boolean;
}

export interface WorkbenchData {
  [phaseId: string]: any;
}
