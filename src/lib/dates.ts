// Calendar-date helpers. Pure functions (no React, no browser APIs); every "now" is passed in so
// tests are deterministic. Dates are handled as local calendar days, written YYYY-MM-DD.

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];
const pad = (n: number) => String(n).padStart(2, '0');

export const REMINDER_HOUR = 9;

export function isValidYmd(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export function formatYmd(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;
}

/** Local calendar day of a Date as YYYY-MM-DD. */
export function toYmd(date: Date): string {
  return formatYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function parseYmd(text: unknown): { year: number; month: number; day: number } | null {
  if (typeof text !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  return isValidYmd(year, month, day) ? { year, month, day } : null;
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Month number 1-12 for "oct", "sept" or "October"; 0 when the word is not a month. */
function monthNumber(word: string): number {
  const w = word.toLowerCase();
  const index = MONTH_NAMES.findIndex((name) => w === name || w === name.slice(0, 3) || (w === 'sept' && name === 'september'));
  return index + 1;
}

/**
 * Turns free text such as "Oct 15", "October 15th", "15 Oct" or "Oct 15, 2027" into YYYY-MM-DD.
 * Without a year, the next occurrence on or after today is used. Returns '' when it can't be read.
 */
export function looseDateToYmd(text: unknown, now: Date): string {
  if (typeof text !== 'string') return '';
  const value = text.trim();
  if (!value) return '';
  const iso = parseYmd(value);
  if (iso) return formatYmd(iso.year, iso.month, iso.day);

  const monthFirst = /^([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?$/.exec(value);
  const dayFirst = /^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?(?:,?\s+(\d{4}))?$/.exec(value);
  const parts = monthFirst
    ? { name: monthFirst[1], day: Number(monthFirst[2]), year: monthFirst[3] }
    : dayFirst
      ? { name: dayFirst[2], day: Number(dayFirst[1]), year: dayFirst[3] }
      : null;
  if (!parts) return '';
  const month = monthNumber(parts.name);
  if (month === 0) return '';

  if (parts.year) {
    const year = Number(parts.year);
    return isValidYmd(year, month, parts.day) ? formatYmd(year, month, parts.day) : '';
  }
  const today = startOfDay(now).getTime();
  for (let year = now.getFullYear(); year <= now.getFullYear() + 8; year += 1) {
    if (isValidYmd(year, month, parts.day) && new Date(year, month - 1, parts.day).getTime() >= today) {
      return formatYmd(year, month, parts.day);
    }
  }
  return '';
}

/** 09:00 local time on a YYYY-MM-DD day, or null for an invalid day. */
export function reminderTimeOn(ymd: string): Date | null {
  const parts = parseYmd(ymd);
  return parts ? new Date(parts.year, parts.month - 1, parts.day, REMINDER_HOUR, 0, 0, 0) : null;
}

/** 09:00 local time, `days` calendar days after today. */
export function inDaysAtNine(now: Date, days: number): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, REMINDER_HOUR, 0, 0, 0);
}

export interface CalendarEvent {
  date: string;
  title: string;
}

/** The soonest event whose 09:00 reminder time is still in the future. */
export function nextEvent(events: readonly CalendarEvent[], now: Date): (CalendarEvent & { at: Date }) | null {
  let best: (CalendarEvent & { at: Date }) | null = null;
  for (const event of events) {
    const at = reminderTimeOn(event.date);
    if (!at || at.getTime() <= now.getTime()) continue;
    if (!best || at.getTime() < best.at.getTime()) best = { ...event, at };
  }
  return best;
}
