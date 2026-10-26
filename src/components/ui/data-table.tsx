import { useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePagination } from '@/hooks/usePagination';
import { normalizeQuery } from '@/utils/pagination';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  label?: string;
  disabled?: boolean;
}

export function PaginationControls({ page, pageSize, total, onPageChange, onPageSizeChange, label = 'registros', disabled = false }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.max(1, Math.min(page, pages));
  return <nav aria-label={`Paginação de ${label}`} className="flex flex-wrap items-center justify-between gap-3 text-sm">
    <label className="flex items-center gap-2">Por página
      <select aria-label={`Registros por página: ${label}`} className="rounded-md border bg-background p-2" value={pageSize} disabled={disabled}
        onChange={event => onPageSizeChange(Number(event.target.value))}>
        {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
      </select>
    </label>
    <span className="text-muted-foreground">{total ? (current - 1) * pageSize + 1 : 0} - {Math.min(current * pageSize, total)} de {total}</span>
    <div className="flex max-w-full flex-wrap items-center justify-center gap-1">
      <Button type="button" size="icon" variant="outline" title="Primeira página" aria-label="Primeira página" disabled={disabled || current <= 1} onClick={() => onPageChange(1)}><ChevronsLeft className="size-4" /></Button>
      <Button type="button" size="icon" variant="outline" title="Página anterior" aria-label="Página anterior" disabled={disabled || current <= 1} onClick={() => onPageChange(current - 1)}><ChevronLeft className="size-4" /></Button>
      <span className="px-2 tabular-nums">Página {current} de {pages}</span>
      <Button type="button" size="icon" variant="outline" title="Próxima página" aria-label="Próxima página" disabled={disabled || current >= pages} onClick={() => onPageChange(current + 1)}><ChevronRight className="size-4" /></Button>
      <Button type="button" size="icon" variant="outline" title="Última página" aria-label="Última página" disabled={disabled || current >= pages} onClick={() => onPageChange(pages)}><ChevronsRight className="size-4" /></Button>
    </div>
  </nav>;
}

interface ListProps<T> {
  items: T[];
  label: string;
  search?: (item: T) => string;
  searchPlaceholder?: string;
  resetKey?: string;
  disabled?: boolean;
  children: (items: T[]) => ReactNode;
}

export function PaginatedList<T>({ items, label, search, searchPlaceholder = 'Buscar por nome ou dados', resetKey = '', disabled, children }: ListProps<T>) {
  const [query, setQuery] = useState('');
  const filtered = search ? items.filter(item => normalizeQuery(search(item)).includes(normalizeQuery(query))) : items;
  const pagination = usePagination(filtered, `${resetKey}:${query}`);
  return <div className="min-w-0 space-y-3">
    {search && <Input aria-label={`Buscar em ${label}`} placeholder={searchPlaceholder} value={query} onChange={event => setQuery(event.target.value)} />}
    {children(pagination.items)}
    <PaginationControls {...pagination} label={label} disabled={disabled} />
  </div>;
}

export interface DataColumn<T> {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
}

interface TableProps<T> {
  rows: T[];
  columns: DataColumn<T>[];
  label: string;
  search?: (item: T) => string;
  searchPlaceholder?: string;
  rowKey?: (item: T) => string;
  paginate?: boolean;
  resetKey?: string;
  emptyMessage?: string;
}

export function DataTable<T>({ rows, columns, label, search, searchPlaceholder, rowKey, paginate = true, resetKey, emptyMessage = 'Nenhum registro encontrado.' }: TableProps<T>) {
  const table = (items: T[]) => <div className="overflow-x-auto rounded-md border">
    <table className="w-full text-left text-sm">
      <caption className="sr-only">{label}</caption>
      <thead className="bg-muted"><tr>{columns.map(column => <th key={column.key} scope="col" className="whitespace-nowrap px-3 py-3 font-medium">{column.header}</th>)}</tr></thead>
      <tbody>{items.map((item, index) => <tr key={rowKey ? rowKey(item) : (item as { id?: string }).id ?? index} className="border-t hover:bg-muted/30">
        {columns.map(column => <td key={column.key} className="max-w-sm break-words px-3 py-3 align-top">{column.cell(item)}</td>)}
      </tr>)}{!items.length && <tr><td colSpan={columns.length} className="p-5 text-center text-muted-foreground">{emptyMessage}</td></tr>}</tbody>
    </table>
  </div>;
  return paginate ? <PaginatedList items={rows} label={label} search={search} searchPlaceholder={searchPlaceholder} resetKey={resetKey}>{table}</PaginatedList> : table(rows);
}