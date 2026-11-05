'use client';

import { useState, type FormEvent } from 'react';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { Icon } from '@/components/icons/Icon';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { ApiRequestError, apiFetch } from '@/lib/api-client';
import { useList } from '@/lib/use-list';

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  orderIndex: number;
  seoTitle: string | null;
  seoDescription: string | null;
}

const EMPTY: Category = {
  id: '',
  slug: '',
  name: '',
  description: '',
  icon: 'category',
  color: 'primary',
  orderIndex: 0,
  seoTitle: null,
  seoDescription: null,
};

export default function AdminCategoriesPage() {
  const { data, loading, error, refresh } = useList<Category>('/categories');
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const columns: Column<Category>[] = [
    { key: 'name', header: 'Name', render: (r) => <span className="font-semibold">{r.name}</span> },
    { key: 'slug', header: 'Slug', render: (r) => <code className="font-mono text-body-sm text-on-surface-variant">{r.slug}</code> },
    { key: 'color', header: 'Tone', render: (r) => r.color },
    { key: 'order', header: 'Order', align: 'right', render: (r) => r.orderIndex, width: '80px' },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '160px',
      render: (r) => (
        <div className="flex justify-end gap-space-xs">
          <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleting(r)}>
            <Icon name="delete" size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Categories"
      subtitle="Public-site tool groupings"
      actions={
        <Button leftIcon={<Icon name="add" size={16} />} onClick={() => setEditing(EMPTY)}>
          New category
        </Button>
      }
    >
      {error && (
        <div className="mb-space-md rounded-xl border border-error/30 bg-error-container/20 p-space-sm font-body-sm text-body-sm text-error">
          {error}
        </div>
      )}
      <DataTable columns={columns} rows={data.items} loading={loading} rowKey={(r) => r.id} empty="No categories yet" />

      {editing && (
        <CategoryFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void refresh();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          open={!!deleting}
          title={`Delete "${deleting.name}"?`}
          message="Tools attached to this category must be moved or deleted first."
          confirmLabel="Delete"
          destructive
          onConfirm={async () => {
            await apiFetch(`/categories/${deleting.id}`, { method: 'DELETE' });
            void refresh();
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </AdminPageShell>
  );
}

function CategoryFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Category;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Category>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !initial.id;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body = {
        slug: form.slug,
        name: form.name,
        description: form.description,
        icon: form.icon,
        color: form.color,
        orderIndex: form.orderIndex,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
      };
      if (isNew) {
        await apiFetch('/categories', { method: 'POST', body });
      } else {
        const { slug: _, ...update } = body;
        await apiFetch(`/categories/${initial.id}`, { method: 'PATCH', body: update });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={isNew ? 'New category' : `Edit ${initial.name}`}>
      <form onSubmit={submit} className="flex flex-col gap-space-md">
        <Input
          label="Slug"
          required
          disabled={!isNew}
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          hint="lowercase-kebab, used in URLs. Not editable after creation."
        />
        <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            Description
          </span>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="rounded-xl border border-outline-variant bg-surface-container-low p-3 font-body-md text-body-md text-on-surface focus:border-secondary focus:outline-none"
          />
        </label>
        <div className="grid grid-cols-3 gap-space-sm">
          <Input label="Icon" required value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} hint="Icon name (e.g. picture_as_pdf)" />
          <Input label="Color token" required value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} hint="primary / secondary / tertiary" />
          <Input
            label="Order"
            type="number"
            value={form.orderIndex}
            onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })}
          />
        </div>
        <Input label="SEO title" value={form.seoTitle ?? ''} onChange={(e) => setForm({ ...form, seoTitle: e.target.value || null })} />
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            SEO description
          </span>
          <textarea
            value={form.seoDescription ?? ''}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value || null })}
            rows={2}
            className="rounded-xl border border-outline-variant bg-surface-container-low p-3 font-body-md text-body-md text-on-surface focus:border-secondary focus:outline-none"
          />
        </label>
        {error && (
          <div className="rounded-xl border border-error/30 bg-error-container/20 p-space-sm font-body-sm text-body-sm text-error">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-space-sm">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{isNew ? 'Create' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}
