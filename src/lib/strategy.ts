// Typed data and logic for the Strategy Canvas (Phase 6): a competitor gap matrix and a ranked
// opportunity list. Pure functions only (no React, no browser APIs) so they can be unit-tested with
// `node --test`.
import { isRecord } from './migrations.ts';
import { clean, idOf, intIn, lines, list, text } from './fields.ts';

export const SCORE_MIN = 0;
export const SCORE_MAX = 10;
export const DEFAULT_SCORE = 5;
export const MAX_COMPETITORS = 4;
export const MAX_FACTORS = 12;
export const MAX_OPPORTUNITIES = 20;
/** Impact and effort are rated 1 (low) to 5 (high); 0 means not rated yet. */
export const RATING_MAX = 5;

export interface Competitor {
  id: string;
  name: string;
}
export interface CanvasFactor {
  id: string;
  name: string;
  /** Our score, 0-10. */
  you: number;
  /** Competitor scores by competitor id, 0-10. */
  scores: Record<string, number>;
}
export interface Opportunity {
  id: string;
  title: string;
  /** A testable statement: what we would change and what result would show it worked. */
  hypothesis: string;
  impact: number;
  effort: number;
}
export interface StrategyCanvasData {
  competitors: Competitor[];
  factors: CanvasFactor[];
  opportunities: Opportunity[];
}

/** The three example factors 3.5.0 saved into every installation once a slider was moved. */
const SEEDED_FACTORS: ReadonlyArray<readonly [string, number, number]> = [['Price', 60, 40], ['Quality', 80, 50], ['Speed', 40, 70]];

const score = (value: unknown): number => intIn(value, SCORE_MIN, SCORE_MAX, DEFAULT_SCORE);

export const emptyCanvas = (): StrategyCanvasData => ({ competitors: [], factors: [], opportunities: [] });

function normalizeLegacyFactors(value: unknown): StrategyCanvasData {
  // 3.x stored { name, you, comp } on a 0-100 scale for a single unnamed competitor.
  const legacy = list(value).filter(isRecord).map((f) => ({
    name: text(f.name, 100),
    you: typeof f.you === 'number' ? f.you : NaN,
    comp: typeof f.comp === 'number' ? f.comp : NaN,
  })).filter((f) => f.name && Number.isFinite(f.you) && Number.isFinite(f.comp));
  const seeded = legacy.length === SEEDED_FACTORS.length
    && legacy.every((f, i) => f.name === SEEDED_FACTORS[i][0] && f.you === SEEDED_FACTORS[i][1] && f.comp === SEEDED_FACTORS[i][2]);
  if (legacy.length === 0 || seeded) return emptyCanvas();
  const tenPoint = (n: number) => score(Math.round(Math.min(100, Math.max(0, n)) / 10));
  return {
    competitors: [{ id: 'c1', name: 'Competitor' }],
    factors: legacy.map((f, i) => ({ id: `f${i + 1}`, name: f.name, you: tenPoint(f.you), scores: { c1: tenPoint(f.comp) } })),
    opportunities: [],
  };
}

export function normalizeStrategyCanvas(raw: unknown): StrategyCanvasData {
  const source = isRecord(raw) ? raw : {};
  if (!Array.isArray(source.competitors)) return normalizeLegacyFactors(source.factors);

  const competitors = list(source.competitors).filter(isRecord).slice(0, MAX_COMPETITORS).map((c, i) => ({
    id: idOf(c.id, 'c', i),
    name: text(c.name, 100),
  }));
  const factors = list(source.factors).filter(isRecord).slice(0, MAX_FACTORS).map((f, i) => {
    const stored = isRecord(f.scores) ? f.scores : {};
    return {
      id: idOf(f.id, 'f', i),
      name: text(f.name, 100),
      you: score(f.you),
      scores: Object.fromEntries(competitors.map((c) => [c.id, score(stored[c.id])])),
    };
  });
  const opportunities = list(source.opportunities).filter(isRecord).slice(0, MAX_OPPORTUNITIES).map((o, i) => ({
    id: idOf(o.id, 'o', i),
    title: text(o.title, 300),
    hypothesis: text(o.hypothesis, 1000),
    impact: intIn(o.impact, 0, RATING_MAX, 0),
    effort: intIn(o.effort, 0, RATING_MAX, 0),
  }));
  return { competitors, factors, opportunities };
}

