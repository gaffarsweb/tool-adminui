'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/surfaces/Card';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { Icon, type IconName } from '@/components/icons/Icon';
import { apiFetch } from '@/lib/api-client';

interface DashboardKpis {
  totals: {
    users: number;
    tools: number;
    categories: number;
    blogPosts: number;
    activeSubscriptions: number;
    newContactMessages: number;
    toolRunsLast30d: number;
  };
  topTools: { slug: string; name: string; runs: number }[];
}

const CARDS: { key: keyof DashboardKpis['totals']; label: string; icon: IconName; tone: string }[] = [
  { key: 'users', label: 'Total users', icon: 'users', tone: 'bg-primary/15 text-primary' },
  { key: 'tools', label: 'Tools', icon: 'terminal', tone: 'bg-secondary/15 text-secondary' },
  { key: 'categories', label: 'Categories', icon: 'category', tone: 'bg-tertiary/15 text-tertiary' },
  { key: 'blogPosts', label: 'Published posts', icon: 'newspaper', tone: 'bg-primary/15 text-primary' },
  { key: 'activeSubscriptions', label: 'Active subs', icon: 'credit_card', tone: 'bg-secondary/15 text-secondary' },
  { key: 'newContactMessages', label: 'New messages', icon: 'mail', tone: 'bg-tertiary/15 text-tertiary' },
  { key: 'toolRunsLast30d', label: 'Runs · 30d', icon: 'speed', tone: 'bg-primary/15 text-primary' },
];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardKpis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<{ item: DashboardKpis }>('/admin/dashboard');
        setData(res.item);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load dashboard');
      }
    })();
  }, []);

  return (
    <AdminPageShell title="Command Center" subtitle="Operator dashboard">
      {error && (
        <div className="mb-space-md rounded-xl border border-error/30 bg-error-container/20 p-space-md font-body-sm text-body-sm text-error">
          {error} · Phase 4 seed + DB required for live stats.
        </div>
      )}

      <div className="grid gap-space-md sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {CARDS.map((c) => (
          <Card key={c.key}>
            <span className={`mb-space-sm inline-flex rounded-lg p-2 ${c.tone}`}>
              <Icon name={c.icon} size={18} />
            </span>
            <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              {c.label}
            </p>
            <p className="font-headline-md text-headline-md font-bold text-on-surface">
              {data ? data.totals[c.key].toLocaleString() : '—'}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-space-xl grid gap-space-lg lg:grid-cols-2">
        <Card>
          <h2 className="mb-space-md font-headline-md text-headline-md text-on-surface">Top tools</h2>
          {!data || data.topTools.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant">
              No usage data yet. Logs land as users run tools.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-outline-variant/30">
              {data.topTools.map((t) => (
                <li key={t.slug} className="flex items-center justify-between py-space-sm">
                  <span className="font-body-md text-body-md text-on-surface">{t.name}</span>
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    {t.runs.toLocaleString()} runs
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="mb-space-md font-headline-md text-headline-md text-on-surface">Jump to</h2>
          <div className="grid grid-cols-2 gap-space-sm">
            {[
              { href: '/admin/tools', label: 'Manage tools', icon: 'terminal' as const },
              { href: '/admin/categories', label: 'Categories', icon: 'category' as const },
              { href: '/admin/users', label: 'Users', icon: 'users' as const },
              { href: '/admin/blog', label: 'Blog', icon: 'newspaper' as const },
              { href: '/admin/plans', label: 'Plans', icon: 'tag' as const },
              { href: '/admin/settings', label: 'Settings', icon: 'settings' as const },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-space-sm rounded-xl border border-white/[0.09] bg-surface-container-low px-space-md py-space-sm font-label-lg text-label-lg text-on-surface transition-colors hover:border-secondary/40"
              >
                <Icon name={l.icon} size={18} />
                {l.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </AdminPageShell>
  );
}
