import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Network, Search, Table, Calculator, Calendar, GitCompare,
  TestTube, Presentation, ArrowLeft, Plus, Check, X, Share2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useProgressStore } from '../hooks/useProgressStore';
import { Button } from '../components/Button';

// ─── Tool definitions ────────────────────────────────────────────────
interface Tool {
  id:          string;
  title:       string;
  icon:        React.ElementType;
  phase:       string;
  accentColor: string;       // Tailwind text color class
  bgColor:     string;       // Tailwind bg for icon container
  description: string;
}

const TOOLS: Tool[] = [
  { id: '1', title: 'Issue Tree Builder',    icon: Network,      phase: 'Phase 1', accentColor: 'text-blue-400',   bgColor: 'bg-blue-400/15',   description: 'Break down complex problems into smaller, manageable components.' },
  { id: '2', title: 'AI Verification Log',   icon: Search,       phase: 'Phase 2', accentColor: 'text-purple-400', bgColor: 'bg-purple-400/15', description: 'Log and verify AI outputs to ensure accuracy and compliance.' },
  { id: '3', title: 'Formula Cheat-Sheet',   icon: Table,        phase: 'Phase 3', accentColor: 'text-green-400',  bgColor: 'bg-green-400/15',  description: 'Quick reference for commonly used formulas and calculations.' },
  { id: '4', title: 'GA4 Discrepancy Calc',  icon: Calculator,   phase: 'Phase 4', accentColor: 'text-orange-400', bgColor: 'bg-orange-400/15', description: 'Calculate and analyze data discrepancies between GA4 and CRM.' },
  { id: '5', title: 'Demand Calendar',       icon: Calendar,     phase: 'Phase 5', accentColor: 'text-red-400',    bgColor: 'bg-red-400/15',    description: 'Plan and schedule demand generation activities over time.' },
  { id: '6', title: 'Strategy Canvas',       icon: GitCompare,   phase: 'Phase 6', accentColor: 'text-indigo-400', bgColor: 'bg-indigo-400/15', description: 'Visualize and compare strategic initiatives against competitors.' },
  { id: '7', title: 'A/B Test Generator',    icon: TestTube,     phase: 'Phase 7', accentColor: 'text-pink-400',   bgColor: 'bg-pink-400/15',   description: 'Design and generate parameters for A/B testing.' },
  { id: '8', title: 'Brief Builder',         icon: Presentation, phase: 'Phase 8', accentColor: 'text-accent',     bgColor: 'bg-accent-dim',    description: 'Create comprehensive briefs for campaigns and projects.' },
];

// ─── Tool sub-components (all dark-styled) ────────────────────────────

function ToolInput({
  placeholder, value, onChange, type = 'text',
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-surface-subtle border border-line rounded-xl px-3 py-2.5 text-body text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-line-focus focus:ring-2 focus:ring-accent/20 transition-all"
    />
  );
}

function ToolTextArea({ placeholder, value, onChange, rows = 2 }: { placeholder?: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-surface-subtle border border-line rounded-xl px-3 py-2.5 text-body text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-line-focus focus:ring-2 focus:ring-accent/20 transition-all resize-none"
    />
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-caption text-ink-secondary font-semibold uppercase tracking-wider mb-3">
      {children}
    </h4>
  );
}

