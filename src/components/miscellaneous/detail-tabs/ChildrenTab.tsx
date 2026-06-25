import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { miscellaneousService } from '@/services/miscellaneousService';
import { TypeBadge, StatusBadge } from '../StatusBadge';
import type { Miscellaneous } from '@/services/miscellaneousService';

interface Props { miscId: string; }

const TYPE_LABELS: Record<string, string> = {
  project: 'Projetos', event: 'Eventos', goal: 'Metas',
  meeting: 'Reuniões', activity: 'Atividades', form: 'Formulários',
};

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

  return (
    <div className="space-y-5">
      {types.map((type) => (
        <section key={type} className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {TYPE_LABELS[type] ?? type} ({grouped[type].length})
          </h4>
          {grouped[type].map((child) => (
            <div
              key={child.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/miscelaneas/${child.id}`)}
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{child.title}</span>
                <div className="flex gap-1">
                  <TypeBadge type={child.type} />
                  <StatusBadge status={child.status} />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(child.start_date).toLocaleDateString('pt-BR')}
              </span>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
