import { Plus } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { ToolInput } from '../components/ToolInput';
import { ToolTextArea } from '../components/ToolTextArea';
import { newId } from '../lib/fields';
import {
  DEFAULT_SCORE, MAX_COMPETITORS, MAX_FACTORS, MAX_OPPORTUNITIES, RATING_MAX, SCORE_MAX, SCORE_MIN, addCompetitor, addFactor, describeGap, gapVsBest,
  normalizeStrategyCanvas, opportunityScore, rankOpportunities, removeCompetitor,
} from '../lib/strategy';
import type { CanvasFactor, Opportunity } from '../lib/strategy';
import { EmptyHint, Panel, RemoveButton, ToolSection } from './ui';
import { useToolSlice } from './useToolSlice';

interface ScoreSliderProps {
  id: string;
  label: string;
  value: number;
  strong?: boolean;
  onChange: (value: number) => void;
}

function ScoreSlider({ id, label, value, strong = false, onChange }: ScoreSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className={`w-24 shrink-0 truncate text-meta ${strong ? 'text-accent font-semibold' : 'text-ink-secondary'}`}>{label}</label>
      <input
        id={id}
        type="range"
        min={SCORE_MIN}
        max={SCORE_MAX}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`flex-1 min-h-11 ${strong ? 'accent-accent' : 'accent-ink-tertiary'}`}
      />
      <span className="w-6 text-right text-meta font-mono tabular text-ink-primary">{value}</span>
    </div>
  );
}

const RATING_LABEL = (n: number): string => {
  if (n === 0) return 'Not rated';
  if (n === 1) return '1 (low)';
  return n === RATING_MAX ? `${n} (high)` : String(n);
};
const RATINGS = Array.from({ length: RATING_MAX + 1 }, (_, n) => n);

