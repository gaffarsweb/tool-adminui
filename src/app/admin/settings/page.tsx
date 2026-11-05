'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Card } from '@/components/surfaces/Card';
import { ApiRequestError, apiFetch } from '@/lib/api-client';

interface Settings {
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  socialLinksJson: Record<string, string>;
  contactEmail: string | null;
  contactPhone: string | null;
  defaultSeoTitleTemplate: string;
  defaultSeoDescription: string;
  adsenseClientId: string | null;
}

export default function SettingsPage() {
  const [data, setData] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<{ item: Settings }>('/settings');
        setData(res.item);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      }
    })();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const { item } = await apiFetch<{ item: Settings }>('/settings', {
        method: 'PATCH',
        body: {
          siteName: data.siteName,
          logoUrl: data.logoUrl || undefined,
          faviconUrl: data.faviconUrl || undefined,
          contactEmail: data.contactEmail || undefined,
          contactPhone: data.contactPhone || undefined,
          defaultSeoTitleTemplate: data.defaultSeoTitleTemplate,
          defaultSeoDescription: data.defaultSeoDescription,
          adsenseClientId: data.adsenseClientId || undefined,
          socialLinksJson: data.socialLinksJson,
        },
      });
      setData(item);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setData((d) => (d ? { ...d, [key]: value } : d));
  }

  return (
    <AdminPageShell title="Site Settings" subtitle="Brand, SEO defaults, ads">
      {!data ? (
        <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg">
          <Card>
            <h2 className="mb-space-md font-headline-md text-headline-md text-on-surface">Brand</h2>
            <div className="grid gap-space-md md:grid-cols-2">
              <Input label="Site name" value={data.siteName} onChange={(e) => set('siteName', e.target.value)} required />
              <Input label="Logo URL" value={data.logoUrl ?? ''} onChange={(e) => set('logoUrl', e.target.value || null)} />
              <Input label="Favicon URL" value={data.faviconUrl ?? ''} onChange={(e) => set('faviconUrl', e.target.value || null)} />
              <Input label="Contact email" type="email" value={data.contactEmail ?? ''} onChange={(e) => set('contactEmail', e.target.value || null)} />
              <Input label="Contact phone" value={data.contactPhone ?? ''} onChange={(e) => set('contactPhone', e.target.value || null)} />
            </div>
          </Card>

          <Card>
            <h2 className="mb-space-md font-headline-md text-headline-md text-on-surface">SEO defaults</h2>
            <div className="flex flex-col gap-space-md">
              <Input
                label="Default title template"
                hint="Use %s as the page-specific placeholder, e.g. &ldquo;%s · TOOLS&rdquo;"
                value={data.defaultSeoTitleTemplate}
                onChange={(e) => set('defaultSeoTitleTemplate', e.target.value)}
              />
              <label className="flex flex-col gap-space-xs">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  Default meta description
                </span>
                <textarea
                  value={data.defaultSeoDescription}
                  onChange={(e) => set('defaultSeoDescription', e.target.value)}
                  rows={3}
                  className="rounded-xl border border-outline-variant bg-surface-container-low p-3 font-body-md text-body-md text-on-surface focus:border-secondary focus:outline-none"
                />
              </label>
            </div>
          </Card>

          <Card>
            <h2 className="mb-space-md font-headline-md text-headline-md text-on-surface">Monetization</h2>
            <Input
              label="AdSense client ID"
              hint="Phase 12 wires live ads. Leaving this blank keeps ads off."
              value={data.adsenseClientId ?? ''}
              onChange={(e) => set('adsenseClientId', e.target.value || null)}
            />
          </Card>

          {error && (
            <div className="rounded-xl border border-error/30 bg-error-container/20 p-space-sm font-body-sm text-body-sm text-error">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-space-sm">
            {saved && <span className="font-label-md text-label-md text-tertiary">Saved</span>}
            <Button type="submit" loading={saving} size="lg">
              Save settings
            </Button>
          </div>
        </form>
      )}
    </AdminPageShell>
  );
}
