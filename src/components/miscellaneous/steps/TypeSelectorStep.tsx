import type { MiscType } from '@/services/miscellaneousService';

const TYPES: { type: MiscType; label: string; description: string; icon: string }[] = [
  { type: 'project', label: 'Projeto', description: 'Agrupa eventos, metas, reuniões e atividades.', icon: '🗂️' },
  { type: 'event', label: 'Evento', description: 'Acontecimento com data e local definidos.', icon: '🎉' },
  { type: 'goal', label: 'Meta', description: 'Objetivo mensurável com progresso rastreável.', icon: '🎯' },
  { type: 'meeting', label: 'Reunião', description: 'Encontro com pauta e lista de presença.', icon: '🤝' },
  { type: 'activity', label: 'Atividade', description: 'Subtarefa com checklist e status de conclusão.', icon: '✅' },
  { type: 'form', label: 'Formulário', description: 'Coleta de dados, pesquisas e votações.', icon: '📋' },
];

interface Props {
  value?: MiscType;
  onChange: (type: MiscType) => void;
}

export function TypeSelectorStep({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Selecione o tipo de miscelânea que deseja criar.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TYPES.map(({ type, label, description, icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors hover:bg-muted
              ${value === type ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}`}
          >
            <span className="text-2xl">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
            <span className="text-xs text-muted-foreground leading-tight">{description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
