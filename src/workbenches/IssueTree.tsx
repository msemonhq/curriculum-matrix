import { Info, Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { ToolInput } from '../components/ToolInput';
import { ToolTextArea } from '../components/ToolTextArea';
import { MAX_ITEMS, newId } from '../lib/fields';
import { normalizeIssueTree } from '../lib/workbench';
import type { Branch, Hypothesis } from '../lib/workbench';
import { EmptyHint, Panel, RemoveButton, ToolSection } from './ui';
import { useToolSlice } from './useToolSlice';

const blankHypothesis = (): Hypothesis => ({ id: newId(), text: '', rank: 0, dataSource: '', method: '', decisionResult: '' });

export default function IssueTree() {
  const [data, update] = useToolSlice('1', normalizeIssueTree);

  const allHypotheses = data.branches.flatMap((b) => b.hypotheses);
  const ranks = allHypotheses.map((h) => h.rank).filter((r) => r > 0);
  const hasSharedRank = new Set(ranks).size !== ranks.length;
  // Offer as many priorities as there are hypotheses (at least 3), and never hide one already chosen.
  const rankMax = Math.min(9, Math.max(3, allHypotheses.length, ...ranks));

  const setBranch = (id: string, patch: Partial<Branch>) =>
    update((current) => ({ ...current, branches: current.branches.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  const setHypothesis = (branchId: string, id: string, patch: Partial<Hypothesis>) =>
    update((current) => ({
      ...current,
      branches: current.branches.map((b) => (
        b.id === branchId ? { ...b, hypotheses: b.hypotheses.map((h) => (h.id === id ? { ...h, ...patch } : h)) } : b
      )),
    }));
  const addBranch = () =>
    update((current) => ({ ...current, branches: [...current.branches, { id: newId(), title: '', hypotheses: [blankHypothesis()] }] }));
  const addHypothesis = (branchId: string) =>
    update((current) => ({
      ...current,
      branches: current.branches.map((b) => (b.id === branchId ? { ...b, hypotheses: [...b.hypotheses, blankHypothesis()] } : b)),
    }));

  return (
    <div className="w-full text-left">
      <ToolTextArea
        id="tree-question"
        label="Research question"
        rows={2}
        value={data.question}
        maxLength={4000}
        placeholder="e.g. Why did online orders fall in September?"
        onChange={(e) => update((current) => ({ ...current, question: e.target.value }))}
      />

      <ToolSection
        title="Branches and hypotheses"
        hint="For each hypothesis, name the data, the method, and the result that would change your decision."
      >
        {hasSharedRank && (
          <p role="status" className="mb-3 flex items-start gap-2 text-meta text-ink-primary">
            <Info className="mt-px w-4 h-4 shrink-0 text-ink-secondary" aria-hidden="true" />
            Two hypotheses share the same priority. Give each its own number to rank them.
          </p>
        )}
        {data.branches.length === 0 && <EmptyHint>No branches yet. Add one for each part of the question you want to test.</EmptyHint>}

        <ul className="space-y-4 mb-4">
          {data.branches.map((branch, bi) => (
            <li key={branch.id}>
              <Panel>
                <div className="flex items-end gap-2 mb-3">
                  <ToolInput
                    id={`branch-${branch.id}-title`}
                    label={`Branch ${bi + 1}`}
                    value={branch.title}
                    maxLength={300}
                    placeholder="e.g. Fewer people are reaching the site"
                    onChange={(e) => setBranch(branch.id, { title: e.target.value })}
                  />
                  <RemoveButton
                    label={`Delete branch ${bi + 1}`}
                    needsConfirm={Boolean(branch.title.trim()) || branch.hypotheses.some((h) => h.text.trim() || h.dataSource.trim() || h.method.trim() || h.decisionResult.trim())}
                    onRemove={() => update((current) => ({ ...current, branches: current.branches.filter((b) => b.id !== branch.id) }))}
                  />
                </div>

                <ul className="space-y-3">
                  {branch.hypotheses.map((h, hi) => (
                    <li key={h.id} className="pt-3 border-t border-rule">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-meta font-semibold text-ink-primary">Hypothesis {bi + 1}.{hi + 1}</span>
                        <RemoveButton
                          label={`Delete hypothesis ${bi + 1}.${hi + 1}`}
                          needsConfirm={Boolean(h.text.trim() || h.dataSource.trim() || h.method.trim() || h.decisionResult.trim())}
                          onRemove={() => update((current) => ({
                            ...current,
                            branches: current.branches.map((b) => (b.id === branch.id ? { ...b, hypotheses: b.hypotheses.filter((x) => x.id !== h.id) } : b)),
                          }))}
                        />
                      </div>
                      <div className="space-y-3">
                        <ToolTextArea
                          id={`hyp-${h.id}-text`}
                          label="Hypothesis"
                          rows={2}
                          value={h.text}
                          maxLength={4000}
                          placeholder="e.g. Paid traffic dropped after the budget cut"
                          onChange={(e) => setHypothesis(branch.id, h.id, { text: e.target.value })}
                        />
                        <Select
                          id={`hyp-${h.id}-rank`}
                          label="Priority"
                          value={String(h.rank)}
                          onChange={(e) => setHypothesis(branch.id, h.id, { rank: Number(e.target.value) })}
                        >
                          <option value="0">Not ranked</option>
                          {Array.from({ length: Math.max(rankMax, h.rank) }, (_, n) => n + 1).map((n) => (
                            <option key={n} value={n}>{n === 1 ? '1 (test first)' : String(n)}</option>
                          ))}
                        </Select>
                        <ToolInput
                          id={`hyp-${h.id}-source`}
                          label="Data source"
                          value={h.dataSource}
                          maxLength={1000}
                          placeholder="e.g. GA4 acquisition report"
                          onChange={(e) => setHypothesis(branch.id, h.id, { dataSource: e.target.value })}
                        />
                        <ToolInput
                          id={`hyp-${h.id}-method`}
                          label="Method"
                          value={h.method}
                          maxLength={1000}
                          placeholder="e.g. Compare weekly sessions by channel, August vs September"
                          onChange={(e) => setHypothesis(branch.id, h.id, { method: e.target.value })}
                        />
                        <ToolTextArea
                          id={`hyp-${h.id}-result`}
                          label="Result that would change the decision"
                          rows={2}
                          value={h.decisionResult}
                          maxLength={1000}
                          placeholder="e.g. If paid sessions fell by more than 20%, restore the budget"
                          onChange={(e) => setHypothesis(branch.id, h.id, { decisionResult: e.target.value })}
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-3">
                  <Button variant="text" fullWidth onClick={() => addHypothesis(branch.id)} disabled={branch.hypotheses.length >= MAX_ITEMS}>
                    <Plus className="w-4 h-4" aria-hidden="true" /> Add hypothesis
                  </Button>
                </div>
              </Panel>
            </li>
          ))}
        </ul>

        <Button variant="secondary" fullWidth onClick={addBranch} disabled={data.branches.length >= MAX_ITEMS}>
          <Plus className="w-4 h-4" aria-hidden="true" /> Add branch
        </Button>
      </ToolSection>
    </div>
  );
}
