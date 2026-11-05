'use client';

import { useState, type FormEvent } from 'react';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { Icon } from '@/components/icons/Icon';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Select } from '@/components/primitives/Select';
import { ApiRequestError, apiFetch } from '@/lib/api-client';
import { useList } from '@/lib/use-list';

interface Plan {
  id: string;
  slug: string;
  name: string;
  tier: 'FREE' | 'PRO' | 'BUSINESS';
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  features: string[];
  limits: Record<string, unknown>;
  orderIndex: number;
}

const EMPTY: Plan = {
  id: '',
  slug: '',
  name: '',
  tier: 'FREE',
  priceMonthly: 0,
  priceAnnual: 0,
  currency: 'INR',
  features: [],
  limits: {},
  orderIndex: 0,
};

export default function AdminPlansPage() {
  const { data, loading, refresh } = useList<Plan>('/plans/admin/all');
  const [editing, setEditing] = useState<Plan | null>(null);
  const [deleting, setDeleting] = useState<Plan | null>(null);

  const columns: Column<Plan>[] = [
    { key: 'name', header: 'Plan', render: (p) => <span className="font-semibold">{p.name}</span> },
    { key: 'tier', header: 'Tier', render: (p) => <Badge tone="primary">{p.tier}</Badge> },
    {
      key: 'price',
      header: 'Price (monthly / annual)',
      render: (p) => `${p.currency} ${p.priceMonthly.toLocaleString()} / ${p.priceAnnual.toLocaleString()}`,
    },
    { key: 'features', header: 'Features', render: (p) => p.features.length, align: 'right', width: '100px' },
    { key: 'order', header: 'Order', align: 'right', width: '80px', render: (p) => p.orderIndex },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '160px',
      render: (p) => (
        <div className="flex justify-end gap-space-xs">
          <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleting(p)}>
            <Icon name="delete" size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Plans"
      subtitle="Public pricing catalog"
      actions={
        <Button leftIcon={<Icon name="add" size={16} />} onClick={() => setEditing(EMPTY)}>New plan</Button>
      }
    >
      <DataTable columns={columns} rows={data.items} loading={loading} rowKey={(p) => p.id} empty="No plans — seed the DB to start." />

      {editing && (
        <PlanFormModal
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
          open
          title={`Delete "${deleting.name}"?`}
          message="Cannot delete a plan with active subscriptions. Downgrade users first."
          destructive
          confirmLabel="Delete plan"
          onConfirm={async () => {
            await apiFetch(`/plans/${deleting.id}`, { method: 'DELETE' });
            void refresh();
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </AdminPageShell>
  );
}

function PlanFormModal({ initial, onClose, onSaved }: { initial: Plan; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Plan>(initial);
  const [limitsRaw, setLimitsRaw] = useState(JSON.stringify(initial.limits ?? {}, null, 2));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !initial.id;

  async function submit(e: FormEvent) {
    e.preventDefault();
    let limits: Record<string, unknown>;
    try {
      limits = JSON.parse(limitsRaw);
    } catch {
      setError('Limits JSON is invalid');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const body = {
        slug: form.slug,
        name: form.name,
        tier: form.tier,
        priceMonthly: form.priceMonthly,
        priceAnnual: form.priceAnnual,
        currency: form.currency,
        features: form.features,
        limitsJson: limits,
        orderIndex: form.orderIndex,
      };
      if (isNew) {
        await apiFetch('/plans', { method: 'POST', body });
      } else {
        const { slug: _, ...update } = body;
        await apiFetch(`/plans/${initial.id}`, { method: 'PATCH', body: update });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={isNew ? 'New plan' : `Edit ${initial.name}`} width="lg">
      <form onSubmit={submit} className="flex flex-col gap-space-md">
        <div className="grid grid-cols-2 gap-space-sm">
          <Input label="Slug" required disabled={!isNew} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-4 gap-space-sm">
          <Select
            label="Tier"
            value={form.tier}
            onChange={(e) => setForm({ ...form, tier: e.target.value as Plan['tier'] })}
            options={[
              { value: 'FREE', label: 'Free' },
              { value: 'PRO', label: 'Pro' },
              { value: 'BUSINESS', label: 'Business' },
            ]}
          />
          <Input label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          <Input label="Price /mo" type="number" value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: Number(e.target.value) })} />
          <Input label="Price /year" type="number" value={form.priceAnnual} onChange={(e) => setForm({ ...form, priceAnnual: Number(e.target.value) })} />
        </div>
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Features (one per line)</span>
          <textarea
            value={form.features.join('\n')}
            onChange={(e) => setForm({ ...form, features: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
            rows={5}
            className="rounded-xl border border-outline-variant bg-surface-container-low p-3 font-body-md text-body-md text-on-surface focus:border-secondary focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Limits (JSON)</span>
          <textarea
            value={limitsRaw}
            onChange={(e) => setLimitsRaw(e.target.value)}
            rows={4}
            className="font-mono rounded-xl border border-outline-variant bg-surface-container-low p-3 text-body-sm text-on-surface focus:border-secondary focus:outline-none"
          />
        </label>
        <Input label="Order" type="number" value={form.orderIndex} onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })} />
        {error && (
          <div className="rounded-xl border border-error/30 bg-error-container/20 p-space-sm font-body-sm text-body-sm text-error">{error}</div>
        )}
        <div className="flex justify-end gap-space-sm">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{isNew ? 'Create' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}
