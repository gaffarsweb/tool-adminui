import { cn } from '@/lib/cn';

export interface AmbientBlobsProps {
  variant?: 'hero' | 'auth' | 'minimal';
  className?: string;
}

export function AmbientBlobs({ variant = 'hero', className }: AmbientBlobsProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
    >
      {variant === 'hero' && (
        <>
          <div className="absolute -top-32 left-1/4 h-[550px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
          <div className="absolute right-10 top-48 h-[500px] w-[600px] rounded-full bg-secondary/10 blur-[130px]" />
          <div className="absolute left-[-100px] top-[800px] h-[500px] w-[500px] rounded-full bg-tertiary/5 blur-[160px]" />
        </>
      )}
      {variant === 'auth' && (
        <>
          <div className="absolute -top-32 left-1/4 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
          <div className="absolute right-10 top-48 h-[450px] w-[550px] rounded-full bg-secondary/10 blur-[130px]" />
        </>
      )}
      {variant === 'minimal' && (
        <div className="absolute top-20 right-0 h-[400px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
      )}
    </div>
  );
}
