'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { Icon } from '@/components/icons/Icon';
import { GlassPanel } from '@/components/surfaces/GlassPanel';
import { AmbientBlobs } from '@/components/visuals/AmbientBlobs';
import { IsometricGrid } from '@/components/visuals/IsometricGrid';
import { brand } from '@/config/brand';
import { login } from '@/features/auth/auth-actions';
import { ApiRequestError } from '@/lib/api-client';

// Phase 4 — real email + password admin login.
// TOTP input remains rendered but is non-functional; Phase 7 wires enrollment + verify.
// The LVL-5 / AIR-GAP chrome is stylistic framing — the actual auth is email + password + role=ADMIN check.

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'ADMIN') {
        setError('This account is not authorized for the admin console.');
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Sign-in failed',
      );
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-surface p-space-lg">
      <AmbientBlobs variant="auth" />
      <IsometricGrid opacity={0.025} />

      <GlassPanel
        elevated
        className="relative z-10 flex w-full max-w-xl flex-col gap-space-lg rounded-2xl p-space-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="relative inline-flex items-center justify-center">
              <span className="absolute -inset-1 rounded-full bg-primary/25 blur-sm" />
              <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                <Icon name="bolt" size={20} />
              </span>
            </span>
            <span className="font-headline-md text-headline-md font-bold uppercase tracking-tight text-on-surface">
              {brand.name}
            </span>
          </div>
          <div className="flex items-center gap-space-xs rounded bg-surface-container-highest px-2.5 py-1 font-label-sm text-label-sm text-secondary">
            <Icon name="shield" size={14} />
            AIR-GAP ACTIVE
          </div>
        </div>

        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
            TOOLS PLATFORM · SECURITY KERNEL
          </span>
          <h1 className="mt-0.5 flex items-center gap-space-sm font-headline-md text-headline-md tracking-tight text-on-surface">
            ROOT OPERATOR ACCESS
            <span className="rounded bg-primary/20 px-2 py-0.5 font-label-md text-label-md text-primary">
              LVL-5
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-space-sm rounded bg-surface-container-highest/80 px-space-md py-2 font-label-md text-label-md text-on-surface-variant">
          <Icon name="lock" size={16} className="text-secondary" />
          <span className="tracking-wide">
            RESTRICTED CONSOLE · ROLE=ADMIN REQUIRED · 256-BIT SESSION
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-email"
              className="flex items-center justify-between font-label-md text-label-md uppercase tracking-wider text-on-surface-variant"
            >
              <span>Operator Credential / Email</span>
              <span className="font-label-sm text-label-sm normal-case tracking-normal text-outline">
                HARDWARE-BOUND
              </span>
            </label>
            <div className="relative flex items-center">
              <Icon name="account_circle" size={18} className="absolute left-3 text-outline" />
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@omnitools.example"
                className="w-full rounded bg-surface-container-lowest py-2.5 pl-10 pr-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:bg-surface-container-high focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="passcode"
                className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant"
              >
                Master Passcode
              </label>
              <span className="font-label-sm text-label-sm text-outline">
                CRYPTOGRAPHIC TOKEN 0x89
              </span>
            </div>
            <div className="relative flex items-center">
              <Icon name="key" size={18} className="absolute left-3 text-outline" />
              <input
                id="passcode"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••••••"
                className="w-full rounded bg-surface-container-lowest py-2.5 pl-10 pr-4 font-body-md tracking-widest text-on-surface placeholder:text-on-surface-variant/40 focus:bg-surface-container-high focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-space-sm pt-1 opacity-60">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                <Icon name="token" size={16} className="text-secondary" />
                <span>TOTP (Phase 7)</span>
              </label>
              <span className="font-label-sm text-label-sm text-outline">NOT YET ENROLLED</span>
            </div>
            <div className="grid grid-cols-6 gap-space-sm">
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  disabled
                  aria-label={`TOTP digit ${i + 1}`}
                  className="h-12 w-full cursor-not-allowed rounded bg-surface-container-lowest text-center font-headline-sm text-headline-sm text-secondary focus:outline-none"
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded border border-error/30 bg-error-container/20 p-space-sm font-body-sm text-body-sm text-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-space-sm rounded bg-primary px-4 py-3.5 font-label-lg text-label-lg text-on-primary shadow-[0_0_24px_-4px_rgba(139,92,246,0.5)] transition-all hover:bg-primary-fixed-dim hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Icon name="spinner" size={18} className="animate-spin" />
            ) : (
              <Icon name="verified_user" size={18} />
            )}
            <span>{loading ? 'VALIDATING SIGNATURE…' : 'AUTHENTICATE TO ADMIN ENCLAVE'}</span>
          </button>
        </form>

        <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
          <span className="flex items-center gap-1.5 text-secondary">
            <Icon name="healing" size={14} />
            Need recovery? Reset via public site.
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
            HSM Online
          </span>
        </div>
      </GlassPanel>
    </main>
  );
}
