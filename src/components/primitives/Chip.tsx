import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type ChipTone = 'default' | 'primary' | 'secondary' | 'tertiary';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  tone?: ChipTone;
  dot?: boolean;
}

const activeTones: Record<ChipTone, string> = {
  default: 'border-white/15 bg-surface-container-high text-on-surface',
  primary: 'border-primary/40 bg-primary/15 text-primary',
  secondary: 'border-secondary/40 bg-secondary/15 text-secondary',
  tertiary: 'border-tertiary/40 bg-tertiary/15 text-tertiary',
};

const dotColors: Record<ChipTone, string> = {
  default: 'bg-on-surface-variant',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
};

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { active = false, tone = 'default', dot = false, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={active}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full border px-3 font-label-lg text-label-lg transition-colors',
        active
          ? activeTones[tone]
          : 'border-white/[0.06] bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
        className,
      )}
      {...rest}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[tone])} />}
      {children}
    </button>
  );
});
