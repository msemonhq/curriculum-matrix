import React, { useMemo } from 'react';
import { jdLines, phases } from '../data/curriculumData';
import { Target } from 'lucide-react';

export default function AuditMatrixScreen() {
  const coveredCount = useMemo(() => {
    const servedIds = new Set(phases.flatMap(p => p.jdLinesServed));
    return jdLines.filter(line => servedIds.has(line.id)).length;
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Matrix Audit Center</h2>
        <p className="text-gray-500 mt-1">JD coverage and source verification.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-rokomari-teal" />
          <h3 className="font-bold text-lg">JD Coverage Score</h3>
        </div>
        <div className="flex items-end gap-2 mb-6">
          <span className="text-5xl font-black text-gray-900">{coveredCount}</span>
          <span className="text-xl font-bold text-gray-400 mb-1">/ {jdLines.length}</span>
        </div>
        
        <div className="space-y-3">
          {jdLines.map(line => {
            const servingPhases = phases.filter(p => p.jdLinesServed.includes(line.id));
            return (
              <div key={line.id} className="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex gap-3 items-start">
                  <span className="shrink-0 bg-gray-100 text-gray-600 font-bold text-xs px-2 py-1 rounded">{line.id}</span>
                  <p className="text-sm text-gray-700 leading-snug">{line.text}</p>
                </div>
                {servingPhases.length > 0 && (
                  <div className="text-xs font-semibold text-rokomari-teal ml-10 flex gap-2 mt-1">
                    ↳ Served by: {servingPhases.map(p => `Phase ${p.number}`).join(', ')}
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
