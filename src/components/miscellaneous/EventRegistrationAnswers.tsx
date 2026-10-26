import { useEffect, useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import type { ExternalRegistrationField } from '@/services/miscellaneousService';
import { RegistrationDataFields } from '@/components/auth/RegistrationProfileFields';
import { Button } from '@/components/ui/button';

interface Answers {
  registration_fields: ExternalRegistrationField[];
  registration_data: Record<string, unknown>;
  pending_fields: ExternalRegistrationField[];
}

export function EventRegistrationAnswers({ eventId }: { eventId: string }) {
  const [requirements, setRequirements] = useState<Answers | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const base = `/event-participation/${eventId}/answers`;
  useEffect(() => {
    let current = true;
    setRequirements(null); setError(''); setEditing(false); setSaved(false);
    api.get<Answers>(base).then(({ data }) => {
      if (current) { setRequirements(data); setValues(data.registration_data); }
    }).catch(() => { if (current) setError('Não foi possível verificar os dados pendentes da sua inscrição.'); });
    return () => { current = false; };
  }, [base]);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const { data } = await api.patch<Answers>(base, {
        registration_data: Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '')),
        accepted_privacy: true,
      });
      setRequirements(data); setValues(data.registration_data); setEditing(false); setSaved(true);
    } catch (cause: unknown) {
      const message = typeof cause === 'object' && cause !== null && 'response' in cause
        ? (cause as { response?: { data?: { message?: unknown } } }).response?.data?.message : undefined;
      setError(typeof message === 'string' ? message : 'Não foi possível atualizar as respostas.');
    } finally { setSaving(false); }
  };
  if (!requirements) return error ? <p role="alert" className="text-sm text-destructive">{error}</p> : <p className="text-sm text-muted-foreground">Verificando os dados da inscrição...</p>;
  if (!requirements.registration_fields.length) return null;
  const pending = requirements.pending_fields.length > 0;
  return <section className={`space-y-3 rounded-xl border p-4 ${pending ? 'border-amber-400 bg-amber-50/30' : ''}`}>
    <h3 className="font-semibold">Dados específicos deste evento</h3>
    {pending && <div role="status" className="space-y-2 text-sm">
      <p className="font-medium">Existem dados pendentes na sua inscrição.</p>
      <p>A organização adicionou ou atualizou perguntas. Sua inscrição continua confirmada; complete os dados abaixo sem se inscrever novamente.</p>
      <p>Confira: {requirements.pending_fields.map(field => field.label).join(', ')}.</p>
    </div>}
    {!editing && <Button type="button" variant={pending ? 'default' : 'outline'} onClick={() => { setEditing(true); setSaved(false); }}>
      {pending ? 'Completar dados do evento' : 'Consultar ou atualizar minhas respostas'}
    </Button>}
    {editing && <form className="space-y-4" onSubmit={event => void save(event)}>
      <RegistrationDataFields fields={requirements.registration_fields} values={values} onChange={setValues} />
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" required />Autorizo o uso destas respostas pela organização para minha participação neste evento.</label>
      <div className="flex gap-2"><Button disabled={saving}>{saving ? 'Salvando...' : 'Salvar respostas'}</Button>
        <Button type="button" variant="ghost" disabled={saving} onClick={() => setEditing(false)}>Cancelar</Button></div>
    </form>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {saved && <p role="status" className="text-sm text-emerald-700">Respostas atualizadas. Sua inscrição foi mantida.</p>}
  </section>;
}
