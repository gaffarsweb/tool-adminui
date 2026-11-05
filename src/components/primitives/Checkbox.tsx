import { forwardRef, type InputHTMLAttributes } from 'react';
import { Icon } from '@/components/icons/Icon';
import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, ...rest },
  ref,
) {
  const checkboxId = id ?? rest.name;
  return (
    <label htmlFor={checkboxId} className="inline-flex cursor-pointer items-center gap-space-sm">
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <input
          id={checkboxId}
          ref={ref}
          type="checkbox"
          className={cn('peer sr-only', className)}
          {...rest}
        />
        <span className="h-4 w-4 rounded-[3px] border border-white/15 bg-surface-container-low transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-secondary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface" />
        <Icon
          name="check"
          size={12}
          strokeWidth={3}
          className="pointer-events-none absolute text-on-primary opacity-0 peer-checked:opacity-100"
        />
      </span>
      {label && <span className="font-body-md text-body-md text-on-surface">{label}</span>}
    </label>
  );
});
