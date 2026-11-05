'use client';

import { useEffect, useState, type FormEvent } from 'react';
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

interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string | null;
  categoryId: string;
  icon: string;
  iconColor: string | null;
  tier: 'FREE' | 'PRO' | 'BUSINESS';
  isActive: boolean;
  isFeatured: boolean;
  isImplemented: boolean;
  keywords: string[];
  howToMarkdown: string | null;
  faqsJson: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  orderIndex: number;
  totalRuns: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const EMPTY: Tool = {
  id: '',
  slug: '',
  name: '',
  description: '',
  longDescription: null,
  categoryId: '',
  icon: 'code',
  iconColor: null,
  tier: 'FREE',
  isActive: true,
  isFeatured: false,
  isImplemented: false,
  keywords: [],
  howToMarkdown: null,
  faqsJson: null,
  seoTitle: null,
  seoDescription: null,
  orderIndex: 0,
  totalRuns: 0,
};

export default function AdminToolsPage() {
  const [items, setItems] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Tool | null>(null);
  const [deleting, setDeleting] = useState<Tool | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const [toolRes, catRes] = await Promise.all([
        apiFetch<{ items: Tool[] }>('/tools/admin/all', { query: { search: search || undefined, pageSize: 200 } }),
        apiFetch<{ items: Category[] }>('/categories'),
      ]);
      setItems(toolRes.items);
      setCategories(catRes.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? '—';

  const columns: Column<Tool>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (r) => (
        <div>
          <p className="font-semibold text-on-surface">{r.name}</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">{r.slug}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (r) => catName(r.categoryId) },
    {
      key: 'flags',
      header: 'Flags',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.tier !== 'FREE' && <Badge tone="primary">{r.tier}</Badge>}
          {r.isFeatured && <Badge tone="secondary">Featured</Badge>}
          {r.isImplemented ? <Badge tone="tertiary">Live</Badge> : <Badge>Soon</Badge>}
          {!r.isActive && <Badge tone="error">Disabled</Badge>}
        </div>
      ),
    },
    { key: 'runs', header: 'Runs', align: 'right', width: '100px', render: (r) => r.totalRuns.toLocaleString() },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '160px',
      render: (r) => (
        <div className="flex justify-end gap-space-xs">
          <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleting(r)}>
            <Icon name="delete" size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Tools"
      subtitle="Public catalog · featured + tier + SEO"
      actions={
        <Button leftIcon={<Icon name="add" size={16} />} onClick={() => setEditing({ ...EMPTY, categoryId: categories[0]?.id ?? '' })}>
          New tool
        </Button>
      }
    >
      <div className="mb-space-md flex items-center gap-space-sm rounded-xl border border-outline-variant bg-surface-container-low pl-space-md focus-within:border-secondary">
        <Icon name="search" size={18} className="text-secondary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or slug…"
          className="h-10 flex-1 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
        />
      </div>

      <DataTable columns={columns} rows={items} loading={loading} rowKey={(r) => r.id} empty="No tools yet — seed the DB or create one." />

      {editing && (
        <ToolFormModal
          initial={editing}
          categories={categories}
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
          message="This removes the tool from admin control. Usage history (ToolUsage rows) is cascaded."
          confirmLabel="Delete"
          destructive
          onConfirm={async () => {
            await apiFetch(`/tools/${deleting.id}`, { method: 'DELETE' });
            void refresh();
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </AdminPageShell>
  );
}

function ToolFormModal({
  initial,
  categories,
  onClose,
  onSaved,
}: {
  initial: Tool;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Tool>(initial);
  const [faqsRaw, setFaqsRaw] = useState(JSON.stringify(initial.faqsJson ?? [], null, 2));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !initial.id;

  function set<K extends keyof Tool>(k: K, v: Tool[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    let faqs: unknown = null;
    if (faqsRaw.trim()) {
      try {
        faqs = JSON.parse(faqsRaw);
      } catch {
        setError('FAQs JSON is invalid');
        return;
      }
    }

    setLoading(true);
    try {
      const body = {
        slug: form.slug,
        name: form.name,
        description: form.description,
        longDescription: form.longDescription || undefined,
        categoryId: form.categoryId,
        icon: form.icon,
        iconColor: form.iconColor || undefined,
        tier: form.tier,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        isImplemented: form.isImplemented,
        keywords: form.keywords,
        howToMarkdown: form.howToMarkdown || undefined,
        faqsJson: faqs,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        orderIndex: form.orderIndex,
      };
      if (isNew) {
        await apiFetch('/tools', { method: 'POST', body });
      } else {
        const { slug: _, ...update } = body;
        await apiFetch(`/tools/${initial.id}`, { method: 'PATCH', body: update });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={isNew ? 'New tool' : `Edit ${initial.name}`} width="lg">
      <form onSubmit={submit} className="flex flex-col gap-space-md">
        <div className="grid grid-cols-2 gap-space-sm">
          <Input label="Slug" required disabled={!isNew} value={form.slug} onChange={(e) => set('slug', e.target.value)} />
          <Input label="Name" required value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>

        <label className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Description</span>
          <textarea
            required
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            className="rounded-xl border border-outline-variant bg-surface-container-low p-3 font-body-md text-body-md text-on-surface focus:border-secondary focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-3 gap-space-sm">
          <Select
            label="Category"
            value={form.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select…"
          />
          <Input label="Icon" value={form.icon} onChange={(e) => set('icon', e.target.value)} />
          <Select
            label="Tier"
            value={form.tier}
            onChange={(e) => set('tier', e.target.value as Tool['tier'])}
            options={[
              { value: 'FREE', label: 'Free' },
              { value: 'PRO', label: 'Pro' },
              { value: 'BUSINESS', label: 'Business' },
            ]}
          />
        </div>

        <div className="flex flex-wrap gap-space-lg">
          <Toggle label="Active" value={form.isActive} onChange={(v) => set('isActive', v)} />
          <Toggle label="Featured" value={form.isFeatured} onChange={(v) => set('isFeatured', v)} />
          <Toggle label="Implemented" value={form.isImplemented} onChange={(v) => set('isImplemented', v)} />
        </div>

        <Input
          label="Keywords (comma-separated)"
          value={form.keywords.join(', ')}
          onChange={(e) =>
            set(
              'keywords',
              e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            )
          }
        />

        <Input label="SEO title" value={form.seoTitle ?? ''} onChange={(e) => set('seoTitle', e.target.value || null)} />
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">SEO description</span>
          <textarea
            value={form.seoDescription ?? ''}
            onChange={(e) => set('seoDescription', e.target.value || null)}
            rows={2}
            className="rounded-xl border border-outline-variant bg-surface-container-low p-3 font-body-md text-body-md text-on-surface focus:border-secondary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">How-to (markdown)</span>
          <textarea
            value={form.howToMarkdown ?? ''}
            onChange={(e) => set('howToMarkdown', e.target.value || null)}
            rows={4}
            className="font-mono rounded-xl border border-outline-variant bg-surface-container-low p-3 text-body-sm text-on-surface focus:border-secondary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            FAQs (JSON array of {'{ q, a }'})
          </span>
          <textarea
            value={faqsRaw}
            onChange={(e) => setFaqsRaw(e.target.value)}
            rows={6}
            className="font-mono rounded-xl border border-outline-variant bg-surface-container-low p-3 text-body-sm text-on-surface focus:border-secondary focus:outline-none"
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

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-space-sm">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      <span className="font-body-md text-body-md text-on-surface">{label}</span>
    </label>
  );
}
