import type { ComponentType } from 'react';
import { Calculator, Calendar, GitCompare, Network, Presentation, Search, Table, TestTube } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { strategyShareText, normalizeStrategyCanvas } from '../lib/strategy';
import {
  abShareText, briefShareText, calendarShareText, issueTreeShareText, normalizeAbTest, normalizeBrief, normalizeCalendar,
  normalizeIssueTree, normalizeRecon, normalizeVerificationLog, reconShareText, verificationShareText,
} from '../lib/workbench';
import AbTest from './AbTest';
import BriefBuilder from './BriefBuilder';
import DemandCalendar from './DemandCalendar';
import FormulaSheet from './FormulaSheet';
import IssueTree from './IssueTree';
import ReconCalc from './ReconCalc';
import StrategyCanvas from './StrategyCanvas';
import VerificationLog from './VerificationLog';

export interface WorkbenchTool {
  /** Matches the phase's workbenchId and the key the tool's data is saved under. */
  id: string;
  title: string;
  icon: LucideIcon;
  phase: string;
  description: string;
  Component: ComponentType;
  /** Turns the saved data into text to share. Returns null while there is nothing to share. Absent for reference tools. */
  share?: (saved: unknown, now: Date) => string | null;
}

export const TOOLS: readonly WorkbenchTool[] = [
  {
    id: '1', title: 'Issue Tree Builder', icon: Network, phase: 'Phase 1',
    description: 'Break a question into branches, rank the hypotheses, and say how each will be tested.',
    Component: IssueTree,
    share: (saved) => issueTreeShareText(normalizeIssueTree(saved)),
  },
  {
    id: '2', title: 'AI Verification Log', icon: Search, phase: 'Phase 2',
    description: 'Trace ten AI-generated claims to primary sources and mark each confirmed or unsupported.',
    Component: VerificationLog,
    share: (saved) => verificationShareText(normalizeVerificationLog(saved)),
  },
  {
    id: '3', title: 'Formula Cheat-Sheet', icon: Table, phase: 'Phase 3',
    description: 'Search and copy the Sheets and Excel formulas and marketing metrics used in this course.',
    Component: FormulaSheet,
  },
  {
    id: '4', title: 'GA4 vs Meta Check', icon: Calculator, phase: 'Phase 4',
    description: 'Reconcile a week of GA4 sessions with Meta link clicks and flag the days that are far apart.',
    Component: ReconCalc,
    share: (saved) => reconShareText(normalizeRecon(saved)),
  },
  {
    id: '5', title: 'Demand Calendar', icon: Calendar, phase: 'Phase 5',
    description: 'Keep the dates that move book demand in one list, soonest first.',
    Component: DemandCalendar,
    share: (saved, now) => calendarShareText(normalizeCalendar(saved), now),
  },
  {
    id: '6', title: 'Strategy Canvas', icon: GitCompare, phase: 'Phase 6',
    description: 'Score yourself against competitors, then rank the opportunities the gaps point to.',
    Component: StrategyCanvas,
    share: (saved) => strategyShareText(normalizeStrategyCanvas(saved)),
  },
  {
    id: '7', title: 'A/B Test Plan', icon: TestTube, phase: 'Phase 7',
    description: 'Plan a test with its sample size, then record the result and the decision.',
    Component: AbTest,
    share: (saved) => abShareText(normalizeAbTest(saved)),
  },
  {
    id: '8', title: 'Brief Builder', icon: Presentation, phase: 'Phase 8',
    description: 'Write a one-page leadership brief: answer first, three findings, the decision you need.',
    Component: BriefBuilder,
    share: (saved) => briefShareText(normalizeBrief(saved)),
  },
];

export const findTool = (id: string | undefined): WorkbenchTool | undefined => TOOLS.find((tool) => tool.id === id);