// Tool 1
interface IssueTreeProps { issues: string[]; setIssues: React.Dispatch<React.SetStateAction<string[]>>; newIssue: string; setNewIssue: React.Dispatch<React.SetStateAction<string>>; }
function IssueTreeBuilder({ issues, setIssues, newIssue, setNewIssue }: IssueTreeProps) {
  return (
    <div className="w-full text-left">
      <SectionHeading>Core Issues</SectionHeading>
      <ul className="space-y-2 mb-4">
        {issues.map((issue, idx) => (
          <li key={idx} className="flex items-center gap-2 p-3 bg-surface-subtle border border-line rounded-xl text-body text-ink-primary">
            <Network className="w-4 h-4 text-blue-400 shrink-0" />
            {issue}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <ToolInput value={newIssue} onChange={setNewIssue} placeholder="Add new issue..." />
        <Button variant="outline" onClick={() => { if (newIssue) { setIssues([...issues, newIssue]); setNewIssue(''); } }} className="shrink-0 px-4">
          Add
        </Button>
      </div>
    </div>
  );
}

// Tool 2
interface Log { id: number; text: string; status: string; }
interface AIVerifProps { logs: Log[]; setLogs: React.Dispatch<React.SetStateAction<Log[]>>; newLog: string; setNewLog: React.Dispatch<React.SetStateAction<string>>; }
function AIVerificationLog({ logs, setLogs, newLog, setNewLog }: AIVerifProps) {
  return (
    <div className="w-full text-left">
      <SectionHeading>Recent Verifications</SectionHeading>
      <ul className="space-y-2 mb-4">
        {logs.map(log => (
          <li key={log.id} className="flex items-center justify-between p-3 bg-surface-subtle border border-line rounded-xl text-body text-ink-primary">
            <span>{log.text}</span>
            {log.status === 'pass'
              ? <Check className="w-4 h-4 text-success shrink-0" />
              : <X className="w-4 h-4 text-danger shrink-0" />}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <ToolInput value={newLog} onChange={setNewLog} placeholder="Log item to verify..." />
        <Button variant="outline" onClick={() => { if (newLog) { setLogs([...logs, { id: Date.now(), text: newLog, status: 'pass' }]); setNewLog(''); } }} className="shrink-0 px-4">
          Verify
        </Button>
      </div>
    </div>
  );
}

// Tool 3
function FormulaCheatSheet() {
  const formulas = [
    { name: 'ROI',  formula: '(Revenue − Cost) / Cost × 100' },
    { name: 'CPA',  formula: 'Total Cost / Total Conversions' },
    { name: 'ROAS', formula: 'Revenue / Ad Spend' },
  ];
  return (
    <div className="w-full text-left">
      <SectionHeading>Marketing Formulas</SectionHeading>
      <div className="space-y-3">
        {formulas.map((f, i) => (
          <div key={i} className="p-3 bg-surface-subtle border border-line rounded-xl">
            <div className="text-micro text-success uppercase tracking-wider mb-1">{f.name}</div>
            <div className="font-mono text-body text-ink-primary">{f.formula}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tool 4
interface GA4Props { ga4: string; setGa4: (v: string) => void; other: string; setOther: (v: string) => void; }
function GA4DiscrepancyCalc({ ga4, setGa4, other, setOther }: GA4Props) {
  const diff = ga4 && other ? ((Number(ga4) - Number(other)) / Number(other) * 100).toFixed(2) : null;
  const isBig = diff !== null && Math.abs(Number(diff)) > 10;
  return (
    <div className="w-full text-left">
      <SectionHeading>Discrepancy Calculator</SectionHeading>
      <div className="space-y-4">
        <div>
          <label className="block text-caption text-ink-secondary mb-1.5">GA4 Conversions</label>
          <ToolInput type="number" value={ga4} onChange={setGa4} />
        </div>
        <div>
          <label className="block text-caption text-ink-secondary mb-1.5">CRM / Other System</label>
          <ToolInput type="number" value={other} onChange={setOther} />
        </div>
        {diff !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl font-bold text-center tabular ${isBig ? 'bg-danger-dim text-danger border border-danger/25' : 'bg-success-dim text-success border border-success/25'}`}
          >
            Discrepancy: {diff}%
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Tool 5
interface Event { date: string; title: string; }
interface CalendarProps { events: Event[]; setEvents: React.Dispatch<React.SetStateAction<Event[]>>; isAdding: boolean; setIsAdding: React.Dispatch<React.SetStateAction<boolean>>; newDate: string; setNewDate: (v: string) => void; newTitle: string; setNewTitle: (v: string) => void; }
function DemandCalendar({ events, setEvents, isAdding, setIsAdding, newDate, setNewDate, newTitle, setNewTitle }: CalendarProps) {
  const handleAdd = () => {
    if (newDate && newTitle) {
      setEvents([...events, { date: newDate, title: newTitle }]);
      setNewDate(''); setNewTitle(''); setIsAdding(false);
    }
  };
  return (
    <div className="w-full text-left">
      <SectionHeading>Upcoming Campaigns</SectionHeading>
      <ul className="space-y-2 mb-4">
        {events.map((e, idx) => (
          <li key={idx} className="flex gap-4 p-3 bg-surface-subtle border border-line rounded-xl items-center">
            <span className="font-mono text-caption text-danger font-bold shrink-0 tabular">{e.date}</span>
            <span className="text-body text-ink-primary">{e.title}</span>
          </li>
        ))}
      </ul>
      {isAdding ? (
        <div className="flex gap-2 mb-3">
          <ToolInput value={newDate} onChange={setNewDate} placeholder="Oct 15" />
          <ToolInput value={newTitle} onChange={setNewTitle} placeholder="Campaign title" />
          <Button variant="outline" onClick={handleAdd} className="shrink-0 px-3">Add</Button>
        </div>
      ) : (
        <Button variant="ghost" fullWidth onClick={() => setIsAdding(true)} className="gap-2 border border-line rounded-xl">
          <Plus className="w-4 h-4" /> Add Campaign
        </Button>
      )}
    </div>
  );
}

// Tool 6
function StrategyCanvas() {
  const workbenchData  = useProgressStore(s => s.workbench);
  const updateWorkbench = useProgressStore(s => s.updateWorkbench);
  const defaultFactors = [
    { name: 'Price',   you: 60, comp: 40 },
    { name: 'Quality', you: 80, comp: 50 },
    { name: 'Speed',   you: 40, comp: 70 },
  ];
  const factors = workbenchData['6']?.factors || defaultFactors;
  const update = (index: number, key: 'you' | 'comp', value: number) => {
    const nf = [...factors];
    nf[index] = { ...nf[index], [key]: value };
    updateWorkbench('6', { factors: nf });
  };
  return (
    <div className="w-full text-left">
      <SectionHeading>Value Curve</SectionHeading>
      <div className="space-y-6">
        {factors.map((factor: { name: string; you: number; comp: number }, idx: number) => (
          <div key={factor.name} className="space-y-2">
            <span className="text-caption text-ink-secondary font-semibold">{factor.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-caption text-accent font-mono w-16 tabular">You: {factor.you}%</span>
              <input type="range" min="0" max="100" value={factor.you} onChange={e => update(idx, 'you', +e.target.value)} className="flex-1 accent-accent" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-caption text-ink-tertiary font-mono w-16 tabular">Comp: {factor.comp}%</span>
              <input type="range" min="0" max="100" value={factor.comp} onChange={e => update(idx, 'comp', +e.target.value)} className="flex-1 accent-ink-tertiary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tool 7
interface ABProps { variable: string; setVariable: (v: string) => void; control: string; setControl: (v: string) => void; variant: string; setVariant: (v: string) => void; hypothesis: string; setHypothesis: (v: string) => void; }
function ABTestGenerator({ variable, setVariable, control, setControl, variant, setVariant, hypothesis, setHypothesis }: ABProps) {
  const generate = () => {
    if (variable && control && variant) {
      setHypothesis(`If we change the ${variable} from '${control}' to '${variant}', we expect to see an improvement in our primary metric because it better addresses user needs.`);
    }
  };
  return (
    <div className="w-full text-left">
      <SectionHeading>Test Hypothesis</SectionHeading>
      <div className="space-y-3">
        <div>
          <label className="block text-caption text-ink-secondary mb-1.5">Variable</label>
          <ToolInput value={variable} onChange={setVariable} placeholder="e.g. CTA Button Color" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-caption text-ink-secondary mb-1.5">Control</label>
            <ToolInput value={control} onChange={setControl} placeholder="Blue" />
          </div>
          <div>
            <label className="block text-caption text-ink-secondary mb-1.5">Variant</label>
            <ToolInput value={variant} onChange={setVariant} placeholder="Green" />
          </div>
        </div>
        <Button variant="primary" fullWidth onClick={generate}>Generate Hypothesis</Button>
        {hypothesis && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-accent-dim border border-accent/25 rounded-xl text-body text-ink-primary italic"
          >
            "{hypothesis}"
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Tool 8
interface BriefProps { campaignName: string; setCampaignName: (v: string) => void; targetAudience: string; setTargetAudience: (v: string) => void; isSaved: boolean; setIsSaved: (v: boolean) => void; }
function BriefBuilder({ campaignName, setCampaignName, targetAudience, setTargetAudience, isSaved, setIsSaved }: BriefProps) {
  return (
    <div className="w-full text-left">
      <SectionHeading>Campaign Brief</SectionHeading>
      <div className="space-y-3">
        <div>
          <label className="block text-caption text-ink-secondary mb-1.5">Campaign Name</label>
          <ToolInput value={campaignName} onChange={v => { setCampaignName(v); setIsSaved(false); }} placeholder="Q4 Seasonal Push" />
        </div>
        <div>
          <label className="block text-caption text-ink-secondary mb-1.5">Target Audience</label>
          <ToolTextArea rows={3} value={targetAudience} onChange={v => { setTargetAudience(v); setIsSaved(false); }} placeholder="Describe your target audience..." />
        </div>
        <Button
          variant={isSaved ? 'secondary' : 'primary'}
          fullWidth
          onClick={() => setIsSaved(true)}
        >
          {isSaved ? <><Check className="w-4 h-4" /> Brief Saved!</> : 'Save Brief'}
        </Button>
      </div>
    </div>
  );
}

// ─── Main screen ────────────────────────────────────────────────────────────
export default function WorkbenchesScreen() {
  const { toolId } = useParams<{ toolId?: string }>();
  const navigate   = useNavigate();

  const workbenchData   = useProgressStore(s => s.workbench);
  const updateWorkbench = useProgressStore(s => s.updateWorkbench);

  const activeTool = toolId ? TOOLS.find(t => t.id === toolId) : null;

  // Hoisted state — all tools
  const [issues,     setIssues]     = useState<string[]>(workbenchData['1']?.issues || ['Low Conversion Rate', 'High Bounce Rate']);
  const [newIssue,   setNewIssue]   = useState('');
  const [logs,       setLogs]       = useState<Log[]>(workbenchData['2']?.logs || [{ id: 1, text: 'Ad copy generation', status: 'pass' }]);
  const [newLog,     setNewLog]     = useState('');
  const [ga4,        setGa4]        = useState(workbenchData['4']?.ga4 || '');
  const [other,      setOther]      = useState(workbenchData['4']?.other || '');
  const [events,     setEvents]     = useState<Event[]>(workbenchData['5']?.events || [{ date: 'Oct 15', title: 'Q4 Webinar' }]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newDate,    setNewDate]    = useState('');
  const [newTitle,   setNewTitle]   = useState('');
  const [variable,   setVariable]   = useState(workbenchData['7']?.variable || '');
  const [control,    setControl]    = useState(workbenchData['7']?.control || '');
  const [variant,    setVariant]    = useState(workbenchData['7']?.variant || '');
  const [hypothesis, setHypothesis] = useState(workbenchData['7']?.hypothesis || '');
  const [campaignName,   setCampaignName]   = useState(workbenchData['8']?.campaignName || '');
  const [targetAudience, setTargetAudience] = useState(workbenchData['8']?.targetAudience || '');
  const [isSaved,    setIsSaved]    = useState(workbenchData['8']?.isSaved || false);

  useEffect(() => { updateWorkbench('1', { issues }); },                          [issues, updateWorkbench]);
  useEffect(() => { updateWorkbench('2', { logs }); },                            [logs, updateWorkbench]);
  useEffect(() => { updateWorkbench('4', { ga4, other }); },                      [ga4, other, updateWorkbench]);
  useEffect(() => { updateWorkbench('5', { events }); },                          [events, updateWorkbench]);
  useEffect(() => { updateWorkbench('7', { variable, control, variant, hypothesis }); }, [variable, control, variant, hypothesis, updateWorkbench]);
  useEffect(() => { updateWorkbench('8', { campaignName, targetAudience, isSaved }); }, [campaignName, targetAudience, isSaved, updateWorkbench]);

  const renderContent = (id: string) => {
    switch (id) {
      case '1': return <IssueTreeBuilder    issues={issues} setIssues={setIssues} newIssue={newIssue} setNewIssue={setNewIssue} />;
      case '2': return <AIVerificationLog   logs={logs} setLogs={setLogs} newLog={newLog} setNewLog={setNewLog} />;
      case '3': return <FormulaCheatSheet />;
      case '4': return <GA4DiscrepancyCalc  ga4={ga4} setGa4={setGa4} other={other} setOther={setOther} />;
      case '5': return <DemandCalendar      events={events} setEvents={setEvents} isAdding={isAddingEvent} setIsAdding={setIsAddingEvent} newDate={newDate} setNewDate={setNewDate} newTitle={newTitle} setNewTitle={setNewTitle} />;
      case '6': return <StrategyCanvas />;
      case '7': return <ABTestGenerator     variable={variable} setVariable={setVariable} control={control} setControl={setControl} variant={variant} setVariant={setVariant} hypothesis={hypothesis} setHypothesis={setHypothesis} />;
      case '8': return <BriefBuilder        campaignName={campaignName} setCampaignName={setCampaignName} targetAudience={targetAudience} setTargetAudience={setTargetAudience} isSaved={isSaved} setIsSaved={setIsSaved} />;
      default:  return null;
    }
  };

  // ── Active tool view ───────────────────────────────────────────────
  if (activeTool) {
    const Icon = activeTool.icon;

    const handleShare = async () => {
      const data = workbenchData[activeTool.id] || {};
      let formattedText = '';
      if (!data || Object.keys(data).length === 0) {
        formattedText = 'No data recorded yet.';
      } else {
        switch (activeTool.id) {
          case '1': formattedText = `Core Issues:\n${(data.issues || []).map((i: string) => `- ${i}`).join('\n')}`; break;
          case '2': formattedText = `Recent Verifications:\n${(data.logs || []).map((l: any) => `- ${l.text} [${l.status.toUpperCase()}]`).join('\n')}`; break;
          case '4': formattedText = `GA4 Discrepancy:\nGA4 Conversions: ${data.ga4 || 0}\nCRM/Other: ${data.other || 0}`; break;
          case '5': formattedText = `Upcoming Campaigns:\n${(data.events || []).map((e: any) => `- ${e.date}: ${e.title}`).join('\n')}`; break;
          case '6': formattedText = `Strategy Canvas Factors:\n${(data.factors || []).map((f: any) => `- ${f.name} (You: ${f.you}%, Comp: ${f.comp}%)`).join('\n')}`; break;
          case '7': formattedText = `A/B Test Hypothesis:\n"If we change the ${data.variable || '[Variable]'} from '${data.control || '[Control]'}' to '${data.variant || '[Variant]'}', we expect to see an improvement."`; break;
          case '8': formattedText = `Campaign Brief:\nName: ${data.campaignName || 'Untitled'}\nTarget Audience: ${data.targetAudience || 'Not specified'}`; break;
          default: formattedText = JSON.stringify(data, null, 2);
        }
      }
      try {
        const { Share } = await import('@capacitor/share');
        await Share.share({ title: activeTool.title, text: formattedText, dialogTitle: 'Share Workbench Output' });
      } catch {
        navigator.clipboard.writeText(formattedText);
        alert('Copied to clipboard!');
      }
    };

    return (
      <div className="flex flex-col h-full bg-surface-base">
        {/* Tool header */}
        <header className="bg-surface-elevated border-b border-line px-4 py-3 flex items-center gap-3">
          <motion.button
            onClick={() => navigate('/workbenches')}
            whileTap={{ scale: 0.90 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="p-2 -ml-1 rounded-full hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <div className={`p-2 rounded-xl ${activeTool.bgColor} shrink-0`}>
            <Icon className={`w-5 h-5 ${activeTool.accentColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-title text-ink-primary truncate">{activeTool.title}</h2>
            <span className="text-caption text-ink-tertiary">{activeTool.phase} Workbench</span>
          </div>

          <motion.button
            onClick={handleShare}
            whileTap={{ scale: 0.90 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="p-2 rounded-full hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors focus:outline-none"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </header>

        {/* Tool content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero icon + description */}
          <div className="flex flex-col items-center pt-6 px-6 pb-4 text-center">
            <div className={`p-5 rounded-3xl ${activeTool.bgColor} mb-4`}>
              <Icon className={`w-10 h-10 ${activeTool.accentColor}`} strokeWidth={1.5} />
            </div>
            <p className="text-body text-ink-secondary max-w-xs">{activeTool.description}</p>
          </div>

          {/* Tool content card */}
          <div className="px-4 pb-28">
            <div className="bg-surface-elevated border border-line rounded-2xl p-5 shadow-surface">
              {renderContent(activeTool.id)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Grid view ─────────────────────────────────────────────────────
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show:   { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div className="p-4 pb-28">
      <div className="mb-5">
        <h2 className="text-heading text-ink-primary">Interactive Workbenches</h2>
        <p className="text-body text-ink-secondary mt-1">Tools and templates to complete your deliverables.</p>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          return (
            <motion.button
              key={tool.id}
              variants={item}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={() => navigate(`/workbenches/${tool.id}`)}
              className="bg-surface-elevated border border-line rounded-2xl p-4 flex flex-col items-start text-left shadow-surface hover:border-line/80 hover:-translate-y-px transition-all focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <div className={`p-3 rounded-xl ${tool.bgColor} mb-3`}>
                <Icon className={`w-5 h-5 ${tool.accentColor}`} />
              </div>
              <span className="text-micro text-ink-tertiary uppercase tracking-wider">{tool.phase}</span>
              <h3 className="text-body font-semibold text-ink-primary leading-tight mt-1">{tool.title}</h3>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
