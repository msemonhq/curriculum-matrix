import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../hooks/useProgressStore';
import { phases } from '../data/curriculumData';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { phaseStatus, deliverables } = useProgressStore();
  
  const completedPhases = Object.values(phaseStatus).filter(s => s === 'completed').length;
  const completedDeliverables = Object.values(deliverables).filter(Boolean).length;
  const totalPhases = phases.length;

  const totalHoursMin = phases.reduce((acc, phase) => acc + phase.hoursMin, 0);
  const totalHoursMax = phases.reduce((acc, phase) => acc + phase.hoursMax, 0);
  const hoursDisplay = totalHoursMin === totalHoursMax ? `~${totalHoursMin}` : `~${totalHoursMin}-${totalHoursMax}`;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center space-y-2">
        <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Curriculum Progress</h2>
        <div className="text-5xl font-extrabold text-rokomari-darkTeal">
          {Math.round((completedPhases / totalPhases) * 100) || 0}%
        </div>
        <p className="text-sm text-gray-400">{completedPhases} of {totalPhases} phases completed</p>
        
        <div className="w-full bg-gray-100 rounded-full h-2.5 mt-4 overflow-hidden">
          <div 
            className="bg-rokomari-teal h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${(completedPhases / totalPhases) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <CheckCircle2 className="text-green-500 w-8 h-8 mb-2" />
          <span className="text-2xl font-bold text-gray-800">{completedDeliverables}/{totalPhases}</span>
          <span className="text-xs text-gray-500">Deliverables Done</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <Clock className="text-rokomari-orange w-8 h-8 mb-2" />
          <span className="text-2xl font-bold text-gray-800">{hoursDisplay}<span className="text-sm">h</span></span>
          <span className="text-xs text-gray-500">Estimated Core Hours</span>
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
        <AlertTriangle className="text-red-500 shrink-0 w-6 h-6 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Execution Risks</h3>
          <ul className="text-sm text-red-800 mt-2 space-y-1 list-disc pl-4">
            <li>BSPR-lead sign-off on competitor set & category list (Phase 6)</li>
            <li>Real or demo GA4 / Meta view access (Phase 4, 6)</li>
            <li>Bangla-language keyword research tool verification (Phase 5)</li>
          </ul>
        </div>
      </div>
      
      <button 
        onClick={() => navigate('/curriculum')}
        className="w-full bg-rokomari-teal text-white font-semibold rounded-xl py-3.5 shadow-sm active:bg-rokomari-darkTeal transition-colors"
      >
        Resume Curriculum
      </button>
    </div>
  );
}
