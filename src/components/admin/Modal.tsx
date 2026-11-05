'use client';

import { useEffect, type ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

export function Modal({ open, onClose, title, subtitle, children, width = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-lg" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm"
      />
      <div
        className={`relative z-10 w-full ${widths[width]} rounded-2xl border border-white/[0.09] bg-surface-container shadow-[0_24px_64px_rgba(0,0,0,0.6)]`}
      >
        <div className="flex items-start justify-between border-b border-outline-variant/40 p-space-lg">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
            {subtitle && (
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-space-lg">{children}</div>
      </div>
    </div>
  );
}
