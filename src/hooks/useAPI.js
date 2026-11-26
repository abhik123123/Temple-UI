import { useCallback, useEffect, useRef, useState } from 'react';
import { timingsAPI } from '../services/api';

const SLOW_AFTER_MS = 5000;

/**
 * Generic data-fetching hook.
 *
 * @param {() => Promise<any>} fetcher  function returning the response body
 * @param {{ initialData?: any, enabled?: boolean }} [options]
 * @returns {{ data: any, loading: boolean, error: string|null, refetch: () => Promise<void> }}
 *
 * - Ignores results that arrive after unmount or after a newer request.
 * - `fetcher` should be stable (module-level function or useCallback).
 */
export function useAPI(fetcher, { initialData = [], enabled = true } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [slow, setSlow] = useState(false);
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!fetcher) return;
    const id = ++requestId.current;
    setLoading(true);
    try {
      const result = await fetcher();
      if (mounted.current && id === requestId.current) {
        setData(result ?? initialData);
        setError(null);
      }
    } catch (err) {
      if (mounted.current && id === requestId.current) {
        setError(err.message || 'Failed to load data');
      }
    } finally {
      if (mounted.current && id === requestId.current) {
        setLoading(false);
      }
    }
    // initialData is intentionally excluded: callers pass literals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  useEffect(() => {
    if (enabled) refetch();
  }, [enabled, refetch]);

  // After a few seconds of waiting, let the page explain that the server is waking up.
  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return undefined;
    }
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [loading]);

  return { data, loading, error, slow, refetch };
}

/** Weekly opening hours, ordered Monday → Sunday. */
export function useTempleTimings() {
  const { data, loading, error, slow, refetch } = useAPI(timingsAPI.getAll);
  return { timings: Array.isArray(data) ? data : [], loading, error, slow, refetch };
}

export default useAPI;
