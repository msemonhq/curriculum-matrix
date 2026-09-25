import React, { useEffect, useState, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { LayoutDashboard, Map, TestTube, Target } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardScreen from './screens/DashboardScreen';
import CurriculumScreen from './screens/CurriculumScreen';
import WorkbenchesScreen from './screens/WorkbenchesScreen';
import AuditMatrixScreen from './screens/AuditMatrixScreen';

// Four-square matrix logo mark with moving glowing active quadrant
interface MatrixLogoProps {
  activeTab: string;
}

const MatrixLogo: React.FC<MatrixLogoProps> = ({ activeTab }) => {
  // Map active screen to quadrant coordinates
  // Top-Left: Dashboard (1, 1)
  // Top-Right: Roadmap (13, 1)
  // Bottom-Left: Workbenches (1, 13)
  // Bottom-Right: Audit (13, 13)
  const positions: Record<string, { x: number; y: number }> = {
    dashboard:   { x: 1,  y: 1 },
    curriculum:  { x: 13, y: 1 },
    workbenches: { x: 1,  y: 13 },
    audit:       { x: 13, y: 13 },
  };

  const activePos = positions[activeTab] || positions.dashboard;

  const baseSquares = [
    { id: 'dashboard',   x: 1,  y: 1 },
    { id: 'curriculum',  x: 13, y: 1 },
    { id: 'workbenches', x: 1,  y: 13 },
    { id: 'audit',       x: 13, y: 13 },
  ];

  return (
    <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Static base squares */}
        {baseSquares.map((sq) => (
          <rect
            key={sq.id}
            x={sq.x}
            y={sq.y}
            width="8"
            height="8"
            rx="2.5"
            fill="#27272a"
            stroke="#3f3f46"
            strokeWidth="0.8"
          />
        ))}

        {/* Dynamic glowing square that springs between quadrants as screen switches */}
        <motion.rect
          animate={{ x: activePos.x, y: activePos.y }}
          transition={{
            type: 'spring',
            stiffness: 450,
            damping: 28,
            mass: 0.7,
          }}
          width="8"
          height="8"
          rx="2.5"
          fill="#00c4db"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(0, 196, 219, 0.85))',
          }}
        />
      </svg>
    </div>
  );
};

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Auto-hiding scrollbar state
  const [isScrolling, setIsScrolling] = useState(false);
  const [thumbTop, setThumbTop] = useState(12);
  const [thumbHeight, setThumbHeight] = useState(36);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle auto-hiding scrollbar with timer
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;

    if (scrollHeight <= clientHeight) {
      setIsScrolling(false);
      return;
    }

    const maxScroll = scrollHeight - clientHeight;
    const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
    const calculatedHeight = Math.max(36, (clientHeight / scrollHeight) * clientHeight);
    const maxThumbTravel = clientHeight - calculatedHeight - 24;
    const calculatedTop = 12 + progress * maxThumbTravel;

    setThumbHeight(calculatedHeight);
    setThumbTop(calculatedTop);
    setIsScrolling(true);

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    // Scrollbar automatically disappears after 1.6s of inactivity
    scrollTimerRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1600);
  };

  // Reset scroll on navigation
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setIsScrolling(false);
  }, [location.pathname]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-surface-base overflow-hidden text-ink-primary pb-safe">

      {/* Redesigned Topbar: Extended width, removed top border, curved inside border (rounded-b-3xl) */}
      <header className="w-full bg-surface-elevated/85 backdrop-blur-md border-b border-line/60 border-t-0 border-x-0 rounded-b-3xl shadow-surface-lg safe-top z-20 px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <MatrixLogo activeTab={activeTab} />
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

      {/* Auto-Hiding Scrollbar Indicator with smooth timer fade */}
      <AnimatePresence>
        {isScrolling && (
          <motion.div
            key="scroll-indicator"
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.5 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none fixed right-1.5 z-40 w-1 rounded-full bg-accent/80 shadow-glow-sm"
            style={{
              top: `${thumbTop}px`,
              height: `${thumbHeight}px`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-smooth relative"
      >
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
