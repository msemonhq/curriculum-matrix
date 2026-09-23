import React, { useState } from 'react';
import { Network, Search, Table, Calculator, Calendar, GitCompare, TestTube, Presentation, ArrowLeft, Plus, Check, X } from 'lucide-react';

interface Tool {
  id: string;
  title: string;
  icon: React.ElementType;
  phase: string;
  color: string;
  description: string;
}

interface IssueTreeBuilderProps {
  issues: string[];
  setIssues: React.Dispatch<React.SetStateAction<string[]>>;
  newIssue: string;
  setNewIssue: React.Dispatch<React.SetStateAction<string>>;
}
const IssueTreeBuilder: React.FC<IssueTreeBuilderProps> = ({ issues, setIssues, newIssue, setNewIssue }) => {
  return (
    <div className="w-full max-w-md text-left">
      <h4 className="font-bold text-gray-800 mb-4">Core Issues</h4>
      <ul className="space-y-2 mb-4">
        {issues.map((issue, idx) => (
          <li key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-500" /> {issue}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={newIssue}
          onChange={(e) => setNewIssue(e.target.value)}
          placeholder="Add new issue..." 
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
        <button 
          onClick={() => { if(newIssue) { setIssues([...issues, newIssue]); setNewIssue(''); } }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Add
        </button>
      </div>
    </div>
  );
};

interface Log {
  id: number;
  text: string;
  status: string;
}
interface AIVerificationLogProps {
  logs: Log[];
  setLogs: React.Dispatch<React.SetStateAction<Log[]>>;
  newLog: string;
  setNewLog: React.Dispatch<React.SetStateAction<string>>;
}
const AIVerificationLog: React.FC<AIVerificationLogProps> = ({ logs, setLogs, newLog, setNewLog }) => {
  return (
    <div className="w-full max-w-md text-left">
      <h4 className="font-bold text-gray-800 mb-4">Recent Verifications</h4>
      <ul className="space-y-2 mb-4">
        {logs.map((log) => (
          <li key={log.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm flex items-center justify-between">
            <span className="text-gray-700">{log.text}</span>
            {log.status === 'pass' ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={newLog}
          onChange={(e) => setNewLog(e.target.value)}
          placeholder="Log item to verify..." 
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <button 
          onClick={() => { if(newLog) { setLogs([...logs, { id: Date.now(), text: newLog, status: 'pass' }]); setNewLog(''); } }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700"
        >
          Verify
        </button>
      </div>
    </div>
  );
};

const FormulaCheatSheet = () => {
  const formulas = [
    { name: 'ROI', formula: '(Revenue - Cost) / Cost × 100' },
    { name: 'CPA', formula: 'Total Cost / Total Conversions' },
    { name: 'ROAS', formula: 'Revenue / Ad Spend' },
  ];
  return (
    <div className="w-full max-w-md text-left">
      <h4 className="font-bold text-gray-800 mb-4">Marketing Formulas</h4>
      <div className="space-y-3">
        {formulas.map((f, i) => (
          <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-xs font-bold text-green-600 uppercase mb-1">{f.name}</div>
            <div className="font-mono text-sm text-gray-800">{f.formula}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface GA4DiscrepancyCalcProps {
  ga4: string;
  setGa4: React.Dispatch<React.SetStateAction<string>>;
  other: string;
  setOther: React.Dispatch<React.SetStateAction<string>>;
}
const GA4DiscrepancyCalc: React.FC<GA4DiscrepancyCalcProps> = ({ ga4, setGa4, other, setOther }) => {
  const diff = ga4 && other ? ((Number(ga4) - Number(other)) / Number(other) * 100).toFixed(2) : null;
  
  return (
    <div className="w-full max-w-md text-left">
      <h4 className="font-bold text-gray-800 mb-4">Discrepancy Calculator</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">GA4 Conversions</label>
          <input type="number" value={ga4} onChange={e => setGa4(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">CRM/Other System</label>
          <input type="number" value={other} onChange={e => setOther(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
        </div>
        {diff !== null && (
          <div className={`p-4 rounded-lg font-bold text-center ${Math.abs(Number(diff)) > 10 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            Discrepancy: {diff}%
          </div>
        )}
      </div>
    </div>
  );
};

interface Event {
  date: string;
  title: string;
}
interface DemandCalendarProps {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  isAdding: boolean;
  setIsAdding: React.Dispatch<React.SetStateAction<boolean>>;
  newDate: string;
  setNewDate: React.Dispatch<React.SetStateAction<string>>;
  newTitle: string;
  setNewTitle: React.Dispatch<React.SetStateAction<string>>;
}
const DemandCalendar: React.FC<DemandCalendarProps> = ({ events, setEvents, isAdding, setIsAdding, newDate, setNewDate, newTitle, setNewTitle }) => {
  const handleAdd = () => {
    if (newDate && newTitle) {
      setEvents([...events, { date: newDate, title: newTitle }]);
      setNewDate('');
      setNewTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full max-w-md text-left">
      <h4 className="font-bold text-gray-800 mb-4">Upcoming Campaigns</h4>
      <ul className="space-y-3 mb-4">
        {events.map((e, idx) => (
          <li key={idx} className="flex gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg items-center">
            <div className="font-bold text-red-600 text-sm shrink-0 w-12">{e.date}</div>
            <div className="text-sm font-semibold text-gray-800">{e.title}</div>
          </li>
        ))}
      </ul>
      {isAdding ? (
        <div className="flex gap-2 mb-4">
          <input type="text" placeholder="Date (e.g. Oct 15)" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-1/3 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-red-500" />
          <input type="text" placeholder="Campaign Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-red-500" />
          <button onClick={handleAdd} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-600">Add</button>
        </div>
      ) : (
        <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-sm font-semibold hover:bg-red-100">
          <Plus className="w-4 h-4" /> Add Campaign
        </button>
      )}
    </div>
  );
};

const StrategyCanvas = () => {
  return (
    <div className="w-full max-w-md text-left">
      <h4 className="font-bold text-gray-800 mb-4">Value Curve</h4>
      <div className="space-y-4">
        {['Price', 'Quality', 'Speed'].map((factor) => (
          <div key={factor}>
            <label className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
              <span>{factor}</span>
              <span className="text-indigo-600">You vs Competitor</span>
            </label>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
              <div className="h-full bg-indigo-500" style={{ width: '60%' }}></div>
              <div className="h-full bg-gray-400" style={{ width: '40%' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ABTestGeneratorProps {
  variable: string;
  setVariable: React.Dispatch<React.SetStateAction<string>>;
  control: string;
  setControl: React.Dispatch<React.SetStateAction<string>>;
  variant: string;
  setVariant: React.Dispatch<React.SetStateAction<string>>;
  hypothesis: string;
  setHypothesis: React.Dispatch<React.SetStateAction<string>>;
}
const ABTestGenerator: React.FC<ABTestGeneratorProps> = ({ variable, setVariable, control, setControl, variant, setVariant, hypothesis, setHypothesis }) => {
  const generateHypothesis = () => {
    if (variable && control && variant) {
      setHypothesis(`If we change the ${variable} from '${control}' to '${variant}', we expect to see an improvement in our primary metric because it better addresses user needs.`);
    }
  };

  return (
    <div className="w-full max-w-md text-left">
      <h4 className="font-bold text-gray-800 mb-4">Test Hypothesis</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Variable</label>
          <input type="text" value={variable} onChange={e => setVariable(e.target.value)} placeholder="e.g. CTA Button Color" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Control</label>
            <input type="text" value={control} onChange={e => setControl(e.target.value)} placeholder="Blue" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Variant</label>
            <input type="text" value={variant} onChange={e => setVariant(e.target.value)} placeholder="Green" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500" />
          </div>
        </div>
        <button onClick={generateHypothesis} className="w-full mt-2 bg-pink-600 text-white font-semibold py-2 rounded-lg text-sm hover:bg-pink-700">
          Generate Hypothesis
        </button>
        {hypothesis && (
          <div className="mt-4 p-4 bg-pink-50 text-pink-800 rounded-lg text-sm italic">
            "{hypothesis}"
          </div>
        )}
      </div>
    </div>
  );
};

interface BriefBuilderProps {
  campaignName: string;
  setCampaignName: React.Dispatch<React.SetStateAction<string>>;
  targetAudience: string;
  setTargetAudience: React.Dispatch<React.SetStateAction<string>>;
  isSaved: boolean;
  setIsSaved: React.Dispatch<React.SetStateAction<boolean>>;
}
const BriefBuilder: React.FC<BriefBuilderProps> = ({ campaignName, setCampaignName, targetAudience, setTargetAudience, isSaved, setIsSaved }) => {
  return (
    <div className="w-full max-w-md text-left">
      <h4 className="font-bold text-gray-800 mb-4">Campaign Brief</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Campaign Name</label>
          <input type="text" value={campaignName} onChange={e => { setCampaignName(e.target.value); setIsSaved(false); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Target Audience</label>
          <textarea rows={2} value={targetAudience} onChange={e => { setTargetAudience(e.target.value); setIsSaved(false); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500" />
        </div>
        <button onClick={() => setIsSaved(true)} className={`w-full mt-2 font-semibold py-2 rounded-lg text-sm transition-colors ${isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-teal-600 hover:bg-teal-700'} text-white`}>
          {isSaved ? 'Brief Saved!' : 'Save Brief'}
        </button>
      </div>
    </div>
  );
};


export default function WorkbenchesScreen() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  // Hoisted state for all tools
  const [issues, setIssues] = useState<string[]>(['Low Conversion Rate', 'High Bounce Rate']);
  const [newIssue, setNewIssue] = useState('');
  
  const [logs, setLogs] = useState<Log[]>([{ id: 1, text: 'Ad copy generation', status: 'pass' }]);
  const [newLog, setNewLog] = useState('');

  const [ga4, setGa4] = useState('');
  const [other, setOther] = useState('');
  
  const [events, setEvents] = useState<Event[]>([{ date: 'Oct 15', title: 'Q4 Webinar' }]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const [variable, setVariable] = useState('');
  const [control, setControl] = useState('');
  const [variant, setVariant] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  
  const [campaignName, setCampaignName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const tools: Tool[] = [
    { id: '1', title: 'Issue Tree Builder', icon: Network, phase: 'Phase 1', color: 'bg-blue-50 text-blue-600', description: 'Break down complex problems into smaller, manageable components.' },
    { id: '2', title: 'AI Verification Log', icon: Search, phase: 'Phase 2', color: 'bg-purple-50 text-purple-600', description: 'Log and verify AI outputs to ensure accuracy and compliance.' },
    { id: '3', title: 'Formula Cheat-sheet', icon: Table, phase: 'Phase 3', color: 'bg-green-50 text-green-600', description: 'Quick reference for commonly used formulas and calculations.' },
    { id: '4', title: 'GA4 Discrepancy Calc', icon: Calculator, phase: 'Phase 4', color: 'bg-orange-50 text-orange-600', description: 'Calculate and analyze data discrepancies in GA4.' },
    { id: '5', title: 'Demand Calendar', icon: Calendar, phase: 'Phase 5', color: 'bg-red-50 text-red-600', description: 'Plan and schedule demand generation activities over time.' },
    { id: '6', title: 'Strategy Canvas', icon: GitCompare, phase: 'Phase 6', color: 'bg-indigo-50 text-indigo-600', description: 'Visualize and compare strategic initiatives against competitors.' },
    { id: '7', title: 'A/B Test Generator', icon: TestTube, phase: 'Phase 7', color: 'bg-pink-50 text-pink-600', description: 'Design and generate parameters for A/B testing.' },
    { id: '8', title: 'Brief Builder', icon: Presentation, phase: 'Phase 8', color: 'bg-teal-50 text-teal-600', description: 'Create comprehensive briefs for campaigns and projects.' },
  ];

  const renderActiveToolContent = (toolId: string) => {
    switch (toolId) {
      case '1': return <IssueTreeBuilder issues={issues} setIssues={setIssues} newIssue={newIssue} setNewIssue={setNewIssue} />;
      case '2': return <AIVerificationLog logs={logs} setLogs={setLogs} newLog={newLog} setNewLog={setNewLog} />;
      case '3': return <FormulaCheatSheet />;
      case '4': return <GA4DiscrepancyCalc ga4={ga4} setGa4={setGa4} other={other} setOther={setOther} />;
      case '5': return <DemandCalendar events={events} setEvents={setEvents} isAdding={isAddingEvent} setIsAdding={setIsAddingEvent} newDate={newDate} setNewDate={setNewDate} newTitle={newTitle} setNewTitle={setNewTitle} />;
      case '6': return <StrategyCanvas />;
      case '7': return <ABTestGenerator variable={variable} setVariable={setVariable} control={control} setControl={setControl} variant={variant} setVariant={setVariant} hypothesis={hypothesis} setHypothesis={setHypothesis} />;
      case '8': return <BriefBuilder campaignName={campaignName} setCampaignName={setCampaignName} targetAudience={targetAudience} setTargetAudience={setTargetAudience} isSaved={isSaved} setIsSaved={setIsSaved} />;
      default: return null;
    }
  };

  if (activeTool) {
    const Icon = activeTool.icon;
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => setActiveTool(null)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className={`p-2 rounded-lg ${activeTool.color} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 leading-tight">{activeTool.title}</h2>
            <span className="text-xs text-gray-500">{activeTool.phase} Workbench</span>
          </div>
        </header>
        <div className="flex-1 p-6 flex flex-col items-center justify-start overflow-y-auto text-center">
          <div className={`p-6 rounded-full ${activeTool.color} mb-4 opacity-80 shrink-0`}>
            <Icon className="w-12 h-12" strokeWidth={1.5} />
          </div>
          <p className="text-gray-500 max-w-sm mb-8 text-sm">{activeTool.description}</p>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-md flex flex-col items-center">
            {renderActiveToolContent(activeTool.id)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Interactive Workbenches</h2>
        <p className="text-gray-500 mt-1 text-sm">Tools and templates to complete your deliverables.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-20">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <button 
              key={tool.id} 
              onClick={() => setActiveTool(tool)}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-start text-left shadow-sm active:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              <div className={`p-3 rounded-xl ${tool.color} mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-gray-400">{tool.phase}</span>
              <h3 className="font-bold text-gray-800 leading-tight mt-1 text-sm">{tool.title}</h3>
            </button>
          )
        })}
      </div>
    </div>
  );
}
