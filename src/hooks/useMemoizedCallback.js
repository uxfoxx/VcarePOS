import { useCallback, useRef } from 'react';

export function useMemoizedCallback(callback, deps) {
  const ref = useRef();
  
  return useCallback((...args) => {
    if (!ref.current) {
      ref.current = callback;
    }
    return ref.current(...args);
  }, deps);
}

export function useThrottledCallback(callback, delay) {
  const lastRun = useRef(Date.now());
  
  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
}