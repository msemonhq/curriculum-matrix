import React, { useMemo } from 'react';
import curriculumData from '../data/curriculumData.json';
const { jdLines, phases } = curriculumData;
import { Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Hand-rolled SVG Donut Chart — zero deps
function DonutChart({
  covered,
  total,
}: {
  covered: number;
  total: number;
}) {
  const RADIUS      = 44;
  const STROKE      = 8;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const percent     = total > 0 ? covered / total : 0;
  const pct         = Math.round(percent * 100);

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Track */}
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="transparent"
          stroke="#27272a"
          strokeWidth={STROKE}
        />
        {/* Glow layer */}
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="transparent"
          stroke="#00c4db"
          strokeWidth={STROKE}
          opacity={0.15}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={0}
        />
        {/* Filled arc */}
        <motion.circle
          cx="50" cy="50" r={RADIUS}
          fill="transparent"
          stroke={pct < 100 ? '#f87171' : '#22c55e'}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: CIRCUMFERENCE - CIRCUMFERENCE * percent }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ filter: pct < 100 ? 'drop-shadow(0 0 6px rgba(248,113,113,0.5))' : 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' }}
        />
      </svg>

      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-ink-primary tabular leading-none">{pct}%</span>
        <span className="text-micro text-ink-tertiary uppercase tracking-wider mt-0.5">covered</span>
      </div>
    </div>
  );
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};
const staggerItem = {
  hidden: { opacity: 0, x: -8 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

export default function AuditMatrixScreen() {
  const servedIds = useMemo(
    () => new Set(phases.flatMap(p => p.jdLinesServed)),
    []
  );
  const coveredCount = jdLines.filter(line => servedIds.has(line.id)).length;
  const hasGaps      = coveredCount < jdLines.length;

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header with donut */}
      <div className="px-4 pt-4 pb-4 bg-surface-base/80 backdrop-blur-md sticky top-0 z-10 border-b border-line/50">
        <div className="flex items-center gap-5">
          <DonutChart covered={coveredCount} total={jdLines.length} />

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              <span className="text-caption text-ink-secondary font-semibold uppercase tracking-wider">
                JD Coverage
              </span>
            </div>
            <span className={`text-heading font-black tabular ${hasGaps ? 'text-danger' : 'text-success'}`}>
              {coveredCount}
              <span className="text-ink-tertiary font-normal"> / {jdLines.length}</span>
            </span>
            <span className="text-caption text-ink-secondary">
              {hasGaps
                ? `${jdLines.length - coveredCount} gap${jdLines.length - coveredCount > 1 ? 's' : ''} detected`
                : 'Full coverage ✓'}
            </span>
          </div>
        </div>

        {/* Gap alert banner — sticky */}
        {hasGaps && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-danger-dim border border-danger/25 rounded-xl p-3 flex items-start gap-3"
          >
            <AlertTriangle className="text-danger w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="text-caption font-semibold text-danger">Coverage Gap Detected</p>
              <p className="text-caption text-ink-secondary mt-0.5">
                Your roadmap doesn't cover all JD requirements. Review gaps below.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* JD Lines list */}
      <div className="flex-1 overflow-y-auto p-4 pb-28">
        <h3 className="text-caption text-ink-secondary uppercase tracking-wider font-semibold mb-3">
          Job Description Lines
        </h3>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {jdLines.map(line => {
            const servingPhases = phases.filter(p => p.jdLinesServed.includes(line.id));
            const isUnserved    = servingPhases.length === 0;

            return (
              <motion.div
                key={line.id}
                variants={staggerItem}
                className={`rounded-xl border overflow-hidden transition-colors ${
                  isUnserved
                    ? 'bg-danger-dim border-danger/25'
                    : 'bg-surface-elevated border-line'
                }`}
              >
                <div className="p-3 flex gap-3 items-start">
                  {/* Status icon */}
                  <div className="mt-0.5 shrink-0">
                    {isUnserved
                      ? <AlertTriangle className="w-4 h-4 text-danger" />
                      : <CheckCircle2 className="w-4 h-4 text-success" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* ID pill */}
                      <span className={`font-mono text-micro px-2 py-0.5 rounded-md font-bold ${
                        isUnserved
                          ? 'bg-danger/15 text-danger'
                          : 'bg-accent-dim text-accent'
                      }`}>
                        {line.id}
                      </span>
                      {isUnserved && (
                        <span className="text-micro font-bold text-danger uppercase tracking-wider">
                          GAP
                        </span>
                      )}
                    </div>

                    <p className={`text-body mt-1 leading-snug ${
                      isUnserved ? 'text-danger/90' : 'text-ink-primary'
                    }`}>
                      {line.text}
                    </p>

                    {/* Serving phases */}
                    {servingPhases.length > 0 && (
                      <p className="text-caption text-accent mt-1.5 font-medium">
                        ↳ Served by: {servingPhases.map(p => `Phase ${p.number}`).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
