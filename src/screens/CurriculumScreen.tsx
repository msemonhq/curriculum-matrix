import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { phases } from '../data/curriculum';
import { useProgressStore } from '../hooks/useProgressStore';
import { useProgress } from '../hooks/useProgress';
import { isModuleChecked, phaseRowLine, upNextPhase } from '../lib/progress';
import type { MarkState } from '../lib/progress';
import type { PhaseStatus } from '../types';
import {
  ChevronDown, FileCheck,
  CheckCircle2, TestTube, Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '../components/EmptyState';
import { Panel } from '../components/Panel';
import { StatusMark } from '../components/StatusMark';
import { HoursStrip } from '../components/HoursStrip';
import { Button } from '../components/Button';
import { ReminderControl } from '../components/ReminderControl';

const STATUS_CYCLE: Record<PhaseStatus, PhaseStatus> = {
  not_started: 'in_progress',
  in_progress:  'completed',
  completed:    'not_started',
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

/** Visual only: the surrounding button carries the checkbox role and state. */
function CheckMark({ isChecked }: { isChecked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${
        isChecked
          ? 'bg-accent/20 border border-accent'
          : 'bg-surface-base border border-edge'
      }`}
    >
      <svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 16 16" fill="none">
        <motion.path
          d="M3.5 8.5L6.5 11.5L12.5 5"
          stroke={isChecked ? 'currentColor' : 'transparent'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            pathLength: isChecked ? 1 : 0,
            opacity: isChecked ? 1 : 0,
          }}
          transition={{
            pathLength: { type: 'spring', stiffness: 450, damping: 28 },
            opacity: { duration: 0.15 },
          }}
        />
      </svg>
      {isChecked && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute inset-0 rounded-md bg-accent/40 pointer-events-none"
        />
      )}
    </span>
  );
}

/** The Roadmap's status values on the shared mark's three states. */
const MARK_STATE: Record<PhaseStatus, MarkState> = {
  not_started: 'todo',
  in_progress: 'active',
  completed: 'done',
};

const STATUS_LABEL: Record<PhaseStatus, string> = {
  not_started: 'not started',
  in_progress: 'in progress',
  completed: 'completed',
};

/** Scrolls a phase row into view (below the pinned filter bar) and moves focus to its heading button. */
function scrollToPhase(id: string) {
  const row = document.getElementById(`phase-${id}`);
  if (!row) return;
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  row.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  row.querySelector<HTMLElement>('h3 button')?.focus({ preventScroll: true });
}

export default function CurriculumScreen() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    activePhaseId, phaseStatus, deliverables, timeTracking, notes,
    completedModules, toggleModule,
    setPhaseStatus, toggleDeliverable, setPhaseTime, setPhaseNote,
  } = useProgressStore();
  const { byPhase } = useProgress();

  const statusFilters = [
    { value: 'all',         label: 'All' },
    { value: 'not_started', label: 'To do' },
    { value: 'in_progress', label: 'Active' },
    { value: 'completed',   label: 'Done' },
  ];

  const filteredPhases = useMemo(() => {
    return phases.filter(phase => {
      const matchesSearch =
        phase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phase.jdLinesServed.some(jd => jd.toLowerCase().includes(searchQuery.toLowerCase()));
      const status = phaseStatus[phase.id] || 'not_started';
      const matchesFilter = statusFilter === 'all' || status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, statusFilter, phaseStatus]);

  // A tap on the strip names a phase the current search or filter may be hiding: show everything, then scroll.
  const pendingScroll = useRef<string | null>(null);
  const goToPhase = (id: string) => {
    if (filteredPhases.some(phase => phase.id === id)) {
      scrollToPhase(id);
      return;
    }
    pendingScroll.current = id;
    setSearchQuery('');
    setStatusFilter('all');
  };
  useEffect(() => {
    const id = pendingScroll.current;
    if (id && filteredPhases.some(phase => phase.id === id)) {
      pendingScroll.current = null;
      scrollToPhase(id);
    }
  }, [filteredPhases]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-display text-ink-primary">Roadmap</h2>
        <HoursStrip
          className="mt-4"
          phases={phases}
          phaseStatus={phaseStatus}
          completedModules={completedModules}
          activePhaseId={upNextPhase(phases, activePhaseId, phaseStatus)?.id ?? null}
          timeTracking={timeTracking}
          onSelect={goToPhase}
        />
      </div>

      {/* Search and filters stay pinned once the title has scrolled away */}
      <div className="px-4 pt-3 pb-3 space-y-3 bg-surface-base/80 backdrop-blur-md sticky top-0 z-10 border-y border-rule">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
          <input
            type="text"
            placeholder="Search phases or JD lines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-11 w-full pl-9 pr-3 py-2.5 bg-surface-subtle border border-edge rounded-xl text-body text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
          />
        </div>

        {/* Segmented filter pills */}
        <div className="flex gap-2">
          {statusFilters.map(f => (
            <button
              key={f.value}
              type="button"
              aria-pressed={statusFilter === f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`flex-1 min-h-11 py-1.5 rounded-xl text-meta font-semibold transition-all duration-200 ${
                statusFilter === f.value
                  ? 'border border-accent bg-accent text-surface-base'
                  : 'border border-edge bg-surface-subtle text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase list */}
      <div className="p-4 space-y-3 pb-28">
        {filteredPhases.length === 0 && (
          <EmptyState
            title="No phases match"
            description="Try a different search, or show every phase."
            action={
              <Button variant="secondary" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                Show all phases
              </Button>
            }
          />
        )}

        <motion.ol variants={staggerContainer} initial="hidden" animate="show">
          {filteredPhases.map((phase, index) => {
            const isExpanded    = expandedId === phase.id;
            const status        = phaseStatus[phase.id] || 'not_started';
            const deliverableDone = deliverables[phase.id] || false;
            const toolId        = phase.workbenchId;
            const timeLogged    = timeTracking[phase.id] || 0;
            const note          = notes[phase.id] || '';
            const moduleProgress = byPhase[phase.id];
            const above         = index > 0 ? filteredPhases[index - 1] : null;
            const rowLine       = phaseRowLine(status, {
              done: moduleProgress.done,
              total: moduleProgress.total,
              started: status === 'in_progress' || moduleProgress.done > 0,
              trackedHours: timeLogged,
              hoursMin: phase.hoursMin,
              hoursMax: phase.hoursMax,
            });

            return (
              <motion.li key={phase.id} id={`phase-${phase.id}`} variants={staggerItem} className="relative flex scroll-mt-40">
                {/* The spine: a hairline through the nodes, Signal below a finished phase. Drawn before the node so the node sits on top. */}
                {above && <span aria-hidden="true" className={`absolute left-6 top-0 h-[22px] w-px ${phaseStatus[above.id] === 'completed' ? 'bg-accent' : 'bg-rule'}`} />}
                {index < filteredPhases.length - 1 && <span aria-hidden="true" className={`absolute bottom-0 left-6 top-[22px] w-px ${status === 'completed' ? 'bg-accent' : 'bg-rule'}`} />}

                <div className="relative flex w-12 shrink-0 items-start justify-center">
                  {/* Status: a real button so it can be focused and is announced with its state */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    aria-label={`Phase ${phase.number} status: ${STATUS_LABEL[status]}, tap to change`}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                    onClick={() => setPhaseStatus(phase.id, STATUS_CYCLE[status] || 'not_started')}
                  >
                    <StatusMark state={MARK_STATE[status]} />
                  </motion.button>
                </div>

                <div className="min-w-0 flex-1 pb-6">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedId(isExpanded ? null : phase.id)}
                      className="flex min-h-11 w-full items-start gap-3 rounded-xl py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-title leading-tight text-ink-primary">
                          <span className="text-ink-secondary">Phase {phase.number}</span> {phase.title}
                        </span>
                        <span className="mt-1 block text-meta text-ink-secondary">{rowLine}</span>
                        <span className="mt-0.5 block text-meta text-ink-tertiary">Serves <span className="font-mono">{phase.jdLinesServed.join(', ')}</span></span>
                      </span>
                      <motion.span className="mt-1.5 flex shrink-0" animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-4 w-4 text-ink-tertiary" aria-hidden="true" />
                      </motion.span>
                    </button>
                  </h3>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                      >
                        <Panel padding="none" className="mt-1 divide-y divide-rule">

                          {/* Target course and its modules */}
                          <div className="p-4">
                            <h4 className="text-kicker text-ink-secondary">Target course</h4>
                            <p className="mt-1 text-body text-ink-primary">{phase.course}</p>
                            <motion.ul
                              variants={staggerContainer}
                              initial="hidden"
                              animate="show"
                              className="mt-2"
                            >
                              {phase.modules.map((mod) => {
                                if (mod.kind === 'note') {
                                  return (
                                    <motion.li
                                      key={mod.id}
                                      variants={staggerItem}
                                      className="border-t border-rule py-2.5 text-meta text-ink-tertiary"
                                    >
                                      <span className="block">{mod.title}</span>
                                      {mod.description && <span className="block mt-0.5">{mod.description}</span>}
                                    </motion.li>
                                  );
                                }
                                const isChecked = isModuleChecked({ phaseStatus, completedModules }, phase.id, mod.id);
                                return (
                                  <motion.li key={mod.id} variants={staggerItem} className="border-t border-rule">
                                    <button
                                      type="button"
                                      role="checkbox"
                                      aria-checked={isChecked}
                                      onClick={() => toggleModule(phase.id, mod.id)}
                                      className={`w-full min-h-11 text-left text-meta py-2.5 flex items-start gap-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/70 ${
                                        isChecked ? 'text-ink-primary' : 'text-ink-secondary'
                                      }`}
                                    >
                                      <CheckMark isChecked={isChecked} />
                                      <span className="flex-1 leading-relaxed">
                                        <span className="block">{mod.title}</span>
                                        {mod.kind === 'optional' && <span className="block text-kicker text-ink-tertiary mt-0.5">Optional (not counted in progress)</span>}
                                        {mod.description && <span className="block text-ink-tertiary mt-0.5">{mod.description}</span>}
                                      </span>
                                    </button>
                                  </motion.li>
                                );
                              })}
                            </motion.ul>
                          </div>

                          {/* Strategic application: plain text, no tinted box */}
                          <div className="p-4">
                            <h4 className="text-kicker text-ink-secondary">Strategic application</h4>
                            <p className="mt-1 text-body text-ink-primary">{phase.application}</p>
                          </div>

                          {/* Hours and notes: the things you type */}
                          <div className="p-4 space-y-4">
                            <div>
                              <label htmlFor={`hours-${phase.id}`} className="block text-meta text-ink-secondary font-semibold mb-1.5">
                                Hours logged
                              </label>
                              <input
                                id={`hours-${phase.id}`}
                                type="number"
                                min="0"
                                value={timeLogged || ''}
                                onChange={(e) => setPhaseTime(phase.id, parseFloat(e.target.value) || 0)}
                                placeholder={`Est: ${phase.hoursMin}h`}
                                className="min-h-11 w-full bg-surface-subtle border border-edge rounded-lg px-3 py-2 text-body text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all tabular"
                              />
                            </div>

                            <div>
                              <label htmlFor={`notes-${phase.id}`} className="block text-meta text-ink-secondary font-semibold mb-1.5">
                                Notes and blockers
                              </label>
                              <textarea
                                id={`notes-${phase.id}`}
                                rows={2}
                                value={note}
                                onChange={(e) => setPhaseNote(phase.id, e.target.value)}
                                placeholder="Add notes..."
                                className="w-full bg-surface-subtle border border-edge rounded-lg px-3 py-2 text-body text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                              />
                            </div>
                          </div>

                          {/* Reminder */}
                          <ReminderControl phaseId={phase.id} phaseTitle={phase.title} />

                          {/* Deliverable: a real toggle, so keyboards and screen readers can reach it */}
                          <button
                            type="button"
                            aria-pressed={deliverableDone}
                            onClick={() => toggleDeliverable(phase.id)}
                            className="flex w-full min-h-11 items-start gap-3 p-4 text-left transition-colors active:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/70"
                          >
                            <motion.span
                              animate={{ scale: deliverableDone ? [1, 1.25, 1] : 1 }}
                              transition={{ duration: 0.3 }}
                              className="mt-0.5 flex"
                            >
                              {deliverableDone
                                ? <CheckCircle2 className="w-5 h-5 text-success" aria-hidden="true" />
                                : <FileCheck className="w-5 h-5 text-ink-tertiary" aria-hidden="true" />
                              }
                            </motion.span>
                            <span>
                              <span className={`block text-body font-semibold ${deliverableDone ? 'text-success' : 'text-ink-primary'}`}>
                                Proof-of-skill deliverable
                              </span>
                              <span className="mt-0.5 block text-meta text-ink-secondary">
                                {phase.deliverable}
                              </span>
                            </span>
                          </button>

                          {/* Open workbench */}
                          {toolId && (
                            <div className="p-4">
                              <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => navigate(`/workbenches/${toolId}`)}
                                className="gap-2"
                              >
                                <TestTube className="w-4 h-4" aria-hidden="true" />
                                Open workbench
                              </Button>
                            </div>
                          )}
                        </Panel>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
      </div>
    </div>
  );
}
