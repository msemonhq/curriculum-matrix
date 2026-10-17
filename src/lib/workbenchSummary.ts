// One line on what a workbench tool holds, for the contents list: "4 of 10 claims checked", "Next: Singles Day, in 25 days".
// Pure functions (no React, no store). The line is built from the tool's own normalizer and helpers, so it can
// never disagree with what the tool shows. A tool that holds nothing returns null and the list shows its blurb instead.
import { daysUntil } from './dates.ts';
import {
  DECISION_LABEL, FINDING_COUNT, REQUIRED_CLAIMS, abSampleSize, nextCalendarEntryId, normalizeAbTest, normalizeBrief, normalizeCalendar,
  normalizeIssueTree, normalizeRecon, normalizeVerificationLog, reconSummary, reconcileRow, verificationCounts,
} from './workbench.ts';
import { normalizeStrategyCanvas } from './strategy.ts';
import { toolHoldsData } from './workbenchData.ts';

const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Sentence-case a title from the tool, trimmed to one tidy line. */
const tidy = (value: string) => value.replace(/\s+/g, ' ').trim();

type Summarise = (saved: unknown, now: Date) => string;

const SUMMARISE: Readonly<Record<string, Summarise>> = {
  '1': (saved) => {
    const { branches } = normalizeIssueTree(saved);
    const hypotheses = branches.reduce((sum, b) => sum + b.hypotheses.length, 0);
    if (branches.length === 0) return 'Question set, no branches yet';
    return `${count(branches.length, 'branch', 'branches')}, ${count(hypotheses, 'hypothesis', 'hypotheses')}`;
  },
  '2': (saved) => {
    const counts = verificationCounts(normalizeVerificationLog(saved));
    const checked = counts.confirmed + counts.unsupported;
    return `${checked} of ${Math.max(counts.total, REQUIRED_CLAIMS)} claims checked`;
  },
  '4': (saved) => {
    const data = normalizeRecon(saved);
    const summary = reconSummary(data.rows.map((row) => reconcileRow(row, data.thresholdPct)));
    if (summary.days === 0) return 'Numbers started, no day complete yet';
    return `${count(summary.days, 'day')} compared, ${summary.flaggedDays} over the threshold`;
  },
  '5': (saved, now) => {
    const { events } = normalizeCalendar(saved);
    const nextId = nextCalendarEntryId(events, now);
    const next = events.find((e) => e.id === nextId);
    if (next) {
      const days = daysUntil(next.date, now);
      const when = days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;
      return `Next: ${tidy(next.title) || 'untitled'}, ${when}`;
    }
    const undated = events.filter((e) => !e.date).length;
    if (undated === events.length) return `${count(events.length, 'date')} to set`;
    return `${count(events.length, 'date')}, none coming up`;
  },
  '6': (saved) => {
    const { competitors, factors, opportunities } = normalizeStrategyCanvas(saved);
    return `${count(factors.length, 'factor')}, ${count(competitors.length, 'rival')}, ${count(opportunities.length, 'opportunity', 'opportunities')}`;
  },
  '7': (saved) => {
    const data = normalizeAbTest(saved);
    if (data.decision) return `Decision: ${DECISION_LABEL[data.decision]}`;
    if (data.result.trim()) return 'Result recorded, no decision yet';
    const size = abSampleSize(data);
    return size.ok ? `Plan ready, ${size.perArm.toLocaleString('en-US')} per arm` : 'Plan started';
  },
  '8': (saved) => {
    const data = normalizeBrief(saved);
    const filled = (value: string) => value.trim().length > 0;
    const parts = [
      filled(data.title), filled(data.audience), filled(data.answerFirst),
      data.findings.length >= FINDING_COUNT && data.findings.slice(0, FINDING_COUNT).every(filled),
      filled(data.decisionRequested),
    ].filter(Boolean).length;
    return parts === 5 ? 'All 5 parts written' : `${parts} of 5 parts written`;
  },
};

/** The line for a tool's row, or null when the tool holds nothing the person entered (or has nothing to hold). */
export function toolSummary(toolId: string, saved: unknown, now: Date): string | null {
  const summarise = SUMMARISE[toolId];
  if (!summarise || !toolHoldsData(toolId, saved)) return null;
  return summarise(saved, now);
}

export const SUMMARISED_TOOL_IDS = Object.keys(SUMMARISE);
