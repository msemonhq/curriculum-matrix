import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phaseIdFromState, ROADMAP_PATH, roadmapState } from './roadmapLink.ts';

test('the Roadmap path matches the route the app registers', () => {
  assert.equal(ROADMAP_PATH, '/curriculum');
});

test('the phase comes back out of the state a link made', () => {
  assert.deepEqual(roadmapState('phase_3'), { phaseId: 'phase_3' });
  assert.equal(phaseIdFromState(roadmapState('phase_3')), 'phase_3');
});

test('anything that is not a phase request reads as none', () => {
  for (const state of [null, undefined, 'phase_3', 3, {}, { phaseId: '' }, { phaseId: 3 }, { phaseId: null }, []]) {
    assert.equal(phaseIdFromState(state), null, JSON.stringify(state));
  }
});
