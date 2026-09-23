import React from 'react';
import { jdLines } from '../data/curriculumData';
import { Target, AlertCircle, FileSearch, History } from 'lucide-react';

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
          <span className="text-5xl font-black text-gray-900">20</span>
          <span className="text-xl font-bold text-gray-400 mb-1">/ 20</span>
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

      <div className="grid grid-cols-2 gap-4">
        <button className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex flex-col gap-2 items-start active:bg-gray-50">
          <AlertCircle className="w-6 h-6 text-orange-500" />
          <h4 className="font-bold text-gray-800 text-left">Gap Analysis</h4>
          <span className="text-xs text-gray-500">14 items tracked</span>
        </button>
        <button className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex flex-col gap-2 items-start active:bg-gray-50">
          <FileSearch className="w-6 h-6 text-blue-500" />
          <h4 className="font-bold text-gray-800 text-left">Source Audit</h4>
          <span className="text-xs text-gray-500">44 verified links</span>
        </button>
      </div>
    </div>
  );
}
