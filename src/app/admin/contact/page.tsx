'use client';

import { useState } from 'react';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { Icon } from '@/components/icons/Icon';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Select } from '@/components/primitives/Select';
import { apiFetch } from '@/lib/api-client';
import { useList } from '@/lib/use-list';

type Status = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'SPAM';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: Status;
  createdAt: string;
}

const STATUS_TONE: Record<Status, 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral'> = {
  NEW: 'primary',
  IN_PROGRESS: 'secondary',
  RESOLVED: 'tertiary',
  SPAM: 'error',
};

export default function AdminContactPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Status | ''>('');
  const { data, loading, refresh } = useList<ContactMessage>('/contact', {
    status: status || undefined,
    page,
    pageSize: 20,
  });
  const [viewing, setViewing] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);

  async function updateStatus(id: string, next: Status) {
    await apiFetch(`/contact/${id}`, { method: 'PATCH', body: { status: next } });
    void refresh();
    setViewing((v) => (v && v.id === id ? { ...v, status: next } : v));
  }

  const columns: Column<ContactMessage>[] = [
    {
      key: 'sender',
      header: 'From',
      render: (m) => (
        <div>
          <p className="font-semibold text-on-surface">{m.name}</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">{m.email}</p>
        </div>
      ),
    },
    { key: 'subject', header: 'Subject', render: (m) => m.subject ?? <span className="text-on-surface-variant">(none)</span> },
    { key: 'status', header: 'Status', render: (m) => <Badge tone={STATUS_TONE[m.status]}>{m.status}</Badge> },
    { key: 'received', header: 'Received', render: (m) => new Date(m.createdAt).toLocaleString() },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '160px',
      render: (m) => (
        <div className="flex justify-end gap-space-xs">
          <Button size="sm" variant="ghost" onClick={() => setViewing(m)}>View</Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleting(m)}>
            <Icon name="delete" size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell title="Contact messages" subtitle={`${data.total ?? 0} total`}>
      <div className="mb-space-md">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as Status | '');
            setPage(1);
          }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'NEW', label: 'New' },
            { value: 'IN_PROGRESS', label: 'In progress' },
            { value: 'RESOLVED', label: 'Resolved' },
            { value: 'SPAM', label: 'Spam' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data.items}
        loading={loading}
        rowKey={(m) => m.id}
        empty="Inbox is empty."
        pagination={{
          page,
          pageSize: data.pageSize ?? 20,
          total: data.total ?? 0,
          onPageChange: setPage,
        }}
      />

      {viewing && (
        <Modal open onClose={() => setViewing(null)} title={viewing.subject ?? '(no subject)'} subtitle={`${viewing.name} · ${viewing.email}`} width="lg">
          <p className="mb-space-md font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Received {new Date(viewing.createdAt).toLocaleString()}
          </p>
          <p className="mb-space-lg whitespace-pre-wrap font-body-md text-body-md text-on-surface">{viewing.message}</p>
          <div className="flex items-center gap-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Status:</span>
            {(['NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM'] as Status[]).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={viewing.status === s ? 'primary' : 'ghost'}
                onClick={() => updateStatus(viewing.id, s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          open
          title="Delete message?"
          message="This permanently removes the message from the inbox."
          destructive
          confirmLabel="Delete"
          onConfirm={async () => {
            await apiFetch(`/contact/${deleting.id}`, { method: 'DELETE' });
            void refresh();
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </AdminPageShell>
  );
}
