import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { orgUnitService, type OrgUnit, type Position } from '@/services/orgUnitService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type HierarchyEditTarget = { kind: 'unit'; value: OrgUnit } | { kind: 'position'; value: Position };

export default function HierarchyEditor({ target, units, onClose, onSaved }: {
  target: HierarchyEditTarget;
  units: OrgUnit[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(target.value.name);
  const [parent, setParent] = useState(target.kind === 'unit' ? target.value.parent_id ?? '' : '');
  const [status, setStatus] = useState(target.kind === 'unit' ? target.value.status : 'ACTIVE');
  const [duration, setDuration] = useState(target.kind === 'position' ? String(target.value.mandate_duration_days ?? '') : '');
  const [investiture, setInvestiture] = useState(target.kind === 'position' ? target.value.investiture_type : 'ELECTION');
  const [deputy, setDeputy] = useState(target.kind === 'position' && target.value.allows_deputy);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (target.kind === 'unit') {
        await orgUnitService.update(target.value.id, { name: name.trim(), parent_id: parent || null, status });
      } else {
        await orgUnitService.updatePosition(target.value.id, {
          name: name.trim(), investiture_type: investiture,
          ...(duration ? { mandate_duration_days: Number(duration) } : {}),
          allows_deputy: deputy,
        });
      }
      await onSaved();
      onClose();
    } catch (cause: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(cause) ? cause.response?.data.message : undefined;
      setError(message ?? 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar {target.kind === 'unit' ? 'unidade' : 'cargo'}</DialogTitle></DialogHeader>
        <form onSubmit={(event) => void save(event)} className="space-y-4">
          <label className="grid gap-1 text-sm">Nome
            <Input required maxLength={target.kind === 'unit' ? 255 : 100} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          {target.kind === 'unit' ? (
            <>
              <label className="grid gap-1 text-sm">Unidade superior
                <select className="rounded-md border bg-background p-2" value={parent} onChange={(event) => setParent(event.target.value)}>
                  <option value="">Raiz da organização</option>
                  {units.filter((unit) => unit.id !== target.value.id).map((unit) => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">Status
                <select className="rounded-md border bg-background p-2" value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="ACTIVE">Ativa</option><option value="INACTIVE">Inativa</option>
                  <option value="PENDING">Pendente</option><option value="PENDING_DELETION">Exclusão pendente</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <label className="grid gap-1 text-sm">Investidura
                <select className="rounded-md border bg-background p-2" value={investiture} onChange={(event) => {
                  const value = event.target.value;
                  if (value === 'ELECTION' || value === 'APPOINTMENT' || value === 'AUTOMATIC') setInvestiture(value);
                }}>
                  <option value="ELECTION">Eleição</option><option value="APPOINTMENT">Nomeação</option>
                  <option value="AUTOMATIC">Automática</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">Duração dos novos mandatos (dias)
                <Input type="number" min={1} max={36500} value={duration} onChange={(event) => setDuration(event.target.value)} />
              </label>
              <label className="flex gap-2 text-sm">
                <input type="checkbox" checked={deputy} onChange={(event) => setDeputy(event.target.checked)} />Permitir suplente
              </label>
              <p className="text-xs text-muted-foreground">A edição do cargo não altera datas de mandatos já atribuídos.</p>
            </>
          )}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving || !name.trim()}>{saving ? 'Salvando...' : 'Salvar alterações'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
