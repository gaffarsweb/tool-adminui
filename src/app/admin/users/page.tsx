'use client';

import { useState } from 'react';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Icon } from '@/components/icons/Icon';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { apiFetch } from '@/lib/api-client';
import { useList } from '@/lib/use-list';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  emailVerifiedAt: string | null;
  deactivatedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, refresh } = useList<User>('/users', {
    search: search || undefined,
    page,
    pageSize: 20,
  });
  const [deleting, setDeleting] = useState<User | null>(null);

  async function toggleAdmin(u: User) {
    await apiFetch(`/users/${u.id}`, {
      method: 'PATCH',
      body: { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' },
    });
    void refresh();
  }

  async function toggleDeactivated(u: User) {
    await apiFetch(`/users/${u.id}`, {
      method: 'PATCH',
      body: { deactivated: !u.deactivatedAt },
    });
    void refresh();
  }

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      render: (u) => (
        <div>
          <p className="font-semibold text-on-surface">{u.name}</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">{u.email}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.role === 'ADMIN' && <Badge tone="primary">Admin</Badge>}
          {u.emailVerifiedAt ? <Badge tone="tertiary">Verified</Badge> : <Badge>Unverified</Badge>}
          {u.deactivatedAt && <Badge tone="error">Disabled</Badge>}
        </div>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last login',
      render: (u) => (u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'),
    },
    {
      key: 'created',
      header: 'Joined',
      render: (u) => new Date(u.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '240px',
      render: (u) => (
        <div className="flex justify-end gap-space-xs">
          <Button size="sm" variant="ghost" onClick={() => toggleAdmin(u)}>
            {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toggleDeactivated(u)}>
            {u.deactivatedAt ? 'Activate' : 'Disable'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleting(u)}>
            <Icon name="delete" size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell title="Users" subtitle={`${data.total ?? 0} total`}>
      {error && (
        <div className="mb-space-md rounded-xl border border-error/30 bg-error-container/20 p-space-sm font-body-sm text-body-sm text-error">
          {error}
        </div>
      )}
      <div className="mb-space-md flex items-center gap-space-sm rounded-xl border border-outline-variant bg-surface-container-low pl-space-md focus-within:border-secondary">
        <Icon name="search" size={18} className="text-secondary" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email…"
          className="h-10 flex-1 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
        />
      </div>

      <DataTable
        columns={columns}
        rows={data.items}
        loading={loading}
        rowKey={(u) => u.id}
        empty="No users match."
        pagination={{
          page,
          pageSize: data.pageSize ?? 20,
          total: data.total ?? 0,
          onPageChange: setPage,
        }}
      />

      {deleting && (
        <ConfirmDialog
          open
          title={`Delete ${deleting.email}?`}
          message="This removes the account, sessions, favorites, and usage history. Not reversible."
          confirmLabel="Delete account"
          destructive
          onConfirm={async () => {
            await apiFetch(`/users/${deleting.id}`, { method: 'DELETE' });
            void refresh();
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </AdminPageShell>
  );
}
