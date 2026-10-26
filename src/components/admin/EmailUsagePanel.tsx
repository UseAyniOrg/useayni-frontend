import { useEffect, useState, type FormEvent } from 'react';
import { Download, Loader2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UsageRow {
  organization_id: string | null;
  organization_name: string;
  provider: string;
  kind: string;
  total: number;
  accepted: number;
  delivered: number;
  queued: number;
  failed: number;
  bounced: number;
  simulated: number;
}

export default function EmailUsagePanel() {
  const [from, setFrom] = useState(() => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const load = async (event?: FormEvent) => {
    event?.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await api.get<UsageRow[]>('/email/usage', { params: { from, to } });
      setRows(response.data);
    } catch {
      setError('Não foi possível carregar o consumo de emails. Verifique a configuração e a migração do serviço.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { void load(); }, []);
  const visible = rows.filter(row => `${row.organization_name} ${row.kind} ${row.provider}`.toLowerCase().includes(filter.toLowerCase()));
  const totals = visible.reduce((result, row) => ({ accepted: result.accepted + row.accepted,
    delivered: result.delivered + row.delivered, queued: result.queued + row.queued, failed: result.failed + row.failed }),
  { accepted: 0, delivered: 0, queued: 0, failed: 0 });

  const download = () => {
    const cell = (value: unknown) => `"${String(value).replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""')}"`;
    const columns: Array<keyof UsageRow> = ['organization_name', 'provider', 'kind', 'accepted', 'delivered', 'queued', 'failed', 'bounced', 'simulated'];
    const csv = [columns.join(','), ...visible.map(row => columns.map(column => cell(row[column])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `email-usage-${from}-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-4 border-t pt-6" aria-label="Consumo de emails">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Emails transacionais</h2>
        <Button variant="outline" size="sm" onClick={download} disabled={!visible.length || busy}><Download className="size-4" />Exportar CSV</Button>
      </div>
      <form onSubmit={load} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1"><Label htmlFor="email-from">De</Label><Input id="email-from" type="date" value={from} onChange={event => setFrom(event.target.value)} required /></div>
        <div className="space-y-1"><Label htmlFor="email-to">Até</Label><Input id="email-to" type="date" value={to} min={from} onChange={event => setTo(event.target.value)} required /></div>
        <Button type="submit" variant="outline" disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}Atualizar</Button>
        <div className="min-w-48 flex-1 space-y-1"><Label htmlFor="email-filter">Organização, tipo ou provedor</Label><Input id="email-filter" value={filter} onChange={event => setFilter(event.target.value)} /></div>
      </form>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <dl className="grid grid-cols-2 gap-4 border-y py-4 sm:grid-cols-4">
        {[
          ['Aceitos pelo provedor', totals.accepted], ['Entregues', totals.delivered],
          ['Na fila', totals.queued], ['Falhas / investigar', totals.failed],
        ].map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{busy ? '...' : value}</dd></div>)}
      </dl>
      <Table>
        <TableHeader><TableRow>{['Organização', 'Provedor', 'Tipo', 'Aceitos', 'Entregues', 'Na fila', 'Falhas', 'Bounces', 'Simulados'].map(label => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader>
        <TableBody>
          {visible.map(row => <TableRow key={`${row.organization_id}:${row.provider}:${row.kind}`}>
            <TableCell>{row.organization_name}</TableCell><TableCell>{row.provider}</TableCell><TableCell>{row.kind}</TableCell>
            {[row.accepted, row.delivered, row.queued, row.failed, row.bounced, row.simulated].map((value, index) => <TableCell key={index} className="tabular-nums">{value}</TableCell>)}
          </TableRow>)}
          {!busy && !visible.length && <TableRow><TableCell colSpan={9} className="h-20 text-center text-muted-foreground">Nenhum envio no período.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </section>
  );
}