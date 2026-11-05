'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/icons/Icon';
import { brand } from '@/config/brand';
import { cn } from '@/lib/cn';

interface NavEntry {
  label: string;
  href: string;
  icon: IconName;
}

const NAV_SECTIONS: { heading: string; items: NavEntry[] }[] = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
      { label: 'Analytics', href: '/admin/analytics', icon: 'analytics' },
      { label: 'Tool Matrix', href: '/admin/tool-matrix', icon: 'category' },
    ],
  },
  {
    heading: 'Catalog',
    items: [
      { label: 'Tools', href: '/admin/tools', icon: 'terminal' },
      { label: 'Categories', href: '/admin/categories', icon: 'folder' },
      { label: 'Blog', href: '/admin/blog', icon: 'newspaper' },
    ],
  },
  {
    heading: 'Commerce',
    items: [
      { label: 'Plans', href: '/admin/plans', icon: 'tag' },
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: 'credit_card' },
      { label: 'Payments', href: '/admin/payments', icon: 'hash' },
    ],
  },
  {
    heading: 'Audience',
    items: [
      { label: 'Users', href: '/admin/users', icon: 'users' },
      { label: 'Contact', href: '/admin/contact', icon: 'mail' },
    ],
  },
  {
    heading: 'System',
    items: [{ label: 'Settings', href: '/admin/settings', icon: 'settings' }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-white/[0.09] bg-surface-container-lowest/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-space-sm border-b border-outline-variant/40 px-space-lg">
        <span className="relative inline-flex items-center justify-center">
          <span className="absolute -inset-1 rounded-full bg-primary/20 blur-sm" />
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <Icon name="bolt" size={20} />
          </span>
        </span>
        <span className="font-headline-sm text-headline-sm font-bold uppercase tracking-tight text-on-surface">
          {brand.name}
        </span>
        <span className="ml-auto rounded bg-primary/20 px-2 py-0.5 font-label-sm text-label-sm text-primary">
          LVL-5
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-space-md py-space-lg">
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading} className="mb-space-lg">
            <p className="mb-space-xs px-space-md font-label-sm text-label-sm uppercase tracking-wider text-outline">
              {section.heading}
            </p>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-space-sm rounded-xl px-space-md py-2 font-label-lg text-label-lg transition-colors',
                        active
                          ? 'bg-primary/15 text-primary'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                      )}
                    >
                      <Icon name={item.icon} size={18} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-outline-variant/40 p-space-md">
        <button
          type="button"
          className="flex w-full items-center gap-space-sm rounded-xl px-space-md py-2 font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <Icon name="logout" size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
