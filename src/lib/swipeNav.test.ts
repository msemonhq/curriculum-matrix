import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MARK_CELLS } from './matrixMark.ts';
import { SWIPE_EDGE_GUARD, SWIPE_MIN_DISTANCE, TAB_ORDER, swipeTarget } from './swipeNav.ts';

const W = 390;
const swipe = (tab: string, dx: number, dy = 0, startX = 200) => swipeTarget({ tab, dx, dy, startX, viewportWidth: W });

test('the tab order is the navigation order and covers every tab once', () => {
  assert.deepEqual([...TAB_ORDER], ['dashboard', 'curriculum', 'workbenches', 'audit']);
  assert.deepEqual([...TAB_ORDER].sort(), Object.keys(MARK_CELLS).sort());
});

test('swiping left brings the next tab, swiping right the previous one', () => {
  assert.equal(swipe('dashboard', -120), 'curriculum');
  assert.equal(swipe('curriculum', -120), 'workbenches');
  assert.equal(swipe('workbenches', -120), 'audit');
  assert.equal(swipe('audit', 120), 'workbenches');
  assert.equal(swipe('curriculum', 120), 'dashboard');
});

test('the ends do not wrap round', () => {
  assert.equal(swipe('dashboard', 200), null);
  assert.equal(swipe('audit', -200), null);
});

test('a short drag is not a swipe', () => {
  assert.equal(swipe('curriculum', -(SWIPE_MIN_DISTANCE - 1)), null);
  assert.equal(swipe('curriculum', SWIPE_MIN_DISTANCE - 1), null);
  assert.equal(swipe('curriculum', -SWIPE_MIN_DISTANCE), 'workbenches');
});

test('a mostly vertical drag is scrolling, not a swipe', () => {
  assert.equal(swipe('curriculum', -100, 100), null);
  assert.equal(swipe('curriculum', -100, 70), null);
  assert.equal(swipe('curriculum', -100, 50), 'workbenches');
  assert.equal(swipe('curriculum', 100, -50), 'dashboard');
});

test('a swipe that starts at a screen edge is left to the system', () => {
  assert.equal(swipe('curriculum', 120, 0, SWIPE_EDGE_GUARD - 1), null);
  assert.equal(swipe('curriculum', -120, 0, W - SWIPE_EDGE_GUARD + 1), null);
  assert.equal(swipe('curriculum', 120, 0, SWIPE_EDGE_GUARD), 'dashboard');
  assert.equal(swipe('curriculum', -120, 0, W - SWIPE_EDGE_GUARD), 'workbenches');
});

test('an unknown tab or a non-numeric input goes nowhere', () => {
  assert.equal(swipe('settings', -120), null);
  assert.equal(swipe('', -120), null);
  assert.equal(swipe('curriculum', Number.NaN), null);
  assert.equal(swipeTarget({ tab: 'curriculum', dx: -120, dy: 0, startX: Number.NaN, viewportWidth: W }), null);
  assert.equal(swipeTarget({ tab: 'curriculum', dx: -120, dy: 0, startX: 200, viewportWidth: Number.POSITIVE_INFINITY }), null);
});
