import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orgUnitService, type OrgUnit } from '@/services/orgUnitService';
import type { ScopeRule } from '@/services/miscellaneousService';

interface Props {
  rules: ScopeRule[];
  onChange: (rules: ScopeRule[]) => void;
  canManageScope: boolean;
}

export function ScopeRulesBuilder({ rules, onChange, canManageScope }: Props) {
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!canManageScope) return;
    let active = true;
    setLoading(true);
    orgUnitService.listAll()
      .then((items) => { if (active) setUnits(items); })
      .catch(() => { if (active) setLoadError('Não foi possível carregar as unidades da organização.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canManageScope]);

  const update = (index: number, rule: ScopeRule) =>
    onChange(rules.map((item, itemIndex) => itemIndex === index ? rule : item));
  const remove = (index: number) => onChange(rules.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3">
      {rules.length === 0 && (
        <p className="text-sm text-muted-foreground">Sem restrição adicional: visível para os membros da organização.</p>
      )}
      {rules.map((rule, index) => (
        <div key={`${rule.type}-${index}`} className="grid gap-3 rounded-md border bg-muted/20 p-3 sm:grid-cols-[minmax(10rem,0.7fr)_minmax(12rem,1fr)_auto] sm:items-end">
          <div className="space-y-1">
            <Label htmlFor={`scope-type-${index}`}>Público</Label>
            <Select
              value={rule.type === 'org_unit' ? 'org_unit' : 'general'}
              onValueChange={(value) => update(index, value === 'org_unit'
                ? { type: 'org_unit' }
                : { type: 'general' })}
            >
              <SelectTrigger id={`scope-type-${index}`}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Toda a organização</SelectItem>
                <SelectItem value="org_unit">Unidade específica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {rule.type === 'org_unit' ? (
            <div className="space-y-1">
              <Label htmlFor={`scope-unit-${index}`}>Unidade</Label>
              <Select
                value={rule.org_unit_id ?? '__none__'}
                onValueChange={(value) => update(index, { ...rule, org_unit_id: value === '__none__' ? undefined : value })}
                disabled={loading || units.length === 0}
              >
                <SelectTrigger id={`scope-unit-${index}`}><SelectValue placeholder={loading ? 'Carregando unidades...' : 'Selecione uma unidade'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" disabled>Selecione uma unidade</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}{unit.type?.name ? ` · ${unit.type.name}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="pb-2 text-sm text-muted-foreground">Inclui todos os membros ativos da organização.</p>
          )}
          <Button type="button" variant="ghost" size="icon" aria-label="Remover regra" onClick={() => remove(index)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {loadError && <p role="alert" className="text-sm text-destructive">{loadError}</p>}
      {rules.length > 1 && <p className="text-xs text-muted-foreground">As regras são combinadas com OU.</p>}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => onChange([...rules, { type: 'org_unit' }])}
        disabled={!canManageScope || loading || units.length === 0}
      >
        <Plus className="h-4 w-4" /> Adicionar unidade
      </Button>
      {canManageScope && !loading && units.length === 0 && (
        <p className="text-xs text-muted-foreground">Cadastre tipos e unidades em Hierarquia para usar escopos específicos.</p>
      )}
    </div>
  );
}
