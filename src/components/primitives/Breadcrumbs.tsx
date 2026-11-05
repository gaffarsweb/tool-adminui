import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import { cn } from '@/lib/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-space-xs', className)}>
      <ol className="flex flex-wrap items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-space-xs">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-on-surface">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'text-on-surface' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <Icon name="chevron_right" size={14} className="text-outline" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
