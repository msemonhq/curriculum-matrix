import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../hooks/useProgressStore';
import curriculumData from '../data/curriculumData.json';
const { phases } = curriculumData;
import { CheckCircle2, AlertTriangle, Clock, Settings, Upload, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, useSpring } from 'framer-motion';
import { Button } from '../components/Button';
import { TextArea } from '../components/TextArea';
import { IconButton } from '../components/IconButton';
import { Card } from '../components/Card';
import { Sheet } from '../components/Sheet';

// Animated number counter
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState('0');

  React.useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  React.useEffect(() => {
    return spring.on('change', (latest) => {
      setDisplay(Math.round(latest).toString());
    });
  }, [spring]);

  return (
    <span className="tabular">
      {display}{suffix}
    </span>
  );
}

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { phaseStatus, deliverables, timeTracking, importProgress, resetProgress } = useProgressStore();

  const [showImportSheet, setShowImportSheet]   = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [importData, setImportData]             = useState('');
  const [risksExpanded, setRisksExpanded]       = useState(false);

  const completedPhases       = Object.values(phaseStatus).filter(s => s === 'completed').length;
  const completedDeliverables = Object.values(deliverables).filter(Boolean).length;
  const totalPhases           = phases.length;
  const progressPercent       = Math.round((completedPhases / totalPhases) * 100) || 0;
  const isComplete            = progressPercent === 100;

  const totalHoursMin  = phases.reduce((acc, p) => acc + p.hoursMin, 0);
  const totalHoursMax  = phases.reduce((acc, p) => acc + p.hoursMax, 0);
  const hoursDisplay   = totalHoursMin === totalHoursMax ? `~${totalHoursMin}` : `~${totalHoursMin}–${totalHoursMax}`;
  const totalLogged    = Object.values(timeTracking).reduce((sum, h) => sum + (h || 0), 0);

  // SVG ring
  const RADIUS      = 42;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const handleImport = () => {
    if (!importData.trim()) return;
    try {
      const parsed = JSON.parse(importData);
      if (parsed?.state) {
        importProgress(parsed.state);
        alert('Progress imported successfully!');
        setShowImportSheet(false);
        setImportData('');
      } else {
        alert('Invalid format. Missing state key.');
      }
    } catch {
      alert('Invalid JSON.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      resetProgress();
      setShowSettingsSheet(false);
    }
  };

  const risks = [
    'BSPR-lead sign-off on competitor set & category list (Phase 6)',
    'Real or demo GA4 / Meta view access (Phase 4, 6)',
    'Bangla-language keyword research tool verification (Phase 5)',
  ];

  return (
    <div className="p-4 space-y-4 pb-28">

      {/* Settings button */}
      <div className="flex justify-end">
        <IconButton onClick={() => setShowSettingsSheet(true)}>
          <Settings className="w-5 h-5" />
        </IconButton>
      </div>

      {/* Progress Ring Card */}
      <Card padding="large" glow={isComplete} className="flex flex-col items-center space-y-2">
        <p className="text-caption text-ink-secondary uppercase tracking-wider">Curriculum Progress</p>

        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Track */}
            <circle
              cx="50" cy="50" r={RADIUS}
              fill="transparent"
              stroke="#27272a"
              strokeWidth="7"
            />
            {/* Glow layer */}
            <motion.circle
              cx="50" cy="50" r={RADIUS}
              fill="transparent"
              stroke="#00c4db"
              strokeWidth="7"
              strokeLinecap="round"
              opacity={0.18}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={0}
            />
            {/* Progress arc */}
            <motion.circle
              cx="50" cy="50" r={RADIUS}
              fill="transparent"
              stroke="#00c4db"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: CIRCUMFERENCE - (CIRCUMFERENCE * progressPercent) / 100 }}
              transition={{ duration: 1.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ filter: 'drop-shadow(0 0 6px rgba(0,196,219,0.6))' }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-display font-black text-ink-primary tabular leading-none">
              <AnimatedNumber value={progressPercent} suffix="%" />
            </span>
            {isComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-1"
              >
                <CheckCircle2 className="w-5 h-5 text-accent" />
              </motion.div>
            )}
          </div>
        </div>

        <p className="text-caption text-ink-secondary">
          {completedPhases} of {totalPhases} phases completed
        </p>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col gap-2">
          <div className="w-9 h-9 rounded-xl bg-success-dim flex items-center justify-center">
            <CheckCircle2 className="text-success w-5 h-5" />
          </div>
          <span className="text-heading font-black text-ink-primary tabular">
            {completedDeliverables}
            <span className="text-caption text-ink-secondary font-medium ml-1">/ {totalPhases}</span>
          </span>
          <span className="text-caption text-ink-secondary">Deliverables Done</span>
        </Card>

        <Card className="flex flex-col gap-2">
          <div className="w-9 h-9 rounded-xl bg-warning-dim flex items-center justify-center">
            <Clock className="text-warning w-5 h-5" />
          </div>
          <span className="text-heading font-black text-ink-primary tabular">
            {totalLogged}
            <span className="text-caption text-ink-secondary font-medium ml-1">/ {hoursDisplay}h</span>
          </span>
          <span className="text-caption text-ink-secondary">Hours Logged</span>
        </Card>
      </div>

      {/* Execution Risks — collapsible */}
      <div className="bg-danger-dim border border-danger/25 rounded-2xl overflow-hidden">
        <button
          className="w-full flex items-center gap-3 p-4 text-left"
          onClick={() => setRisksExpanded(v => !v)}
        >
          <div className="w-8 h-8 rounded-xl bg-danger/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="text-danger w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-body font-semibold text-ink-primary">Execution Risks</h3>
            <p className="text-caption text-danger/80">{risks.length} items require attention</p>
          </div>
          <motion.div
            animate={{ rotate: risksExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-ink-tertiary" />
          </motion.div>
        </button>

        <motion.div
          initial={false}
          animate={{ height: risksExpanded ? 'auto' : 0, opacity: risksExpanded ? 1 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <ul className="px-4 pb-4 space-y-2">
            {risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-caption text-danger/90">
                <span className="mt-0.5 shrink-0 text-danger">•</span>
                {risk}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Primary CTA */}
      <Button fullWidth onClick={() => navigate('/curriculum')} className="gap-2">
        Resume Curriculum
        <ArrowRight className="w-4 h-4" />
      </Button>

      {/* Export / Import row */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          fullWidth
          onClick={async () => {
            const data = localStorage.getItem('bspr-curriculum-storage');
            if (data) {
              try {
                const { Share } = await import('@capacitor/share');
                await Share.share({ title: 'Curriculum Progress Backup', text: data, dialogTitle: 'Save Progress Backup' });
              } catch {
                navigator.clipboard.writeText(data);
                alert('Progress copied to clipboard!');
              }
            }
          }}
          className="text-body py-3"
        >
          Export
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setShowImportSheet(true)}
          className="text-body py-3"
        >
          Import
        </Button>
      </div>

      {/* Import Sheet */}
      <Sheet isOpen={showImportSheet} onClose={() => setShowImportSheet(false)} title="Import Progress">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-caption text-ink-secondary">
            <Upload className="w-4 h-4" />
            Paste your exported progress JSON below
          </div>
          <TextArea
            rows={6}
            placeholder="Paste JSON here..."
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setShowImportSheet(false)}>Cancel</Button>
            <Button fullWidth onClick={handleImport}>Import</Button>
          </div>
        </div>
      </Sheet>

      {/* Settings Sheet */}
      <Sheet isOpen={showSettingsSheet} onClose={() => setShowSettingsSheet(false)} title="Settings">
        <div className="space-y-4">
          <div className="p-4 bg-danger-dim border border-danger/25 rounded-xl">
            <h4 className="text-body font-semibold text-danger mb-1">Danger Zone</h4>
            <p className="text-caption text-ink-secondary mb-3">
              Permanently deletes all progress, tracked hours, and workbench data.
            </p>
            <Button variant="danger" fullWidth onClick={handleReset}>
              Reset All Progress
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
