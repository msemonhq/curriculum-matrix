import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ToolInput } from '../components/ToolInput';
import { daysUntil, parseYmd } from '../lib/dates';
import { MAX_ITEMS, newId } from '../lib/fields';
import { nextCalendarEntryId, normalizeCalendar, sortCalendar } from '../lib/workbench';
import type { CalendarEntry } from '../lib/workbench';
import { EmptyHint, Hint, RemoveButton, SectionHeading } from './ui';
import { useToolSlice } from './useToolSlice';

function whenText(days: number | null): string {
  if (days === null) return '';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

export default function DemandCalendar() {
  const [data, update] = useToolSlice('5', normalizeCalendar);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [dateError, setDateError] = useState('');
  const [titleError, setTitleError] = useState('');

  const now = new Date();
  const events = sortCalendar(data.events);
  const nextId = nextCalendarEntryId(data.events, now);

  const setEntry = (id: string, patch: Partial<CalendarEntry>) =>
    update((current) => ({ events: current.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    const nameOk = title.trim() !== '';
    const dateOk = parseYmd(date) !== null;
    setTitleError(nameOk ? '' : 'Enter a campaign or event name.');
    setDateError(dateOk ? '' : 'Choose a date.');
    if (!nameOk || !dateOk) return;
    update((current) => ({ events: [...current.events, { id: newId(), date, title: title.trim() }] }));
    setDate('');
    setTitle('');
  };

  return (
    <div className="w-full text-left">
      <SectionHeading>Demand calendar</SectionHeading>
      <Hint className="mb-4">List the dates that move demand for books in Bangladesh: festivals, exams, fairs, sales. The next one is highlighted.</Hint>

      <form onSubmit={handleAdd} className="space-y-3 mb-5" noValidate>
        <ToolInput id="calendar-new-date" label="Date" type="date" value={date} error={dateError || undefined} onChange={(e) => setDate(e.target.value)} />
        <ToolInput
          id="calendar-new-title"
          label="Event or campaign"
          value={title}
          maxLength={300}
          error={titleError || undefined}
          placeholder="e.g. Ekushey Book Fair opens"
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button type="submit" variant="secondary" fullWidth disabled={data.events.length >= MAX_ITEMS}>
          <Plus className="w-4 h-4" aria-hidden="true" /> Add to calendar
        </Button>
      </form>

      {events.length === 0 ? (
        <EmptyHint>Nothing on the calendar yet. Add the first date above.</EmptyHint>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => {
            const isNext = e.id === nextId;
            const days = daysUntil(e.date, now);
            const past = days !== null && days < 0;
            return (
              <li key={e.id} className={`p-3 border rounded-xl ${isNext ? 'bg-accent-dim border-accent/60' : 'bg-surface-subtle border-rule'} ${past ? 'opacity-70' : ''}`}>
                {(isNext || past || !e.date) && (
                  <div className="mb-2">
                    {isNext && <Badge variant="accent">Next · {whenText(days)}</Badge>}
                    {past && <Badge>Past</Badge>}
                    {!e.date && <Badge variant="danger">Set a date</Badge>}
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0 space-y-2">
                    <ToolInput id={`calendar-${e.id}-date`} aria-label={`Date for ${e.title || 'event'}`} type="date" value={e.date} onChange={(ev) => setEntry(e.id, { date: ev.target.value })} />
                    <ToolInput id={`calendar-${e.id}-title`} aria-label="Event name" value={e.title} maxLength={300} onChange={(ev) => setEntry(e.id, { title: ev.target.value })} />
                  </div>
                  <RemoveButton label={`Delete ${e.title || 'event'}`} needsConfirm={Boolean(e.title.trim())} onRemove={() => update((current) => ({ events: current.events.filter((x) => x.id !== e.id) }))} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
