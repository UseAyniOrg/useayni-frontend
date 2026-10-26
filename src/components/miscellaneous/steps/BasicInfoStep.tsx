import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MiscType } from '@/services/miscellaneousService';

interface Props {
  type: MiscType;
  values: Record<string, string | number | undefined>;
  onChange: (field: string, value: string | number | undefined) => void;
}

export function BasicInfoStep({ type, values, onChange }: Props) {
  const field = (name: string, label: string, inputType = 'text', required = false) => (
    <div className="space-y-1">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type={inputType}
        value={(values[name] as string) ?? ''}
        onChange={(e) => onChange(name, e.target.value || undefined)}
        maxLength={name === 'title' ? 120 : undefined}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {field('title', 'Título', 'text', true)}

      <div className="space-y-1">
        <Label htmlFor="description">
          Descrição <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="description"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          value={(values.description as string) ?? ''}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('start_date', 'Data de início', 'datetime-local', true)}
        {type !== 'goal' && field('end_date', 'Data de término', 'datetime-local', type !== 'activity')}
      </div>

      {/* Event-specific */}
      {type === 'event' && (
        <>
          {field('stream_link', 'Link de transmissão')}
          <div className="grid grid-cols-2 gap-3">
            {field('capacity_presential', 'Capacidade presencial', 'number')}
            {field('capacity_online', 'Capacidade online', 'number')}
          </div>
        </>
      )}

      {/* Meeting-specific */}
      {type === 'meeting' && (
        <>
          {field('meeting_link', 'Link da videoconferência')}
          <div className="space-y-1">
            <Label htmlFor="agenda">Pauta</Label>
            <textarea
              id="agenda"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              value={(values.agenda as string) ?? ''}
              onChange={(e) => onChange('agenda', e.target.value)}
            />
          </div>
        </>
      )}

      {/* Goal-specific */}
      {type === 'goal' && (
        <div className="grid grid-cols-2 gap-3">
          {field('goal_target', 'Valor alvo', 'number', true)}
          {field('goal_unit', 'Unidade de medida', 'text', true)}
        </div>
      )}

      {/* Activity-specific */}
      {type === 'activity' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="activity_status">Status</Label>
            <select
              id="activity_status"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={(values.activity_status as string) ?? 'pending'}
              onChange={(e) => onChange('activity_status', e.target.value)}
            >
              <option value="pending">Pendente</option>
              <option value="in_progress">Em andamento</option>
              <option value="done">Concluída</option>
              <option value="blocked">Impedida</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="activity_priority">Prioridade</Label>
            <select
              id="activity_priority"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={(values.activity_priority as string) ?? 'medium'}
              onChange={(e) => onChange('activity_priority', e.target.value)}
            >
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </div>
        </div>
      )}

      {/* Location */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground select-none">
          + Adicionar localização
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {field('location_zip', 'CEP')}
          {field('location_street', 'Rua')}
          {field('location_number', 'Número')}
          {field('location_neighborhood', 'Bairro')}
          {field('location_city', 'Cidade')}
          {field('location_state', 'UF')}
        </div>
      </details>
    </div>
  );
}
