import { ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { phases } from '../data/curriculum';
import { useProgressStore } from '../hooks/useProgressStore';
import { upNextPhase } from '../lib/progress';
import { toolSummary } from '../lib/workbenchSummary';
import { Button } from '../components/Button';
import { Panel } from '../components/Panel';
import { TOOLS } from './registry';

/**
 * The workbenches as a contents list: the numeral is the phase, then the tool and one line, which is what
 * the tool holds once you have entered something and what it is for until then. Above it, the tool of the
 * phase you are on, lifted into a panel. Only this list watches the saved data, so typing inside a tool
 * never re-renders it.
 */
export function ToolList() {
  const navigate = useNavigate();
  const saved = useProgressStore((state) => state.workbench);
  const phaseStatus = useProgressStore((state) => state.phaseStatus);
  const activePhaseId = useProgressStore((state) => state.activePhaseId);
  const now = new Date();

  const current = upNextPhase(phases, activePhaseId, phaseStatus);
  const featured = current ? TOOLS.find((tool) => tool.id === current.workbenchId) : undefined;
  const finished = new Set(phases.filter((p) => phaseStatus[p.id] === 'completed' && p.workbenchId).map((p) => p.workbenchId));

  return (
    <>
      {current && featured && (
        <Panel padding="large" className="mb-8">
          <p className="text-kicker text-ink-secondary">Up next · Phase {current.number}</p>
          <h3 className="mt-1 text-title text-ink-primary">{featured.title}</h3>
          <p className="mt-1 text-meta text-ink-secondary">{toolSummary(featured.id, saved[featured.id], now) ?? featured.description}</p>
          <Button fullWidth onClick={() => navigate(`/workbenches/${featured.id}`)} className="mt-6">
            Open<span className="sr-only"> {featured.title}</span> <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </Panel>
      )}

      {current && featured && <h3 className="mb-2 text-kicker text-ink-secondary">All workbenches</h3>}
      <ol className="border-b border-rule">
        {TOOLS.map((tool) => {
          const summary = toolSummary(tool.id, saved[tool.id], now);
          return (
            <li key={tool.id} className="border-t border-rule">
              <button
                type="button"
                onClick={() => navigate(`/workbenches/${tool.id}`)}
                className="flex min-h-11 w-full items-start gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/70"
              >
                {/* The numeral is the phase number; screen readers hear it as "Phase 1". */}
                <span className="w-6 shrink-0 text-title tabular text-ink-tertiary"><span className="sr-only">Phase </span>{tool.id}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-body font-semibold ${finished.has(tool.id) ? 'text-ink-secondary' : 'text-ink-primary'}`}>{tool.title}</span>
                  <span className="mt-0.5 block break-words text-meta text-ink-secondary">{summary ?? tool.blurb}</span>
                </span>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-tertiary" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}
