// Small helpers shared by the workbench normalizers. Pure functions (no React, no browser APIs).

export const MAX_TEXT = 4000;
export const MAX_ITEMS = 50;

/** A string cut to `max` characters; anything that is not a string becomes ''. */
export const text = (value: unknown, max = MAX_TEXT): string => (typeof value === 'string' ? value.slice(0, max) : '');

/** An array cut to MAX_ITEMS entries; anything that is not an array becomes []. */
export const list = (value: unknown): unknown[] => (Array.isArray(value) ? value.slice(0, MAX_ITEMS) : []);

/** A stored id, or a stable fallback built from the prefix and position when it is missing. */
export const idOf = (value: unknown, prefix: string, index: number): string => {
  const id = text(value, 60);
  return id || `${prefix}${index + 1}`;
};

/** `value` when it is one of `allowed`, otherwise `fallback`. */
export const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => (
  typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
);

/** A whole number inside [min, max], or `fallback` for anything else. */
export const intIn = (value: unknown, min: number, max: number, fallback: number): number => (
  typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : fallback
);

/** A short unique id for a new list item. */
export function newId(now: number = Date.now(), random: number = Math.random()): string {
  return `${now.toString(36)}${Math.floor(random * 1e6).toString(36)}`;
}

export const sameList = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((item, i) => item === b[i]);
export const clean = (value: string) => value.trim();

/** Joins the parts that are strings with newlines; null, undefined and false are skipped. */
export const lines = (...parts: Array<string | null | undefined | false>): string => parts.filter((p): p is string => typeof p === 'string').join('\n');
