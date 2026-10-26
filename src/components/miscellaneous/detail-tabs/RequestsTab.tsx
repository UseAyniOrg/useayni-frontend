import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { miscellaneousService } from '@/services/miscellaneousService';
import { DataTable } from '@/components/ui/data-table';

interface Request {
  id: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
  member: { name: string };
}

interface Props { miscId: string; isOwner: boolean; }

export function RequestsTab({ miscId, isOwner }: Props) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    miscellaneousService.listRequests(miscId).then(setRequests).finally(() => setLoading(false));
  };

  useEffect(() => { if (isOwner) load(); }, [miscId, isOwner]);

  const handle = async (requestId: string, status: 'approved' | 'rejected') => {
    await miscellaneousService.reviewRequest(miscId, requestId, { status });
    load();
  };

  if (!isOwner) return <p className="text-sm text-muted-foreground">Apenas donos podem ver as solicitações.</p>;
  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (requests.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma solicitação.</p>;

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-600',
  };

  return <DataTable rows={requests} label="solicitações" search={request => `${request.member.name} ${request.title} ${request.message} ${request.status}`}
    columns={[
      { key: 'member', header: 'Pessoa', cell: request => request.member.name },
      { key: 'title', header: 'Título', cell: request => request.title },
      { key: 'message', header: 'Mensagem', cell: request => request.message },
      { key: 'date', header: 'Data', cell: request => new Date(request.created_at).toLocaleDateString('pt-BR') },
      { key: 'status', header: 'Status', cell: request => <span className={`rounded px-2 py-1 text-xs ${statusColor[request.status] ?? ''}`}>{request.status}</span> },
      { key: 'actions', header: 'Ações', cell: request => request.status === 'pending' && <div className="flex gap-2">
        <Button size="sm" onClick={() => handle(request.id, 'approved')}>Aprovar</Button>
        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handle(request.id, 'rejected')}>Negar</Button>
      </div> },
    ]} />;
}
