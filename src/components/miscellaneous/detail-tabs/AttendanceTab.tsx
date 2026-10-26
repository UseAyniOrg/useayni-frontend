import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { miscellaneousService } from '@/services/miscellaneousService';
import type { MiscType } from '@/services/miscellaneousService';
import { AttendanceQrCode } from '../AttendanceQrCode';
import { AttendanceQrScanner } from '../AttendanceQrScanner';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DataTable, PaginatedList } from '@/components/ui/data-table';

const ATTENDANCE_TYPES: MiscType[] = ['event', 'meeting', 'activity'];

interface Session {
  id: string;
  title: string;
  mode: string;
  starts_at: string;
  ends_at: string;
}

interface Record {
  id: string | null;
  present: boolean;
  member_id: string;
  member: { id: string; name: string };
}

interface Props { miscId: string; miscType: MiscType; isOwner: boolean; currentUserId: string; }

export function AttendanceTab({ miscId, miscType, isOwner }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const activeSessionRef = useRef<string | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', mode: 'manual', starts_at: '', ends_at: '' });
  const [qrInput, setQrInput] = useState('');
  const [qrError, setQrError] = useState('');
  const [qrSuccess, setQrSuccess] = useState('');
  const [validating, setValidating] = useState(false);
  const validationInFlight = useRef(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadSessions = () =>
    miscellaneousService.listAttendanceSessions(miscId).then(setSessions);

  const loadRecords = (sessionId: string) =>
    miscellaneousService.getAttendanceRecords(sessionId).then(data => {
      if (activeSessionRef.current === sessionId) setRecords(data);
    });

  const loadToken = (sessionId: string) =>
    miscellaneousService.getAttendanceToken(sessionId).then((t) => {
      if (activeSessionRef.current !== sessionId) return;
      setCheckedIn(t.checked_in);
      setUserToken(t.checked_in ? null : t.token);
    });

  useEffect(() => { loadSessions().catch(() => setQrError('Não foi possível carregar as sessões de presença.')); }, [miscId]);

  const openSession = async (sessionId: string) => {
    activeSessionRef.current = sessionId;
    setActiveSession(sessionId);
    setRecords([]);
    setQrInput('');
    setQrError('');
    setQrSuccess('');
    setCheckedIn(false);
    setUserToken(null);
    try {
      if (isOwner) await loadRecords(sessionId);
      else if (sessions.find(session => session.id === sessionId)?.mode === 'qr_code') await loadToken(sessionId);
    } catch { if (activeSessionRef.current === sessionId) setQrError('Não foi possível carregar os dados desta sessão. Verifique se ela está aberta e tente novamente.'); }
  };

  const createSession = async () => {
    try {
      await miscellaneousService.createAttendanceSession(miscId, form);
      setCreating(false);
      setForm({ title: '', mode: 'manual', starts_at: '', ends_at: '' });
      await loadSessions();
    } catch { setQrError('Não foi possível criar a sessão. Confira os dados e tente novamente.'); }
  };

  const togglePresence = async (sessionId: string, userId: string, current: boolean) => {
    try {
      await miscellaneousService.manualCheckIn(sessionId, userId, !current);
      await loadRecords(sessionId);
    } catch { setQrError('Não foi possível atualizar a presença.'); }
  };

  const deleteSession = async () => {
    if (!sessionToDelete || deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await miscellaneousService.deleteAttendanceSession(sessionToDelete.id);
      setSessions(current => current.filter(session => session.id !== sessionToDelete.id));
      if (activeSessionRef.current === sessionToDelete.id) {
        activeSessionRef.current = null;
        setActiveSession(null);
        setRecords([]);
        setUserToken(null);
        setCheckedIn(false);
        setQrInput('');
      }
      setQrError('');
      setQrSuccess('Sessão de presença excluída.');
      setSessionToDelete(null);
    } catch {
      setDeleteError('Não foi possível excluir a sessão. Confira sua conexão e permissão e tente novamente.');
    } finally { setDeleting(false); }
  };

  const handleQrCheckIn = async (sessionId: string, scannedToken = qrInput) => {
    if (!scannedToken.trim() || validationInFlight.current) return;
    validationInFlight.current = true;
    setValidating(true);
    setQrError('');
    setQrSuccess('');
    try {
      const result = await miscellaneousService.checkInByQr(sessionId, scannedToken.trim());
      setQrSuccess(`Presença confirmada: ${result.member?.name ?? 'membro'}`);
      setQrInput('');
      try { await loadRecords(sessionId); }
      catch { setQrError('Presença validada, mas não foi possível atualizar a lista. Reabra a sessão para consultar.'); }
    } catch (cause: unknown) {
      const message = typeof cause === 'object' && cause !== null && 'response' in cause
        ? (cause as { response?: { data?: { message?: unknown } } }).response?.data?.message : undefined;
      setQrError(typeof message === 'string' ? message : 'Não foi possível validar o código. Confira a conexão e a sessão.');
    } finally { validationInFlight.current = false; setValidating(false); }
  };

  if (!ATTENDANCE_TYPES.includes(miscType)) {
    return <p className="text-sm text-muted-foreground">Este tipo de miscelânea não suporta presença.</p>;
  }

  return (
    <div className="space-y-4">
      {qrError && <p role="alert" className="text-sm text-destructive">{qrError}</p>}
      {qrSuccess && <p role="status" className="text-sm text-green-700">{qrSuccess}</p>}
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

      {sessions.length === 0 && !creating && (
        <p className="text-sm text-muted-foreground">Nenhuma sessão de presença criada.</p>
      )}
      <PaginatedList items={sessions} label="sessões de presença" search={session => session.title} disabled={validating || deleting}>
      {visibleSessions => <div className="space-y-3">{visibleSessions.map((s) => (
        <div key={s.id} className="rounded-lg border overflow-hidden">
          <div className="flex items-center">
          <button
            className="min-w-0 flex-1 flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/50"
            disabled={validating || deleting}
            onClick={() => {
              if (activeSession === s.id) { activeSessionRef.current = null; setActiveSession(null); }
              else void openSession(s.id);
            }}
          >
            <div className="min-w-0">
              <p className="break-words text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.mode} · {new Date(s.starts_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <span className="text-xs text-muted-foreground">{activeSession === s.id ? '▲' : '▼'}</span>
          </button>
          {isOwner && <Button type="button" size="icon" variant="ghost" className="mr-2 shrink-0 text-destructive hover:text-destructive"
            title="Excluir sessão de presença" aria-label={`Excluir sessão ${s.title}`} disabled={validating || deleting}
            onClick={() => { setDeleteError(''); setSessionToDelete(s); }}>
            <Trash2 className="size-4" />
          </Button>}
          </div>

          {activeSession === s.id && (
            <div className="border-t px-4 py-3 space-y-3">
              {/* QR token for participant */}
              {!isOwner && checkedIn && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                  <p className="text-sm font-medium text-green-700">✓ Presença validada</p>
                </div>
              )}
              {!isOwner && !checkedIn && userToken && (
                <AttendanceQrCode token={userToken} />
              )}
              {!isOwner && s.mode === 'qr_code' && (
                <Button size="sm" variant="outline" onClick={() => void openSession(s.id)}>Atualizar minha presença</Button>
              )}

              {/* QR check-in input for owner */}
              {isOwner && s.mode === 'qr_code' && (
                <div className="space-y-2">
                  <AttendanceQrScanner key={s.id} disabled={!!sessionToDelete} paused={validating} onRead={token => handleQrCheckIn(s.id, token)} />
                  <Label className="text-xs">Validar token do membro</Label>
                  <div className="flex gap-2">
                    <Input
                      className="text-xs font-mono"
                      placeholder="Cole ou escaneie o token aqui"
                      value={qrInput}
                      onChange={(e) => { setQrInput(e.target.value); setQrError(''); setQrSuccess(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleQrCheckIn(s.id)}
                    />
                    <Button size="sm" onClick={() => handleQrCheckIn(s.id)} disabled={!qrInput.trim() || validating}>{validating ? 'Validando...' : 'Validar'}</Button>
                  </div>
                </div>
              )}

              {isOwner && <DataTable rows={records} label="lista de presença" rowKey={record => record.member_id}
                search={record => record.member.name} searchPlaceholder="Buscar por nome cadastrado" resetKey={s.id}
                columns={[
                  { key: 'name', header: 'Nome cadastrado', cell: record => record.member.name },
                  { key: 'status', header: 'Situação', cell: record => record.present ? 'Presente' : 'Ausente' },
                  { key: 'presence', header: 'Presença', cell: record => <input type="checkbox" className="size-4 accent-primary"
                    aria-label={`Presença de ${record.member.name}`} checked={record.present} disabled={validating}
                    onChange={() => void togglePresence(s.id, record.member_id, record.present)} /> },
                ]} />}
            </div>
          )}
        </div>
      ))}</div>}
      </PaginatedList>
      <Dialog open={!!sessionToDelete} onOpenChange={open => { if (!open && !deleting) setSessionToDelete(null); }}>
        <DialogContent role="alertdialog" showCloseButton={!deleting} onOpenAutoFocus={event => {
          event.preventDefault();
          document.getElementById('cancel-attendance-deletion')?.focus();
        }}>
          <DialogHeader>
            <DialogTitle>Excluir sessão de presença?</DialogTitle>
            <DialogDescription className="break-words">A sessão "{sessionToDelete?.title}" será excluída junto com todas as presenças registradas e os tokens de QR Code.</DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <p><strong>Esta operação é irreversível.</strong> Os dados não poderão ser recuperados. Tem certeza de que deseja continuar?</p>
          </div>
          {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button id="cancel-attendance-deletion" type="button" variant="outline" disabled={deleting} onClick={() => setSessionToDelete(null)}>Cancelar</Button>
            <Button type="button" variant="destructive" disabled={deleting} onClick={() => void deleteSession()}>
              <Trash2 className="size-4" />{deleting ? 'Excluindo...' : 'Excluir definitivamente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
