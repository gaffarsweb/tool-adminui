'use client';

import type { ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import { cn } from '@/lib/cn';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  empty?: string;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (next: number) => void;
  };
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  empty = 'No rows',
  rowKey,
  onRowClick,
  pagination,
}: DataTableProps<T>) {
  return (
    <div className="flex flex-col gap-space-md">
      <div className="overflow-hidden rounded-xl border border-white/[0.09] bg-surface-container/65 backdrop-blur-md">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-outline-variant/40 bg-surface-container-low">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    'px-4 py-3 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-on-surface-variant">
                  <Icon name="spinner" className="animate-spin" /> Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <p className="font-body-md text-body-md text-on-surface-variant">{empty}</p>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-outline-variant/20 last:border-b-0',
                    onRowClick && 'cursor-pointer transition-colors hover:bg-surface-container-high/40',
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 align-top font-body-md text-body-md text-on-surface',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total > pagination.pageSize && (
        <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
          <span>
            Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.pageSize))} ·{' '}
            {pagination.total.toLocaleString()} rows
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 hover:bg-surface-container-high hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="chevron_left" size={14} /> Prev
            </button>
            <button
              type="button"
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 hover:bg-surface-container-high hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <Icon name="chevron_right" size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
