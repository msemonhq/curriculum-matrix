import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell } from 'lucide-react';
import { Button } from './Button';
import { Sheet } from './Sheet';
import { useProgressStore } from '../hooks/useProgressStore';
import { useToast } from '../hooks/useToast';
import { asCalendarEvents, inDaysAtNine, nextEvent, reminderTimeOn, toYmd } from '../lib/dates';
import { cancelReminder, scheduleReminder } from '../services/reminders';

const formatWhen = (value: Date | string) => new Intl.DateTimeFormat(undefined, {
  weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
}).format(typeof value === 'string' ? new Date(value) : value);

interface ReminderControlProps {
  phaseId: string;
  phaseTitle: string;
}

/** Shows a phase's reminder with Change and Cancel, or lets the learner set one. */
export function ReminderControl({ phaseId, phaseTitle }: ReminderControlProps) {
  const reminder = useProgressStore((s) => s.reminders[phaseId]);
  const setReminder = useProgressStore((s) => s.setReminder);
  const calendar = useProgressStore((s) => s.workbench['5']?.events);
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);

  // A reminder whose time has passed has already fired, so it is no longer "set".
  const active = reminder && new Date(reminder.at).getTime() > Date.now() ? reminder : null;
  const upcomingEvent = open ? nextEvent(asCalendarEvents(calendar), new Date()) : null;

  const set = async (at: Date, label: string) => {
    setBusy(true);
    const result = await scheduleReminder(phaseId, phaseTitle, at);
    setBusy(false);
    if (!result.ok) {
      showToast(result.message, result.reason === 'browser' ? 'info' : 'danger');
      return;
    }
    setReminder(phaseId, { at: at.toISOString(), label });
    setOpen(false);
    setDate('');
    showToast(`Reminder set for ${formatWhen(at)}.`, 'success');
  };

  const cancel = async () => {
    setBusy(true);
    const result = await cancelReminder(phaseId);
    setBusy(false);
    if (!result.ok) {
      showToast(result.message, 'danger');
      return;
    }
    setReminder(phaseId, null);
    showToast('Reminder cancelled.', 'success');
  };

  const pickedAt = reminderTimeOn(date);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 text-meta text-ink-secondary font-semibold">
        <Bell className="w-3.5 h-3.5" aria-hidden="true" /> Reminder
      </div>
      {active ? (
        <>
          <p className="mt-1 text-body text-ink-primary">
            {formatWhen(active.at)}
            {active.label && <span className="text-ink-tertiary"> · {active.label}</span>}
          </p>
          <div className="mt-2 flex gap-2">
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(true)}>Change</Button>
            <Button variant="text" disabled={busy} onClick={cancel}>Cancel reminder</Button>
          </div>
        </>
      ) : (
        <Button variant="text" fullWidth className="mt-1 gap-2 text-meta" onClick={() => setOpen(true)}>
          Set a reminder
        </Button>
      )}

      {/* Portal: the sheet is position:fixed and must not be clipped by the expanding phase card. */}
      {createPortal(
      <Sheet isOpen={open} onClose={() => setOpen(false)} title="Remind me">
        <div className="space-y-3">
          <Button variant="secondary" fullWidth disabled={busy} onClick={() => set(inDaysAtNine(new Date(), 1), 'Tomorrow')}>
            Tomorrow, 9:00
          </Button>
          <Button variant="secondary" fullWidth disabled={busy} onClick={() => set(inDaysAtNine(new Date(), 3), 'In 3 days')}>
            In 3 days, 9:00
          </Button>
          {upcomingEvent && (
            <Button variant="secondary" fullWidth disabled={busy} onClick={() => set(upcomingEvent.at, upcomingEvent.title || 'Demand Calendar')}>
              Next campaign: {upcomingEvent.title || 'Untitled'}, {formatWhen(upcomingEvent.at)}
            </Button>
          )}
          <div>
            <label htmlFor={`reminder-date-${phaseId}`} className="block text-meta text-ink-secondary mb-1.5 font-medium">
              Or pick a date (reminds at 9:00)
            </label>
            <div className="flex gap-2">
              <input
                id={`reminder-date-${phaseId}`}
                type="date"
                min={toYmd(new Date())}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-11 w-full bg-surface-subtle border border-edge rounded-xl px-3 py-2.5 text-body text-ink-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
              <Button disabled={busy || !pickedAt} onClick={() => pickedAt && set(pickedAt, 'Custom date')}>Set</Button>
            </div>
          </div>
        </div>
      </Sheet>,
      document.body,
      )}
    </div>
  );
}
