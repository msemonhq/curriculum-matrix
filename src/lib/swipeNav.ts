import type { MarkTab } from './matrixMark.ts';

/** The tabs in bottom-navigation order, left to right. A swipe moves one step along this list. */
export const TAB_ORDER: readonly MarkTab[] = ['dashboard', 'curriculum', 'workbenches', 'audit'];

/** How far a finger must travel sideways to count as a swipe, in CSS pixels. */
export const SWIPE_MIN_DISTANCE = 64;
/** The swipe must be at least this many times wider than it is tall, so scrolling down is never a swipe. */
export const SWIPE_DIRECTION_RATIO = 1.75;
/** A swipe that starts this close to a screen edge is left to the system (Android's back gesture lives there). */
export const SWIPE_EDGE_GUARD = 24;

export interface SwipeInput {
  /** The tab you are on. */
  tab: string;
  /** Finger travel from touch start to touch end. Negative dx is a swipe to the left. */
  dx: number;
  dy: number;
  /** Where the touch began, and how wide the screen is. */
  startX: number;
  viewportWidth: number;
}

/**
 * The tab a swipe leads to, or null when it is not a swipe or there is nowhere to go. Swiping left brings
 * the next tab (the one to the right in the navigation), swiping right the previous one. The ends do not wrap.
 */
export function swipeTarget({ tab, dx, dy, startX, viewportWidth }: SwipeInput): MarkTab | null {
  if (![dx, dy, startX, viewportWidth].every(Number.isFinite)) return null;
  if (startX < SWIPE_EDGE_GUARD || startX > viewportWidth - SWIPE_EDGE_GUARD) return null;
  if (Math.abs(dx) < SWIPE_MIN_DISTANCE) return null;
  if (Math.abs(dx) < Math.abs(dy) * SWIPE_DIRECTION_RATIO) return null;
  const index = TAB_ORDER.indexOf(tab as MarkTab);
  if (index === -1) return null;
  return TAB_ORDER[index + (dx < 0 ? 1 : -1)] ?? null;
}
