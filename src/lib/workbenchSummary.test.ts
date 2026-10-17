import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAVED_SHAPES } from './workbenchData.ts';
import { SUMMARISED_TOOL_IDS, toolSummary } from './workbenchSummary.ts';

const NOW = new Date(2026, 9, 17, 10); // 17 Oct 2026, local

const claim = (id: string, status: string) => ({ id, claim: `claim ${id}`, source: '', status });

test('every tool that saves data has a summary, and the cheat-sheet has none', () => {
  assert.deepEqual(SUMMARISED_TOOL_IDS.sort(), Object.keys(SAVED_SHAPES).sort());
  assert.equal(toolSummary('3', { anything: 1 }, NOW), null);
});

test('a tool that holds nothing has no summary, however empty it looks', () => {
  for (const id of SUMMARISED_TOOL_IDS) {
    for (const nothing of [undefined, null, 7, 'x', [], {}, SAVED_SHAPES[id].normalize(undefined)]) {
      assert.equal(toolSummary(id, nothing, NOW), null, `tool ${id} with ${JSON.stringify(nothing)}`);
    }
  }
});

test('issue tree: branches and hypotheses, with the singular and the question-only case', () => {
  assert.equal(toolSummary('1', { question: 'Why?', branches: [] }, NOW), 'Question set, no branches yet');
  const branch = (id: string, n: number) => ({ id, title: `b${id}`, hypotheses: Array.from({ length: n }, (_, i) => ({ id: `${id}h${i}`, text: 'h', rank: 0, dataSource: '', method: '', decisionResult: '' })) });
  assert.equal(toolSummary('1', { question: 'Why?', branches: [branch('1', 1)] }, NOW), '1 branch, 1 hypothesis');
  assert.equal(toolSummary('1', { question: 'Why?', branches: [branch('1', 2), branch('2', 3)] }, NOW), '2 branches, 5 hypotheses');
});

test('verification log: checked means confirmed or unsupported, out of ten or the claims logged', () => {
  assert.equal(toolSummary('2', { claims: [claim('1', 'unchecked')] }, NOW), '0 of 10 claims checked');
  assert.equal(toolSummary('2', { claims: [claim('1', 'confirmed'), claim('2', 'unsupported'), claim('3', 'unchecked')] }, NOW), '2 of 10 claims checked');
  const twelve = Array.from({ length: 12 }, (_, i) => claim(String(i), i < 5 ? 'confirmed' : 'unchecked'));
  assert.equal(toolSummary('2', { claims: twelve }, NOW), '5 of 12 claims checked');
});

test('GA4 vs Meta: days compared and days over the threshold', () => {
  assert.equal(toolSummary('4', { rows: [{ date: '2026-10-01', ga4: '120', meta: '' }] }, NOW), 'Numbers started, no day complete yet');
  const rows = [
    { date: '2026-10-01', ga4: '100', meta: '100' }, // 0%
    { date: '2026-10-02', ga4: '150', meta: '100' }, // +50%, over the default 10%
  ];
  assert.equal(toolSummary('4', { rows }, NOW), '2 days compared, 1 over the threshold');
  assert.equal(toolSummary('4', { rows: rows.slice(0, 1) }, NOW), '1 day compared, 0 over the threshold');
});

test('demand calendar: the next event with how far away it is, else what is left', () => {
  const ev = (id: string, date: string, title: string) => ({ id, date, title });
  assert.equal(toolSummary('5', { events: [ev('a', '2026-11-11', 'Singles Day'), ev('b', '2026-10-01', 'Past')] }, NOW), 'Next: Singles Day, in 25 days');
  assert.equal(toolSummary('5', { events: [ev('a', '2026-10-17', 'Launch')] }, NOW), 'Next: Launch, today');
  assert.equal(toolSummary('5', { events: [ev('a', '2026-10-18', 'Launch')] }, NOW), 'Next: Launch, tomorrow');
  assert.equal(toolSummary('5', { events: [ev('a', '2026-10-01', 'Past')] }, NOW), '1 date, none coming up');
  assert.equal(toolSummary('5', { events: [ev('a', '', 'Soon'), ev('b', '', 'Later')] }, NOW), '2 dates to set');
  assert.equal(toolSummary('5', { events: [ev('a', '2026-11-11', '  Singles \n Day  ')] }, NOW), 'Next: Singles Day, in 25 days');
});

test('strategy canvas: factors, rivals and opportunities', () => {
  const data = { competitors: [{ id: 'c1', name: 'Rival' }], factors: [], opportunities: [] };
  assert.equal(toolSummary('6', data, NOW), '0 factors, 1 rival, 0 opportunities');
});

test('A/B test: the furthest stage reached wins', () => {
  assert.equal(toolSummary('7', { hypothesis: 'Shorter form' }, NOW), 'Plan started');
  assert.match(toolSummary('7', { hypothesis: 'x', baselinePct: '5', mdePoints: '1' }, NOW) ?? '', /^Plan ready, [\d,]+ per arm$/);
  assert.equal(toolSummary('7', { hypothesis: 'x', result: '+0.8 points' }, NOW), 'Result recorded, no decision yet');
  assert.equal(toolSummary('7', { hypothesis: 'x', result: '+0.8 points', decision: 'ship' }, NOW), 'Decision: Ship the variant');
});

test('brief builder: parts written out of five', () => {
  assert.equal(toolSummary('8', { title: 'Q4 brief', findings: ['', '', ''] }, NOW), '1 of 5 parts written');
  assert.equal(toolSummary('8', { title: 'Q4', audience: 'CEO', answerFirst: 'Do it', findings: ['a', 'b', ''], decisionRequested: 'Approve' }, NOW), '4 of 5 parts written');
  assert.equal(toolSummary('8', { title: 'Q4', audience: 'CEO', answerFirst: 'Do it', findings: ['a', 'b', 'c'], decisionRequested: 'Approve' }, NOW), 'All 5 parts written');
});
