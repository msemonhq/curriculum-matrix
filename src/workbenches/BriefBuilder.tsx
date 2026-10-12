import { Check } from 'lucide-react';
import { Select } from '../components/Select';
import { ToolInput } from '../components/ToolInput';
import { ToolTextArea } from '../components/ToolTextArea';
import { normalizeBrief } from '../lib/workbench';
import type { BriefData, Confidence } from '../lib/workbench';
import { Hint, SectionHeading } from './ui';
import { useToolSlice } from './useToolSlice';

const CONFIDENCE_OPTIONS: ReadonlyArray<{ value: Confidence; label: string }> = [
  { value: '', label: 'Not stated' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function BriefBuilder() {
  const [data, update] = useToolSlice('8', normalizeBrief);

  // Every change is written to storage as it happens, so the saved time is the time of the last edit.
  const change = (patch: Partial<BriefData>) => update((current) => ({ ...current, ...patch, savedAt: new Date().toISOString() }));
  const setFinding = (index: number, value: string) =>
    update((current) => ({
      ...current,
      findings: current.findings.map((f, i) => (i === index ? value : f)),
      savedAt: new Date().toISOString(),
    }));

  const savedAt = data.savedAt ? new Date(data.savedAt) : null;

  return (
    <div className="w-full text-left">
      <SectionHeading>Leadership brief</SectionHeading>
      <Hint className="mb-4">One page. Lead with the answer, back it with three findings, then say what you need decided and how sure you are.</Hint>

      <div className="space-y-4">
        <ToolInput id="brief-title" label="Title" value={data.title} maxLength={300} placeholder="e.g. Where to put the Eid campaign budget" onChange={(e) => change({ title: e.target.value })} />
        <ToolInput id="brief-audience" label="Audience" value={data.audience} maxLength={1000} placeholder="e.g. Head of Marketing and the CEO" onChange={(e) => change({ audience: e.target.value })} />
        <ToolTextArea id="brief-answer" label="Answer first" rows={3} value={data.answerFirst} maxLength={4000} placeholder="The one or two sentences a busy reader should remember." onChange={(e) => change({ answerFirst: e.target.value })} />
        {data.findings.map((finding, i) => (
          <ToolTextArea
            key={i}
            id={`brief-finding-${i + 1}`}
            label={`Finding ${i + 1}`}
            rows={3}
            value={finding}
            maxLength={1000}
            placeholder="A finding with the number or evidence behind it."
            onChange={(e) => setFinding(i, e.target.value)}
          />
        ))}
        <ToolTextArea id="brief-decision" label="Decision requested" rows={2} value={data.decisionRequested} maxLength={4000} placeholder="What you need the reader to approve, and by when." onChange={(e) => change({ decisionRequested: e.target.value })} />
        <Select id="brief-confidence" label="Confidence in the answer" value={data.confidence} onChange={(e) => change({ confidence: e.target.value as Confidence })}>
          {CONFIDENCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
      </div>

      <p role="status" className="mt-5 flex items-center gap-1.5 text-caption text-ink-secondary">
        {savedAt ? (
          <>
            <Check className="w-4 h-4 text-success" aria-hidden="true" />
            Saved on this device · {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </>
        ) : (
          'Changes are saved on this device as you type.'
        )}
      </p>
    </div>
  );
}
