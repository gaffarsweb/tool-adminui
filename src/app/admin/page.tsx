'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/surfaces/Card';
import { AdminTopbar } from '@/components/layout/AdminTopbar';
import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { logout } from '@/features/auth/auth-actions';

export default function AdminDashboard() {
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
    // middleware redirects the unauthenticated case; this catches
    // authenticated non-admin users who somehow reached /admin.
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
      <AdminTopbar title="Command Center" subtitle="Operator dashboard" />
      <main className="flex-1 p-space-lg">
        <div className="mb-space-lg">
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Welcome back
          </p>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{user.name}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{user.email}</p>
        </div>

        <div className="grid gap-space-lg md:grid-cols-4">
          <Card>
            <p className="mb-space-xs font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Total users
            </p>
            <p className="font-headline-md text-headline-md text-on-surface">— · Phase 7</p>
          </Card>
          <Card>
            <p className="mb-space-xs font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Active subscriptions
            </p>
            <p className="font-headline-md text-headline-md text-on-surface">— · Phase 9</p>
          </Card>
          <Card>
            <p className="mb-space-xs font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Published blog posts
            </p>
            <p className="font-headline-md text-headline-md text-on-surface">— · Phase 10</p>
          </Card>
          <Card>
            <p className="mb-space-xs font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Session
            </p>
            <Button
              variant="secondary"
              className="mt-space-sm"
              onClick={async () => {
                await logout();
                router.push('/login');
                router.refresh();
              }}
            >
              Sign out
            </Button>
          </Card>
        </div>
      </main>
    </>
  );
}
