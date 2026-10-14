import { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ToolInput } from '../components/ToolInput';
import { FORMULAS, FORMULA_GROUPS, filterFormulas } from '../lib/formulas';
import type { FormulaEntry, FormulaGroup } from '../lib/formulas';
import { useToast } from '../hooks/useToast';
import { copyText } from '../services/share';
import { Hint, SectionHeading } from './ui';

const GROUP_CHOICES: ReadonlyArray<FormulaGroup | 'All'> = ['All', ...FORMULA_GROUPS];

export default function FormulaSheet() {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<FormulaGroup | 'All'>('All');
  const results = useMemo(() => filterFormulas(FORMULAS, query, group), [query, group]);

  const handleCopy = async (entry: FormulaEntry) => {
    const copied = await copyText(entry.formula);
    if (copied) showToast(`Copied ${entry.name}.`, 'success');
    else showToast('Could not copy. Press and hold the formula to select it.', 'danger');
  };

  return (
    <div className="w-full text-left">
      <SectionHeading>Formula cheat-sheet</SectionHeading>
      <Hint className="mb-4">Formulas for the Phase 3 intake, pivot and summary, and the marketing metrics used later. Change the cell references to match your sheet.</Hint>

      <ToolInput
        id="formula-search"
        aria-label="Search formulas"
        type="search"
        value={query}
        placeholder="Search, for example QUERY, lookup or ROAS"
        onChange={(e) => setQuery(e.target.value)}
      />

      <div role="group" aria-label="Filter by group" className="flex gap-2 overflow-x-auto py-3 -mx-1 px-1">
        {GROUP_CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            aria-pressed={group === choice}
            onClick={() => setGroup(choice)}
            className={`min-h-11 shrink-0 px-4 rounded-xl border text-meta font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${group === choice ? 'bg-accent-dim border-accent/50 text-accent' : 'bg-transparent border-rule text-ink-secondary hover:text-ink-primary'}`}
          >
            {choice}
          </button>
        ))}
      </div>

      <p role="status" className="mb-3 text-meta text-ink-secondary tabular">{results.length} of {FORMULAS.length} shown</p>

      {results.length === 0 ? (
        <div className="p-4 border border-dashed border-rule rounded-xl text-body text-ink-secondary">No formula matches that search. Try a shorter word, or choose All.</div>
      ) : (
        <ul className="space-y-3">
          {results.map((entry) => (
            <li key={entry.id} className="p-3 bg-surface-subtle border border-rule rounded-xl">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h5 className="text-body font-semibold text-ink-primary truncate">{entry.name}</h5>
                  <Badge>{entry.group}</Badge>
                </div>
                <Button variant="secondary" aria-label={`Copy ${entry.name}`} onClick={() => handleCopy(entry)} className="shrink-0 !px-3 !py-2">
                  <Copy className="w-4 h-4" aria-hidden="true" /> Copy
                </Button>
              </div>
              <code className="block p-2.5 mb-2 bg-surface-base border border-rule rounded-lg font-mono text-meta text-success whitespace-pre-wrap break-words">{entry.formula}</code>
              <p className="text-meta text-ink-secondary">{entry.note}</p>
              {entry.excel && <p className="mt-1.5 text-meta text-ink-secondary"><span className="font-semibold text-ink-primary">In Excel: </span>{entry.excel}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
