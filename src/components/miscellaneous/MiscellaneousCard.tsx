import { useNavigate } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TypeBadge, StatusBadge, VisibilityBadge } from './StatusBadge';
import type { Miscellaneous } from '@/services/miscellaneousService';

interface Props {
  misc: Miscellaneous;
}

export function MiscellaneousCard({ misc }: Props) {
  const navigate = useNavigate();

  const formattedDate = new Date(misc.start_date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/miscelaneas/${misc.id}`)}
    >
      {misc.cover_url && (
        <div className="h-32 w-full overflow-hidden rounded-t-lg">
          <img src={misc.cover_url} alt={misc.title} className="h-full w-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-1 mb-2">
          <TypeBadge type={misc.type} />
          <StatusBadge status={misc.status} />
          <VisibilityBadge visibility={misc.visibility ?? 'public'} />
        </div>
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{misc.title}</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{misc.description}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
          {misc.max_members && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {misc.max_members} vagas
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
