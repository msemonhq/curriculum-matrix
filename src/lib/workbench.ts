// Typed data and logic for the workbench tools. Pure functions only (no React, no browser APIs)
// so they can be unit-tested with `node --test`. Each tool reads a typed "slice" out of the saved
// workbench data (workbench[toolId]); the normalizers accept anything stored (including shapes
// written by 3.x) and always return a complete, valid slice.
import { isRecord } from './migrations.ts';
import { parseYmd, toYmd } from './dates.ts';
import { clean, idOf, lines, list, newId, pick, sameList, text } from './fields.ts';

export { newId };

// ─── Tool 1: issue tree ─────────────────────────────────────────────
export interface Hypothesis {
  id: string;
  text: string;
  /** 0 = not ranked yet, 1 = highest priority. */
  rank: number;
  dataSource: string;
  method: string;
  decisionResult: string;
}
export interface Branch {
  id: string;
  title: string;
  hypotheses: Hypothesis[];
}
export interface IssueTreeData {
  question: string;
  branches: Branch[];
}

/** Placeholder entries 3.5.0 wrote into every installation; they are not the learner's data. */
const SEEDED_ISSUES = ['Low Conversion Rate', 'High Bounce Rate'];

export function normalizeIssueTree(raw: unknown): IssueTreeData {
  const source = isRecord(raw) ? raw : {};
  if (Array.isArray(source.branches)) {
    return {
      question: text(source.question),
      branches: list(source.branches).filter(isRecord).map((b, i) => ({
        id: idOf(b.id, 'b', i),
        title: text(b.title, 300),
        hypotheses: list(b.hypotheses).filter(isRecord).map((h, j) => ({
          id: idOf(h.id, 'h', j),
          text: text(h.text),
          rank: typeof h.rank === 'number' && Number.isInteger(h.rank) && h.rank >= 0 && h.rank <= 9 ? h.rank : 0,
          dataSource: text(h.dataSource, 1000),
          method: text(h.method, 1000),
          decisionResult: text(h.decisionResult, 1000),
        })),
      })),
    };
  }
  // 3.x stored a flat list of issue strings.
  const legacy = list(source.issues).filter((i): i is string => typeof i === 'string');
  const real = sameList(legacy, SEEDED_ISSUES) ? [] : legacy;
  return {
    question: '',
    branches: real.map((title, i) => ({ id: `b${i + 1}`, title: title.slice(0, 300), hypotheses: [] })),
  };
}

const rankLabel = (rank: number) => (rank > 0 ? `priority ${rank}` : 'unranked');
const rankOrder = (rank: number) => (rank > 0 ? rank : 99);

export function issueTreeShareText(data: IssueTreeData): string | null {
  if (!clean(data.question) && data.branches.length === 0) return null;
  const body = data.branches.flatMap((branch, i) => [
    '',
    `Branch ${i + 1}: ${clean(branch.title) || '(untitled)'}`,
    ...[...branch.hypotheses]
      .sort((a, b) => rankOrder(a.rank) - rankOrder(b.rank))
      .flatMap((h) => [
        `- Hypothesis (${rankLabel(h.rank)}): ${clean(h.text) || '(empty)'}`,
        `  Data source: ${clean(h.dataSource) || '(not set)'}`,
        `  Method: ${clean(h.method) || '(not set)'}`,
        `  Result that would change the decision: ${clean(h.decisionResult) || '(not set)'}`,
      ]),
  ]);
  return lines('One-page research plan', `Question: ${clean(data.question) || '(not set)'}`, ...body);
}

// ─── Tool 2: AI verification log ────────────────────────────────────
export const CLAIM_STATUSES = ['unchecked', 'confirmed', 'unsupported'] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];
export const REQUIRED_CLAIMS = 10;

export interface Claim {
  id: string;
  claim: string;
  source: string;
  status: ClaimStatus;
}
export interface VerificationLogData {
  claims: Claim[];
}

export function normalizeVerificationLog(raw: unknown): VerificationLogData {
  const source = isRecord(raw) ? raw : {};
  if (Array.isArray(source.claims)) {
    return {
      claims: list(source.claims).filter(isRecord).map((c, i) => ({
        id: idOf(c.id, 'c', i),
        claim: text(c.claim, 1000),
        source: text(c.source, 1000),
        status: pick(c.status, CLAIM_STATUSES, 'unchecked'),
      })),
    };
  }
  // 3.x stored { id, text, status: 'pass' } where every entry was "pass"; that carried no meaning.
  const legacy = list(source.logs).filter(isRecord).map((l) => text(l.text, 1000));
  const real = sameList(legacy, ['Ad copy generation']) ? [] : legacy;
  return { claims: real.map((claim, i) => ({ id: `c${i + 1}`, claim, source: '', status: 'unchecked' as const })) };
}