/** Removes a competitor and the scores that were recorded for it. */
export function removeCompetitor(data: StrategyCanvasData, id: string): StrategyCanvasData {
  return {
    ...data,
    competitors: data.competitors.filter((c) => c.id !== id),
    factors: data.factors.map((f) => {
      const scores = { ...f.scores };
      delete scores[id];
      return { ...f, scores };
    }),
  };
}

/** Adds a competitor; every factor gets the neutral default score for it. */
export function addCompetitor(data: StrategyCanvasData, id: string, name = ''): StrategyCanvasData {
  if (data.competitors.length >= MAX_COMPETITORS) return data;
  return {
    ...data,
    competitors: [...data.competitors, { id, name }],
    factors: data.factors.map((f) => ({ ...f, scores: { ...f.scores, [id]: DEFAULT_SCORE } })),
  };
}

/** Adds a factor scored at the neutral default for us and for every competitor. */
export function addFactor(data: StrategyCanvasData, id: string, name = ''): StrategyCanvasData {
  if (data.factors.length >= MAX_FACTORS) return data;
  return {
    ...data,
    factors: [...data.factors, { id, name, you: DEFAULT_SCORE, scores: Object.fromEntries(data.competitors.map((c) => [c.id, DEFAULT_SCORE])) }],
  };
}

/**
 * Our score minus the best competitor's score on one factor. Positive = we lead, negative = a
 * competitor leads. Null when there is no competitor to compare with.
 */
export function gapVsBest(factor: CanvasFactor, competitors: readonly Competitor[]): number | null {
  const theirs = competitors.map((c) => factor.scores[c.id]).filter((n): n is number => typeof n === 'number');
  return theirs.length === 0 ? null : factor.you - Math.max(...theirs);
}

export function describeGap(gap: number | null): string {
  if (gap === null) return 'Add a competitor to compare';
  if (gap === 0) return 'Level with the best competitor';
  return gap > 0 ? `${gap} ahead of the best competitor` : `${-gap} behind the best competitor`;
}

/** Impact divided by effort, to two decimals; null until both are rated. */
export function opportunityScore(opportunity: Pick<Opportunity, 'impact' | 'effort'>): number | null {
  if (opportunity.impact < 1 || opportunity.effort < 1) return null;
  return Math.round((opportunity.impact / opportunity.effort) * 100) / 100;
}

/** Rated opportunities first, best score first (higher impact wins a tie); unrated ones keep their order at the end. */
export function rankOpportunities(opportunities: readonly Opportunity[]): Opportunity[] {
  return opportunities
    .map((opportunity, index) => ({ opportunity, index, value: opportunityScore(opportunity) }))
    .sort((a, b) => {
      if (a.value !== null && b.value !== null) return (b.value - a.value) || (b.opportunity.impact - a.opportunity.impact) || (a.index - b.index);
      if (a.value !== null) return -1;
      if (b.value !== null) return 1;
      return a.index - b.index;
    })
    .map((entry) => entry.opportunity);
}

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

export function strategyShareText(data: StrategyCanvasData): string | null {
  if (data.factors.length === 0 && data.opportunities.length === 0 && data.competitors.length === 0) return null;
  const names = data.competitors.map((c, i) => clean(c.name) || `Competitor ${i + 1}`);
  const ranked = rankOpportunities(data.opportunities);
  return lines(
    'Competitor gap matrix (scores 0-10)',
    names.length ? `Competitors: ${names.join(', ')}` : 'Competitors: (none added)',
    '',
    ...data.factors.map((f) => {
      const gap = gapVsBest(f, data.competitors);
      const theirs = data.competitors.map((c, i) => `${names[i]} ${f.scores[c.id] ?? DEFAULT_SCORE}`);
      return `- ${clean(f.name) || '(unnamed factor)'}: You ${f.you}${theirs.length ? `, ${theirs.join(', ')}` : ''}${gap === null ? '' : ` (gap vs best ${signed(gap)})`}`;
    }),
    '',
    'Ranked opportunities (impact / effort)',
    ...(ranked.length === 0 ? ['(none yet)'] : ranked.flatMap((o, i) => {
      const value = opportunityScore(o);
      return [
        `${i + 1}. ${clean(o.title) || '(untitled)'} - ${value === null ? 'not rated yet' : `impact ${o.impact}, effort ${o.effort}, score ${value}`}`,
        `   Testable hypothesis: ${clean(o.hypothesis) || '(not set)'}`,
      ];
    })),
  );
}
