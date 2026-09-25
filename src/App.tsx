import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { LayoutDashboard, Map, TestTube, Target } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardScreen from './screens/DashboardScreen';
import CurriculumScreen from './screens/CurriculumScreen';
import WorkbenchesScreen from './screens/WorkbenchesScreen';
import AuditMatrixScreen from './screens/AuditMatrixScreen';

// Minimal Matrix logo mark
const MatrixLogo = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="8" height="8" rx="2" fill="#00c4db" opacity="0.9"/>
    <rect x="13" y="1" width="8" height="8" rx="2" fill="#00c4db" opacity="0.5"/>
    <rect x="1" y="13" width="8" height="8" rx="2" fill="#00c4db" opacity="0.5"/>
    <rect x="13" y="13" width="8" height="8" rx="2" fill="#00c4db" opacity="0.25"/>
  </svg>
);

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
    return () => { listener.then(l => l.remove()); };
  }, [location.pathname, navigate]);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/curriculum')) return 'curriculum';
    if (path.startsWith('/workbenches')) return 'workbenches';
    if (path.startsWith('/audit')) return 'audit';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  const tabs = [
    { id: 'dashboard',   path: '/',            label: 'Dashboard',   icon: LayoutDashboard },
    { id: 'curriculum',  path: '/curriculum',  label: 'Roadmap',     icon: Map },
    { id: 'workbenches', path: '/workbenches', label: 'Workbenches', icon: TestTube },
    { id: 'audit',       path: '/audit',       label: 'Audit',       icon: Target },
  ];

  const screenLabel = tabs.find(t => t.id === activeTab)?.label || 'Dashboard';

  // Hide bottom nav when inside a specific workbench tool
  const isInsideTool = location.pathname.startsWith('/workbenches/') && location.pathname.length > '/workbenches/'.length;

  return (
    <div className="flex flex-col h-screen bg-surface-base overflow-hidden text-ink-primary pb-safe">

      {/* Glassmorphism Header */}
      <header className="glass safe-top z-20 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <MatrixLogo />
          <AnimatePresence mode="wait">
            <motion.h1
              key={screenLabel}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="text-title font-semibold text-ink-primary tracking-tight"
            >
              {screenLabel}
            </motion.h1>
          </AnimatePresence>
        </div>
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto scroll-smooth relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full"
          >
            <Routes location={location}>
              <Route path="/"                     element={<DashboardScreen />} />
              <Route path="/curriculum"            element={<CurriculumScreen />} />
              <Route path="/workbenches"           element={<WorkbenchesScreen />} />
              <Route path="/workbenches/:toolId"   element={<WorkbenchesScreen />} />
              <Route path="/audit"                 element={<AuditMatrixScreen />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Pill Bottom Navigation */}
      {!isInsideTool && (
        <nav className="fixed bottom-0 w-full px-4 pb-4 safe-bottom z-30 pointer-events-none">
          <div className="pointer-events-auto bg-surface-elevated border border-line rounded-3xl shadow-surface-lg flex justify-around items-center h-16 px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  whileTap={{ scale: 0.90 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex flex-col items-center justify-center flex-1 h-full space-y-1 focus:outline-none"
                >
                  <div className={`relative px-4 py-1.5 rounded-2xl transition-all duration-200 ${
                    isActive ? 'bg-accent-dim' : 'bg-transparent'
                  }`}>
                    <Icon
                      className={`w-5 h-5 transition-colors duration-200 ${
                        isActive ? 'text-accent' : 'text-ink-tertiary'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
                      />
                    )}
                  </div>
                  <span className={`text-micro uppercase tracking-wider transition-colors duration-200 ${
                    isActive ? 'text-accent' : 'text-ink-tertiary'
                  }`}>
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </nav>
      )}
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
