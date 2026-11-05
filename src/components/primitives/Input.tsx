import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, rightIcon, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-space-xs">
      {label && (
        <label
          htmlFor={inputId}
          className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'relative flex h-10 items-center rounded-xl border bg-surface-container-low transition-colors focus-within:shadow-[0_0_12px_rgba(6,182,212,0.25)]',
          error
            ? 'border-error focus-within:border-error'
            : 'border-outline-variant focus-within:border-secondary',
        )}
      >
        {leftIcon && <span className="pl-3 text-on-surface-variant">{leftIcon}</span>}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-full w-full flex-1 bg-transparent px-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none',
            leftIcon && 'pl-2',
            rightIcon && 'pr-2',
            className,
          )}
          {...rest}
        />
        {rightIcon && <span className="pr-3 text-on-surface-variant">{rightIcon}</span>}
      </div>
      {error ? (
        <p className="font-body-sm text-body-sm text-error">{error}</p>
      ) : hint ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
});
