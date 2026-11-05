import { forwardRef, type SelectHTMLAttributes } from 'react';
import { Icon } from '@/components/icons/Icon';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, placeholder, error, className, id, ...rest },
  ref,
) {
  const selectId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-space-xs">
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'h-full w-full flex-1 appearance-none bg-transparent px-3 pr-8 font-body-md text-body-md text-on-surface focus:outline-none',
            className,
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-surface-container">
              {o.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevron_down"
          size={18}
          className="pointer-events-none absolute right-3 text-on-surface-variant"
        />
      </div>
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
    </div>
  );
});
