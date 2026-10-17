import React from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { ToastProvider } from './components/ToastProvider';
import { LayoutDashboard, Map, TestTube, Target } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardScreen from './screens/DashboardScreen';
import CurriculumScreen from './screens/CurriculumScreen';
import WorkbenchesScreen from './screens/WorkbenchesScreen';
import AuditMatrixScreen from './screens/AuditMatrixScreen';
import { MatrixMark } from './components/MatrixMark';
import { ResumeChip } from './components/ResumeChip';
import { phases } from './data/curriculum';
import { useProgress } from './hooks/useProgress';
import { useSwipeNavigation } from './hooks/useSwipeNavigation';
import { useProgressStore } from './hooks/useProgressStore';
import { upNextPhase } from './lib/progress';
import { ROADMAP_PATH, roadmapState } from './lib/roadmapLink';

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => { const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => { if (!canGoBack || location.pathname === '/') CapacitorApp.exitApp(); else navigate(-1); }); return () => { listener.then(l => l.remove()); }; }, [location.pathname, navigate]);
  const getActiveTab = () => { const path = location.pathname; if (path.startsWith('/curriculum')) return 'curriculum'; if (path.startsWith('/workbenches')) return 'workbenches'; if (path.startsWith('/audit')) return 'audit'; return 'dashboard'; };
  const activeTab = getActiveTab();
  const tabs = [{ id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard }, { id: 'curriculum', path: '/curriculum', label: 'Roadmap', icon: Map }, { id: 'workbenches', path: '/workbenches', label: 'Workbenches', icon: TestTube }, { id: 'audit', path: '/audit', label: 'Audit', icon: Target }];
  const isInsideTool = location.pathname.startsWith('/workbenches/') && location.pathname.length > '/workbenches/'.length;
  // On the screens you wander off to, the header offers a way back to the phase you are on. The Dashboard
  // and the Roadmap already show it, and a tool is focused work, so none of those get the chip.
  const activePhaseId = useProgressStore((state) => state.activePhaseId);
  const phaseStatus = useProgressStore((state) => state.phaseStatus);
  const { byPhase } = useProgress();
  const resumePhase = !isInsideTool && (activeTab === 'workbenches' || activeTab === 'audit')
    ? upNextPhase(phases, activePhaseId, phaseStatus)
    : undefined;
  
  React.useEffect(() => { if (mainRef.current) mainRef.current.scrollTop = 0; }, [location.pathname]);
  // Swiping sideways moves along the tabs, in the order of the navigation bar. Off inside a tool, which has no bar.
  useSwipeNavigation(mainRef, activeTab, !isInsideTool, (tab) => {
    const target = tabs.find((candidate) => candidate.id === tab);
    if (target) navigate(target.path);
  });

  return (
    <div className="flex flex-col h-screen bg-surface-base overflow-hidden text-ink-primary pb-safe">
      <header className="w-full z-20 pt-safe-top border-b border-rule">
        <div className="flex min-h-16 items-center gap-3 px-4 py-2">
          <MatrixMark activeTab={activeTab} />
          <span className="min-w-0 flex-1 text-title text-ink-primary">Rokomari BSPR</span>
          {resumePhase && (
            <ResumeChip
              phaseNumber={resumePhase.number}
              percent={byPhase[resumePhase.id].percent}
              onClick={() => navigate(ROADMAP_PATH, { state: roadmapState(resumePhase.id) })}
            />
          )}
        </div>
      </header>
      <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
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
      {!isInsideTool && (
        <nav
          aria-label="Primary navigation"
          className="fixed bottom-0 w-full px-4 pb-4 safe-bottom z-30 pointer-events-none"
        >
          <div className="pointer-events-auto bg-surface-elevated border border-rule rounded-3xl shadow-surface-lg flex justify-around items-center h-16 px-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={tab.label}
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  whileTap={{ scale: 0.96 }}
                  className="flex flex-col items-center justify-center flex-1 h-full space-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 rounded-2xl"
                >
                  <div className={`relative px-4 py-1.5 rounded-2xl ${isActive ? 'bg-accent-dim' : ''}`}>
                    <Icon
                      className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-ink-tertiary'}`}
                      strokeWidth={isActive ? 2.5 : 2}
                      aria-hidden="true"
                    />
                  </div>
                  <span
                    className={`text-kicker tracking-normal ${isActive ? 'text-accent' : 'text-ink-tertiary'}`}
                  >
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

export default function App() { return <Router><ToastProvider><MainApp /></ToastProvider></Router>; }