export function verificationCounts(data: VerificationLogData) {
  const count = (status: ClaimStatus) => data.claims.filter((c) => c.status === status).length;
  return {
    total: data.claims.length,
    confirmed: count('confirmed'),
    unsupported: count('unsupported'),
    unchecked: count('unchecked'),
    remaining: Math.max(0, REQUIRED_CLAIMS - data.claims.length),
  };
}

export function verificationShareText(data: VerificationLogData): string | null {
  if (data.claims.length === 0) return null;
  const n = verificationCounts(data);
  return lines(
    'AI verification log',
    `Claims logged: ${n.total} of ${REQUIRED_CLAIMS} required. Confirmed: ${n.confirmed}. Unsupported: ${n.unsupported}. Unchecked: ${n.unchecked}.`,
    '',
    ...data.claims.flatMap((c, i) => [
      `${i + 1}. [${c.status.toUpperCase()}] ${clean(c.claim) || '(empty claim)'}`,
      `   Primary source: ${clean(c.source) || '(not traced yet)'}`,
    ]),
  );
}

// ─── Tool 4: GA4 sessions vs Meta link clicks, one week ─────────────
export const RECON_DAYS = 7;
export const DEFAULT_THRESHOLD_PCT = 10;

export interface ReconRow {
  date: string;
  /** Kept as typed text so a half-typed number is not rewritten under the cursor. */
  ga4: string;
  meta: string;
}
export interface ReconData {
  rows: ReconRow[];
  thresholdPct: number;
  note: string;
}

export const emptyReconRows = (): ReconRow[] => Array.from({ length: RECON_DAYS }, () => ({ date: '', ga4: '', meta: '' }));

export function normalizeRecon(raw: unknown): ReconData {
  const source = isRecord(raw) ? raw : {};
  const rows = emptyReconRows();
  list(source.rows).slice(0, RECON_DAYS).forEach((row, i) => {
    if (!isRecord(row)) return;
    rows[i] = {
      date: parseYmd(row.date) ? text(row.date, 10) : '',
      ga4: text(row.ga4, 15),
      meta: text(row.meta, 15),
    };
  });
  const threshold = typeof source.thresholdPct === 'number' && Number.isFinite(source.thresholdPct) && source.thresholdPct >= 0 && source.thresholdPct <= 1000
    ? source.thresholdPct
    : DEFAULT_THRESHOLD_PCT;
  return { rows, thresholdPct: threshold, note: text(source.note) };
}

const toCount = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export type ReconFlag = 'ok' | 'over' | 'no_data' | 'zero_baseline';
export interface ReconLine {
  date: string;
  ga4: number | null;
  meta: number | null;
  diff: number | null;
  /** Difference as % of Meta link clicks; null when it cannot be calculated. */
  pct: number | null;
  flag: ReconFlag;
}

export function reconcileRow(row: ReconRow, thresholdPct: number): ReconLine {
  const ga4 = toCount(row.ga4);
  const meta = toCount(row.meta);
  const base = { date: row.date, ga4, meta };
  if (ga4 === null || meta === null) return { ...base, diff: null, pct: null, flag: 'no_data' };
  const diff = ga4 - meta;
  if (meta === 0) return { ...base, diff, pct: null, flag: 'zero_baseline' };
  const pct = Math.round((diff / meta) * 1000) / 10;
  return { ...base, diff, pct, flag: Math.abs(pct) > thresholdPct ? 'over' : 'ok' };
}

export function reconSummary(lines_: readonly ReconLine[]) {
  const counted = lines_.filter((l) => l.ga4 !== null && l.meta !== null);
  const totalGa4 = counted.reduce((sum, l) => sum + (l.ga4 ?? 0), 0);
  const totalMeta = counted.reduce((sum, l) => sum + (l.meta ?? 0), 0);
  return {
    days: counted.length,
    totalGa4,
    totalMeta,
    totalDiff: totalGa4 - totalMeta,
    overallPct: totalMeta > 0 ? Math.round(((totalGa4 - totalMeta) / totalMeta) * 1000) / 10 : null,
    flaggedDays: lines_.filter((l) => l.flag === 'over').length,
  };
}

export const describeFlag = (line: ReconLine, thresholdPct: number): string => {
  switch (line.flag) {
    case 'no_data': return 'Enter both numbers';
    case 'zero_baseline': return 'Meta link clicks is 0, so a % cannot be calculated';
    case 'over': return `Over the ${thresholdPct}% threshold`;
    default: return 'Within threshold';
  }
};

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

