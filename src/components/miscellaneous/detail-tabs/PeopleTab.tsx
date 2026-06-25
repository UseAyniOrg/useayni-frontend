import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { miscellaneousService } from '@/services/miscellaneousService';

interface Person {
  id: string;
  member: { id: string; name: string; profile_picture_url?: string };
  role?: string;
  is_creator?: boolean;
}

interface Props {
  miscId: string;
  isOwner: boolean;
  currentUserId: string;
}

export function PeopleTab({ miscId, isOwner, currentUserId }: Props) {
  const [owners, setOwners] = useState<Person[]>([]);
  const [members, setMembers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [addInput, setAddInput] = useState('');
  const [addType, setAddType] = useState<'owner' | 'member'>('member');

  const load = async () => {
    setLoading(true);
    try {
      const data = await miscellaneousService.getPeople(miscId);
      setOwners(data.owners ?? []);
      setMembers(data.members ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [miscId]);

  const handleAdd = async () => {
    if (!addInput.trim()) return;
    if (addType === 'owner') await miscellaneousService.addOwner(miscId, addInput.trim());
    else await miscellaneousService.addMember(miscId, addInput.trim());
    setAddInput('');
    load();
  };

  const handleRemoveOwner = async (userId: string) => {
    await miscellaneousService.removeOwner(miscId, userId);
    load();
  };

  const handleRemoveMember = async (userId: string) => {
    await miscellaneousService.removeMember(miscId, userId);
    load();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div className="space-y-5">
      {isOwner && (
        <div className="flex gap-2">
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={addType}
            onChange={(e) => setAddType(e.target.value as 'owner' | 'member')}
          >
            <option value="member">Membro</option>
            <option value="owner">Co-owner</option>
          </select>
          <Input
            placeholder="UUID do usuário"
            value={addInput}
            onChange={(e) => setAddInput(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={handleAdd}>Adicionar</Button>
        </div>
      )}

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Donos</h4>
        {owners.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div className="flex items-center gap-2">
              {o.member.profile_picture_url
                ? <img src={o.member.profile_picture_url} className="h-6 w-6 rounded-full" alt="" />
                : <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">{o.member.name[0]}</div>
              }
              <span className="text-sm">{o.member.name}</span>
              <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">{o.is_creator ? 'Criador' : o.role}</span>
            </div>
            {isOwner && !o.is_creator && o.member.id !== currentUserId && (
              <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => handleRemoveOwner(o.member.id)}>Remover</Button>
            )}
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Membros ({members.length})</h4>
        {members.length === 0 && <p className="text-sm text-muted-foreground">Nenhum membro ainda.</p>}
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div className="flex items-center gap-2">
              {m.member.profile_picture_url
                ? <img src={m.member.profile_picture_url} className="h-6 w-6 rounded-full" alt="" />
                : <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">{m.member.name[0]}</div>
              }
              <span className="text-sm">{m.member.name}</span>
            </div>
            {isOwner && (
              <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => handleRemoveMember(m.member.id)}>Remover</Button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
