import { useCallback, useMemo } from 'react';
import { useProgressStore } from '../hooks/useProgressStore';

/**
 * Reads one workbench tool's saved data as a typed, always-valid value, and saves changes.
 *
 * `normalize` must be a module-level function (a stable reference). It turns whatever is stored,
 * including nothing at all, into a complete value, so a fresh install is simply the empty value.
 * `update` is given the latest saved value, so two changes made in one event never overwrite each
 * other, and writes the whole result back.
 */
export function useToolSlice<T extends object>(toolId: string, normalize: (raw: unknown) => T) {
  const raw = useProgressStore((state) => state.workbench[toolId]);
  const setWorkbench = useProgressStore((state) => state.setWorkbench);
  const data = useMemo(() => normalize(raw), [raw, normalize]);
  const update = useCallback(
    (change: (current: T) => T) => {
      setWorkbench(toolId, change(normalize(useProgressStore.getState().workbench[toolId])));
    },
    [toolId, normalize, setWorkbench],
  );
  return [data, update] as const;
}
