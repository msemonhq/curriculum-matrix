export type PhaseStatus = 'not_started' | 'in_progress' | 'completed';

export interface JDLine {
  id: string;
  text: string;
  type: 'Responsibility' | 'Competency';
}

/** `core` (default) counts toward progress; `optional` and `note` do not. */
export type ModuleKind = 'core' | 'optional' | 'note';

export interface ModuleDetail {
  id: string;
  title: string;
  description?: string;
  kind?: ModuleKind;
}

export interface Phase {
  id: string;
  number: number | string; // e.g. 1, 2, "Optional 1"
  title: string;
  course: string;
  modules: ModuleDetail[];
  application: string;
  jdLinesServed: string[];
  deliverable: string;
  hoursMin: number;
  hoursMax: number;
  isOptional?: boolean;
  workbenchId?: string;
}

export interface WorkbenchData {
  [phaseId: string]: Record<string, unknown>;
}
