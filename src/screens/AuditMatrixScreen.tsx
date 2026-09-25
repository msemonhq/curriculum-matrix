import React, { useMemo } from 'react';
import curriculumData from '../data/curriculumData.json';
const { jdLines, phases } = curriculumData;
import { Target, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function DonutChart({ covered, total }: { covered: number; total: number }) {
  const radius = 44;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const percent = total > 0 ? covered / total : 0;
  const pct = Math.round(percent * 100);

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`${pct}% of job description requirements covered`}>
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="currentColor" className="text-surface-subtle" strokeWidth={stroke} />
        <motion.circle cx="50" cy="50" r={radius} fill="transparent" stroke={pct < 100 ? 'currentColor' : 'currentColor'} className={pct < 100 ? 'text-danger' : 'text-success'} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference - circumference * percent }} transition={{ duration: 0.9 }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-ink-primary tabular leading-none">{pct}%</span>
        <span className="text-micro text-ink-tertiary uppercase tracking-wider mt-0.5">covered</span>
      </div>
    </div>
  );
}

export default function AuditMatrixScreen() {
  const navigate = useNavigate();
  const servedIds = useMemo(() => new Set(phases.flatMap(p => p.jdLinesServed)), []);
  const coveredCount = jdLines.filter(line => servedIds.has(line.id)).length;
  const gaps = jdLines.filter(line => !servedIds.has(line.id));
  const hasGaps = gaps.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-4 bg-surface-base/95 sticky top-0 z-10 border-b border-line/50">
        <div className="flex items-center gap-5">
          <DonutChart covered={coveredCount} total={jdLines.length} />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2"><Target className="w-4 h-4 text-accent" aria-hidden="true" /><span className="text-caption text-ink-secondary font-semibold uppercase tracking-wider">JD coverage</span></div>
            <span className={`text-heading font-black tabular ${hasGaps ? 'text-danger' : 'text-success'}`}>{coveredCount}<span className="text-ink-tertiary font-normal"> / {jdLines.length}</span></span>
            <span className="text-caption text-ink-secondary">{hasGaps ? `${gaps.length} gap${gaps.length === 1 ? '' : 's'} detected` : 'Full coverage'}</span>
          </div>
        </div>
        {hasGaps && <div className="mt-3 bg-danger-dim border border-danger/25 rounded-xl p-3 flex items-start gap-3" role="status"><AlertTriangle className="text-danger w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /><div><p className="text-caption font-semibold text-danger">Coverage gap detected</p><p className="text-caption text-ink-secondary mt-0.5">Review the uncovered requirements below.</p></div></div>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-28">
        <h3 className="text-caption text-ink-secondary uppercase tracking-wider font-semibold mb-3">Job description lines</h3>
        <div className="space-y-2">
          {jdLines.map(line => {
            const servingPhases = phases.filter(p => p.jdLinesServed.includes(line.id));
            const isUnserved = servingPhases.length === 0;
            return <div key={line.id} className={`rounded-xl border overflow-hidden ${isUnserved ? 'bg-danger-dim border-danger/25' : 'bg-surface-elevated border-line'}`}>
              <div className="p-3 flex gap-3 items-start">
                {isUnserved ? <AlertTriangle className="w-4 h-4 text-danger mt-0.5 shrink-0" aria-label="Uncovered requirement" /> : <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" aria-label="Covered requirement" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><span className={`font-mono text-micro px-2 py-0.5 rounded-md font-bold ${isUnserved ? 'bg-danger/15 text-danger' : 'bg-accent-dim text-accent'}`}>{line.id}</span>{isUnserved && <span className="text-micro font-bold text-danger uppercase tracking-wider">Gap</span>}</div>
                  <p className={`text-body mt-1 leading-snug ${isUnserved ? 'text-danger/90' : 'text-ink-primary'}`}>{line.text}</p>
                  {servingPhases.length > 0 && <p className="text-caption text-accent mt-1.5 font-medium">Served by: {servingPhases.map(p => `Phase ${p.number}`).join(', ')}</p>}
                  {isUnserved && <button type="button" onClick={() => navigate('/curriculum')} className="mt-2 inline-flex min-h-11 items-center gap-1 text-caption font-semibold text-danger underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70">Review roadmap <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /></button>}
                </div>
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
