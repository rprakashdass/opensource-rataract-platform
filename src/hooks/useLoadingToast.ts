import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useLoadingToast(isLoading: boolean, message: string = "Loading...") {
  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (isLoading) {
      toastIdRef.current = toast.loading(message);
    } else {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    }
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, [isLoading, message]);
}
