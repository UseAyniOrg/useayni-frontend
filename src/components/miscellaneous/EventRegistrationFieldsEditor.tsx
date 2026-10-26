import type { ExternalRegistrationField } from '@/services/miscellaneousService';
import { Button } from '@/components/ui/button';

export function EventRegistrationFieldsEditor({ fields, onChange }: {
  fields: ExternalRegistrationField[];
  onChange: (fields: ExternalRegistrationField[]) => void;
}) {
  const update = (index: number, patch: Partial<ExternalRegistrationField>) =>
    onChange(fields.map((field, i) => i === index ? { ...field, ...patch } : field));
  return <section className="space-y-3 rounded-lg border p-4">
    <h2 className="font-semibold">Dados específicos deste evento</h2>
    <p className="text-sm text-muted-foreground">Perguntas apenas desta inscrição, para membros e comunidade. Os tipos de cadastro da organização são configurados separadamente. Respostas anteriores são preservadas. Participantes verão um aviso para completar dados novos ou incompatíveis, sem refazer a inscrição.</p>
    {fields.map((field, index) => <div key={index} className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
      <label className="grid gap-1 text-sm"><span>Rótulo do campo</span><input className="rounded border p-2" value={field.label} onChange={event => update(index, { label: event.target.value })} /></label>
      <label className="grid gap-1 text-sm"><span>Chave do campo</span><input className="rounded border p-2" value={field.key} onChange={event => update(index, { key: event.target.value })} /></label>
      <label className="grid gap-1 text-sm"><span>Tipo de campo</span><select className="rounded border bg-background p-2" value={field.type} onChange={event => update(index, { type: event.target.value as ExternalRegistrationField['type'], options: undefined })}>
        <option value="text">Texto</option><option value="email">Email</option><option value="number">Número</option><option value="date">Data</option><option value="select">Seleção</option><option value="checkbox">Confirmação</option>
      </select></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(field.required)} onChange={event => update(index, { required: event.target.checked })} />Obrigatório</label>
      {field.type === 'select' && <label className="grid gap-1 text-sm sm:col-span-2"><span>Opções (uma por linha)</span><textarea className="rounded border p-2" value={(field.options ?? []).join('\n')} onChange={event => update(index, { options: event.target.value.split('\n') })} /></label>}
      <Button type="button" variant="ghost" onClick={() => onChange(fields.filter((_, i) => i !== index))}>Remover campo</Button>
    </div>)}
    <Button type="button" variant="outline" disabled={fields.length >= 40} onClick={() => {
      let index = fields.length + 1;
      while (fields.some(field => field.key === `campo_${index}`)) index++;
      onChange([...fields, { key: `campo_${index}`, label: '', type: 'text', required: false }]);
    }}>Adicionar campo (até 40)</Button>
  </section>;
}
