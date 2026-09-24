import React, { useMemo } from 'react';
import curriculumData from '../data/curriculumData.json';
const { jdLines, phases } = curriculumData;
import { Target, AlertTriangle } from 'lucide-react';

export default function AuditMatrixScreen() {
  const coveredCount = useMemo(() => {
    const servedIds = new Set(phases.flatMap(p => p.jdLinesServed));
    return jdLines.filter(line => servedIds.has(line.id)).length;
  }, []);

  const hasGaps = coveredCount < jdLines.length;

  return (
    <div className="p-4 space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Matrix Audit Center</h2>
        <p className="text-gray-500 mt-1">JD coverage and source verification.</p>
      </div>

      {hasGaps && (
        <div className="bg-danger-light border border-red-100 rounded-2xl p-4 flex gap-3">
          <AlertTriangle className="text-danger shrink-0 w-6 h-6 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Coverage Gap Detected</h3>
            <p className="text-sm text-red-800 mt-1">
              Your current curriculum roadmap does not cover all Job Description requirements. Review the missing items below.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-rokomari-teal" />
          <h3 className="font-bold text-lg">JD Coverage Score</h3>
        </div>
        <div className="flex items-end gap-2 mb-6">
          <span className={`text-5xl font-black ${hasGaps ? 'text-danger' : 'text-gray-900'}`}>{coveredCount}</span>
          <span className="text-xl font-bold text-gray-400 mb-1">/ {jdLines.length}</span>
        </div>
        
        <div className="space-y-3">
          {jdLines.map(line => {
            const servingPhases = phases.filter(p => p.jdLinesServed.includes(line.id));
            const isUnserved = servingPhases.length === 0;
            return (
              <div key={line.id} className={`flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0 last:pb-0 ${isUnserved ? 'bg-danger-light/30 -mx-2 px-2 pt-2 rounded-xl border-b-0 mb-3' : ''}`}>
                <div className="flex gap-3 items-start">
                  <span className={`shrink-0 font-bold text-xs px-2 py-1 rounded ${isUnserved ? 'bg-danger/10 text-danger' : 'bg-gray-100 text-gray-600'}`}>{line.id}</span>
                  <p className={`text-sm leading-snug ${isUnserved ? 'text-red-900 font-medium' : 'text-gray-700'}`}>{line.text}</p>
                </div>
                {servingPhases.length > 0 && (
                  <div className="text-xs font-semibold text-rokomari-teal ml-10 flex gap-2 mt-1">
                    ↳ Served by: {servingPhases.map(p => `Phase ${p.number}`).join(', ')}
                  </div>
                )}
                {isUnserved && (
                  <div className="text-xs font-bold text-danger ml-10 mt-1 flex gap-2 items-center mb-1">
                    <AlertTriangle className="w-3 h-3" /> GAP DETECTED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
