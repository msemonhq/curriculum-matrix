import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../hooks/useProgressStore';
import { toolHoldsData } from '../lib/workbenchData';
import { TOOLS } from './registry';

/**
 * The workbenches as a contents list: a numeral, the tool, one line on what it is for, and a Signal dot
 * when the tool already holds something the person entered. Only this list watches the saved data, so
 * typing inside a tool never re-renders it.
 */
export function ToolList() {
  const navigate = useNavigate();
  const saved = useProgressStore((state) => state.workbench);

  return (
    <ol className="border-b border-rule">
      {TOOLS.map((tool) => {
        const hasData = toolHoldsData(tool.id, saved[tool.id]);
        return (
          <li key={tool.id} className="border-t border-rule">
            <button
              type="button"
              onClick={() => navigate(`/workbenches/${tool.id}`)}
              className="flex min-h-11 w-full items-start gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/70"
            >
              {/* The numeral is the phase number; the line under the title says it in words, so it is not read twice. */}
              <span aria-hidden="true" className="w-6 shrink-0 text-title tabular text-ink-tertiary">{tool.id}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-body font-semibold text-ink-primary">{tool.title}</span>
                <span className="mt-0.5 block text-meta text-ink-secondary">
                  {tool.phase} · {tool.blurb}
                  {hasData && <span className="sr-only">, has saved data</span>}
                </span>
              </span>
              {hasData && <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />}
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-tertiary" aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ol>
  );
}
