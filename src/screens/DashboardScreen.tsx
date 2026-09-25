import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../hooks/useProgressStore';
import curriculumData from '../data/curriculumData.json';
const { phases } = curriculumData;
import { CheckCircle2, Zap, Clock, Settings, Upload, ChevronDown, ArrowRight, Download, RotateCcw } from 'lucide-react';
import { motion, animate, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { TextArea } from '../components/TextArea';
import { IconButton } from '../components/IconButton';
import { Card } from '../components/Card';
import { Sheet } from '../components/Sheet';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.0,
      ease: "linear",
      onUpdate: (latest) => setDisplay(Math.round(latest))
    });
    return () => controls.stop();
  }, [value]);
  return <span className="tabular">{display}{suffix}</span>;
}

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { phaseStatus, deliverables, timeTracking, importProgress, resetProgress } = useProgressStore();
  const { toast, showToast, dismissToast } = useToast();
  const [showImportSheet, setShowImportSheet] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showResetSheet, setShowResetSheet] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [winsExpanded, setWinsExpanded] = useState(false);

  const completedPhases = Object.values(phaseStatus).filter(s => s === 'completed').length;
  const completedDeliverables = Object.values(deliverables).filter(Boolean).length;
  const totalPhases = phases.length;
  const progressPercent = Math.round((completedPhases / totalPhases) * 100) || 0;
  const isComplete = progressPercent === 100;
  const nextPhase = phases.find(phase => (phaseStatus[phase.id] || 'not_started') !== 'completed');
  const totalHoursMin = phases.reduce((acc, p) => acc + p.hoursMin, 0);
  const totalHoursMax = phases.reduce((acc, p) => acc + p.hoursMax, 0);
  const hoursDisplay = totalHoursMin === totalHoursMax ? `~${totalHoursMin}` : `~${totalHoursMin}â€“${totalHoursMax}`;
  const totalLogged = Object.values(timeTracking).reduce((sum, h) => sum + (h || 0), 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const handleImport = () => {
    setImportError('');
    if (!importData.trim()) { setImportError('Paste a backup before importing.'); return; }
    try {
      const parsed = JSON.parse(importData);
      if (!parsed?.state || typeof parsed.state !== 'object') { setImportError('This does not look like a Curriculum Matrix backup.'); return; }
      importProgress(parsed.state);
      setShowImportSheet(false);
      setImportData('');
      showToast('Progress imported successfully.', 'success');
    } catch { setImportError('The backup is not valid JSON.'); }
  };

  const handleExport = async () => {
    const data = localStorage.getItem('bspr-curriculum-storage');
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

  const handleReset = () => {
    resetProgress();
    setShowResetSheet(false);
    setShowSettingsSheet(false);
    showToast('All progress has been reset.', 'success');
  };

  const priorityWins = [
    { text: 'Secure BSPR-lead sign-off on competitor set & category list', phase: 6 },
    { text: 'Connect real or demo GA4 / Meta view access', phase: 4 },
    { text: 'Verify Bangla-language keyword research tool', phase: 5 },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-app-nav">
      {toast && <Toast message={toast.message} tone={toast.tone} onClose={dismissToast} />}
      <div className="flex items-center justify-between">
        <div><p className="text-caption text-ink-secondary uppercase tracking-wider">Overview</p><h2 className="text-heading text-ink-primary">Your curriculum</h2></div>
        <IconButton label="Open settings" onClick={() => setShowSettingsSheet(true)}><Settings className="w-5 h-5" aria-hidden="true" /></IconButton>
      </div>

      {nextPhase ? <Card variant="glass" padding="large" className="border-accent/30"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center shrink-0"><ArrowRight className="w-5 h-5 text-accent" aria-hidden="true" /></div><div className="min-w-0 flex-1"><p className="text-micro text-accent uppercase tracking-wider">Next recommended step</p><h3 className="text-title text-ink-primary mt-1">Phase {nextPhase.number}: {nextPhase.title}</h3><p className="text-caption text-ink-secondary mt-1">Start this phase to keep your momentum.</p><Button fullWidth onClick={() => navigate('/curriculum')} className="mt-7">Open Phase <ArrowRight className="w-4 h-4" aria-hidden="true" /></Button></div></div></Card> : <Card variant="glass" padding="large" className="border-success/30"><div className="flex items-center gap-3"><CheckCircle2 className="w-8 h-8 text-success" aria-hidden="true" /><div><h3 className="text-title text-ink-primary">Curriculum complete</h3><p className="text-caption text-ink-secondary">You have completed every phase.</p></div></div></Card>}

      <Card padding="none" glow={isComplete} className="flex items-center justify-center py-8">
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 block" viewBox="0 0 100 100" role="img" aria-label={`${progressPercent}% of curriculum complete`}>
            <circle cx="50" cy="50" r={radius} fill="transparent" className="text-[#00D4FF]/[0.06]" stroke="currentColor" strokeWidth="7" />
            <motion.circle cx="50" cy="50" r={radius} fill="transparent" className="text-accent" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference - (circumference * progressPercent) / 100 }} transition={{ duration: 1.2 }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1.5 pt-1">
            <span className="text-[36px] font-extrabold text-white tabular leading-none">
              <AnimatedNumber value={progressPercent} suffix="%" />
            </span>
            <span className="text-[10px] font-bold text-accent tracking-[0.12em] uppercase">Phases Complete</span>
            <span className="text-[12px] font-normal text-[#727682]">{completedPhases} of {totalPhases} completed</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col gap-3">
          <div className="w-9 h-9 rounded-xl bg-success-dim flex items-center justify-center">
            <CheckCircle2 className="text-success w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-bold text-white tabular leading-none">{completedDeliverables}</span>
            <span className="text-[12px] font-normal text-[#8E929B]">/ {totalPhases}</span>
          </div>
          <span className="text-[13px] font-medium text-[#A0A5B1]">Deliverables done</span>
        </Card>
        <Card className="flex flex-col gap-3">
          <div className="w-9 h-9 rounded-xl bg-warning-dim flex items-center justify-center">
            <Clock className="text-warning w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-bold text-white tabular leading-none">{totalLogged}</span>
            <span className="text-[12px] font-normal text-[#8E929B]">/ {hoursDisplay}h</span>
          </div>
          <span className="text-[13px] font-medium text-[#A0A5B1]">Hours logged</span>
        </Card>
      </div>

      <div className="bg-warning-dim border border-warning/25 rounded-2xl overflow-hidden">
        <button type="button" aria-expanded={winsExpanded} className="min-h-11 w-full flex items-center gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 active:scale-[0.98] transition-transform duration-100" onClick={() => setWinsExpanded(v => !v)}>
          <div className="w-8 h-8 rounded-xl bg-warning/15 flex items-center justify-center shrink-0">
            <Zap className="text-warning w-4 h-4" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-body font-semibold text-ink-primary">Momentum Boosters</h3>
            <p className="text-caption text-warning/90">{priorityWins.length} quick ways to speed up your progress</p>
          </div>
          <motion.div animate={{ rotate: winsExpanded ? 180 : 0 }} transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}>
            <ChevronDown className="w-4 h-4 text-ink-tertiary" aria-hidden="true" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {winsExpanded && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { height: 0, opacity: 0, transition: { height: { duration: 0.3 }, opacity: { duration: 0.2 } } },
                visible: {
                  height: 'auto',
                  opacity: 1,
                  transition: {
                    height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                    opacity: { duration: 0.3, delay: 0.1 },
                    staggerChildren: 0.06
                  }
                }
              }}
              className="overflow-hidden"
            >
              <ul className="px-4 pb-4 space-y-2">
                {priorityWins.map(win => (
                  <motion.li
                    key={win.phase}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] } }
                    }}
                    className="flex"
                  >
                    <button type="button" className="w-full flex items-center justify-between text-left bg-surface-elevated/40 hover:bg-surface-elevated/60 p-3 rounded-lg border border-warning/10 active:scale-[0.98] transition-transform duration-100" onClick={() => navigate('/curriculum')}>
                      <div className="flex-1 pr-3">
                        <p className="text-caption text-ink-primary font-medium leading-snug">{win.text}</p>
                        <p className="text-micro text-warning/80 mt-1 uppercase tracking-wider">Phase {win.phase}</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-warning/15 flex items-center justify-center shrink-0">
                        <ArrowRight className="w-3.5 h-3.5 text-warning" aria-hidden="true" />
                      </div>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Button fullWidth onClick={() => navigate('/curriculum')} className="gap-2">Open Curriculum <ArrowRight className="w-4 h-4" aria-hidden="true" /></Button>

      <Sheet isOpen={showImportSheet} onClose={() => setShowImportSheet(false)} title="Import progress"><div className="space-y-4"><div className="flex items-center gap-2 text-caption text-ink-secondary"><Upload className="w-4 h-4" aria-hidden="true" />Paste your exported backup JSON below</div><TextArea rows={6} placeholder="Paste JSON here..." value={importData} onChange={e => { setImportData(e.target.value); setImportError(''); }} />{importError && <p role="alert" className="text-caption text-danger">{importError}</p>}<div className="flex gap-3"><Button variant="ghost" fullWidth onClick={() => setShowImportSheet(false)}>Cancel</Button><Button fullWidth onClick={handleImport}>Import</Button></div></div></Sheet>
      <Sheet isOpen={showSettingsSheet} onClose={() => setShowSettingsSheet(false)} title="Settings"><div className="space-y-3"><Button variant="secondary" fullWidth onClick={handleExport}><Download className="w-4 h-4" aria-hidden="true" /> Export backup</Button><Button variant="secondary" fullWidth onClick={() => { setShowSettingsSheet(false); setShowImportSheet(true); }}><Upload className="w-4 h-4" aria-hidden="true" /> Import backup</Button><div className="p-4 mt-4 bg-danger-dim border border-danger/25 rounded-xl"><h4 className="text-body font-semibold text-danger mb-1">Danger zone</h4><p className="text-caption text-ink-secondary mb-3">Permanently deletes all progress, tracked hours, and workbench data.</p><Button variant="danger" fullWidth onClick={() => setShowResetSheet(true)}><RotateCcw className="w-4 h-4" aria-hidden="true" /> Reset all progress</Button></div></div></Sheet>
      <Sheet isOpen={showResetSheet} onClose={() => setShowResetSheet(false)} title="Reset all progress?"><div className="space-y-4"><p className="text-body text-ink-secondary">This permanently deletes your phases, deliverables, notes, hours, and workbench data. This cannot be undone.</p><div className="flex gap-3"><Button variant="ghost" fullWidth onClick={() => setShowResetSheet(false)}>Cancel</Button><Button variant="danger" fullWidth onClick={handleReset}>Reset everything</Button></div></div></Sheet>
      </div>
    </div>
  );
}


