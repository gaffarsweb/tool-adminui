'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from './api-client';

export interface ListResult<T> {
  items: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

/** Fetches a list endpoint and tracks loading / error / refresh state. */
export function useList<T>(path: string, query?: Record<string, string | number | boolean | undefined>) {
  const [data, setData] = useState<ListResult<T>>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = JSON.stringify(query);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<ListResult<T>>(path, { query });
      setData(res);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, queryKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh, setData };
}
