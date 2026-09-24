import React from 'react';
import { jdLines } from '../data/curriculumData';
import { Target } from 'lucide-react';

export default function AuditMatrixScreen() {
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
          <span className="text-5xl font-black text-gray-900">{jdLines.length}</span>
          <span className="text-xl font-bold text-gray-400 mb-1">/ {jdLines.length}</span>
        </div>
        
        <div className="space-y-3">
          {jdLines.map(line => (
            <div key={line.id} className="flex gap-3 items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <span className="shrink-0 bg-gray-100 text-gray-600 font-bold text-xs px-2 py-1 rounded">{line.id}</span>
              <p className="text-sm text-gray-700 leading-snug">{line.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
