import { useState } from 'react';
import { Badge } from '../components/Badge';
import { ToolInput } from '../components/ToolInput';
import { ToolTextArea } from '../components/ToolTextArea';
import { describeFlag, normalizeRecon, reconSummary, reconcileRow } from '../lib/workbench';
import type { ReconFlag, ReconRow } from '../lib/workbench';
import { Hint, Panel } from './ui';
import { useToolSlice } from './useToolSlice';

const fmt = (n: number) => n.toLocaleString('en-US');
const signed = (n: number) => (n > 0 ? `+${fmt(n)}` : fmt(n));

const FLAG_BADGE: Record<ReconFlag, { variant: 'success' | 'danger' | 'default'; label: string } | null> = {
  ok: { variant: 'success', label: 'Within threshold' },
  over: { variant: 'danger', label: 'Over threshold' },
  zero_baseline: { variant: 'default', label: 'Cannot compare' },
  no_data: null,
};

export default function ReconCalc() {
  const [data, update] = useToolSlice('4', normalizeRecon);
  const [thresholdText, setThresholdText] = useState(String(data.thresholdPct));

  const results = data.rows.map((row) => reconcileRow(row, data.thresholdPct));
  const summary = reconSummary(results);
  const thresholdNumber = Number(thresholdText);
  const thresholdValid = thresholdText.trim() !== '' && Number.isFinite(thresholdNumber) && thresholdNumber >= 0 && thresholdNumber <= 1000;

  const setRow = (index: number, patch: Partial<ReconRow>) =>
    update((current) => ({ ...current, rows: current.rows.map((row, i) => (i === index ? { ...row, ...patch } : row)) }));

  return (
    <div className="w-full text-left">
      <div className="mb-6">
        <ToolInput
          id="recon-threshold"
          label="Flag a day when the difference is above (%)"
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={thresholdText}
          error={thresholdValid ? undefined : 'Enter a number from 0 to 1000.'}
          onChange={(e) => {
            const value = e.target.value;
            setThresholdText(value);
            const n = Number(value);
            if (value.trim() !== '' && Number.isFinite(n) && n >= 0 && n <= 1000) update((current) => ({ ...current, thresholdPct: n }));
          }}
          onBlur={() => setThresholdText(String(data.thresholdPct))}
        />
        <Hint className="mt-1.5">GA4 counts sessions on the site and Meta counts clicks on the ad, so they rarely match. The difference is shown as a percentage of Meta link clicks.</Hint>
      </div>

      <ul className="space-y-3 mb-5">
        {data.rows.map((row, i) => {
          const result = results[i];
          const badge = FLAG_BADGE[result.flag];
          return (
            <li key={i}>
              <Panel>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-meta font-semibold text-ink-primary">Day {i + 1}</span>
                  {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
                </div>
                <ToolInput
                  id={`recon-${i}-date`}
                  label="Date"
                  type="date"
                  value={row.date}
                  onChange={(e) => setRow(i, { date: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <ToolInput
                    id={`recon-${i}-ga4`}
                    label="GA4 sessions"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={row.ga4}
                    onChange={(e) => setRow(i, { ga4: e.target.value })}
                  />
                  <ToolInput
                    id={`recon-${i}-meta`}
                    label="Meta link clicks"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={row.meta}
                    onChange={(e) => setRow(i, { meta: e.target.value })}
                  />
                </div>
                {result.flag === 'no_data' && (row.ga4 !== '' || row.meta !== '') && (
                  <p className="mt-2 text-meta text-ink-tertiary">{describeFlag(result, data.thresholdPct)}</p>
                )}
                {result.flag === 'zero_baseline' && (
                  <p role="status" className="mt-2 text-meta text-ink-primary">{describeFlag(result, data.thresholdPct)}</p>
                )}
                {(result.flag === 'ok' || result.flag === 'over') && result.diff !== null && result.pct !== null && (
                  <p role="status" className={`mt-2 text-body font-semibold tabular ${result.flag === 'over' ? 'text-danger' : 'text-success'}`}>
                    {signed(result.diff)} ({result.pct > 0 ? '+' : ''}{result.pct}%)
                  </p>
                )}
              </Panel>
            </li>
          );
        })}
      </ul>

      <Panel className="mb-6" role="status">
        <h3 className="text-title text-ink-primary mb-2">Week total</h3>
        {summary.days === 0 ? (
          <p className="text-body text-ink-secondary">Enter both numbers for at least one day to see the total.</p>
        ) : (
          <div className="space-y-1 text-body text-ink-primary tabular">
            <p>GA4 sessions: {fmt(summary.totalGa4)}</p>
            <p>Meta link clicks: {fmt(summary.totalMeta)}</p>
            <p className="font-semibold">
              Difference: {signed(summary.totalDiff)}
              {summary.overallPct === null ? ' (Meta total is 0, so no % is shown)' : ` (${summary.overallPct > 0 ? '+' : ''}${summary.overallPct}%)`}
            </p>
            <p className="text-ink-secondary">Days over the threshold: {summary.flaggedDays} of {summary.days}</p>
          </div>
        )}
      </Panel>

      <ToolTextArea
        id="recon-note"
        label="Reconciliation note"
        rows={5}
        value={data.note}
        maxLength={4000}
        placeholder="Explain the gap: which days are off, why (tracking consent, bot clicks, slow page loads, attribution window), and what you would check next."
        onChange={(e) => update((current) => ({ ...current, note: e.target.value }))}
      />
    </div>
  );
}
