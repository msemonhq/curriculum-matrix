import { Select } from '../components/Select';
import { ToolInput } from '../components/ToolInput';
import { ToolTextArea } from '../components/ToolTextArea';
import { DECISIONS, DECISION_LABEL, abSampleSize, normalizeAbTest } from '../lib/workbench';
import type { AbTestData, Decision } from '../lib/workbench';
import { Hint, SectionHeading } from './ui';
import { useToolSlice } from './useToolSlice';

const fmt = (n: number) => n.toLocaleString('en-US');

export default function AbTest() {
  const [data, update] = useToolSlice('7', normalizeAbTest);
  const set = (patch: Partial<AbTestData>) => update((current) => ({ ...current, ...patch }));
  const size = abSampleSize(data);

  return (
    <div className="w-full text-left">
      <SectionHeading>Test plan</SectionHeading>
      <div className="space-y-4">
        <ToolTextArea
          id="ab-hypothesis"
          label="Hypothesis"
          rows={3}
          value={data.hypothesis}
          maxLength={4000}
          placeholder="If we change [what], then [metric] will [rise or fall] by [amount], because [reason]."
          onChange={(e) => set({ hypothesis: e.target.value })}
        />
        <ToolInput
          id="ab-metric"
          label="Primary metric"
          value={data.primaryMetric}
          maxLength={500}
          placeholder="e.g. Checkout conversion rate"
          onChange={(e) => set({ primaryMetric: e.target.value })}
        />
        <ToolTextArea
          id="ab-guardrails"
          label="Guardrail metrics"
          rows={2}
          value={data.guardrails}
          maxLength={1000}
          placeholder="Metrics that must not get worse, e.g. refund rate, page load time"
          onChange={(e) => set({ guardrails: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <ToolInput
            id="ab-baseline"
            label="Baseline rate (%)"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="any"
            value={data.baselinePct}
            placeholder="4"
            onChange={(e) => set({ baselinePct: e.target.value })}
          />
          <ToolInput
            id="ab-mde"
            label="Smallest effect (points)"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={data.mdePoints}
            placeholder="1"
            onChange={(e) => set({ mdePoints: e.target.value })}
          />
        </div>
        <Hint>Baseline is today&apos;s rate, for example 4 for 4%. The smallest effect is the lift worth detecting, in percentage points, for example 1.</Hint>

        <div className="p-4 bg-accent-dim border border-accent/25 rounded-xl" role="status">
          {size.ok ? (
            <>
              <p className="text-title text-ink-primary tabular">{fmt(size.perArm)} visitors per arm</p>
              <p className="text-meta text-ink-secondary mt-1 tabular">{fmt(size.total)} in total · 95% confidence, 80% power, two-sided</p>
            </>
          ) : (
            <p className="text-body text-ink-secondary">{size.message}</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <SectionHeading>Test report</SectionHeading>
        <div className="space-y-4">
          <ToolTextArea
            id="ab-result"
            label="Result"
            rows={3}
            value={data.result}
            maxLength={4000}
            placeholder="What happened in each arm, with the numbers."
            onChange={(e) => set({ result: e.target.value })}
          />
          <ToolInput
            id="ab-ci"
            label="Confidence interval"
            value={data.confidenceInterval}
            maxLength={200}
            placeholder="e.g. +0.4 to +1.6 points (95%)"
            onChange={(e) => set({ confidenceInterval: e.target.value })}
          />
          <Select id="ab-decision" label="Decision" value={data.decision} onChange={(e) => set({ decision: e.target.value as Decision })}>
            {DECISIONS.map((decision) => (
              <option key={decision || 'none'} value={decision}>{DECISION_LABEL[decision]}</option>
            ))}
          </Select>
          <ToolTextArea
            id="ab-learning"
            label="What we learned"
            rows={3}
            value={data.learning}
            maxLength={4000}
            placeholder="What this changes about how we think, even if the variant lost."
            onChange={(e) => set({ learning: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
