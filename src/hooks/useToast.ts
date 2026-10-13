import { createContext, useContext } from 'react';
import type { ToastTone } from '../components/Toast';

export interface ToastApi {
  showToast: (message: string, tone?: ToastTone) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

/** Shows a toast through the app-level ToastProvider (one toast at a time, newest wins). */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>');
  return api;
}
