import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  REQUIRED_CLAIMS, abSampleSize, abShareText, briefShareText, calendarShareText, issueTreeShareText,
  nextCalendarEntryId, normalizeAbTest, normalizeBrief, normalizeCalendar, normalizeIssueTree, normalizeRecon,
  normalizeVerificationLog, reconShareText, reconSummary, reconcileRow, sampleSizePerArm, sortCalendar,
  verificationCounts, verificationShareText,
} from './workbench.ts';

const NOW = new Date(2026, 9, 12, 13, 0, 0);

// ─── foundation: fresh install is empty, junk is tolerated ───────────
test('every tool normalizes nothing to an empty slice', () => {
  assert.deepEqual(normalizeIssueTree(undefined), { question: '', branches: [] });
  assert.deepEqual(normalizeVerificationLog(undefined), { claims: [] });
  assert.deepEqual(normalizeCalendar(undefined), { events: [] });
  assert.equal(normalizeRecon(undefined).rows.length, 7);
  assert.ok(normalizeRecon(undefined).rows.every((r) => !r.date && !r.ga4 && !r.meta));
  assert.equal(normalizeAbTest(undefined).hypothesis, '');
  assert.deepEqual(normalizeBrief(undefined).findings, ['', '', '']);
});

test('normalizers survive garbage without throwing', () => {
  for (const junk of [null, 7, 'x', [], { branches: 5 }, { claims: [1, null, 'a'] }, { events: { a: 1 } }, { rows: 'no' }]) {
    normalizeIssueTree(junk); normalizeVerificationLog(junk); normalizeCalendar(junk);
    normalizeRecon(junk); normalizeAbTest(junk); normalizeBrief(junk);
  }
  assert.deepEqual(normalizeVerificationLog({ claims: [1, null, 'a'] }).claims, []);
});

test('seeded 3.5.0 placeholder data is not treated as the learner\'s work', () => {
  assert.deepEqual(normalizeIssueTree({ issues: ['Low Conversion Rate', 'High Bounce Rate'] }).branches, []);
  assert.deepEqual(normalizeVerificationLog({ logs: [{ id: 1, text: 'Ad copy generation', status: 'pass' }] }).claims, []);
  assert.deepEqual(normalizeCalendar({ events: [{ date: '2026-10-15', title: 'Q4 Webinar' }] }).events, []);
});

// ─── tool 1 ──────────────────────────────────────────────────────────
test('legacy issues become branches; real entries are kept', () => {
  const data = normalizeIssueTree({ issues: ['Traffic drop', 'Checkout friction'] });
  assert.deepEqual(data.branches.map((b) => b.title), ['Traffic drop', 'Checkout friction']);
  assert.deepEqual(data.branches[0].hypotheses, []);
});

test('issue tree share text names every field the deliverable asks for', () => {
  const data = normalizeIssueTree({
    question: 'Why did category conversion drop?',
    branches: [{ id: 'b1', title: 'Traffic', hypotheses: [
      { id: 'h2', text: 'Mobile share rose', rank: 2, dataSource: 'GA4', method: 'Segment by device', decisionResult: 'Mobile CVR below desktop' },
      { id: 'h1', text: 'Paid mix shifted', rank: 1, dataSource: 'Meta Ads', method: 'Compare campaigns', decisionResult: 'Spend moved to cold audiences' },
    ] }],
  });
  const share = issueTreeShareText(data) ?? '';
  for (const part of ['Question: Why did category conversion drop?', 'Branch 1: Traffic', 'Data source: GA4', 'Method: Segment by device', 'Result that would change the decision: Mobile CVR below desktop']) {
    assert.ok(share.includes(part), `missing: ${part}`);
  }
  assert.ok(share.indexOf('priority 1') < share.indexOf('priority 2'), 'ranked hypotheses come first');
  assert.equal(issueTreeShareText(normalizeIssueTree(undefined)), null);
});

// ─── tool 2 ──────────────────────────────────────────────────────────
test('verification log can mark claims unsupported and counts against the 10 required', () => {
  const data = normalizeVerificationLog({ claims: [
    { id: 'c1', claim: 'Rokomari has 1M users', source: 'Annual report', status: 'confirmed' },
    { id: 'c2', claim: 'Books are 40% of e-commerce', source: '', status: 'unsupported' },
    { id: 'c3', claim: 'Bogus status', source: '', status: 'pass' },
  ] });
  assert.deepEqual(data.claims.map((c) => c.status), ['confirmed', 'unsupported', 'unchecked']);
  assert.deepEqual(verificationCounts(data), { total: 3, confirmed: 1, unsupported: 1, unchecked: 1, remaining: REQUIRED_CLAIMS - 3 });
  const share = verificationShareText(data) ?? '';
  assert.ok(share.includes('Claims logged: 3 of 10 required'));
  assert.ok(share.includes('[UNSUPPORTED] Books are 40% of e-commerce'));
  assert.ok(share.includes('Primary source: Annual report'));
  assert.ok(share.includes('Primary source: (not traced yet)'));
});

