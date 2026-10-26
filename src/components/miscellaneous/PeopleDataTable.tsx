import { useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { filterPeopleRows, normalizeSearch, type PeopleTableColumn, type PeopleTableFilter, type PeopleTableRow } from './peopleTableData';
import { PaginationControls } from '@/components/ui/data-table';

interface Props {
  rows: PeopleTableRow[];
  columns: PeopleTableColumn[];
  title: string;
  renderActions?: (row: PeopleTableRow) => ReactNode;
}

export function PeopleDataTable({ rows, columns, title, renderActions }: Props) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<PeopleTableFilter[]>([]);
  const [sort, setSort] = useState({ key: 'name', descending: false });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows.find(row => row.id === selectedId);
  const filtered = useMemo(() => filterPeopleRows(rows, search, filters).sort((a, b) => {
    const result = normalizeSearch(a.values[sort.key] ?? '').localeCompare(normalizeSearch(b.values[sort.key] ?? ''), 'pt-BR', { numeric: true });
    return sort.descending ? -result : result;
  }), [rows, search, filters, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const displayed = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const update = (id: number, patch: Partial<PeopleTableFilter>) => {
    setPage(1);
    setFilters(current => current.map(filter => filter.id === id ? { ...filter, ...patch } : filter));
  };
  return <section className="min-w-0 space-y-4">
    <h2 className="font-semibold">{title}</h2>
    <label className="grid gap-1 text-sm"><span>Pesquisar em todos os dados</span>
      <Input placeholder="Ex.: eng — nome, email, curso ou respostas" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
    </label>
    <div className="space-y-2 rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">Combine filtros por campo. Todos os filtros devem ser atendidos. A busca ignora maiúsculas e acentos e inclui os dados do detalhe.</p>
      {filters.map((filter, index) => <div key={filter.id} className="flex flex-wrap gap-2">
        <select aria-label={`Campo do filtro ${index + 1}`} className="max-w-full rounded-md border bg-background p-2 text-sm" value={filter.column}
          onChange={event => update(filter.id, { column: event.target.value, operator: 'contains', value: '' })}>
          {columns.map(column => <option key={column.key} value={column.key}>{column.label}</option>)}
        </select>
        <select aria-label={`Operação do filtro ${index + 1}`} className="rounded-md border bg-background p-2 text-sm" value={filter.operator}
          onChange={event => update(filter.id, { operator: event.target.value as PeopleTableFilter['operator'] })}>
          <option value="contains">Contém</option><option value="not_contains">Não contém</option><option value="equals">Igual a</option><option value="starts_with">Começa com</option>
          <option value="empty">Não informado</option><option value="not_empty">Informado</option>
          {columns.find(column => column.key === filter.column)?.date && <><option value="gte">A partir de</option><option value="lte">Até</option></>}
        </select>
        {!['empty', 'not_empty'].includes(filter.operator) && <Input aria-label={`Valor do filtro ${index + 1}`} className="w-56"
          type={['gte', 'lte'].includes(filter.operator) ? 'date' : 'text'} value={filter.value} onChange={event => update(filter.id, { value: event.target.value })} />}
        <Button type="button" variant="ghost" onClick={() => { setFilters(current => current.filter(item => item.id !== filter.id)); setPage(1); }}>Remover filtro {index + 1}</Button>
      </div>)}
      <div className="flex gap-2">
        <Button type="button" variant="outline" disabled={!columns.length} onClick={() => setFilters(current => [...current, { id: (current.at(-1)?.id ?? 0) + 1, column: columns[0].key, operator: 'contains', value: '' }])}>Adicionar filtro</Button>
        <Button type="button" variant="ghost" onClick={() => { setFilters([]); setSearch(''); setPage(1); }}>Limpar filtros</Button>
      </div>
    </div>
    <p role="status" className="text-sm font-medium">{filtered.length} de {rows.length} registro(s) encontrado(s)</p>
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{title}. Clique no nome para ver todos os dados.</caption>
        <thead className="bg-muted"><tr>{columns.filter(column => !column.key.includes('.')).map(column => <th key={column.key} scope="col" className="whitespace-nowrap p-3" aria-sort={sort.key === column.key ? sort.descending ? 'descending' : 'ascending' : 'none'}>
          <button type="button" className="font-semibold" onClick={() => setSort(current => ({ key: column.key, descending: current.key === column.key ? !current.descending : false }))}>{column.label}{sort.key === column.key ? sort.descending ? ' ↓' : ' ↑' : ''}</button>
        </th>)}{renderActions && <th scope="col" className="p-3">Ações</th>}</tr></thead>
        <tbody>{displayed.map(row => <tr key={row.id} className="border-t hover:bg-muted/30">
          {columns.filter(column => !column.key.includes('.')).map(column => <td key={column.key} className="p-3">
            {column.key === 'name' ? <button type="button" className="text-left font-medium text-primary underline" onClick={() => setSelectedId(row.id)}>{row.name}</button>
              : column.date && row.values[column.key] ? new Date(row.values[column.key]).toLocaleString('pt-BR') : row.values[column.key] || '—'}
          </td>)}
          {renderActions && <td className="p-3">{renderActions(row)}</td>}
        </tr>)}</tbody>
      </table>
      {!displayed.length && <p className="p-4 text-sm text-muted-foreground">Nenhum registro corresponde aos filtros.</p>}
    </div>
    <PaginationControls page={currentPage} pageSize={pageSize} total={filtered.length} label={title}
      onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }} />
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelectedId(null); }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{selected?.name}</DialogTitle><DialogDescription>Dados disponíveis neste cadastro e nesta miscelânea.</DialogDescription></DialogHeader>
        {selected && <dl className="grid gap-4 sm:grid-cols-2">{columns.map(column => <div key={column.key}>
          <dt className="text-xs font-medium text-muted-foreground">{column.label}</dt>
          <dd className="whitespace-pre-wrap break-words text-sm">{column.date && selected.values[column.key] ? new Date(selected.values[column.key]).toLocaleString('pt-BR') : selected.values[column.key] || 'Não informado'}</dd>
        </div>)}</dl>}
      </DialogContent>
    </Dialog>
  </section>;
}
