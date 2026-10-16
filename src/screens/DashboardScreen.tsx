import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../hooks/useProgressStore';
import { phases } from '../data/curriculum';
import { CheckCircle2, Clock, Gauge, Settings, Upload, ArrowRight, Download, RotateCcw } from 'lucide-react';
import { Button } from '../components/Button';
import { CheckMark } from '../components/CheckMark';
import { HoursStrip } from '../components/HoursStrip';
import { ImportSheet } from '../components/ImportSheet';
import { TextInput } from '../components/TextInput';
import { IconButton } from '../components/IconButton';
import { Panel } from '../components/Panel';
import { Section } from '../components/Section';
import { Sheet } from '../components/Sheet';
import { useToast } from '../hooks/useToast';
import { buildBackup } from '../lib/sanitize';
import { cancelAllReminders } from '../services/reminders';
import { formatHours, isModuleChecked, nextModules, phaseSummary, upNextPhase } from '../lib/progress';
import { useProgress } from '../hooks/useProgress';

const NEXT_STEP_COUNT = 3;
const NO_IDS: ReadonlySet<string> = new Set();

function Figure({ value, unit, label, icon, divided }: { value: React.ReactNode; unit?: string; label: string; icon?: React.ReactNode; divided?: boolean }) {
  return (
    <div className={`min-w-0 ${divided ? 'border-l border-rule pl-3' : ''}`}>
      <div className="flex flex-wrap items-baseline gap-x-1">
        <span className="text-figure text-ink-primary tabular">{value}</span>
        {unit && <span className="whitespace-nowrap text-meta text-ink-tertiary">{unit}</span>}
      </div>
      <p className="mt-1 flex items-start gap-1.5 text-meta text-ink-secondary">
        {icon}
        <span>{label}</span>
      </p>
    </div>
  );
}

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { activePhaseId, phaseStatus, completedModules, deliverables, timeTracking, displayName, setDisplayName, resetProgress, toggleModule } = useProgressStore();
  const { showToast } = useToast();
  const { overall, byPhase } = useProgress();
  const [showImportSheet, setShowImportSheet] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showResetSheet, setShowResetSheet] = useState(false);
  // Rows ticked on this visit stay in the list (and can be unticked); the set belongs to one phase.
  const [ticked, setTicked] = useState<{ phaseId: string; ids: ReadonlySet<string> }>({ phaseId: '', ids: new Set() });

  // The greeting is the screen's one title; the header above only carries the app name.
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const name = displayName.trim();

  const completedDeliverables = Object.values(deliverables).filter(Boolean).length;
  const totalPhases = phases.length;
  // Weighted by each phase's hoursMax, so a 20-hour phase moves the strip more than a 2-hour one.
  const progressPercent = overall.percent;
  const nextPhase = upNextPhase(phases, activePhaseId, phaseStatus);
  // Whether the recommended phase is already under way decides what the card says and offers.
  const nextProgress = nextPhase ? byPhase[nextPhase.id] : undefined;
  const nextStarted = !!nextPhase && (phaseStatus[nextPhase.id] === 'in_progress' || (nextProgress?.done ?? 0) > 0);
  const totalHoursMin = phases.reduce((acc, p) => acc + p.hoursMin, 0);
  const totalHoursMax = phases.reduce((acc, p) => acc + p.hoursMax, 0);
  const hoursDisplay = formatHours(totalHoursMin, totalHoursMax);
  const totalLogged = Math.round(Object.values(timeTracking).reduce((sum, h) => sum + (h || 0), 0) * 10) / 10;

  const makeBackup = () => {
    const state = useProgressStore.getState();
    const hasData = Object.keys(state.phaseStatus).length + Object.keys(state.completedModules).length
      + Object.keys(state.deliverables).length + Object.keys(state.notes).length
      + Object.keys(state.timeTracking).length + Object.keys(state.workbench).length > 0;
    return hasData ? buildBackup(state, __APP_VERSION__) : null;
  };

  const handleExport = async () => {
    const data = makeBackup();
    if (!data) { showToast('There is no progress data to export yet.', 'danger'); return; }
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title: 'Curriculum Progress Backup', text: data, dialogTitle: 'Save Progress Backup' });
      showToast('Backup ready to share.', 'success');
    } catch {
      try { await navigator.clipboard.writeText(data); showToast('Backup copied to clipboard.', 'success'); }
      catch { showToast('Could not export the backup.', 'danger'); }
    }
  };

  const handleCopyBackup = async () => {
    const data = makeBackup();
    if (!data) { showToast('There is no progress data to copy yet.', 'danger'); return; }
    try { await navigator.clipboard.writeText(data); showToast('Backup copied to clipboard.', 'success'); }
    catch { showToast('Could not copy the backup.', 'danger'); }
  };

  const handleReset = () => {
    resetProgress();
    void cancelAllReminders();
    setShowResetSheet(false);
    setShowSettingsSheet(false);
    showToast('All progress has been reset.', 'success');
  };

  // The first few unticked modules of the up-next phase, plus any ticked since this screen opened.
  const kept = nextPhase && ticked.phaseId === nextPhase.id ? ticked.ids : NO_IDS;
  const steps = nextPhase ? nextModules(nextPhase, { phaseStatus, completedModules }, NEXT_STEP_COUNT, kept) : [];
  const tickStep = (phaseId: string, moduleId: string, wasChecked: boolean) => {
    if (!wasChecked) setTicked(prev => ({ phaseId, ids: new Set([...(prev.phaseId === phaseId ? prev.ids : []), moduleId]) }));
    toggleModule(phaseId, moduleId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-app-nav">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="break-words text-display text-ink-primary">{greeting}{name ? `, ${name}` : ''}</h2>
          <p className="mt-1 text-meta text-ink-secondary">{hoursDisplay} across {totalPhases} phases</p>
        </div>
        <IconButton className="-mr-3 shrink-0" label="Open settings" onClick={() => setShowSettingsSheet(true)}><Settings className="w-5 h-5" aria-hidden="true" /></IconButton>
      </div>

      <HoursStrip
        phases={phases}
        phaseStatus={phaseStatus}
        completedModules={completedModules}
        activePhaseId={nextPhase?.id ?? null}
        timeTracking={timeTracking}
      />

      {nextPhase ? (
        <Panel padding="large">
          <p className="text-kicker text-ink-secondary">Up next</p>
          <h3 className="mt-1 text-title text-ink-primary">
            <span className="text-ink-secondary">Phase {nextPhase.number}</span> {nextPhase.title}
          </h3>
          {nextProgress && (
            <p className="mt-1 text-meta text-ink-secondary">
              {phaseSummary({
                done: nextProgress.done,
                total: nextProgress.total,
                started: nextStarted,
                trackedHours: timeTracking[nextPhase.id] ?? 0,
                hoursMin: nextPhase.hoursMin,
                hoursMax: nextPhase.hoursMax,
              })}
            </p>
          )}
          <Button fullWidth onClick={() => navigate('/curriculum')} className="mt-6">
            {nextStarted ? 'Continue' : 'Start'} Phase {nextPhase.number} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </Panel>
      ) : (
        <Section padding="large">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-success" aria-hidden="true" />
            <div>
              <h3 className="text-title text-ink-primary">Curriculum complete</h3>
              <p className="text-meta text-ink-secondary">You have completed every phase.</p>
            </div>
          </div>
        </Section>
      )}

      {nextPhase && (
        <Section padding="none">
          <div className="flex items-baseline justify-between gap-3 py-3">
            <h3 className="text-body font-semibold text-ink-primary">Next steps</h3>
            <span className="text-meta text-ink-tertiary">Phase {nextPhase.number}</span>
          </div>
          {steps.length > 0 ? (
            <ul>
              {steps.map(mod => {
                const isChecked = isModuleChecked({ phaseStatus, completedModules }, nextPhase.id, mod.id);
                return (
                  <li key={mod.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => tickStep(nextPhase.id, mod.id, isChecked)}
                      className={`min-h-11 w-full flex items-start gap-3 border-t border-rule py-3 text-left text-meta leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/70 ${
                        isChecked ? 'text-ink-primary' : 'text-ink-secondary'
                      }`}
                    >
                      <CheckMark isChecked={isChecked} />
                      <span className="flex-1">{mod.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="border-t border-rule py-3 text-meta text-ink-secondary">
              Every module in Phase {nextPhase.number} is ticked. Mark the phase done on the Roadmap.
            </p>
          )}
        </Section>
      )}

      {/* Columns size to their content (not equal thirds), so 123.5 hours still fits beside the other two. */}
      <Section className="flex justify-between">
        <Figure
          value={`${progressPercent}%`}
          label="Overall"
          icon={<Gauge className="mt-px w-4 h-4 shrink-0 text-success" aria-hidden="true" />}
        />
        <Figure
          divided
          value={completedDeliverables}
          unit={`/ ${totalPhases}`}
          label="Deliverables"
          icon={<CheckCircle2 className="mt-px w-4 h-4 shrink-0 text-success" aria-hidden="true" />}
        />
        <Figure
          divided
          value={totalLogged}
          unit="h"
          label="Hours logged"
          icon={<Clock className="mt-px w-4 h-4 shrink-0 text-clock" aria-hidden="true" />}
        />
      </Section>

      <ImportSheet isOpen={showImportSheet} onClose={() => setShowImportSheet(false)} onImported={() => { setShowImportSheet(false); showToast('Progress imported successfully.', 'success'); }} />
      <Sheet isOpen={showSettingsSheet} onClose={() => setShowSettingsSheet(false)} title="Settings">
        <div className="space-y-3">
          <TextInput
            id="display-name"
            label="Your name (optional)"
            placeholder="Used in the greeting"
            value={displayName}
            maxLength={40}
            autoComplete="given-name"
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button variant="secondary" fullWidth onClick={handleExport}>
            <Download className="w-4 h-4" aria-hidden="true" /> Export backup
          </Button>
          <Button variant="secondary" fullWidth onClick={handleCopyBackup}>
            <Download className="w-4 h-4" aria-hidden="true" /> Copy backup to clipboard
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setShowSettingsSheet(false);
              setShowImportSheet(true);
            }}
          >
            <Upload className="w-4 h-4" aria-hidden="true" /> Import backup
          </Button>
          <div className="p-4 mt-4 bg-danger-dim border border-danger/25 rounded-xl">
            <h4 className="text-body font-semibold text-danger mb-1">Danger zone</h4>
            <p className="text-meta text-ink-secondary mb-3">
              Permanently deletes all progress, tracked hours, and workbench data.
            </p>
            <Button variant="danger" fullWidth onClick={() => setShowResetSheet(true)}>
              <RotateCcw className="w-4 h-4" aria-hidden="true" /> Reset all progress
            </Button>
          </div>
          <p className="pt-2 text-center text-meta text-ink-secondary">BSPR Curriculum v{__APP_VERSION__}</p>
        </div>
      </Sheet>
      <Sheet isOpen={showResetSheet} onClose={() => setShowResetSheet(false)} title="Reset all progress?">
        <div className="space-y-4">
          <p className="text-body text-ink-secondary">
            This permanently deletes your phases, deliverables, notes, hours, and workbench data. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="text" fullWidth onClick={() => setShowResetSheet(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleReset}>
              Reset everything
            </Button>
          </div>
        </div>
      </Sheet>
      </div>
    </div>
  );
}
