// Which workbench tools hold something the person entered. Pure functions only (no React, no store) so
// `node --test` can check them against the real normalizers. A tool "holds data" when what is saved,
// run through the tool's own normalizer, differs from what a fresh install normalizes to, so a saved
// value that has been cleared back to empty reads as no data.
import { normalizeAbTest, normalizeBrief, normalizeCalendar, normalizeIssueTree, normalizeRecon, normalizeVerificationLog } from './workbench.ts';
import { normalizeStrategyCanvas } from './strategy.ts';

interface SavedShape {
  normalize: (raw: unknown) => object;
  /** Top-level fields that change on every edit without being the person's content (a "saved at" stamp). */
  ignore?: readonly string[];
}

/** Keyed by tool id. The formula cheat-sheet ('3') is a reference and saves nothing, so it has no entry. */
export const SAVED_SHAPES: Readonly<Record<string, SavedShape>> = {
  '1': { normalize: normalizeIssueTree },
  '2': { normalize: normalizeVerificationLog },
  '4': { normalize: normalizeRecon },
  '5': { normalize: normalizeCalendar },
  '6': { normalize: normalizeStrategyCanvas },
  '7': { normalize: normalizeAbTest },
  '8': { normalize: normalizeBrief, ignore: ['savedAt'] },
};

/** True when the tool's saved data holds anything beyond a fresh start. Unknown tools hold nothing. */
export function toolHoldsData(toolId: string, saved: unknown): boolean {
  const shape = SAVED_SHAPES[toolId];
  if (!shape) return false;
  const content = (value: object) =>
    JSON.stringify(Object.entries(value).filter(([key]) => !shape.ignore?.includes(key)));
  return content(shape.normalize(saved)) !== content(shape.normalize(undefined));
}
