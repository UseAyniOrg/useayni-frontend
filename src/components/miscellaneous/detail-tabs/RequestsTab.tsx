import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { miscellaneousService } from '@/services/miscellaneousService';

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

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.id} className="rounded-lg border p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.member.name} · {new Date(r.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[r.status] ?? ''}`}>{r.status}</span>
          </div>
          <p className="text-xs text-muted-foreground">{r.message}</p>
          {r.status === 'pending' && (
            <div className="flex gap-2">
              <Button size="sm" className="h-7" onClick={() => handle(r.id, 'approved')}>Aprovar</Button>
              <Button size="sm" variant="outline" className="h-7 text-destructive" onClick={() => handle(r.id, 'rejected')}>Negar</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