test('legacy "pass" entries are not carried over as verified', () => {
  const data = normalizeVerificationLog({ logs: [{ id: 5, text: 'Competitor count', status: 'pass' }] });
  assert.equal(data.claims[0].status, 'unchecked');
});

// ─── tool 4 ──────────────────────────────────────────────────────────
test('a zero Meta baseline produces a message state, never Infinity or NaN', () => {
  const line = reconcileRow({ date: '2026-10-05', ga4: '120', meta: '0' }, 10);
  assert.equal(line.flag, 'zero_baseline');
  assert.equal(line.pct, null);
  assert.equal(line.diff, 120);
  const share = reconShareText({ ...normalizeRecon(undefined), rows: [{ date: '2026-10-05', ga4: '120', meta: '0' }, ...normalizeRecon(undefined).rows.slice(1)] }) ?? '';
  assert.ok(!/Infinity|NaN/.test(share));
  assert.ok(share.includes('Meta clicks is 0'));
});

test('rows are flagged only above the threshold and totals add up', () => {
  const rows = [
    { date: '2026-10-05', ga4: '1000', meta: '1000' }, // 0%
    { date: '2026-10-06', ga4: '1100', meta: '1000' }, // +10% exactly, not over
    { date: '2026-10-07', ga4: '1150', meta: '1000' }, // +15% over
    { date: '2026-10-08', ga4: '800', meta: '1000' }, // -20% over
    { date: '2026-10-09', ga4: '', meta: '5' }, // incomplete
    { date: '', ga4: 'abc', meta: '-3' }, // invalid
    { date: '', ga4: '', meta: '' },
  ];
  const lines = rows.map((r) => reconcileRow(r, 10));
  assert.deepEqual(lines.map((l) => l.flag), ['ok', 'ok', 'over', 'over', 'no_data', 'no_data', 'no_data']);
  assert.equal(lines[2].pct, 15);
  assert.equal(lines[3].pct, -20);
  assert.deepEqual(reconSummary(lines), { days: 4, totalGa4: 4050, totalMeta: 4000, totalDiff: 50, overallPct: 1.3, flaggedDays: 2 });
  assert.equal(reconcileRow(rows[1], 5).flag, 'over'); // the threshold is adjustable
});

test('recon data keeps seven rows, a default 10% threshold and drops invalid dates', () => {
  const data = normalizeRecon({ rows: [{ date: 'not a date', ga4: '5', meta: '6' }], thresholdPct: -4 });
  assert.equal(data.rows.length, 7);
  assert.equal(data.rows[0].date, '');
  assert.equal(data.thresholdPct, 10);
  assert.equal(normalizeRecon({ thresholdPct: 25 }).thresholdPct, 25);
});

test('recon share text includes every day, the threshold, totals and the note', () => {
  const data = { ...normalizeRecon(undefined), thresholdPct: 10, note: 'GA4 excludes consent-denied users.',
    rows: [{ date: '2026-10-05', ga4: '1150', meta: '1000' }, ...normalizeRecon(undefined).rows.slice(1)] };
  const share = reconShareText(data) ?? '';
  for (const part of ['Flag threshold: 10%', '2026-10-05: GA4 sessions 1150, Meta link clicks 1000, difference +150 (+15%) FLAGGED', 'Day 2: no data', 'Total over 1 day(s)', 'Reconciliation note: GA4 excludes consent-denied users.']) {
    assert.ok(share.includes(part), `missing: ${part}`);
  }
  assert.equal(reconShareText(normalizeRecon(undefined)), null);
});

