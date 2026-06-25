import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { miscellaneousService } from '@/services/miscellaneousService';
import type { MiscType } from '@/services/miscellaneousService';

const ATTENDANCE_TYPES: MiscType[] = ['event', 'meeting', 'activity'];

interface Session {
  id: string;
  title: string;
  mode: string;
  starts_at: string;
  ends_at: string;
}

interface Record {
  id: string;
  present: boolean;
  member: { id: string; name: string };
}

interface Props { miscId: string; miscType: MiscType; isOwner: boolean; currentUserId: string; }

export function AttendanceTab({ miscId, miscType, isOwner }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', mode: 'manual', starts_at: '', ends_at: '' });

  const loadSessions = () =>
    miscellaneousService.listAttendanceSessions(miscId).then(setSessions);

  const loadRecords = (sessionId: string) =>
    miscellaneousService.getAttendanceRecords(sessionId).then(setRecords);

  const loadToken = (sessionId: string) =>
    miscellaneousService.getAttendanceToken(sessionId).then((t) => setUserToken(t.token));

  useEffect(() => { loadSessions(); }, [miscId]);

  const openSession = async (sessionId: string) => {
    setActiveSession(sessionId);
    await loadRecords(sessionId);
    if (!isOwner) await loadToken(sessionId);
  };

  const createSession = async () => {
    await miscellaneousService.createAttendanceSession(miscId, form);
    setCreating(false);
    setForm({ title: '', mode: 'manual', starts_at: '', ends_at: '' });
    loadSessions();
  };

  const togglePresence = async (sessionId: string, userId: string, current: boolean) => {
    await miscellaneousService.manualCheckIn(sessionId, userId, !current);
    loadRecords(sessionId);
  };

  if (!ATTENDANCE_TYPES.includes(miscType)) {
    return <p className="text-sm text-muted-foreground">Este tipo de miscelânea não suporta presença.</p>;
  }

  return (
    <div className="space-y-4">
      {isOwner && (
        <Button size="sm" onClick={() => setCreating(!creating)}>
          {creating ? 'Cancelar' : '+ Nova sessão'}
        </Button>
      )}

      {creating && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="space-y-1">
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Modo</Label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}>
              <option value="manual">Manual</option>
              <option value="qr_code">QR Code</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Início</Label>
              <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Fim</Label>
              <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))} />
            </div>
          </div>
          <Button size="sm" onClick={createSession}>Criar sessão</Button>
        </div>
      )}

      {/* Sessions list */}
      {sessions.length === 0 && !creating && (
        <p className="text-sm text-muted-foreground">Nenhuma sessão de presença criada.</p>
      )}
      {sessions.map((s) => (
        <div key={s.id} className="rounded-lg border overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50"
            onClick={() => activeSession === s.id ? setActiveSession(null) : openSession(s.id)}
          >
            <div>
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.mode} · {new Date(s.starts_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <span className="text-xs text-muted-foreground">{activeSession === s.id ? '▲' : '▼'}</span>
          </button>

          {activeSession === s.id && (
            <div className="border-t px-4 py-3 space-y-2">
              {/* QR token for participant */}
              {!isOwner && userToken && (
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Seu token de presença</p>
                  <code className="text-xs break-all">{userToken}</code>
                </div>
              )}
              {/* Manual list */}
              {isOwner && records.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span>{r.member.name}</span>
                  <button
                    className={`w-10 h-5 rounded-full transition-colors ${r.present ? 'bg-green-500' : 'bg-muted-foreground/30'}`}
                    onClick={() => togglePresence(s.id, r.member.id, r.present)}
                  />
                </div>
              ))}
              {isOwner && records.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum registro ainda.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