export function reconShareText(data: ReconData): string | null {
  const results = data.rows.map((row) => reconcileRow(row, data.thresholdPct));
  const any = results.some((l) => l.flag !== 'no_data') || clean(data.note) !== '';
  if (!any) return null;
  const summary = reconSummary(results);
  return lines(
    'GA4 sessions vs Meta link clicks (one-week reconciliation)',
    `Flag threshold: ${data.thresholdPct}%`,
    '',
    ...results.map((l, i) => {
      const date = l.date || `Day ${i + 1}`;
      if (l.flag === 'no_data') return `${date}: no data`;
      const pct = l.pct === null ? 'n/a' : `${signed(l.pct)}%`;
      return `${date}: GA4 sessions ${l.ga4}, Meta link clicks ${l.meta}, difference ${signed(l.diff ?? 0)} (${pct})${l.flag === 'over' ? ' FLAGGED' : ''}${l.flag === 'zero_baseline' ? ' (Meta clicks is 0)' : ''}`;
    }),
    '',
    `Total over ${summary.days} day(s): GA4 ${summary.totalGa4}, Meta ${summary.totalMeta}, difference ${signed(summary.totalDiff)}${summary.overallPct === null ? '' : ` (${signed(summary.overallPct)}%)`}. Days over threshold: ${summary.flaggedDays}.`,
    clean(data.note) ? `\nReconciliation note: ${clean(data.note)}` : null,
  );
}

// ─── Tool 5: demand calendar ────────────────────────────────────────
export interface CalendarEntry {
  id: string;
  /** YYYY-MM-DD, or empty when it still needs a date. */
  date: string;
  title: string;
}
export interface DemandCalendarData {
  events: CalendarEntry[];
}

export function normalizeCalendar(raw: unknown): DemandCalendarData {
  const source = isRecord(raw) ? raw : {};
  const events = list(source.events).filter(isRecord).map((e, i) => ({
    id: idOf(e.id, 'e', i),
    date: parseYmd(e.date) ? text(e.date, 10) : '',
    title: text(e.title, 300),
  }));
  // 3.5.0 seeded one example event into every installation.
  const seededOnly = events.length === 1 && events[0].title === 'Q4 Webinar';
  return { events: seededOnly ? [] : events };
}

/** Dated events soonest first; events still missing a date go last. */
export function sortCalendar(events: readonly CalendarEntry[]): CalendarEntry[] {
  return [...events].sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });
}

/** The id of the soonest event on or after today, if any. */
export function nextCalendarEntryId(events: readonly CalendarEntry[], now: Date): string | null {
  const today = toYmd(now);
  return sortCalendar(events).find((e) => e.date && e.date >= today)?.id ?? null;
}

export function calendarShareText(data: DemandCalendarData, now: Date): string | null {
  if (data.events.length === 0) return null;
  const next = nextCalendarEntryId(data.events, now);
  return lines(
    'Demand calendar',
    ...sortCalendar(data.events).map((e) => `- ${e.date || 'date to be set'}: ${clean(e.title) || '(untitled)'}${e.id === next ? ' (next)' : ''}`),
  );
}

// ─── Tool 7: A/B test plan and report ───────────────────────────────
export const Z_ALPHA = 1.96; // 95% confidence, two-sided
export const Z_BETA = 0.84; // 80% power
export const DECISIONS = ['', 'ship', 'iterate', 'stop'] as const;
export type Decision = (typeof DECISIONS)[number];

export interface AbTestData {
  // Test Plan
  hypothesis: string;
  primaryMetric: string;
  guardrails: string;
  /** Baseline conversion rate, in percent (typed text). */
  baselinePct: string;
  /** Minimum detectable effect, in absolute percentage points (typed text). */
  mdePoints: string;
  // Test Report
  result: string;
  confidenceInterval: string;
  decision: Decision;
  learning: string;
}

export function normalizeAbTest(raw: unknown): AbTestData {
  const s = isRecord(raw) ? raw : {};
  return {
    hypothesis: text(s.hypothesis),
    primaryMetric: text(s.primaryMetric, 500),
    guardrails: text(s.guardrails, 1000),
    baselinePct: text(s.baselinePct, 12),
    mdePoints: text(s.mdePoints, 12),
    result: text(s.result),
    confidenceInterval: text(s.confidenceInterval, 200),
    decision: pick(s.decision, DECISIONS, ''),
    learning: text(s.learning),
  };
}

/**
 * Visitors needed in each arm for a two-proportion test (standard normal approximation):
 *   n = 2 (z_alpha + z_beta)^2 * pbar * (1 - pbar) / delta^2,  pbar = baseline + delta / 2.
 * Rates are proportions (0.04 = 4%). Returns null for inputs that cannot be tested.
 * Example: 4% baseline, +1 point, 95% confidence, 80% power -> 6,739 per arm.
 */
