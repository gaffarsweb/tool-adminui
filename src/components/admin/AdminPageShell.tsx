'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AdminTopbar } from '@/components/layout/AdminTopbar';
import { Button } from '@/components/primitives/Button';
import { logout } from '@/features/auth/auth-actions';
import { useCurrentUser } from '@/features/auth/useCurrentUser';

export interface AdminPageShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminPageShell({ title, subtitle, actions, children }: AdminPageShellProps) {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-surface">
        <p className="font-body-md text-body-md text-on-surface-variant">Authenticating…</p>
      </main>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-space-md bg-surface">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Access denied. This console requires role=ADMIN.
        </p>
        <Button
          variant="secondary"
          onClick={async () => {
            await logout();
            router.push('/login');
          }}
        >
          Sign out
        </Button>
      </main>
    );
  }

  return (
    <>
      <AdminTopbar title={title} subtitle={subtitle} />
      <main className="flex-1 p-space-lg">
        {actions && <div className="mb-space-lg flex items-center justify-end gap-space-sm">{actions}</div>}
        {children}
      </main>
    </>
  );
}
