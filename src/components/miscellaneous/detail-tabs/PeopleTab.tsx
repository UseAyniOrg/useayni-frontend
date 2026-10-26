import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { miscellaneousService } from '@/services/miscellaneousService';
import { PeopleDataTable } from '../PeopleDataTable';
import { addDataColumns, addRegistrationColumns, textValue, type PeopleTableColumn, type PeopleTableRow } from '../peopleTableData';

interface Person {
  id: string;
  member: { id: string; name: string; email_personal?: string; phone?: string; cpf?: string; registration_status?: string };
  role?: string;
  is_creator?: boolean;
  joined_at?: string;
  details?: { membership_type: string; shared_profile: Record<string, unknown>; registration_data: Record<string, unknown>; custom_fields: Record<string, unknown> };
}
interface Props { miscId: string; isOwner: boolean; currentUserId: string }

export function PeopleTab({ miscId, isOwner, currentUserId }: Props) {
  const [owners, setOwners] = useState<Person[]>([]);
  const [members, setMembers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [addInput, setAddInput] = useState('');
  const [addType, setAddType] = useState<'owner' | 'member'>('member');
  const load = async () => {
    const data = await miscellaneousService.getPeople(miscId);
    setOwners(data.owners ?? []); setMembers(data.members ?? []);
  };
  useEffect(() => {
    let current = true;
    setLoading(true); setError('');
    miscellaneousService.getPeople(miscId).then(data => {
      if (current) { setOwners(data.owners ?? []); setMembers(data.members ?? []); }
    }).catch(() => { if (current) setError('Não foi possível carregar as pessoas desta miscelânea.'); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [miscId]);
  const action = async (operation: () => Promise<unknown>) => {
    setBusy(true); setError('');
    try { await operation(); await load(); }
    catch { setError('Não foi possível concluir a alteração ou atualizar a lista. Recarregue os dados antes de tentar novamente.'); }
    finally { setBusy(false); }
  };
  const data = useMemo(() => {
    const columns = new Map<string, PeopleTableColumn>([
      ['name', { key: 'name', label: 'Nome' }], ['role', { key: 'role', label: 'Participação' }],
    ]);
    if (isOwner) for (const [key, label] of [['email', 'Email'], ['phone', 'Telefone'], ['cpf', 'CPF'], ['membership', 'Vínculo'], ['profileType', 'Tipo de cadastro']]) columns.set(key, { key, label });
    columns.set('registered', { key: 'registered', label: 'Entrada no evento', date: true });
    const people = new Map<string, { person: Person; labels: string[] }>();
    for (const person of owners) people.set(person.member.id, { person, labels: [person.is_creator ? 'Criador' : 'Co-responsável'] });
    for (const person of members) {
      const existing = people.get(person.member.id);
      people.set(person.member.id, { person, labels: [...(existing?.labels ?? []), 'Participante'] });
    }
    const rows: PeopleTableRow[] = [...people].map(([id, { person, labels }]) => {
      const profile = person.details?.shared_profile ?? {};
      const values: Record<string, string> = { name: person.member.name, role: labels.join(', '), registered: person.joined_at ?? '' };
      if (isOwner) {
        Object.assign(values, { email: person.member.email_personal ?? '', phone: person.member.phone ?? '', cpf: person.member.cpf ?? '',
          membership: person.details?.membership_type === 'external' ? 'Externo' : 'Interno',
          profileType: textValue(profile.organization_profile_name) });
        addRegistrationColumns(values, columns, profile, person.details?.registration_data);
        addDataColumns(values, columns, 'custom', 'Cadastro interno', person.details?.custom_fields);
      }
      return { id, name: values.name, values };
    });
    return { columns: [...columns.values()], rows };
  }, [owners, members, isOwner]);
  if (loading) return <p className="text-sm text-muted-foreground">Carregando pessoas...</p>;
  return <div className="min-w-0 space-y-4">
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {isOwner && <div className="flex flex-wrap gap-2">
      <select aria-label="Tipo de participação a adicionar" className="rounded-md border bg-background px-3 py-2 text-sm" value={addType} onChange={event => setAddType(event.target.value as 'owner' | 'member')}>
        <option value="member">Participante</option><option value="owner">Co-responsável</option>
      </select>
      <Input aria-label="UUID do usuário" placeholder="UUID do usuário" value={addInput} onChange={event => setAddInput(event.target.value)} className="min-w-48 flex-1" />
      <Button disabled={busy || !addInput.trim()} onClick={() => void action(async () => {
        if (addType === 'owner') await miscellaneousService.addOwner(miscId, addInput.trim());
        else await miscellaneousService.addMember(miscId, addInput.trim());
        setAddInput('');
      })}>Adicionar</Button>
    </div>}
    <PeopleDataTable key={miscId} title="Pessoas da miscelânea" {...data} renderActions={isOwner ? row => <div className="flex flex-wrap gap-1">
      {owners.some(owner => owner.member.id === row.id && !owner.is_creator && row.id !== currentUserId) &&
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => void action(() => miscellaneousService.removeOwner(miscId, row.id))}>Remover responsável</Button>}
      {members.some(member => member.member.id === row.id) &&
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => void action(() => miscellaneousService.removeMember(miscId, row.id))}>Remover participante</Button>}
    </div> : undefined} />
  </div>;
}
