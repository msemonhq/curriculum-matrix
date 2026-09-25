import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import curriculumData from '../data/curriculumData.json';
const { phases } = curriculumData;
import { useProgressStore } from '../hooks/useProgressStore';
import {
  ChevronDown, BookOpen, Clock, Target, FileCheck,
  Circle, CheckCircle2, PlayCircle, TestTube, Search, Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';

const STATUS_CYCLE: Record<string, string> = {
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

function ModuleCheckmark({ isChecked, onClick }: { isChecked: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.8 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`relative w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 focus:outline-none ${
        isChecked
          ? 'bg-accent/20 border border-accent shadow-glow-sm'
          : 'bg-surface-base border border-line/70 hover:border-line'
      }`}
      aria-label={isChecked ? 'Mark module incomplete' : 'Mark module complete'}
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
        <motion.path
          d="M3.5 8.5L6.5 11.5L12.5 5"
          stroke={isChecked ? '#00c4db' : 'transparent'}
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
        <motion.div
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute inset-0 rounded-md bg-accent/40 pointer-events-none"
        />
      )}
    </motion.button>
  );
}

export default function CurriculumScreen() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    phaseStatus, deliverables, timeTracking, notes, workbench,
    completedModules, toggleModule,
    setPhaseStatus, toggleDeliverable, setPhaseTime, setPhaseNote,
  } = useProgressStore();

  const statusFilters = [
    { value: 'all',         label: 'All' },
    { value: 'not_started', label: 'To Do' },
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

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'completed':  return <CheckCircle2 className="text-success w-6 h-6" />;
      case 'in_progress': return <PlayCircle className="text-accent w-6 h-6" />;
      default:            return <Circle className="text-ink-tertiary w-6 h-6" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky search + filter bar */}
      <div className="px-4 pt-3 pb-3 space-y-3 bg-surface-base/80 backdrop-blur-md sticky top-0 z-10 border-b border-line/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
          <input
            type="text"
            placeholder="Search phases or JD lines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-surface-subtle border border-line rounded-xl text-body text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-line-focus focus:ring-2 focus:ring-accent/20 transition-all"
          />
        </div>

        {/* Segmented filter pills */}
        <div className="flex gap-2">
          {statusFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`flex-1 py-1.5 rounded-xl text-caption font-semibold transition-all duration-200 ${
                statusFilter === f.value
                  ? 'bg-accent text-surface-base shadow-glow-sm'
                  : 'bg-surface-subtle text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-28">
        {filteredPhases.length === 0 && (
          <div className="mt-8">
            <EmptyState title="No phases found" description="Try adjusting your search or filters." />
          </div>
        )}

        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-3">
          {filteredPhases.map((phase) => {
            const isExpanded    = expandedId === phase.id;
            const status        = phaseStatus[phase.id] || 'not_started';
            const deliverableDone = deliverables[phase.id] || false;
            const toolId        = phase.workbenchId;
            const timeLogged    = timeTracking[phase.id] || 0;
            const note          = notes[phase.id] || '';
            const timePercent   = phase.hoursMax > 0 ? Math.min((timeLogged / phase.hoursMax) * 100, 100) : 0;

            return (
              <motion.div key={phase.id} variants={staggerItem}>
                {/* Phase card */}
                <div className="bg-surface-elevated border border-line rounded-2xl overflow-hidden shadow-surface">

                  {/* Phase header row */}
                  <div
                    className="p-4 flex items-center gap-3 cursor-pointer active:bg-surface-subtle transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : phase.id)}
                  >
                    {/* Status icon â€” tap to cycle */}
                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhaseStatus(phase.id, STATUS_CYCLE[status] || 'not_started');
                      }}
                    >
                      {getStatusIcon(status)}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      {/* Phase number badge */}
                      <Badge variant="phase" className="mb-1">
                        Phase {String(phase.number).padStart(2, '0')}
                      </Badge>
                      <h3 className="text-title text-ink-primary leading-tight truncate">{phase.title}</h3>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 mt-1.5 text-caption text-ink-tertiary">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {phase.hoursMin === phase.hoursMax ? `~${phase.hoursMin}h` : `~${phase.hoursMin}â€“${phase.hoursMax}h`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {phase.jdLinesServed.join(', ')}
                        </span>
                      </div>

                      {/* Inline time progress bar */}
                      {timeLogged > 0 && (
                        <div className="mt-2">
                          <ProgressBar progress={timePercent} height="thin" />
                        </div>
                      )}
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="text-ink-tertiary w-4 h-4" />
                    </motion.div>
                  </div>

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
                        <div className="px-4 pb-4 pt-1 border-t border-line bg-surface-subtle/50 space-y-4">

                          {/* Target Course */}
                          <div className="mt-3 bg-surface-overlay rounded-xl p-3 border border-line/60">
                            <h4 className="flex items-center gap-2 text-caption text-ink-secondary font-semibold uppercase tracking-wider mb-2">
                              <BookOpen className="w-3.5 h-3.5 text-accent" />
                              Target Course
                            </h4>
                            <p className="text-body text-ink-primary">{phase.course}</p>
                            <motion.ul
                              variants={staggerContainer}
                              initial="hidden"
                              animate="show"
                              className="mt-2 space-y-1.5"
                            >
                              {phase.modules.map((mod, i) => {
                                const isChecked = completedModules[`${phase.id}_${i}`] ?? (status === 'completed');
                                return (
                                  <motion.li
                                    key={i}
                                    variants={staggerItem}
                                    onClick={() => toggleModule(phase.id, i)}
                                    className={`cursor-pointer text-caption px-3 py-2 rounded-xl flex items-start gap-2.5 transition-all duration-200 border ${
                                      isChecked
                                        ? 'bg-accent-dim/30 border-accent/30 text-ink-primary'
                                        : 'bg-surface-subtle border-line/50 text-ink-secondary hover:border-line'
                                    }`}
                                  >
                                    <ModuleCheckmark
                                      isChecked={isChecked}
                                      onClick={() => toggleModule(phase.id, i)}
                                    />
                                    <span className={`flex-1 leading-relaxed ${isChecked ? 'text-ink-primary font-medium' : ''}`}>
                                      {mod}
                                    </span>
                                  </motion.li>
                                );
                              })}
                            </motion.ul>
                          </div>

                          {/* Strategic Application */}
                          <div>
                            <h4 className="text-caption text-ink-secondary font-semibold uppercase tracking-wider mb-2">
                              Strategic Application
                            </h4>
                            <p className="text-body text-ink-primary bg-accent-dim border border-accent/20 p-3 rounded-xl">
                              {phase.application}
                            </p>
                          </div>

                          {/* Hours + Notes */}
                          <div className="space-y-3">
                            <div className="bg-surface-elevated border border-line rounded-xl p-3">
                              <label className="block text-caption text-ink-secondary font-semibold mb-1.5">
                                Hours Logged
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={timeLogged || ''}
                                onChange={(e) => setPhaseTime(phase.id, parseFloat(e.target.value) || 0)}
                                placeholder={`Est: ${phase.hoursMin}h`}
                                className="w-full bg-surface-subtle border border-line rounded-lg px-3 py-2 text-body text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-line-focus focus:ring-2 focus:ring-accent/20 transition-all tabular"
                              />
                            </div>

                            <div className="bg-surface-elevated border border-line rounded-xl p-3">
                              <label className="block text-caption text-ink-secondary font-semibold mb-1.5">
                                Notes / Blockers
                              </label>
                              <textarea
                                rows={2}
                                value={note}
                                onChange={(e) => setPhaseNote(phase.id, e.target.value)}
                                placeholder="Add notes..."
                                className="w-full bg-surface-subtle border border-line rounded-lg px-3 py-2 text-body text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-line-focus focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                              />
                            </div>
                          </div>

                          {/* Remind Me */}
                          <Button
                            variant="ghost"
                            fullWidth
                            className="gap-2 text-caption"
                            onClick={async () => {
                              try {
                                let targetDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
                                let alertMsg   = 'Reminder set for 24 hours from now.';
                                const demandEvents = workbench['5']?.events || [];
                                if (demandEvents.length > 0) {
                                  const now         = new Date();
                                  const currentYear = now.getFullYear();
                                  const validEvents = demandEvents
                                    .flatMap((e: any) => {
                                      const dThisYear = new Date(`${e.date} ${currentYear}`);
                                      const dNextYear = new Date(`${e.date} ${currentYear + 1}`);
                                      const options = [];
                                      if (!isNaN(dThisYear.getTime()) && dThisYear.getTime() > now.getTime()) options.push({ ...e, parsed: dThisYear });
                                      if (!isNaN(dNextYear.getTime()) && dNextYear.getTime() > now.getTime()) options.push({ ...e, parsed: dNextYear });
                                      return options;
                                    })
                                    .sort((a: any, b: any) => a.parsed.getTime() - b.parsed.getTime());
                                  if (validEvents.length > 0) {
                                    targetDate = validEvents[0].parsed;
                                    alertMsg   = `Reminder set for ${validEvents[0].title} on ${validEvents[0].date}.`;
                                  }
                                }
                                const { LocalNotifications } = await import('@capacitor/local-notifications');
                                await LocalNotifications.requestPermissions();
                                await LocalNotifications.schedule({
                                  notifications: [{
                                    title: 'Curriculum Reminder',
                                    body:  `Time to get back to ${phase.title}!`,
                                    id:    Math.floor(Math.random() * 1000000),
                                    schedule: { at: targetDate },
                                  }],
                                });
                                alert(alertMsg);
                              } catch {
                                alert('Notifications not supported in browser context.');
                              }
                            }}
                          >
                            <Bell className="w-3.5 h-3.5" />
                            Remind Me
                          </Button>

                          {/* Deliverable toggle */}
                          <div
                            className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                              deliverableDone
                                ? 'bg-success-dim border-success/30'
                                : 'bg-surface-elevated border-line hover:border-line/80'
                            }`}
                            onClick={() => toggleDeliverable(phase.id)}
                          >
                            <div className="flex items-start gap-3">
                              <motion.div
                                animate={{ scale: deliverableDone ? [1, 1.25, 1] : 1 }}
                                transition={{ duration: 0.3 }}
                                className="mt-0.5"
                              >
                                {deliverableDone
                                  ? <CheckCircle2 className="w-5 h-5 text-success" />
                                  : <FileCheck className="w-5 h-5 text-ink-tertiary" />
                                }
                              </motion.div>
                              <div>
                                <h4 className={`text-body font-semibold ${deliverableDone ? 'text-success' : 'text-ink-primary'}`}>
                                  Proof-of-Skill Deliverable
                                </h4>
                                <p className={`text-caption mt-0.5 ${deliverableDone ? 'text-success/80' : 'text-ink-secondary'}`}>
                                  {phase.deliverable}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Open Workbench */}
                          {toolId && (
                            <Button
                              variant="outline"
                              fullWidth
                              onClick={() => navigate(`/workbenches/${toolId}`)}
                              className="gap-2"
                            >
                              <TestTube className="w-4 h-4" />
                              Open Workbench
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
