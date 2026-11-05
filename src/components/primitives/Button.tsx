import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-space-xs font-semibold font-label-lg text-label-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<ButtonVariant, string> = {
  primary:
    'rounded-xl bg-primary-container text-on-primary-container shadow-[0_0_20px_-4px_rgba(160,120,255,0.4)] hover:bg-primary hover:text-on-primary active:scale-[0.99]',
  secondary:
    'rounded-xl border border-white/[0.09] bg-surface-container-low text-on-surface hover:border-secondary/50 hover:bg-surface-container active:scale-[0.99]',
  ghost:
    'rounded-xl bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
  destructive:
    'rounded-xl bg-error-container text-on-error-container hover:bg-error hover:text-on-error active:scale-[0.99]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-label-md',
  md: 'h-10 px-4',
  lg: 'h-11 px-6',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {loading ? (
        <Icon name="spinner" className="animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
