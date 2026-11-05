import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-white/[0.09] bg-surface-container/65 p-space-lg backdrop-blur-md',
        interactive &&
          'transition-colors duration-200 hover:border-white/[0.18] focus-within:border-white/[0.18]',
        className,
      )}
      {...rest}
    />
  );
});
