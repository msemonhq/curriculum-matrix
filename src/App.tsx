import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { LayoutDashboard, Map, TestTube, Target, FileBarChart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardScreen from './screens/DashboardScreen';
import CurriculumScreen from './screens/CurriculumScreen';
import WorkbenchesScreen from './screens/WorkbenchesScreen';
import AuditMatrixScreen from './screens/AuditMatrixScreen';

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack || location.pathname === '/') {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [location.pathname, navigate]);

  // Mapping paths to activeTab identifier
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/curriculum')) return 'curriculum';
    if (path.startsWith('/workbenches')) return 'workbenches';
    if (path.startsWith('/audit')) return 'audit';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  const tabs = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'curriculum', path: '/curriculum', label: 'Roadmap', icon: Map },
    { id: 'workbenches', path: '/workbenches', label: 'Workbenches', icon: TestTube },
    { id: 'audit', path: '/audit', label: 'Audit', icon: Target },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden text-gray-900 pb-safe">
      {/* Top App Bar */}
      <header className="bg-rokomari-teal text-white shadow-md z-10 px-4 py-3 safe-top flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Rokomari BSPR Curriculum</h1>
        <FileBarChart className="w-5 h-5 text-white/80" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 scroll-smooth relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Routes location={location}>
              <Route path="/" element={<DashboardScreen />} />
              <Route path="/curriculum" element={<CurriculumScreen />} />
              <Route path="/workbenches" element={<WorkbenchesScreen />} />
              <Route path="/workbenches/:toolId" element={<WorkbenchesScreen />} />
              <Route path="/audit" element={<AuditMatrixScreen />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 safe-bottom">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
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

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
