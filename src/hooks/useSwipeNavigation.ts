import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { MarkTab } from '../lib/matrixMark';
import { swipeTarget } from '../lib/swipeNav';

/** Controls that use horizontal drags themselves: a swipe that starts on one belongs to it. */
const OWN_DRAG = 'input, textarea, select, [contenteditable="true"], [role="slider"], [data-no-swipe]';

/** True when a touch starting on `target` must not be read as a swipe between screens. */
function startsWhereASwipeIsNotWanted(target: EventTarget | null, root: HTMLElement): boolean {
  if (!(target instanceof Element)) return true;
  // A sheet locks the page behind it while it is open.
  if (document.body.style.overflow === 'hidden') return true;
  // Pinched in, a sideways drag pans the page.
  if ((window.visualViewport?.scale ?? 1) > 1.01) return true;
  for (let el: Element | null = target; el && el !== root; el = el.parentElement) {
    if (el.matches(OWN_DRAG)) return true;
    // Anything that scrolls sideways (a row of filter chips) keeps its own drag.
    const { overflowX } = getComputedStyle(el);
    if ((overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 1) return true;
  }
  return false;
}

/**
 * Swiping sideways on the screen moves to the next or previous tab. `tab` is the tab you are on and
 * `enabled` turns the gesture off (inside a tool, where there is no tab bar). The rule for what counts as a
 * swipe is `swipeTarget`; this hook only reads the touches and keeps clear of controls that drag themselves.
 */
export function useSwipeNavigation(
  ref: RefObject<HTMLElement | null>,
  tab: string,
  enabled: boolean,
  onSwipe: (tab: MarkTab) => void,
) {
  const latest = useRef({ tab, enabled, onSwipe });
  useEffect(() => {
    latest.current = { tab, enabled, onSwipe };
  });

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let start: { x: number; y: number } | null = null;

    const onStart = (event: TouchEvent) => {
      start = null;
      if (!latest.current.enabled || event.touches.length !== 1) return;
      if (startsWhereASwipeIsNotWanted(event.target, root)) return;
      start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    };
    // A second finger turns the gesture into a pinch.
    const onMove = (event: TouchEvent) => {
      if (event.touches.length > 1) start = null;
    };
    const onEnd = (event: TouchEvent) => {
      const from = start;
      start = null;
      const touch = event.changedTouches[0];
      if (!from || !touch || event.touches.length > 0) return;
      const next = swipeTarget({
        tab: latest.current.tab,
        dx: touch.clientX - from.x,
        dy: touch.clientY - from.y,
        startX: from.x,
        viewportWidth: window.innerWidth,
      });
      if (next) latest.current.onSwipe(next);
    };
    const onCancel = () => {
      start = null;
    };

    root.addEventListener('touchstart', onStart, { passive: true });
    root.addEventListener('touchmove', onMove, { passive: true });
    root.addEventListener('touchend', onEnd, { passive: true });
    root.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      root.removeEventListener('touchstart', onStart);
      root.removeEventListener('touchmove', onMove);
      root.removeEventListener('touchend', onEnd);
      root.removeEventListener('touchcancel', onCancel);
    };
  }, [ref]);
}
