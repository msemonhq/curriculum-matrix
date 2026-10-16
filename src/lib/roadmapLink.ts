// A link into the Roadmap that lands on one phase. The phase id travels in the router's location state,
// so it never shows in the address and a plain visit to the Roadmap is unchanged:
//   navigate(ROADMAP_PATH, { state: roadmapState('phase_3') })

export const ROADMAP_PATH = '/curriculum';

export function roadmapState(phaseId: string): { phaseId: string } {
  return { phaseId };
}

/** The phase a visit asked for, if any. Anything that is not a non-empty string reads as no request. */
export function phaseIdFromState(state: unknown): string | null {
  if (typeof state !== 'object' || state === null) return null;
  const id = (state as { phaseId?: unknown }).phaseId;
  return typeof id === 'string' && id.length > 0 ? id : null;
}
