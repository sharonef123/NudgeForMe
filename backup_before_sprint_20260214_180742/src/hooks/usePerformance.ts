import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounce hook - delays execution until after delay ms have passed
 */
export const useDebounce = <T,>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook - limits execution to once per delay ms
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T => {
  const lastRan = useRef(Date.now());

  return useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
};

/**
 * Idle callback hook - executes when browser is idle
 */
export const useIdleCallback = (callback: () => void, dependencies: any[] = []) => {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => {
        callback();
      });

      return () => {
        cancelIdleCallback(handle);
      };
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeout = setTimeout(callback, 1);
      return () => clearTimeout(timeout);
    }
  }, dependencies);
};

/**
 * Memoized callback that persists across renders
 */
export const useEventCallback = <T extends (...args: any[]) => any>(fn: T): T => {
  const ref = useRef<T>(fn);

  useEffect(() => {
    ref.current = fn;
  });

  return useCallback(((...args: any[]) => ref.current(...args)) as T, []);
};

/**
 * Hook to detect slow network connection
 */
export const useNetworkStatus = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

    if (connection) {
      const updateConnection = () => {
        setConnectionType(connection.effectiveType || 'unknown');
        setIsSlowConnection(['slow-2g', '2g'].includes(connection.effectiveType));
      };

      updateConnection();
      connection.addEventListener('change', updateConnection);

      return () => {
        connection.removeEventListener('change', updateConnection);
      };
    }
  }, []);

  return { isSlowConnection, connectionType };
};

/**
 * Hook to measure component render time
 */
export const useRenderTime = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (import.meta.env.DEV) {
      console.log(
        `[${componentName}] Render #${renderCount.current}: ${renderTime.toFixed(2)}ms`
      );
    }

    startTime.current = performance.now();
  });
};

/**
 * Hook for optimistic updates
 */
export const useOptimisticUpdate = <T,>(
  initialData: T,
  updateFn: (data: T) => Promise<T>
) => {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (optimisticData: T) => {
      const previousData = data;
      setData(optimisticData);
      setIsUpdating(true);
      setError(null);

      try {
        const result = await updateFn(optimisticData);
        setData(result);
      } catch (err) {
        setData(previousData);
        setError(err as Error);
      } finally {
        setIsUpdating(false);
      }
    },
    [data, updateFn]
  );

  return { data, isUpdating, error, update };
};