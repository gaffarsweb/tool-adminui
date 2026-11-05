import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Tint = 'neutral' | 'primary' | 'secondary' | 'tertiary';

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  tint?: Tint;
  elevated?: boolean;
}

const tintClasses: Record<Tint, string> = {
  neutral: 'bg-surface-container/72',
  primary: 'bg-primary/5',
  secondary: 'bg-secondary/5',
  tertiary: 'bg-tertiary/5',
};

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(function GlassPanel(
  { tint = 'neutral', elevated = false, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'border border-white/[0.09] backdrop-blur-xl',
        tintClasses[tint],
        elevated && 'shadow-[0_24px_64px_rgba(0,0,0,0.6)]',
        className,
      )}
      {...rest}
    />
  );
});
