import { cn } from '@/lib/cn';

export interface IsometricGridProps {
  className?: string;
  opacity?: number;
}

export function IsometricGrid({ className, opacity = 0.035 }: IsometricGridProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full text-on-surface', className)}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="matrix-grid" patternUnits="userSpaceOnUse" width="48" height="48">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="48" cy="0" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#matrix-grid)" />
    </svg>
  );
}
