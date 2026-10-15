import { Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { ToolInput } from '../components/ToolInput';
import { ToolTextArea } from '../components/ToolTextArea';
import { MAX_ITEMS, newId } from '../lib/fields';
import { CLAIM_STATUSES, REQUIRED_CLAIMS, normalizeVerificationLog, verificationCounts } from '../lib/workbench';
import type { Claim, ClaimStatus } from '../lib/workbench';
import { EmptyHint, Hint, Panel, RemoveButton, SectionHeading } from './ui';
import { useToolSlice } from './useToolSlice';

const STATUS_LABEL: Record<ClaimStatus, string> = { unchecked: 'Unchecked', confirmed: 'Confirmed', unsupported: 'Unsupported' };
const STATUS_ON: Record<ClaimStatus, string> = {
  unchecked: 'bg-surface-base text-ink-primary border-ink-tertiary',
  confirmed: 'bg-success-dim text-success border-success/50',
  unsupported: 'bg-danger-dim text-danger border-danger/50',
};

export default function VerificationLog() {
  const [data, update] = useToolSlice('2', normalizeVerificationLog);
  const counts = verificationCounts(data);

  const setClaim = (id: string, patch: Partial<Claim>) =>
    update((current) => ({ claims: current.claims.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const addClaim = () =>
    update((current) => ({ claims: [...current.claims, { id: newId(), claim: '', source: '', status: 'unchecked' }] }));
  const removeClaim = (id: string) => update((current) => ({ claims: current.claims.filter((c) => c.id !== id) }));

  return (
    <div className="w-full text-left">
      <SectionHeading>Verification Log</SectionHeading>
      <Hint className="mb-4">
        Log {REQUIRED_CLAIMS} claims an AI made about the Bangladeshi book market. For each, find the primary source and mark it confirmed or unsupported.
      </Hint>

      <div className="mb-5" role="status">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
          <span className="text-body font-semibold text-ink-primary tabular">
            {counts.total} of {REQUIRED_CLAIMS} claims logged
          </span>
          <span className="text-meta text-ink-secondary tabular">
            {counts.confirmed} confirmed · {counts.unsupported} unsupported · {counts.unchecked} unchecked
          </span>
        </div>
        <ProgressBar progress={(Math.min(counts.total, REQUIRED_CLAIMS) / REQUIRED_CLAIMS) * 100} />
        {counts.total >= REQUIRED_CLAIMS && counts.unchecked === 0 && (
          <p className="mt-2 text-meta text-success">All claims are checked.</p>
        )}
      </div>

      {data.claims.length === 0 && (
        <EmptyHint>No claims yet. Add the first claim the AI gave you, then trace it to where the number or fact really comes from.</EmptyHint>
      )}

      <ul className="space-y-3 mb-4">
        {data.claims.map((c, i) => (
          <li key={c.id}>
            <Panel>
              <div className="flex items-center justify-between mb-2">
                <span className="text-meta font-semibold text-ink-primary">Claim {i + 1}</span>
                <RemoveButton
                  label={`Delete claim ${i + 1}`}
                  needsConfirm={Boolean(c.claim.trim() || c.source.trim())}
                  onRemove={() => removeClaim(c.id)}
                />
              </div>
              <div className="space-y-3">
                <ToolTextArea
                  id={`claim-${c.id}-text`}
                  label="What the AI claimed"
                  rows={2}
                  value={c.claim}
                  maxLength={1000}
                  placeholder="e.g. Online book sales in Bangladesh grew faster than shop sales last year"
                  onChange={(e) => setClaim(c.id, { claim: e.target.value })}
                />
                <ToolInput
                  id={`claim-${c.id}-source`}
                  label="Primary source (link or citation)"
                  value={c.source}
                  maxLength={1000}
                  placeholder="e.g. publisher report, BBS table, company filing"
                  onChange={(e) => setClaim(c.id, { source: e.target.value })}
                />
                <div role="group" aria-label={`Status of claim ${i + 1}`} className="grid grid-cols-3 gap-2">
                  {CLAIM_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      aria-pressed={c.status === status}
                      onClick={() => setClaim(c.id, { status })}
                      className={`min-h-11 rounded-xl border text-meta font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${c.status === status ? STATUS_ON[status] : 'bg-transparent border-edge text-ink-tertiary hover:text-ink-secondary'}`}
                    >
                      {STATUS_LABEL[status]}
                    </button>
                  ))}
                </div>
              </div>
            </Panel>
          </li>
        ))}
      </ul>

      <Button variant="secondary" fullWidth onClick={addClaim} disabled={data.claims.length >= MAX_ITEMS}>
        <Plus className="w-4 h-4" aria-hidden="true" /> Add claim
      </Button>
    </div>
  );
}
