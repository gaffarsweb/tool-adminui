import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'primary' | 'secondary' | 'tertiary' | 'error';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  leftIcon?: ReactNode;
  dot?: boolean;
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-container-high/70 text-on-surface',
  primary: 'bg-primary/15 text-primary border border-primary/30',
  secondary: 'bg-secondary/15 text-secondary border border-secondary/30',
  tertiary: 'bg-tertiary/15 text-tertiary border border-tertiary/30',
  error: 'bg-error-container/40 text-error border border-error/30',
};

const dotColors: Record<BadgeTone, string> = {
  neutral: 'bg-on-surface-variant',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
  error: 'bg-error',
};

export function Badge({ tone = 'neutral', leftIcon, dot, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-space-xs rounded-full px-3 py-1 font-label-lg text-label-lg backdrop-blur-xl',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {dot && <span className={cn('h-2 w-2 rounded-full', dotColors[tone])} />}
      {leftIcon}
      {children}
    </span>
  );
}
