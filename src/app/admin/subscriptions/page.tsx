'use client';

import { useState } from 'react';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/primitives/Badge';
import { Select } from '@/components/primitives/Select';
import { useList } from '@/lib/use-list';

type Status = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED' | 'TRIALING';

interface Subscription {
  id: string;
  tier: 'FREE' | 'PRO' | 'BUSINESS';
  status: Status;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  user: { email: string; name: string } | null;
  plan: { name: string; slug: string } | null;
  createdAt: string;
}

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Status | ''>('');
  const { data, loading } = useList<Subscription>('/subscriptions', {
    status: status || undefined,
    page,
    pageSize: 20,
  });

  const columns: Column<Subscription>[] = [
    {
      key: 'user',
      header: 'User',
      render: (s) => (
        <div>
          <p className="font-semibold text-on-surface">{s.user?.name ?? '—'}</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">{s.user?.email ?? ''}</p>
        </div>
      ),
    },
    { key: 'plan', header: 'Plan', render: (s) => s.plan?.name ?? '—' },
    { key: 'tier', header: 'Tier', render: (s) => <Badge tone="primary">{s.tier}</Badge> },
    { key: 'status', header: 'Status', render: (s) => <Badge tone={s.status === 'ACTIVE' ? 'tertiary' : 'neutral'}>{s.status}</Badge> },
    { key: 'cycle', header: 'Cycle', render: (s) => s.billingCycle },
    { key: 'ends', header: 'Period ends', render: (s) => new Date(s.currentPeriodEnd).toLocaleDateString() },
  ];

  return (
    <AdminPageShell title="Subscriptions" subtitle={`${data.total ?? 0} total · read-only`}>
      <div className="mb-space-md">
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value as Status | ''); setPage(1); }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'TRIALING', label: 'Trialing' },
            { value: 'PAUSED', label: 'Paused' },
            { value: 'CANCELLED', label: 'Cancelled' },
            { value: 'EXPIRED', label: 'Expired' },
          ]}
        />
      </div>
      <DataTable
        columns={columns}
        rows={data.items}
        loading={loading}
        rowKey={(s) => s.id}
        empty="No subscriptions yet. Phase 9 wires the checkout flow."
        pagination={{
          page,
          pageSize: data.pageSize ?? 20,
          total: data.total ?? 0,
          onPageChange: setPage,
        }}
      />
    </AdminPageShell>
  );
}
