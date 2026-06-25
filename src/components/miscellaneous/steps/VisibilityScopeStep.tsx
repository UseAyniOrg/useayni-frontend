import { Label } from '@/components/ui/label';
import { ScopeRulesBuilder } from '@/components/ui/scope-rules-builder';
import { MiscellaneousSearchInput } from '@/components/ui/miscellaneous-search-input';
import type { MiscType, MiscParticipation, ScopeRule, Miscellaneous } from '@/services/miscellaneousService';

interface Props {
  type: MiscType;
  participation: MiscParticipation;
  scopeRules: ScopeRule[];
  parent?: Miscellaneous;
  maxParticipants?: number;
  onParticipationChange: (v: MiscParticipation) => void;
  onScopeRulesChange: (rules: ScopeRule[]) => void;
  onParentChange: (item: Miscellaneous | undefined) => void;
  onMaxParticipantsChange: (v: number | undefined) => void;
  estimatedStatus: string;
}

export function VisibilityScopeStep({
  participation, scopeRules, parent, maxParticipants,
  onParticipationChange, onScopeRulesChange, onParentChange,
  onMaxParticipantsChange, estimatedStatus,
}: Props) {
  return (
    <div className="space-y-6">

      {/* Participation type */}
      <div className="space-y-2">
        <Label>Tipo de participação</Label>
        <p className="text-xs text-muted-foreground">
          Define como os membros entram nesta miscelânea.
        </p>
        <div className="flex gap-3">
          {(['public', 'private'] as MiscParticipation[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onParticipationChange(v)}
              className={`flex-1 rounded-lg border p-3 text-sm text-left transition-colors space-y-0.5
                ${participation === v ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}
            >
              <p className="font-medium">{v === 'public' ? '🔓 Aberta' : '🔒 Fechada'}</p>
              <p className="text-xs text-muted-foreground">
                {v === 'public'
                  ? 'Qualquer membro do escopo pode entrar livremente'
                  : 'Membros solicitam entrada — donos aprovam ou recusam'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Scope rules */}
      <div className="space-y-2">
        <Label>Quem pode ver esta miscelânea</Label>
        <p className="text-xs text-muted-foreground">
          Defina regras de visibilidade. Sem regras = toda a plataforma.
          Múltiplas regras são combinadas com <strong>OU</strong>.
        </p>
        <ScopeRulesBuilder rules={scopeRules} onChange={onScopeRulesChange} />
      </div>

      {/* Max participants */}
      <div className="space-y-2">
        <Label htmlFor="max_participants">
          Limite de participantes <span className="text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <input
          id="max_participants"
          type="number"
          min={1}
          className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Sem limite"
          value={maxParticipants ?? ''}
          onChange={(e) => onMaxParticipantsChange(e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>

      {/* Status preview */}
      <div className={`rounded-lg border p-3 text-sm ${estimatedStatus === 'active'
        ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
        : 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'}`}>
        {estimatedStatus === 'active'
          ? '✅ Será criada como Ativa imediatamente.'
          : '⏳ Este escopo requer aprovação de um gestor. Status: Pendente de aprovação.'}
      </div>

      {/* Parent selection */}
      <div className="space-y-2">
        <Label>Miscelânea pai <span className="text-muted-foreground font-normal">(opcional)</span></Label>
        <p className="text-xs text-muted-foreground">
          Datas desta miscelânea serão limitadas ao período do pai. Se não informar data de término, será herdada do pai.
        </p>
        <MiscellaneousSearchInput
          value={parent}
          onChange={onParentChange}
          placeholder="Buscar miscelânea por título…"
        />
      </div>
    </div>
  );
}
