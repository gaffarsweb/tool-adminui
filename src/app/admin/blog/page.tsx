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

type Status = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentMarkdown: string;
  featuredImageUrl: string | null;
  categoryId: string;
  status: Status;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  relatedToolIds: string[];
}

interface BlogCategory {
  id: string;
  slug: string;
  name: string;
}

const EMPTY: Post = {
  id: '',
  slug: '',
  title: '',
  excerpt: null,
  contentMarkdown: '',
  featuredImageUrl: null,
  categoryId: '',
  status: 'DRAFT',
  publishedAt: null,
  seoTitle: null,
  seoDescription: null,
  relatedToolIds: [],
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState<Post | null>(null);
  const [managingCategories, setManagingCategories] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const [postsRes, catRes] = await Promise.all([
        apiFetch<{ items: Post[] }>('/blog/admin/posts', { query: { pageSize: 100 } }),
        apiFetch<{ items: BlogCategory[] }>('/blog/categories'),
      ]);
      setPosts(postsRes.items);
      setCategories(catRes.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const columns: Column<Post>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (p) => (
        <div>
          <p className="font-semibold text-on-surface">{p.title}</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">{p.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) => categories.find((c) => c.id === p.categoryId)?.name ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <Badge tone={p.status === 'PUBLISHED' ? 'tertiary' : p.status === 'ARCHIVED' ? 'neutral' : 'secondary'}>
          {p.status}
        </Badge>
      ),
    },
    { key: 'published', header: 'Published', render: (p) => (p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—') },
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
      title="Blog"
      subtitle={`${posts.length} posts · ${categories.length} categories`}
      actions={
        <>
          <Button variant="secondary" onClick={() => setManagingCategories(true)}>Categories</Button>
          <Button leftIcon={<Icon name="add" size={16} />} onClick={() => setEditing({ ...EMPTY, categoryId: categories[0]?.id ?? '' })}>
            New post
          </Button>
        </>
      }
    >
      <DataTable columns={columns} rows={posts} loading={loading} rowKey={(p) => p.id} empty="No posts yet." />

      {editing && (
        <PostFormModal
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
          title={`Delete "${deleting.title}"?`}
          message="Post is permanently removed."
          destructive
          confirmLabel="Delete"
          onConfirm={async () => {
            await apiFetch(`/blog/posts/${deleting.id}`, { method: 'DELETE' });
            void refresh();
          }}
          onClose={() => setDeleting(null)}
        />
      )}

      {managingCategories && (
        <BlogCategoriesModal
          categories={categories}
          onClose={() => setManagingCategories(false)}
          onChanged={() => void refresh()}
        />
      )}
    </AdminPageShell>
  );
}

function PostFormModal({
  initial,
  categories,
  onClose,
  onSaved,
}: {
  initial: Post;
  categories: BlogCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Post>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !initial.id;

  function set<K extends keyof Post>(k: K, v: Post[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body = {
        slug: form.slug,
        title: form.title,
        excerpt: form.excerpt || undefined,
        contentMarkdown: form.contentMarkdown,
        featuredImageUrl: form.featuredImageUrl || undefined,
        categoryId: form.categoryId,
        status: form.status,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        relatedToolIds: form.relatedToolIds,
      };
      if (isNew) {
        await apiFetch('/blog/posts', { method: 'POST', body });
      } else {
        const { slug: _, ...update } = body;
        await apiFetch(`/blog/posts/${initial.id}`, { method: 'PATCH', body: update });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={isNew ? 'New post' : `Edit ${initial.title}`} width="lg">
      <form onSubmit={submit} className="flex flex-col gap-space-md">
        <div className="grid grid-cols-2 gap-space-sm">
          <Input label="Slug" required disabled={!isNew} value={form.slug} onChange={(e) => set('slug', e.target.value)} />
          <Input label="Title" required value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-space-sm">
          <Select
            label="Category"
            value={form.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select…"
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => set('status', e.target.value as Status)}
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'PUBLISHED', label: 'Published' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
          />
        </div>
        <Input label="Featured image URL" value={form.featuredImageUrl ?? ''} onChange={(e) => set('featuredImageUrl', e.target.value || null)} />
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Excerpt</span>
          <textarea
            value={form.excerpt ?? ''}
            onChange={(e) => set('excerpt', e.target.value || null)}
            rows={2}
            className="rounded-xl border border-outline-variant bg-surface-container-low p-3 font-body-md text-body-md text-on-surface focus:border-secondary focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Content (markdown)</span>
          <textarea
            required
            value={form.contentMarkdown}
            onChange={(e) => set('contentMarkdown', e.target.value)}
            rows={14}
            className="font-mono rounded-xl border border-outline-variant bg-surface-container-low p-3 text-body-sm text-on-surface focus:border-secondary focus:outline-none"
          />
        </label>
        <div className="grid grid-cols-1 gap-space-sm">
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
        </div>
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

function BlogCategoriesModal({ categories, onClose, onChanged }: { categories: BlogCategory[]; onClose: () => void; onChanged: () => void }) {
  const [newSlug, setNewSlug] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch('/blog/categories', { method: 'POST', body: { slug: newSlug, name: newName } });
      setNewSlug('');
      setNewName('');
      onChanged();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    await apiFetch(`/blog/categories/${id}`, { method: 'DELETE' });
    onChanged();
  }

  return (
    <Modal open onClose={onClose} title="Blog categories">
      <ul className="mb-space-lg flex flex-col divide-y divide-outline-variant/30">
        {categories.length === 0 && (
          <li className="py-space-md text-center font-body-md text-body-md text-on-surface-variant">
            No categories yet
          </li>
        )}
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-space-sm">
            <div>
              <p className="font-body-md text-body-md text-on-surface">{c.name}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">{c.slug}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>
              <Icon name="delete" size={14} />
            </Button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex flex-col gap-space-md">
        <Input label="Slug" required value={newSlug} onChange={(e) => setNewSlug(e.target.value)} />
        <Input label="Name" required value={newName} onChange={(e) => setNewName(e.target.value)} />
        {error && (
          <div className="rounded-xl border border-error/30 bg-error-container/20 p-space-sm font-body-sm text-body-sm text-error">{error}</div>
        )}
        <Button type="submit" loading={loading}>Add category</Button>
      </form>
    </Modal>
  );
}
