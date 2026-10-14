import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Upload } from 'lucide-react';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { TextArea } from './TextArea';
import curriculumData from '../data/curriculumData.json';
import { useProgressStore } from '../hooks/useProgressStore';
import { BACKUP_KEY } from '../lib/migrations';
import { MAX_BACKUP_CHARS, parseBackup, pickProgressData, summarize } from '../lib/sanitize';
import type { BackupSummary, ParsedBackup } from '../lib/sanitize';

const PHASE_IDS = curriculumData.phases.map((phase) => phase.id);

const ROWS: Array<{ key: keyof BackupSummary; label: string }> = [
  { key: 'phasesCompleted', label: 'Phases completed' },
  { key: 'phasesInProgress', label: 'Phases in progress' },
  { key: 'modulesChecked', label: 'Modules checked' },
  { key: 'deliverablesDone', label: 'Deliverables done' },
  { key: 'hoursLogged', label: 'Hours logged' },
  { key: 'notes', label: 'Notes' },
  { key: 'workbenchPhases', label: 'Tools with data' },
];

function readSnapshot(): string | null {
  try {
    return localStorage.getItem(BACKUP_KEY);
  } catch {
    return null;
  }
}

interface ImportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

type Review = Extract<ParsedBackup, { ok: true }> & { current: BackupSummary };

export function ImportSheet({ isOpen, onClose, onImported }: ImportSheetProps) {
  const importProgress = useProgressStore((s) => s.importProgress);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [review, setReview] = useState<Review | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setText('');
    setError('');
    setReview(null);
    setSnapshot(readSnapshot());
  }, [isOpen]);

  const runReview = (source: string) => {
    const result = parseBackup(source, PHASE_IDS);
    if (!result.ok) {
      setError(result.error);
      setReview(null);
      return;
    }
    setError('');
    setReview({ ...result, current: summarize(pickProgressData(useProgressStore.getState())) });
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_BACKUP_CHARS * 4) {
      setError('This file is too large to be a backup.');
      return;
    }
    try {
      const contents = await file.text();
      setText(contents);
      runReview(contents);
    } catch {
      setError('That file could not be read.');
    }
  };

  const handleConfirm = () => {
    if (!review) return;
    importProgress(review.state);
    onImported();
  };

  const reviewBody = review && (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-dim p-3 text-meta text-warning">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>Importing replaces everything saved on this device. Check the numbers below first.</p>
      </div>
      <table className="w-full text-body">
        <thead>
          <tr className="text-meta text-ink-secondary">
            <th scope="col" className="py-1 text-left font-medium">Item</th>
            <th scope="col" className="py-1 text-right font-medium">Backup</th>
            <th scope="col" className="py-1 text-right font-medium">Now</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ key, label }) => (
            <tr key={key} className="border-t border-rule">
              <th scope="row" className="py-2 text-left font-normal text-ink-primary">{label}</th>
              <td className="tabular py-2 text-right text-ink-primary">{review.summary[key]}</td>
              <td className="tabular py-2 text-right text-ink-secondary">{review.current[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {review.sourceVersion < 1 && (
        <p className="text-meta text-ink-secondary">
          This backup is from an older version. Module checkmarks were matched to the updated curriculum.
        </p>
      )}
      <div className="flex gap-3">
        <Button variant="ghost" fullWidth onClick={() => setReview(null)}>Back</Button>
        <Button variant="danger" fullWidth onClick={handleConfirm}>Replace my progress</Button>
      </div>
    </div>
  );

  const inputBody = (
    <div className="space-y-4">
      <p className="text-meta text-ink-secondary">Choose a backup file, or paste the backup text below.</p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt,application/json,text/plain"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleFile}
      />
      <Button variant="secondary" fullWidth onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-4 w-4" aria-hidden="true" /> Choose backup file
      </Button>
      <TextArea
        label="Or paste backup text"
        id="import-text"
        rows={5}
        placeholder="Paste JSON here..."
        value={text}
        onChange={(e) => { setText(e.target.value); setError(''); }}
      />
      {snapshot && (
        <button
          type="button"
          onClick={() => { setText(snapshot); runReview(snapshot); }}
          className="min-h-11 w-full text-left text-meta text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
        >
          Use the snapshot saved automatically before the 4.0 update
        </button>
      )}
      {error && <p role="alert" className="text-meta text-danger">{error}</p>}
      <div className="flex gap-3">
        <Button variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
        <Button fullWidth onClick={() => runReview(text)}>Review</Button>
      </div>
    </div>
  );

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={review ? 'Review import' : 'Import progress'}>
      {review ? reviewBody : inputBody}
    </Sheet>
  );
}
