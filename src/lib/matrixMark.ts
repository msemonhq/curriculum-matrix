/**
 * The header mark is a 2 by 2 grid with one square filled. Each of the four tabs owns one square,
 * in the same order as the bottom navigation read left to right: Dashboard top left, Roadmap top right,
 * Workbenches bottom left, Audit bottom right. Opening a tool keeps the Workbenches square.
 */
export type MarkTab = 'dashboard' | 'curriculum' | 'workbenches' | 'audit';

export interface MarkCell {
  col: 0 | 1;
  row: 0 | 1;
}

export const MARK_CELLS: Readonly<Record<MarkTab, MarkCell>> = {
  dashboard: { col: 0, row: 0 },
  curriculum: { col: 1, row: 0 },
  workbenches: { col: 0, row: 1 },
  audit: { col: 1, row: 1 },
};

/** The square for a tab. An unknown tab falls back to the Dashboard's, as the app does for an unknown route. */
export function markCell(tab: string): MarkCell {
  return Object.prototype.hasOwnProperty.call(MARK_CELLS, tab) ? MARK_CELLS[tab as MarkTab] : MARK_CELLS.dashboard;
}
