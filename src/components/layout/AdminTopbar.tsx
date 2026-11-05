import { Icon } from '@/components/icons/Icon';
import { StatusPill } from '@/components/primitives/StatusPill';

export interface AdminTopbarProps {
  title: string;
  subtitle?: string;
}

export function AdminTopbar({ title, subtitle }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.09] bg-surface-container-lowest/80 px-space-lg backdrop-blur-xl">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface">{title}</h1>
        {subtitle && (
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-space-md">
        <StatusPill tone="online">HSM ONLINE</StatusPill>

        <button
          type="button"
          aria-label="Open command palette"
          className="hidden h-9 items-center gap-space-sm rounded-xl bg-surface-container-low px-space-md text-on-surface-variant shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:bg-surface-container hover:text-on-surface md:flex"
        >
          <Icon name="search" size={16} className="text-secondary" />
          <span className="font-body-sm text-body-sm">Command palette…</span>
          <kbd className="rounded bg-surface-container-high px-1.5 py-0.5 font-label-sm text-label-sm">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl bg-surface-container-low p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
        >
          <Icon name="notifications" size={20} />
        </button>

        <div className="flex items-center gap-space-sm rounded-xl bg-surface-container-low px-space-sm py-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <Icon name="person" size={16} />
          </span>
          <div className="hidden text-left sm:block">
            <p className="font-label-md text-label-md text-on-surface">Operator</p>
            <p className="font-label-sm text-label-sm text-outline">LVL-5 · clearance</p>
          </div>
        </div>
      </div>
    </header>
  );
}
