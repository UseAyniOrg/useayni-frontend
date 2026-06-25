import { Progress } from '@/components/ui/progress';
import type { Miscellaneous } from '@/services/miscellaneousService';

interface Props { misc: Miscellaneous; }

export function OverviewTab({ misc }: Props) {
  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground leading-relaxed">{misc.description}</p>

      <div className="grid grid-cols-2 gap-3">
        <div><span className="font-medium">Início:</span> {fmt(misc.start_date)}</div>
        {misc.end_date && <div><span className="font-medium">Término:</span> {fmt(misc.end_date)}</div>}
      </div>

      {/* Event */}
      {misc.type === 'event' && (
        <div className="space-y-1 rounded-lg border p-3">
          {misc.stream_link && <p><span className="font-medium">Transmissão:</span> <a href={misc.stream_link} target="_blank" rel="noreferrer" className="text-primary underline">{misc.stream_link}</a></p>}
          {misc.capacity_presential && <p><span className="font-medium">Capacidade presencial:</span> {misc.capacity_presential}</p>}
          {misc.capacity_online && <p><span className="font-medium">Capacidade online:</span> {misc.capacity_online}</p>}
        </div>
      )}

      {/* Meeting */}
      {misc.type === 'meeting' && (
        <div className="space-y-1 rounded-lg border p-3">
          {misc.meeting_link && <p><span className="font-medium">Link:</span> <a href={misc.meeting_link} target="_blank" rel="noreferrer" className="text-primary underline">{misc.meeting_link}</a></p>}
          {misc.agenda && <p><span className="font-medium">Pauta:</span> {misc.agenda}</p>}
        </div>
      )}

      {/* Goal */}
      {misc.type === 'goal' && misc.goal_target != null && (
        <div className="space-y-2 rounded-lg border p-3">
          <div className="flex justify-between text-xs">
            <span>Progresso</span>
            <span>{misc.goal_progress ?? 0} / {misc.goal_target} {misc.goal_unit}</span>
          </div>
          <Progress value={((misc.goal_progress ?? 0) / misc.goal_target) * 100} />
        </div>
      )}

      {/* Activity */}
      {misc.type === 'activity' && (
        <div className="flex gap-3">
          <span className="rounded-full bg-muted px-3 py-1 text-xs">Status: {misc.activity_status ?? '—'}</span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs">Prioridade: {misc.activity_priority ?? '—'}</span>
        </div>
      )}

      {/* Location */}
      {(misc as any).location_city && (
        <p className="text-muted-foreground text-xs">
          📍 {[(misc as any).location_street, (misc as any).location_number, (misc as any).location_neighborhood, (misc as any).location_city, (misc as any).location_state].filter(Boolean).join(', ')}
        </p>
      )}

      {/* Registration */}
      {misc.registration_start_date && (
        <div className="rounded-lg border p-3 text-xs space-y-1">
          <p className="font-medium">Inscrições</p>
          <p>Início: {fmt(misc.registration_start_date)}</p>
          {misc.registration_end_date && <p>Término: {fmt(misc.registration_end_date)}</p>}
          {misc.max_members && <p>Vagas: {misc.max_members}</p>}
        </div>
      )}

      {/* Public slug */}
      {misc.public_access_enabled && misc.public_slug && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs">
          🌐 URL pública: <a href={`/p/${misc.public_slug}`} className="text-primary underline">/p/{misc.public_slug}</a>
        </div>
      )}
    </div>
  );
}
