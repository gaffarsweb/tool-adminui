'use client';

import { apiFetch } from '@/lib/api-client';
import type { AuthUser } from './types';

export async function login(email: string, password: string): Promise<AuthUser> {
  const { user } = await apiFetch<{ user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  return user;
}

export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' });
}

export async function getMe(): Promise<AuthUser | null> {
  try {
    const { user } = await apiFetch<{ user: AuthUser }>('/auth/me');
    return user;
  } catch {
    return null;
  }
}
