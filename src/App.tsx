import React from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { LayoutDashboard, Map, TestTube, Target } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardScreen from './screens/DashboardScreen';
import CurriculumScreen from './screens/CurriculumScreen';
import WorkbenchesScreen from './screens/WorkbenchesScreen';
import AuditMatrixScreen from './screens/AuditMatrixScreen';

interface MatrixLogoProps { activeTab: string; }
const MatrixLogo: React.FC<MatrixLogoProps> = ({ activeTab }) => {
  const positions: Record<string, { x: number; y: number }> = { dashboard: { x: 1, y: 1 }, curriculum: { x: 13, y: 1 }, workbenches: { x: 1, y: 13 }, audit: { x: 13, y: 13 } };
  const activePos = positions[activeTab] || positions.dashboard;
  const baseSquares = [{ id: 'dashboard', x: 1, y: 1 }, { id: 'curriculum', x: 13, y: 1 }, { id: 'workbenches', x: 1, y: 13 }, { id: 'audit', x: 13, y: 13 }];
  return <div className="relative w-6 h-6 flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">{baseSquares.map(sq => <rect key={sq.id} x={sq.x} y={sq.y} width="8" height="8" rx="2.5" fill="#27272a" stroke="#3f3f46" strokeWidth="0.8" />)}<motion.rect animate={{ x: activePos.x, y: activePos.y }} transition={{ type: 'spring', stiffness: 450, damping: 28, mass: 0.7 }} width="8" height="8" rx="2.5" fill="#00c4db" /></svg></div>;
};

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolling, setIsScrolling] = React.useState(false);
  const [thumbTop, setThumbTop] = React.useState(12);
  const [thumbHeight, setThumbHeight] = React.useState(36);
  const mainRef = React.useRef<HTMLElement>(null);
  const scrollTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => { const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => { if (!canGoBack || location.pathname === '/') CapacitorApp.exitApp(); else navigate(-1); }); return () => { listener.then(l => l.remove()); }; }, [location.pathname, navigate]);
  const getActiveTab = () => { const path = location.pathname; if (path.startsWith('/curriculum')) return 'curriculum'; if (path.startsWith('/workbenches')) return 'workbenches'; if (path.startsWith('/audit')) return 'audit'; return 'dashboard'; };
  const activeTab = getActiveTab();
  const tabs = [{ id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard }, { id: 'curriculum', path: '/curriculum', label: 'Roadmap', icon: Map }, { id: 'workbenches', path: '/workbenches', label: 'Workbenches', icon: TestTube }, { id: 'audit', path: '/audit', label: 'Audit', icon: Target }];
  const screenLabel = tabs.find(t => t.id === activeTab)?.label || 'Dashboard';
  const isInsideTool = location.pathname.startsWith('/workbenches/') && location.pathname.length > '/workbenches/'.length;
  const handleScroll = (e: React.UIEvent<HTMLElement>) => { const target = e.currentTarget; const { scrollTop, scrollHeight, clientHeight } = target; if (scrollHeight <= clientHeight) { setIsScrolling(false); return; } const maxScroll = scrollHeight - clientHeight; const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1); const calculatedHeight = Math.max(36, (clientHeight / scrollHeight) * clientHeight); setThumbHeight(calculatedHeight); setThumbTop(12 + progress * (clientHeight - calculatedHeight - 24)); setIsScrolling(true); if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current); scrollTimerRef.current = window.setTimeout(() => setIsScrolling(false), 1600); };
  React.useEffect(() => { if (mainRef.current) mainRef.current.scrollTop = 0; setIsScrolling(false); }, [location.pathname]);
  React.useEffect(() => () => { if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current); }, []);

  return <div className="flex flex-col h-screen bg-surface-base overflow-hidden text-ink-primary pb-safe"><header className="w-full bg-surface-elevated/85 backdrop-blur-md border-b border-line/60 rounded-b-3xl shadow-surface-lg safe-top z-20 px-6 py-3.5 flex items-center justify-between"><div className="flex items-center gap-3"><MatrixLogo activeTab={activeTab} /><AnimatePresence mode="wait"><motion.h1 key={screenLabel} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }} className="text-title font-semibold text-ink-primary tracking-tight">{screenLabel}</motion.h1></AnimatePresence></div><div className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" /></header>{isScrolling && <div aria-hidden="true" className="pointer-events-none fixed right-1.5 z-40 w-1 rounded-full bg-accent/80" style={{ top: `${thumbTop}px`, height: `${thumbHeight}px` }} />}
    <main ref={mainRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scroll-smooth relative"><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="h-full"><Routes location={location}><Route path="/" element={<DashboardScreen />} /><Route path="/curriculum" element={<CurriculumScreen />} /><Route path="/workbenches" element={<WorkbenchesScreen />} /><Route path="/workbenches/:toolId" element={<WorkbenchesScreen />} /><Route path="/audit" element={<AuditMatrixScreen />} /></Routes></motion.div></AnimatePresence></main>{!isInsideTool && <nav aria-label="Primary navigation" className="fixed bottom-0 w-full px-4 pb-4 safe-bottom z-30 pointer-events-none"><div className="pointer-events-auto bg-surface-elevated border border-line rounded-3xl shadow-surface-lg flex justify-around items-center h-16 px-2">{tabs.map(tab => { const Icon = tab.icon; const isActive = activeTab === tab.id; return <motion.button type="button" aria-current={isActive ? 'page' : undefined} aria-label={tab.label} key={tab.id} onClick={() => navigate(tab.path)} whileTap={{ scale: 0.96 }} className="flex flex-col items-center justify-center flex-1 h-full space-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 rounded-2xl"><div className={`relative px-4 py-1.5 rounded-2xl ${isActive ? 'bg-accent-dim' : ''}`}><Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-ink-tertiary'}`} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" /></div><span className={`text-micro uppercase tracking-wider ${isActive ? 'text-accent' : 'text-ink-tertiary'}`}>{tab.label}</span></motion.button>; })}</div></nav>}</div>;
}

export default function App() { return <Router><MainApp /></Router>; }
