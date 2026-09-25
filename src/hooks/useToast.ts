import { useCallback, useState } from 'react';
import type { ToastTone } from '../components/Toast';

export function useToast() {
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    setToast({ message, tone });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return { toast, showToast, dismissToast };
}
