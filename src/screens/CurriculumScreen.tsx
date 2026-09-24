import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import curriculumData from '../data/curriculumData.json';
const { phases } = curriculumData;
import { useProgressStore } from '../hooks/useProgressStore';
import { ChevronDown, ChevronUp, BookOpen, Clock, Target, FileCheck, Circle, CheckCircle2, PlayCircle, TestTube, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '../components/EmptyState';

export default function CurriculumScreen() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { phaseStatus, deliverables, timeTracking, notes, workbench, setPhaseStatus, toggleDeliverable, setPhaseTime, setPhaseNote } = useProgressStore();

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-green-500 w-6 h-6" />;
      case 'in_progress': return <PlayCircle className="text-rokomari-orange w-6 h-6" />;
      default: return <Circle className="text-gray-300 w-6 h-6" />;
    }
  };

  const filteredPhases = useMemo(() => {
    return phases.filter(phase => {
      const matchesSearch = phase.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            phase.jdLinesServed.some(jd => jd.toLowerCase().includes(searchQuery.toLowerCase()));
      const status = phaseStatus[phase.id] || 'not_started';
      const matchesFilter = statusFilter === 'all' || status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, statusFilter, phaseStatus]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search phases or JD lines..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rokomari-teal"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rokomari-teal text-gray-600"
        >
          <option value="all">All Status</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {filteredPhases.length === 0 && (
        <div className="mt-8">
          <EmptyState 
            title="No phases found" 
            description="Try adjusting your search or filters." 
          />
        </div>
      )}

      {filteredPhases.map((phase) => {
        const isExpanded = expandedId === phase.id;
        const status = phaseStatus[phase.id] || 'not_started';
        const deliverableDone = deliverables[phase.id] || false;
        const toolId = phase.workbenchId;
        const timeLogged = timeTracking[phase.id] || 0;
        const note = notes[phase.id] || '';

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
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {phase.hoursMin === phase.hoursMax ? `~${phase.hoursMin} hrs` : `~${phase.hoursMin}-${phase.hoursMax} hrs`}</div>
                  <div className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {phase.jdLinesServed.join(', ')}</div>
                </div>
              </div>
              <div>{isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}</div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
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

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white border border-gray-200 p-3 rounded-xl">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Hours Logged</label>
                        <input 
                          type="number" 
                          min="0"
                          value={timeLogged || ''} 
                          onChange={(e) => setPhaseTime(phase.id, parseFloat(e.target.value) || 0)}
                          placeholder={`Est: ${phase.hoursMin}`}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-rokomari-teal" 
                        />
                      </div>
                      <div className="bg-white border border-gray-200 p-3 rounded-xl">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Notes / Blockers</label>
                        <textarea 
                          rows={1}
                          value={note} 
                          onChange={(e) => setPhaseNote(phase.id, e.target.value)}
                          placeholder="Add notes..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-rokomari-teal resize-none" 
                        />
                      </div>
                      <div className="col-span-2">
                        <button 
                          onClick={async () => {
                            try {
                              let targetDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
                              let alertMsg = 'Reminder set for 24 hours from now.';
                              const demandEvents = workbench['5']?.events || [];
                              
                              if (demandEvents.length > 0) {
                                const now = new Date();
                                const currentYear = now.getFullYear();
                                const validEvents = demandEvents
                                  .flatMap((e: any) => {
                                    const dThisYear = new Date(`${e.date} ${currentYear}`);
                                    const dNextYear = new Date(`${e.date} ${currentYear + 1}`);
                                    const options = [];
                                    if (!isNaN(dThisYear.getTime()) && dThisYear.getTime() > now.getTime()) {
                                      options.push({ ...e, parsed: dThisYear });
                                    }
                                    if (!isNaN(dNextYear.getTime()) && dNextYear.getTime() > now.getTime()) {
                                      options.push({ ...e, parsed: dNextYear });
                                    }
                                    return options;
                                  })
                                  .sort((a: any, b: any) => a.parsed.getTime() - b.parsed.getTime());
                                  
                                if (validEvents.length > 0) {
                                  targetDate = validEvents[0].parsed;
                                  alertMsg = `Reminder set for ${validEvents[0].title} on ${validEvents[0].date}.`;
                                }
                              }

                              const { LocalNotifications } = await import('@capacitor/local-notifications');
                              await LocalNotifications.requestPermissions();
                              await LocalNotifications.schedule({
                                notifications: [{
                                  title: 'Curriculum Reminder',
                                  body: `Time to get back to ${phase.title}!`,
                                  id: Math.floor(Math.random() * 1000000),
                                  schedule: { at: targetDate }
                                }]
                              });
                              alert(alertMsg);
                            } catch { alert('Notifications not supported in browser context.'); }
                          }}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-xl py-2 shadow-sm text-sm hover:bg-gray-100 transition-colors"
                        >
                          Remind Me
                        </button>
                      </div>
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
                    
                    {toolId && (
                      <button 
                        onClick={() => navigate(`/workbenches/${toolId}`)}
                        className="w-full mt-2 bg-white border border-gray-200 text-rokomari-darkTeal font-semibold rounded-xl py-3 shadow-sm active:bg-gray-50 transition-colors flex justify-center items-center gap-2"
                      >
                        <TestTube className="w-5 h-5" /> Open Workbench
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