// ─── tool 5 ──────────────────────────────────────────────────────────
test('calendar sorts dated events first and highlights the next one on or after today', () => {
  const events = normalizeCalendar({ events: [
    { id: 'a', date: '2026-12-01', title: 'Winter sale' },
    { id: 'b', date: '', title: 'Needs a date' },
    { id: 'c', date: '2026-10-15', title: 'Webinar' },
    { id: 'd', date: '2026-09-01', title: 'Past' },
  ] }).events;
  assert.deepEqual(sortCalendar(events).map((e) => e.id), ['d', 'c', 'a', 'b']);
  assert.equal(nextCalendarEntryId(events, NOW), 'c');
  assert.equal(nextCalendarEntryId([], NOW), null);
  const share = calendarShareText({ events }, NOW) ?? '';
  assert.ok(share.includes('- 2026-10-15: Webinar (next)'));
  assert.ok(share.includes('- date to be set: Needs a date'));
  assert.equal(calendarShareText({ events: [] }, NOW), null);
});

// ─── tool 7 ──────────────────────────────────────────────────────────
test('sample size matches the fixture: 4% baseline, +1 point, 95%/80% is about 6,740 per arm', () => {
  const n = sampleSizePerArm(0.04, 0.01);
  assert.ok(Math.abs(Number(n) - 6740) <= 10, `got ${n}`);
  assert.equal(n, 6739);
  const fromFields = abSampleSize({ baselinePct: '4', mdePoints: '1' });
  assert.deepEqual(fromFields, { ok: true, perArm: 6739, total: 13478 });
});

test('sample size grows as the effect shrinks and refuses impossible inputs', () => {
  assert.ok((sampleSizePerArm(0.04, 0.005) ?? 0) > (sampleSizePerArm(0.04, 0.01) ?? 0));
  for (const [b, d] of [[0, 0.01], [0.04, 0], [0.04, -0.01], [0.99, 0.02], [Number.NaN, 0.01]] as const) {
    assert.equal(sampleSizePerArm(b, d), null);
  }
  const bad = abSampleSize({ baselinePct: '', mdePoints: '1' });
  assert.equal(bad.ok, false);
  assert.equal(abSampleSize({ baselinePct: '100', mdePoints: '1' }).ok, false);
  assert.equal(abSampleSize({ baselinePct: '98', mdePoints: '5' }).ok, false);
});

test('A/B share text carries every plan and report field plus the computed sample size', () => {
  const data = normalizeAbTest({
    hypothesis: 'A shorter form lifts sign-ups', primaryMetric: 'Sign-up rate', guardrails: 'Refund rate, page speed',
    baselinePct: '4', mdePoints: '1', result: 'Variant +0.9 points', confidenceInterval: '+0.2 to +1.6', decision: 'ship', learning: 'Fewer fields help',
  });
  const share = abShareText(data) ?? '';
  for (const part of ['A/B Test Plan', 'Hypothesis: A shorter form lifts sign-ups', 'Primary metric: Sign-up rate', 'Guardrail metrics: Refund rate, page speed',
    'Baseline rate: 4%', 'Minimum detectable effect: 1 percentage points', '6,739 per arm, 13,478 in total', 'A/B Test Report', 'Result: Variant +0.9 points',
    'Confidence interval: +0.2 to +1.6', 'Decision: Ship the variant', 'Learning: Fewer fields help']) {
    assert.ok(share.includes(part), `missing: ${part}`);
  }
  assert.equal(abShareText(normalizeAbTest(undefined)), null);
  assert.equal(normalizeAbTest({ decision: 'launch' }).decision, '');
});

// ─── tool 8 ──────────────────────────────────────────────────────────
test('brief maps 3.x fields, always has three findings, and shares every deliverable field', () => {
  const legacy = normalizeBrief({ campaignName: 'Q4 push', targetAudience: 'CMO', isSaved: true });
  assert.equal(legacy.title, 'Q4 push');
  assert.equal(legacy.audience, 'CMO');
  assert.equal(legacy.findings.length, 3);

  const data = normalizeBrief({
    title: 'Leadership brief', audience: 'CEO', answerFirst: 'Shift 20% of spend to search',
    findings: ['Search CVR is 2x', 'Social CPA is rising', 'Bangla queries are underserved', 'extra'],
    decisionRequested: 'Approve the reallocation', confidence: 'medium', savedAt: '2026-10-12T07:00:00.000Z',
  });
  assert.equal(data.findings.length, 3);
  const share = briefShareText(data) ?? '';
  for (const part of ['Leadership brief', 'Audience: CEO', 'Answer first: Shift 20% of spend to search', 'Finding 1: Search CVR is 2x', 'Finding 3: Bangla queries are underserved',
    'Decision requested: Approve the reallocation', 'Confidence: medium']) {
    assert.ok(share.includes(part), `missing: ${part}`);
  }
  assert.equal(briefShareText(normalizeBrief(undefined)), null);
  assert.equal(normalizeBrief({ savedAt: 'yesterday' }).savedAt, '');
});
