import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { miscellaneousRoute, miscellaneousService } from '@/services/miscellaneousService';
import { TypeBadge, StatusBadge } from '../StatusBadge';
import type { Miscellaneous } from '@/services/miscellaneousService';
import { DataTable } from '@/components/ui/data-table';

interface Props { miscId: string; }

export function ChildrenTab({ miscId }: Props) {
  const navigate = useNavigate();
  const [grouped, setGrouped] = useState<Record<string, Miscellaneous[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    miscellaneousService.getChildren(miscId).then(setGrouped).finally(() => setLoading(false));
  }, [miscId]);

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const types = Object.keys(grouped);
  if (types.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma miscelânea filha.</p>;

  return <DataTable rows={Object.values(grouped).flat()} label="miscelâneas filhas" search={child => `${child.title} ${child.type} ${child.status}`}
    columns={[
      { key: 'title', header: 'Título', cell: child => <button type="button" className="text-left text-primary underline" onClick={() => navigate(miscellaneousRoute(`/${child.id}`))}>{child.title}</button> },
      { key: 'type', header: 'Tipo', cell: child => <TypeBadge type={child.type} /> },
      { key: 'status', header: 'Status', cell: child => <StatusBadge status={child.status} /> },
      { key: 'date', header: 'Início', cell: child => new Date(child.start_date).toLocaleDateString('pt-BR') },
    ]} />;
}
