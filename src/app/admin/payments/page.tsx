'use client';

import { useState } from 'react';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/primitives/Badge';
import { Select } from '@/components/primitives/Select';
import { useList } from '@/lib/use-list';

type Status = 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED';

interface Payment {
  id: string;
  provider: 'RAZORPAY' | 'STRIPE';
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: Status;
  method: string | null;
  createdAt: string;
  user: { email: string; name: string } | null;
}

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Status | ''>('');
  const { data, loading } = useList<Payment>('/payments', {
    status: status || undefined,
    page,
    pageSize: 20,
  });

  const columns: Column<Payment>[] = [
    {
      key: 'provider',
      header: 'Provider',
      render: (p) => (
        <div>
          <p className="font-semibold text-on-surface">{p.provider}</p>
          <p className="font-mono text-label-sm text-on-surface-variant">{p.providerPaymentId}</p>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (p) => p.user?.email ?? '—',
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (p) => `${p.currency} ${p.amount.toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <Badge tone={p.status === 'CAPTURED' ? 'tertiary' : p.status === 'FAILED' ? 'error' : 'neutral'}>
          {p.status}
        </Badge>
      ),
    },
    { key: 'method', header: 'Method', render: (p) => p.method ?? '—' },
    { key: 'when', header: 'When', render: (p) => new Date(p.createdAt).toLocaleString() },
  ];

  return (
    <AdminPageShell title="Payments" subtitle={`${data.total ?? 0} total · read-only ledger`}>
      <div className="mb-space-md">
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value as Status | ''); setPage(1); }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'CAPTURED', label: 'Captured' },
            { value: 'FAILED', label: 'Failed' },
            { value: 'REFUNDED', label: 'Refunded' },
          ]}
        />
      </div>
      <DataTable
        columns={columns}
        rows={data.items}
        loading={loading}
        rowKey={(p) => p.id}
        empty="No payments yet. Phase 9 wires the webhook."
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
