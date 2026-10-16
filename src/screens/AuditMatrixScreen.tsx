import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jdLines, phases } from '../data/curriculum';
import { useProgress } from '../hooks/useProgress';
import { readinessState } from '../lib/progress';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { StatusMark } from '../components/StatusMark';

// Coverage is a fact about how the curriculum was designed, so it gets one sentence. The thing the
// person can change is readiness, so that is what the list shows: a mark, a figure and a bar per line.
export default function AuditMatrixScreen() {
  const navigate = useNavigate();
  const { byJdLine } = useProgress();
  const servedIds = useMemo(() => new Set(phases.flatMap(p => p.jdLinesServed)), []);
  const gapCount = jdLines.filter(line => !servedIds.has(line.id)).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 pb-28">
        <h2 className="text-display text-ink-primary">Audit</h2>
        {gapCount > 0 ? (
          <p role="status" className="mt-1 text-body text-danger">
            {gapCount} of {jdLines.length} job-description lines {gapCount === 1 ? 'has' : 'have'} no phase.
          </p>
        ) : (
          <p className="mt-1 text-body text-ink-secondary">All {jdLines.length} job-description lines are covered by a phase.</p>
        )}

        <h3 className="mt-6 mb-3 text-kicker text-ink-secondary">Your readiness, by line</h3>
        <ol className="border-b border-rule">
          {jdLines.map(line => {
            const servingPhases = phases.filter(p => p.jdLinesServed.includes(line.id));
            const isUnserved = servingPhases.length === 0;
            const percent = byJdLine[line.id].percent;
            return (
              <li key={line.id} className="flex gap-3 border-t border-rule py-4">
                {isUnserved
                  ? <AlertTriangle className="h-6 w-6 shrink-0 p-0.5 text-danger" role="img" aria-label="Uncovered requirement" />
                  : <StatusMark state={readinessState(percent)} />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-meta text-ink-tertiary">{line.id}</span>
                    {isUnserved
                      ? <span className="text-meta font-semibold text-danger">Gap</span>
                      // The progress bar below says this to a screen reader, so the figure is not read twice.
                      : <span aria-hidden="true" className="text-title tabular text-ink-primary">{percent}%</span>}
                  </div>
                  <p className="mt-1 text-body text-ink-primary">{line.text}</p>
                  {isUnserved ? (
                    <>
                      <p className="mt-1 text-meta text-danger">No phase covers this line.</p>
                      <Button variant="secondary" className="mt-3" onClick={() => navigate('/curriculum')}>Review roadmap</Button>
                    </>
                  ) : (
                    <>
                      <p className="mt-1 text-meta text-ink-secondary">Served by {servingPhases.map(p => `Phase ${p.number}`).join(', ')}</p>
                      <div className="mt-3" role="progressbar" aria-label={`Readiness for ${line.id}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                        <ProgressBar progress={percent} />
                      </div>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
