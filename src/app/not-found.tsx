import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-surface px-margin">
      <div className="glass-panel w-full max-w-md rounded-xl p-8 text-center">
        <p className="mb-2 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          Error · 404
        </p>
        <h1 className="mb-4 font-headline-lg text-headline-lg text-on-surface">Route not found</h1>
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary-container px-4 font-label-lg text-label-lg font-semibold text-on-primary-container transition-colors hover:bg-primary hover:text-on-primary"
        >
          Return to gateway
        </Link>
      </div>
    </main>
  );
}
