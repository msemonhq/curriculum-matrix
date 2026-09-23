import React, { useState } from 'react';
import { LayoutDashboard, Map, TestTube, Target, FileBarChart } from 'lucide-react';
import DashboardScreen from './screens/DashboardScreen';
import CurriculumScreen from './screens/CurriculumScreen';
import WorkbenchesScreen from './screens/WorkbenchesScreen';
import AuditMatrixScreen from './screens/AuditMatrixScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'curriculum', label: 'Roadmap', icon: Map },
    { id: 'workbenches', label: 'Workbenches', icon: TestTube },
    { id: 'audit', label: 'Audit', icon: Target },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden text-gray-900 pb-safe">
      {/* Top App Bar */}
      <header className="bg-rokomari-teal text-white shadow-md z-10 px-4 py-3 safe-top flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Rokomari BSPR Curriculum</h1>
        <FileBarChart className="w-5 h-5 text-white/80" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 scroll-smooth">
        {activeTab === 'dashboard' && <DashboardScreen onNavigate={setActiveTab} />}
        {activeTab === 'curriculum' && <CurriculumScreen />}
        {activeTab === 'workbenches' && <WorkbenchesScreen />}
        {activeTab === 'audit' && <AuditMatrixScreen />}
      </main>

      {/* Bottom Navigation (Material 3 style) */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 safe-bottom">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-rokomari-darkTeal' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <div className={`px-4 py-1 rounded-full ${isActive ? 'bg-rokomari-teal/15' : ''}`}>
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-xs font-medium ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
