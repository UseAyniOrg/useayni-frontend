import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth/authService';
import { Button } from '@/components/ui/button';

export function SupportSessionBanner() {
  const { user, setUser } = useAuthContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!user?.support_session_id) return null;
  const end = async () => {
    setBusy(true); setError('');
    try {
      setUser(await authService.endSupportSession());
      const target = new URL('/admin', window.location.origin);
      if (target.hostname.endsWith('.localhost')) target.hostname = 'localhost';
      else if (!['localhost', '127.0.0.1'].includes(target.hostname)) target.hostname = 'www.useayni.com';
      window.location.assign(target.toString());
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível encerrar o suporte.');
    } finally { setBusy(false); }
  };
  return <section className="flex flex-wrap items-center justify-between gap-3 border-b bg-amber-50 px-4 py-3 text-amber-950">
    <div><p className="text-sm font-semibold">Acesso de suporte da plataforma</p><p className="text-xs">As ações desta sessão são auditadas.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
    <Button variant="outline" disabled={busy} onClick={() => void end()}>{busy ? 'Encerrando...' : 'Encerrar suporte'}</Button>
  </section>;
}
