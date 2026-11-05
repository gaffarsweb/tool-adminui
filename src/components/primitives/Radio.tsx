import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, className, id, ...rest },
  ref,
) {
  const radioId = id ?? rest.name;
  return (
    <label htmlFor={radioId} className="inline-flex cursor-pointer items-center gap-space-sm">
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <input
          id={radioId}
          ref={ref}
          type="radio"
          className={cn('peer sr-only', className)}
          {...rest}
        />
        <span className="h-4 w-4 rounded-full border border-white/15 bg-surface-container-low transition-colors peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-secondary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface" />
        <span className="absolute h-2 w-2 scale-0 rounded-full bg-primary transition-transform peer-checked:scale-100" />
      </span>
      {label && <span className="font-body-md text-body-md text-on-surface">{label}</span>}
    </label>
  );
});
