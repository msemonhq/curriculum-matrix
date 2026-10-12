import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SCORE, MAX_COMPETITORS, addCompetitor, addFactor, describeGap, emptyCanvas, gapVsBest, normalizeStrategyCanvas,
  opportunityScore, rankOpportunities, removeCompetitor, strategyShareText,
} from './strategy.ts';
import type { StrategyCanvasData } from './strategy.ts';

const sample = (): StrategyCanvasData => ({
  competitors: [{ id: 'c1', name: 'Boi Poka' }, { id: 'c2', name: 'Pathak' }],
  factors: [
    { id: 'f1', name: 'Price', you: 6, scores: { c1: 8, c2: 4 } },
    { id: 'f2', name: 'Delivery speed', you: 9, scores: { c1: 5, c2: 5 } },
  ],
  opportunities: [
    { id: 'o1', title: 'Free delivery threshold', hypothesis: 'If we lower it, AOV rises 5%.', impact: 3, effort: 3 },
    { id: 'o2', title: 'Same-day Dhaka', hypothesis: 'Same-day raises repeat rate by 2 points.', impact: 5, effort: 2 },
    { id: 'o3', title: 'Not rated yet', hypothesis: '', impact: 0, effort: 0 },
  ],
});

test('a fresh install is empty', () => {
  assert.deepEqual(normalizeStrategyCanvas(undefined), emptyCanvas());
  for (const junk of [null, 7, 'x', [], { competitors: 5 }, { factors: 'no' }, { competitors: [1], factors: [null], opportunities: [{}] }]) normalizeStrategyCanvas(junk);
});

test('the three seeded 3.5.0 factors are not the learner\'s data, but moved sliders are kept', () => {
  const seeded = [{ name: 'Price', you: 60, comp: 40 }, { name: 'Quality', you: 80, comp: 50 }, { name: 'Speed', you: 40, comp: 70 }];
  assert.deepEqual(normalizeStrategyCanvas({ factors: seeded }), emptyCanvas());
  const moved = normalizeStrategyCanvas({ factors: [{ name: 'Price', you: 70, comp: 40 }, ...seeded.slice(1)] });
  assert.equal(moved.factors.length, 3);
  assert.deepEqual(moved.competitors, [{ id: 'c1', name: 'Competitor' }]);
  assert.equal(moved.factors[0].you, 7);
  assert.equal(moved.factors[0].scores.c1, 4);
});

test('the current shape round-trips and is repaired when damaged', () => {
  const data = sample();
  assert.deepEqual(normalizeStrategyCanvas(data), data);
  const damaged = normalizeStrategyCanvas({
    competitors: [{ id: 'c1', name: 'A' }, { id: 'c2', name: 'B' }, { id: 'c3' }, { id: 'c4' }, { id: 'c5' }],
    factors: [{ id: 'f1', name: 'Price', you: 99, scores: { c1: -3, c2: 'x' } }],
    opportunities: [{ id: 'o1', title: 'T', impact: 9, effort: 2.5 }],
  });
  assert.equal(damaged.competitors.length, MAX_COMPETITORS);
  assert.equal(damaged.factors[0].you, DEFAULT_SCORE);
  assert.deepEqual(damaged.factors[0].scores, { c1: DEFAULT_SCORE, c2: DEFAULT_SCORE, c3: DEFAULT_SCORE, c4: DEFAULT_SCORE });
  assert.deepEqual([damaged.opportunities[0].impact, damaged.opportunities[0].effort], [0, 0]);
});

test('adding and removing competitors keeps every factor consistent', () => {
  const added = addCompetitor(sample(), 'c3', 'Rokomari rival');
  assert.ok(added.factors.every((f) => f.scores.c3 === DEFAULT_SCORE));
  const removed = removeCompetitor(added, 'c1');
  assert.deepEqual(removed.competitors.map((c) => c.id), ['c2', 'c3']);
  assert.ok(removed.factors.every((f) => !('c1' in f.scores)));
  const full = [1, 2, 3, 4].reduce((d, n) => addCompetitor(d, `x${n}`), emptyCanvas());
  assert.equal(addCompetitor(full, 'x5').competitors.length, MAX_COMPETITORS);
});

test('a new factor starts neutral for us and for every competitor', () => {
  const next = addFactor(sample(), 'f3', 'Quality');
  assert.deepEqual(next.factors[2], { id: 'f3', name: 'Quality', you: DEFAULT_SCORE, scores: { c1: DEFAULT_SCORE, c2: DEFAULT_SCORE } });
});

test('the gap is measured against the best competitor', () => {
  const { factors, competitors } = sample();
  assert.equal(gapVsBest(factors[0], competitors), -2);
  assert.equal(gapVsBest(factors[1], competitors), 4);
  assert.equal(gapVsBest(factors[0], []), null);
  assert.equal(describeGap(-2), '2 behind the best competitor');
  assert.equal(describeGap(4), '4 ahead of the best competitor');
  assert.equal(describeGap(0), 'Level with the best competitor');
  assert.equal(describeGap(null), 'Add a competitor to compare');
});

test('opportunities rank by impact over effort, unrated last', () => {
  const data = sample();
  assert.equal(opportunityScore(data.opportunities[1]), 2.5);
  assert.equal(opportunityScore(data.opportunities[2]), null);
  assert.deepEqual(rankOpportunities(data.opportunities).map((o) => o.id), ['o2', 'o1', 'o3']);
  const tie = rankOpportunities([
    { id: 'a', title: '', hypothesis: '', impact: 2, effort: 1 },
    { id: 'b', title: '', hypothesis: '', impact: 4, effort: 2 },
  ]);
  assert.deepEqual(tie.map((o) => o.id), ['b', 'a']);
});

test('share text carries the matrix and the ranked list with hypotheses', () => {
  assert.equal(strategyShareText(emptyCanvas()), null);
  const out = strategyShareText(sample())!;
  assert.match(out, /Competitors: Boi Poka, Pathak/);
  assert.match(out, /- Price: You 6, Boi Poka 8, Pathak 4 \(gap vs best -2\)/);
  assert.match(out, /1\. Same-day Dhaka - impact 5, effort 2, score 2\.5/);
  assert.match(out, /Testable hypothesis: Same-day raises repeat rate by 2 points\./);
  assert.match(out, /3\. Not rated yet - not rated yet/);
});
