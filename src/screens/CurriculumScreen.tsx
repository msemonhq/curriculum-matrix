import React, { useState } from 'react';
import { phases } from '../data/curriculumData';
import { useProgressStore } from '../hooks/useProgressStore';
import { ChevronDown, ChevronUp, BookOpen, Clock, Target, FileCheck, Circle, CheckCircle2, PlayCircle } from 'lucide-react';

export default function CurriculumScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { phaseStatus, deliverables, setPhaseStatus, toggleDeliverable } = useProgressStore();

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-green-500 w-6 h-6" />;
      case 'in_progress': return <PlayCircle className="text-rokomari-orange w-6 h-6" />;
      default: return <Circle className="text-gray-300 w-6 h-6" />;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {phases.map((phase) => {
        const isExpanded = expandedId === phase.id;
        const status = phaseStatus[phase.id] || 'not_started';
        const deliverableDone = deliverables[phase.id] || false;

        return (
          <div key={phase.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div 
              className="p-4 flex items-center gap-4 cursor-pointer active:bg-gray-50"
              onClick={() => setExpandedId(isExpanded ? null : phase.id)}
            >
              <div onClick={(e) => {
                e.stopPropagation();
                const next = status === 'not_started' ? 'in_progress' : status === 'in_progress' ? 'completed' : 'not_started';
                setPhaseStatus(phase.id, next);
              }}>
                {getStatusIcon(status)}
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-rokomari-teal uppercase tracking-wide">Phase {phase.number}</div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight mt-0.5">{phase.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {phase.estimatedHours}</div>
                  <div className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {phase.jdLinesServed.join(', ')}</div>
                </div>
              </div>
              <div>{isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}</div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50/50 space-y-4">
                <div className="mt-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800"><BookOpen className="w-4 h-4 text-rokomari-teal" /> Target Course</h4>
                  <p className="text-sm text-gray-600 mt-1">{phase.course}</p>
                  <ul className="mt-2 space-y-1">
                    {phase.modules.map((mod, i) => (
                      <li key={i} className="text-xs text-gray-600 bg-white border border-gray-100 p-2 rounded-lg">• {mod}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Strategic Application</h4>
                  <p className="text-sm text-gray-600 mt-1 bg-rokomari-teal/5 p-3 rounded-xl border border-rokomari-teal/10">{phase.application}</p>
                </div>

                <div 
                  className={`p-3 rounded-xl border cursor-pointer transition-colors ${deliverableDone ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
                  onClick={() => toggleDeliverable(phase.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {deliverableDone ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <FileCheck className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${deliverableDone ? 'text-green-800' : 'text-gray-800'}`}>Proof-of-Skill Deliverable</h4>
                      <p className={`text-xs mt-1 ${deliverableDone ? 'text-green-700' : 'text-gray-600'}`}>{phase.deliverable}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
