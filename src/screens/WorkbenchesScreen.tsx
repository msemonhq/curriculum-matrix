import React from 'react';
import { Network, Search, Table, Calculator, Calendar, GitCompare, TestTube, Presentation } from 'lucide-react';

export default function WorkbenchesScreen() {
  const tools = [
    { id: '1', title: 'Issue Tree Builder', icon: Network, phase: 'Phase 1', color: 'bg-blue-50 text-blue-600' },
    { id: '2', title: 'AI Verification Log', icon: Search, phase: 'Phase 2', color: 'bg-purple-50 text-purple-600' },
    { id: '3', title: 'Formula Cheat-sheet', icon: Table, phase: 'Phase 3', color: 'bg-green-50 text-green-600' },
    { id: '4', title: 'GA4 Discrepancy Calc', icon: Calculator, phase: 'Phase 4', color: 'bg-orange-50 text-orange-600' },
    { id: '5', title: 'Demand Calendar', icon: Calendar, phase: 'Phase 5', color: 'bg-red-50 text-red-600' },
    { id: '6', title: 'Strategy Canvas', icon: GitCompare, phase: 'Phase 6', color: 'bg-indigo-50 text-indigo-600' },
    { id: '7', title: 'A/B Test Generator', icon: TestTube, phase: 'Phase 7', color: 'bg-pink-50 text-pink-600' },
    { id: '8', title: 'Brief Builder', icon: Presentation, phase: 'Phase 8', color: 'bg-rokomari-teal/10 text-rokomari-darkTeal' },
  ];

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Interactive Workbenches</h2>
        <p className="text-gray-500 mt-1">Tools and templates to complete your deliverables.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <button key={tool.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-start text-left shadow-sm active:bg-gray-50 transition-all">
              <div className={`p-3 rounded-xl ${tool.color} mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-gray-400">{tool.phase}</span>
              <h3 className="font-bold text-gray-800 leading-tight mt-1">{tool.title}</h3>
            </button>
          )
        })}
      </div>
    </div>
  );
}
