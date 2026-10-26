import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { AttendanceQrCode } from './AttendanceQrCode';
import { PaginatedList } from '@/components/ui/data-table';

interface Session { id: string; title: string; mode: string; starts_at: string; ends_at: string }

export function EventParticipantAttendance({ slug }: { slug: string }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [tokens, setTokens] = useState<Record<string, { token: string | null; checked_in: boolean }>>({});
  const base = `/public/events/${encodeURIComponent(slug)}/attendance`;
  useEffect(() => {
    let current = true;
    setLoading(true); setError(''); setTokens({});
    api.get<Session[]>(base).then(({ data }) => { if (current) setSessions(data); })
      .catch(() => { if (current) setError('Não foi possível carregar as sessões de presença. Tente novamente mais tarde.'); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [base]);
  const getToken = async (session: Session) => {
    setBusy(session.id); setError('');
    try {
      const { data } = await api.get<{ token: string | null; checked_in: boolean }>(`${base}/${session.id}/token`);
      setTokens(current => ({ ...current, [session.id]: data }));
    } catch (cause: unknown) {
      const message = typeof cause === 'object' && cause !== null && 'response' in cause
        ? (cause as { response?: { data?: { message?: unknown } } }).response?.data?.message : undefined;
      setError(typeof message === 'string' ? message : 'Não foi possível obter seu código de presença.');
    } finally { setBusy(''); }
  };
  return <section className="space-y-3 border-t pt-4">
    <h3 className="text-lg font-semibold">Minha presença</h3>
    <p className="text-sm text-muted-foreground">Quando a equipe abrir uma sessão, apresente seu código para validar sua presença.</p>
    {loading && <p className="text-sm">Carregando sessões...</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {!loading && !error && sessions.length === 0 && <p className="text-sm text-muted-foreground">A equipe ainda não disponibilizou sessões de presença.</p>}
    <PaginatedList items={sessions} label="minhas sessões de presença" search={session => session.title} resetKey={slug}>
    {visibleSessions => <div className="space-y-3">{visibleSessions.map(session => {
      const attendance = tokens[session.id];
      return <article key={session.id} className="space-y-2 rounded-lg border p-3">
      <h4 className="font-medium">{session.title}</h4>
      <p className="text-xs text-muted-foreground">{new Date(session.starts_at).toLocaleString('pt-BR')} até {new Date(session.ends_at).toLocaleString('pt-BR')}</p>
      {session.mode === 'qr_code' ? <Button type="button" variant="outline" disabled={Boolean(busy)} onClick={() => void getToken(session)}>
        {busy === session.id ? 'Consultando...' : tokens[session.id] ? 'Atualizar minha presença' : 'Ver meu código de presença'}
      </Button> : <p className="text-sm text-muted-foreground">A presença nesta sessão é registrada manualmente pela equipe.</p>}
      {attendance?.checked_in ? <p role="status" className="text-sm font-medium text-emerald-700">Presença validada</p>
        : attendance?.token && <AttendanceQrCode token={attendance.token} />}
    </article>;
    })}</div>}
    </PaginatedList>
  </section>;
}
