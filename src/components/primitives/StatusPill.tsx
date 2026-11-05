import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type StatusTone = 'online' | 'pending' | 'offline' | 'warning';

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  pulse?: boolean;
}

const dotColor: Record<StatusTone, string> = {
  online: 'bg-tertiary',
  pending: 'bg-secondary',
  warning: 'bg-primary',
  offline: 'bg-outline',
};

const textColor: Record<StatusTone, string> = {
  online: 'text-tertiary',
  pending: 'text-secondary',
  warning: 'text-primary',
  offline: 'text-on-surface-variant',
};

export function StatusPill({
  tone = 'online',
  pulse = true,
  className,
  children,
  ...rest
}: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider',
        textColor[tone],
        className,
      )}
      {...rest}
    >
      <span className={cn('h-2 w-2 rounded-full', dotColor[tone], pulse && 'animate-pulse')} />
      {children}
    </span>
  );
}