export default function StrategyCanvas() {
  const [data, update] = useToolSlice('6', normalizeStrategyCanvas);

  const competitorName = (index: number) => data.competitors[index].name.trim() || `Competitor ${index + 1}`;
  const setFactor = (id: string, change: (factor: CanvasFactor) => CanvasFactor) =>
    update((current) => ({ ...current, factors: current.factors.map((f) => (f.id === id ? change(f) : f)) }));
  const setOpportunity = (id: string, patch: Partial<Opportunity>) =>
    update((current) => ({ ...current, opportunities: current.opportunities.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));

  const ranked = rankOpportunities(data.opportunities);

  return (
    <div className="w-full text-left">
      <ToolSection first title="Competitors" hint={`Name up to ${MAX_COMPETITORS} competitors to compare yourself with.`}>
        {data.competitors.length === 0 && <EmptyHint>No competitors yet. Add the first one to see where you lead and where you trail.</EmptyHint>}
        <ul className="space-y-2 mb-3">
          {data.competitors.map((c, i) => (
            <li key={c.id} className="flex items-center gap-2">
              <ToolInput
                id={`competitor-${c.id}`}
                aria-label={`Competitor ${i + 1} name`}
                value={c.name}
                maxLength={100}
                placeholder={`Competitor ${i + 1}`}
                onChange={(e) => update((current) => ({ ...current, competitors: current.competitors.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)) }))}
              />
              <RemoveButton
                label={`Delete ${competitorName(i)}`}
                needsConfirm={Boolean(c.name.trim()) || data.factors.length > 0}
                onRemove={() => update((current) => removeCompetitor(current, c.id))}
              />
            </li>
          ))}
        </ul>
        <Button variant="secondary" fullWidth onClick={() => update((current) => addCompetitor(current, newId()))} disabled={data.competitors.length >= MAX_COMPETITORS}>
          <Plus className="w-4 h-4" aria-hidden="true" /> Add competitor
        </Button>
      </ToolSection>

      <ToolSection title="Gap matrix" hint={`Score each factor from ${SCORE_MIN} to ${SCORE_MAX} for you and for each competitor. The gap is measured against the best competitor.`}>
        {data.factors.length === 0 && <EmptyHint>No factors yet. Add what customers compare, for example price, delivery speed or range.</EmptyHint>}
        <ul className="space-y-3 mb-3">
          {data.factors.map((f, fi) => {
            const gap = gapVsBest(f, data.competitors);
            return (
              <li key={f.id}>
                <Panel>
                  <div className="flex items-center gap-2 mb-2">
                    <ToolInput
                      id={`factor-${f.id}-name`}
                      aria-label={`Factor ${fi + 1} name`}
                      value={f.name}
                      maxLength={100}
                      placeholder="e.g. Delivery speed"
                      onChange={(e) => setFactor(f.id, (factor) => ({ ...factor, name: e.target.value }))}
                    />
                    <RemoveButton
                      label={`Delete ${f.name.trim() || `factor ${fi + 1}`}`}
                      needsConfirm={Boolean(f.name.trim())}
                      onRemove={() => update((current) => ({ ...current, factors: current.factors.filter((x) => x.id !== f.id) }))}
                    />
                  </div>
                  <ScoreSlider id={`factor-${f.id}-you`} label="You" strong value={f.you} onChange={(value) => setFactor(f.id, (factor) => ({ ...factor, you: value }))} />
                  {data.competitors.map((c, ci) => (
                    <ScoreSlider
                      key={c.id}
                      id={`factor-${f.id}-${c.id}`}
                      label={competitorName(ci)}
                      value={f.scores[c.id] ?? DEFAULT_SCORE}
                      onChange={(value) => setFactor(f.id, (factor) => ({ ...factor, scores: { ...factor.scores, [c.id]: value } }))}
                    />
                  ))}
                  <p role="status" className={`mt-1 text-meta font-semibold ${gap === null ? 'text-ink-tertiary' : gap > 0 ? 'text-success' : gap < 0 ? 'text-danger' : 'text-ink-secondary'}`}>
                    {describeGap(gap)}
                  </p>
                </Panel>
              </li>
            );
          })}
        </ul>
        <Button variant="secondary" fullWidth onClick={() => update((current) => addFactor(current, newId()))} disabled={data.factors.length >= MAX_FACTORS}>
          <Plus className="w-4 h-4" aria-hidden="true" /> Add factor
        </Button>
      </ToolSection>

      <ToolSection title="Ranked opportunities" hint="Rate each idea for impact and effort. The score is impact divided by effort, so a high-impact, low-effort idea comes first.">
        {data.opportunities.length === 0 && <EmptyHint>No opportunities yet. Turn a gap into an idea you could test.</EmptyHint>}
        <ul className="space-y-3 mb-3">
          {ranked.map((o, i) => {
            const value = opportunityScore(o);
            return (
              <li key={o.id}>
                <Panel>
                  <div className="flex items-center justify-between mb-2">
                    {value === null ? <Badge>Not ranked</Badge> : <Badge variant="accent">#{i + 1} · score {value}</Badge>}
                    <RemoveButton
                      label={`Delete ${o.title.trim() || 'opportunity'}`}
                      needsConfirm={Boolean(o.title.trim() || o.hypothesis.trim())}
                      onRemove={() => update((current) => ({ ...current, opportunities: current.opportunities.filter((x) => x.id !== o.id) }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <ToolInput
                      id={`opp-${o.id}-title`}
                      label="Opportunity"
                      value={o.title}
                      maxLength={300}
                      placeholder="e.g. Same-day delivery inside Dhaka"
                      onChange={(e) => setOpportunity(o.id, { title: e.target.value })}
                    />
                    <ToolTextArea
                      id={`opp-${o.id}-hypothesis`}
                      label="Testable hypothesis"
                      rows={2}
                      value={o.hypothesis}
                      maxLength={1000}
                      placeholder="If we do this, [metric] will change by [amount] within [time]."
                      onChange={(e) => setOpportunity(o.id, { hypothesis: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Select id={`opp-${o.id}-impact`} label="Impact" value={String(o.impact)} onChange={(e) => setOpportunity(o.id, { impact: Number(e.target.value) })}>
                        {RATINGS.map((n) => <option key={n} value={n}>{RATING_LABEL(n)}</option>)}
                      </Select>
                      <Select id={`opp-${o.id}-effort`} label="Effort" value={String(o.effort)} onChange={(e) => setOpportunity(o.id, { effort: Number(e.target.value) })}>
                        {RATINGS.map((n) => <option key={n} value={n}>{RATING_LABEL(n)}</option>)}
                      </Select>
                    </div>
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => update((current) => ({ ...current, opportunities: [...current.opportunities, { id: newId(), title: '', hypothesis: '', impact: 0, effort: 0 }] }))}
          disabled={data.opportunities.length >= MAX_OPPORTUNITIES}
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Add opportunity
        </Button>
      </ToolSection>
    </div>
  );
}
