import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAVED_SHAPES, toolHoldsData } from './workbenchData.ts';

const IDS = Object.keys(SAVED_SHAPES);

// One real edit per tool, written as the raw shape the store keeps.
const ENTERED: Record<string, unknown> = {
  '1': { question: 'Why did conversion fall in March?', branches: [] },
  '2': { claims: [{ id: 'c1', claim: 'Returns rose 12%', source: '', status: 'unchecked' }] },
  '4': { rows: [{ date: '2026-10-01', ga4: '120', meta: '' }] },
  '5': { events: [{ id: 'e1', date: '2026-11-11', title: 'Singles Day' }] },
  '6': { competitors: [{ id: 'c1', name: 'Rival' }], factors: [], opportunities: [] },
  '7': { hypothesis: 'A shorter form lifts sign-ups' },
  '8': { title: 'Q4 brief', findings: ['', '', ''] },
};

test('the tools that save data are exactly the seven that are not the cheat-sheet', () => {
  assert.deepEqual(IDS, ['1', '2', '4', '5', '6', '7', '8']);
  assert.deepEqual(Object.keys(ENTERED), IDS);
});

test('a fresh install, junk and a tool that was never opened hold no data', () => {
  for (const id of IDS) {
    for (const nothing of [undefined, null, 7, 'x', [], {}]) {
      assert.equal(toolHoldsData(id, nothing), false, `tool ${id} with ${JSON.stringify(nothing)}`);
    }
  }
});

test('a saved value that is the empty slice holds no data, however it got there', () => {
  for (const id of IDS) {
    const empty = SAVED_SHAPES[id].normalize(undefined);
    assert.equal(toolHoldsData(id, empty), false, `tool ${id} saved back as empty`);
  }
});

test('anything the person entered holds data', () => {
  for (const id of IDS) assert.equal(toolHoldsData(id, ENTERED[id]), true, `tool ${id}`);
});

test('the formula cheat-sheet and unknown tools never hold data', () => {
  assert.equal(toolHoldsData('3', { anything: 'at all' }), false);
  assert.equal(toolHoldsData('99', ENTERED['1']), false);
});

test('Brief Builder\'s "saved at" stamp alone is not data; its content is', () => {
  const stampOnly = { title: '', findings: ['', '', ''], savedAt: '2026-10-12T09:00:00.000Z' };
  assert.equal(toolHoldsData('8', stampOnly), false);
  assert.equal(toolHoldsData('8', { ...stampOnly, answerFirst: 'Ship it' }), true);
  assert.equal(toolHoldsData('8', { ...stampOnly, confidence: 'high' }), true);
});

test('typing then clearing a field goes back to no data', () => {
  assert.equal(toolHoldsData('7', { hypothesis: 'x' }), true);
  assert.equal(toolHoldsData('7', { hypothesis: '' }), false);
  const row = (ga4: string) => ({ rows: [{ date: '', ga4, meta: '' }], thresholdPct: 10, note: '' });
  assert.equal(toolHoldsData('4', row('120')), true);
  assert.equal(toolHoldsData('4', row('')), false);
});

test('changing the Recon threshold counts as data, because it is a choice the person made', () => {
  assert.equal(toolHoldsData('4', { rows: [], thresholdPct: 25, note: '' }), true);
});

test('3.x data that carried no meaning (the seeded examples) reads as no data', () => {
  assert.equal(toolHoldsData('1', { issues: ['Low Conversion Rate', 'High Bounce Rate'] }), false);
  assert.equal(toolHoldsData('5', { events: [{ id: 'e1', date: '', title: 'Q4 Webinar' }] }), false);
  assert.equal(toolHoldsData('2', { logs: [{ id: 'l1', text: 'Ad copy generation', status: 'pass' }] }), false);
});
