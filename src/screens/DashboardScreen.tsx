import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../hooks/useProgressStore';
import curriculumData from '../data/curriculumData.json';
const { phases } = curriculumData;
import { CheckCircle2, AlertTriangle, Clock, Settings, X, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { TextArea } from '../components/TextArea';
import { IconButton } from '../components/IconButton';
import { Card } from '../components/Card';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { phaseStatus, deliverables, timeTracking, importProgress, resetProgress } = useProgressStore();
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const completedPhases = Object.values(phaseStatus).filter(s => s === 'completed').length;
  const completedDeliverables = Object.values(deliverables).filter(Boolean).length;
  const totalPhases = phases.length;
  const progressPercent = Math.round((completedPhases / totalPhases) * 100) || 0;

  const totalHoursMin = phases.reduce((acc, phase) => acc + phase.hoursMin, 0);
  const totalHoursMax = phases.reduce((acc, phase) => acc + phase.hoursMax, 0);
  const hoursDisplay = totalHoursMin === totalHoursMax ? `~${totalHoursMin}` : `~${totalHoursMin}-${totalHoursMax}`;
  const totalLoggedHours = Object.values(timeTracking).reduce((sum, h) => sum + (h || 0), 0);

  const handleImport = () => {
    if (importData) {
      try {
        const parsed = JSON.parse(importData);
        if (parsed && parsed.state) {
          importProgress(parsed.state);
          alert('Progress imported successfully!');
          setShowImportModal(false);
          setImportData('');
        } else {
          alert('Invalid format. Missing state key.');
        }
      } catch {
        alert('Invalid JSON.');
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetProgress();
      setShowSettingsModal(false);
    }
  };

  return (
    <div className="p-4 space-y-6 relative">
      <div className="absolute top-4 right-4 z-10">
        <IconButton onClick={() => setShowSettingsModal(true)}>
          <Settings className="w-6 h-6 text-gray-400" />
        </IconButton>
      </div>

      <Card padding="large" className="flex flex-col items-center justify-center space-y-2 mt-4">
        <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Curriculum Progress</h2>
        
        {/* Animated Circular Progress Ring */}
        <div className="relative w-40 h-40 mt-4 mb-2 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              className="text-gray-200 stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            ></circle>
            {/* Animated progress circle */}
            <motion.circle
              className="text-rokomari-teal stroke-current drop-shadow-md"
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              initial={{ strokeDasharray: "251.2", strokeDashoffset: "251.2" }}
              animate={{ strokeDashoffset: 251.2 - (251.2 * progressPercent) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            ></motion.circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-rokomari-darkTeal">{progressPercent}%</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-400 mt-2">{completedPhases} of {totalPhases} phases completed</p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col">
          <CheckCircle2 className="text-success w-8 h-8 mb-2" />
          <span className="text-2xl font-bold text-gray-800">{completedDeliverables}/{totalPhases}</span>
          <span className="text-xs text-gray-500">Deliverables Done</span>
        </Card>
        <Card className="flex flex-col">
          <Clock className="text-warning w-8 h-8 mb-2" />
          <span className="text-2xl font-bold text-gray-800">{totalLoggedHours}<span className="text-sm text-gray-500 font-medium"> / {hoursDisplay}h</span></span>
          <span className="text-xs text-gray-500">Logged vs Estimated</span>
        </Card>
      </div>

      <div className="bg-danger-light border border-red-100 rounded-2xl p-4 flex gap-3">
        <AlertTriangle className="text-danger shrink-0 w-6 h-6 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Execution Risks</h3>
          <ul className="text-sm text-red-800 mt-2 space-y-1 list-disc pl-4">
            <li>BSPR-lead sign-off on competitor set & category list (Phase 6)</li>
            <li>Real or demo GA4 / Meta view access (Phase 4, 6)</li>
            <li>Bangla-language keyword research tool verification (Phase 5)</li>
          </ul>
        </div>
      </div>
      
      <Button 
        fullWidth
        onClick={() => navigate('/curriculum')}
      >
        Resume Curriculum
      </Button>

      <div className="flex gap-4 mt-4">
        <Button 
          variant="secondary"
          fullWidth
          onClick={async () => {
            const data = localStorage.getItem('bspr-curriculum-storage');
            if (data) {
              try {
                const { Share } = await import('@capacitor/share');
                await Share.share({
                  title: 'Curriculum Progress Backup',
                  text: data,
                  dialogTitle: 'Save Progress Backup'
                });
              } catch {
                navigator.clipboard.writeText(data);
                alert('Progress copied to clipboard!');
              }
            }
          }}
          className="text-sm py-3"
        >
          Export Progress
        </Button>
        <Button 
          variant="secondary"
          fullWidth
          onClick={() => setShowImportModal(true)}
          className="text-sm py-3"
        >
          Import Progress
        </Button>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><Upload className="w-5 h-5 text-rokomari-teal" /> Import Progress</h3>
              <IconButton onClick={() => setShowImportModal(false)}>
                <X className="w-5 h-5" />
              </IconButton>
            </div>
            <TextArea 
              rows={6}
              placeholder="Paste your progress JSON string here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => setShowImportModal(false)}>Cancel</Button>
              <Button onClick={handleImport}>Import</Button>
            </div>
          </Card>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><Settings className="w-5 h-5 text-gray-700" /> Settings</h3>
              <IconButton onClick={() => setShowSettingsModal(false)}>
                <X className="w-5 h-5" />
              </IconButton>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-danger-light rounded-xl border border-red-100">
                <h4 className="font-semibold text-danger mb-1">Danger Zone</h4>
                <p className="text-sm text-red-800 mb-3">This will permanently delete all your progress, tracked hours, and workbench data.</p>
                <Button variant="danger" fullWidth onClick={handleReset}>
                  Reset All Progress
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
