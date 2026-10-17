import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MARK_CELLS, markCell } from './matrixMark.ts';
import type { MarkTab } from './matrixMark.ts';

const TABS_IN_NAV_ORDER: MarkTab[] = ['dashboard', 'curriculum', 'workbenches', 'audit'];

test('every tab fills its own square', () => {
  const squares = TABS_IN_NAV_ORDER.map((tab) => `${markCell(tab).col},${markCell(tab).row}`);
  assert.equal(new Set(squares).size, 4);
});

test('the squares follow the navigation order: top left, top right, bottom left, bottom right', () => {
  assert.deepEqual(TABS_IN_NAV_ORDER.map(markCell), [
    { col: 0, row: 0 },
    { col: 1, row: 0 },
    { col: 0, row: 1 },
    { col: 1, row: 1 },
  ]);
});

test('an unknown tab, or a name that only exists on Object, reads as the Dashboard', () => {
  for (const tab of ['', 'settings', 'toString', '__proto__', 'constructor']) {
    assert.deepEqual(markCell(tab), MARK_CELLS.dashboard, tab);
  }
});