export function sampleSizePerArm(baseline: number, delta: number, zAlpha: number = Z_ALPHA, zBeta: number = Z_BETA): number | null {
  if (![baseline, delta].every(Number.isFinite)) return null;
  if (baseline <= 0 || delta <= 0 || baseline + delta >= 1) return null;
  const pooled = baseline + delta / 2;
  return Math.ceil((2 * (zAlpha + zBeta) ** 2 * pooled * (1 - pooled)) / delta ** 2);
}

const parsePositive = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export type SampleSizeResult =
  | { ok: true; perArm: number; total: number }
  | { ok: false; message: string };

/** Sample size from the percent fields of the plan, with a readable reason when it can't be worked out. */
export function abSampleSize(data: Pick<AbTestData, 'baselinePct' | 'mdePoints'>): SampleSizeResult {
  const baseline = parsePositive(data.baselinePct);
  const delta = parsePositive(data.mdePoints);
  if (baseline === null || delta === null) return { ok: false, message: 'Enter a baseline rate and a minimum detectable effect to see the sample size.' };
  if (baseline >= 100) return { ok: false, message: 'The baseline rate must be below 100%.' };
  const perArm = sampleSizePerArm(baseline / 100, delta / 100);
  if (perArm === null) return { ok: false, message: 'The baseline plus the effect must stay below 100%.' };
  return { ok: true, perArm, total: perArm * 2 };
}

export const DECISION_LABEL: Record<Decision, string> = { '': 'not decided', ship: 'Ship the variant', iterate: 'Iterate', stop: 'Stop' };

const groupDigits = (n: number) => n.toLocaleString('en-US');

export function abShareText(data: AbTestData): string | null {
  const any = Object.entries(data).some(([key, value]) => key !== 'decision' && typeof value === 'string' && clean(value) !== '') || data.decision !== '';
  if (!any) return null;
  const size = abSampleSize(data);
  return lines(
    'A/B Test Plan',
    `Hypothesis: ${clean(data.hypothesis) || '(not set)'}`,
    `Primary metric: ${clean(data.primaryMetric) || '(not set)'}`,
    `Guardrail metrics: ${clean(data.guardrails) || '(not set)'}`,
    `Baseline rate: ${clean(data.baselinePct) ? `${clean(data.baselinePct)}%` : '(not set)'}`,
    `Minimum detectable effect: ${clean(data.mdePoints) ? `${clean(data.mdePoints)} percentage points` : '(not set)'}`,
    `Sample size (95% confidence, 80% power): ${size.ok ? `${groupDigits(size.perArm)} per arm, ${groupDigits(size.total)} in total` : size.message}`,
    '',
    'A/B Test Report',
    `Result: ${clean(data.result) || '(not set)'}`,
    `Confidence interval: ${clean(data.confidenceInterval) || '(not set)'}`,
    `Decision: ${DECISION_LABEL[data.decision]}`,
    `Learning: ${clean(data.learning) || '(not set)'}`,
  );
}

// ─── Tool 8: leadership brief ───────────────────────────────────────
export const CONFIDENCE_LEVELS = ['', 'high', 'medium', 'low'] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];
export const FINDING_COUNT = 3;

export interface BriefData {
  title: string;
  audience: string;
  answerFirst: string;
  findings: string[];
  decisionRequested: string;
  confidence: Confidence;
  /** ISO time of the last change; the screen shows it as the saved indicator. */
  savedAt: string;
}

export function normalizeBrief(raw: unknown): BriefData {
  const s = isRecord(raw) ? raw : {};
  const found = list(s.findings).map((f) => text(f, 1000));
  while (found.length < FINDING_COUNT) found.push('');
  return {
    // 3.x called these campaignName and targetAudience.
    title: text(s.title ?? s.campaignName, 300),
    audience: text(s.audience ?? s.targetAudience, 1000),
    answerFirst: text(s.answerFirst),
    findings: found.slice(0, FINDING_COUNT),
    decisionRequested: text(s.decisionRequested),
    confidence: pick(s.confidence, CONFIDENCE_LEVELS, ''),
    savedAt: typeof s.savedAt === 'string' && !Number.isNaN(Date.parse(s.savedAt)) ? s.savedAt : '',
  };
}

export function briefShareText(data: BriefData): string | null {
  const any = [data.title, data.audience, data.answerFirst, data.decisionRequested, ...data.findings].some((v) => clean(v) !== '') || data.confidence !== '';
  if (!any) return null;
  return lines(
    clean(data.title) || 'Leadership brief',
    `Audience: ${clean(data.audience) || '(not set)'}`,
    '',
    `Answer first: ${clean(data.answerFirst) || '(not set)'}`,
    ...data.findings.map((f, i) => `Finding ${i + 1}: ${clean(f) || '(not set)'}`),
    `Decision requested: ${clean(data.decisionRequested) || '(not set)'}`,
    `Confidence: ${data.confidence || 'not stated'}`,
  );
}
