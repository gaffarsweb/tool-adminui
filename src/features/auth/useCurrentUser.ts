'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiRequestError, apiFetch } from '@/lib/api-client';
import type { AuthUser } from './types';

interface State {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export function useCurrentUser() {
  const [state, setState] = useState<State>({ user: null, loading: true, error: null });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const { user } = await apiFetch<{ user: AuthUser }>('/auth/me');
      setState({ user, loading: false, error: null });
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        setState({ user: null, loading: false, error: null });
      } else {
        setState({
          user: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load user',
        });
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
