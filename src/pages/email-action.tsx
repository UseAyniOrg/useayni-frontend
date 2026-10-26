import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmailActionPage({ kind }: { kind: 'invitation' | 'reset' }) {
  const location = useLocation();
  const [token, setToken] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '');
  const [invitation, setInvitation] = useState<{ existing_account: boolean; organization_name: string } | null>(null);
  const [loading, setLoading] = useState(kind === 'invitation');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [completed, setCompleted] = useState<{ login_url?: string; organization_ready?: boolean } | null>(null);
  const choosingPassword = kind === 'reset' || !invitation?.existing_account;

  useEffect(() => {
    if (location.hash) setToken(new URLSearchParams(location.hash.slice(1)).get('token') ?? '');
  }, [location.hash]);

  useEffect(() => {
    setError('');
    setCompleted(null);
    setInvitation(null);
    setLoading(kind === 'invitation' && Boolean(token));
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
    let active = true;
    if (!token) {
      setError('Este link está incompleto. Solicite um novo email.');
      setLoading(false);
    } else if (kind === 'invitation') {
      api.post('/account-email/invitation/inspect', { token }).then(({ data }) => {
        if (active) setInvitation(data);
      }).catch(() => {
        if (active) setError('Convite inválido, expirado ou já utilizado. Solicite um novo convite.');
      }).finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; meta.remove(); };
  }, [kind, token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (choosingPassword && password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(kind === 'invitation' ? '/account-email/invitation/accept' : '/account-email/password-reset/complete', {
        token, password, ...(kind === 'invitation' ? { full_name: name } : {}),
      });
      setPassword('');
      setConfirmation('');
      setCompleted(kind === 'reset' ? {} : data);
    } catch {
      setError('Não foi possível concluir. Confira os dados e a validade do link; solicite um novo envio se necessário.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" aria-label="UseAyni, início"><img src="/Ayni.svg" alt="UseAyni" className="mx-auto h-10 w-auto" /></Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{completed ? 'Tudo certo' : kind === 'reset' ? 'Redefinir senha' : 'Concluir meu acesso'}</CardTitle>
            <CardDescription>{invitation?.organization_name ?? 'Sua conta UseAyni'}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <div role="status" className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" />Validando convite...</div>
              : completed ? <div className="space-y-4">
                <p role="status" className="text-sm leading-6">{kind === 'reset' ? 'Sua senha foi alterada e as sessões anteriores foram encerradas.'
                  : completed.organization_ready ? 'Seu acesso está configurado. Faça login para continuar.'
                    : 'Seu acesso está configurado. A organização ainda aguarda ativação pela equipe UseAyni.'}</p>
                <Button asChild><a href={completed.login_url ?? '/login'}>Ir para o login <ArrowRight className="size-4" /></a></Button>
              </div> : <form onSubmit={submit} className="space-y-4">
                {error && <p role="alert" className="text-sm leading-6 text-destructive">{error}</p>}
                {token && (kind === 'reset' || invitation) && <>
                  {kind === 'invitation' && choosingPassword && <div className="space-y-2">
                    <Label htmlFor="setup-name">Nome completo</Label>
                    <Input id="setup-name" value={name} onChange={event => setName(event.target.value)} autoComplete="name" minLength={2} maxLength={255} required />
                  </div>}
                  <div className="space-y-2">
                    <Label htmlFor="action-password">{choosingPassword ? 'Nova senha (mínimo de 12 caracteres)' : 'Senha atual da sua conta UseAyni'}</Label>
                    <Input id="action-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={choosingPassword ? 'new-password' : 'current-password'} minLength={choosingPassword ? 12 : 1} maxLength={128} required />
                  </div>
                  {choosingPassword && <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirme a nova senha</Label>
                    <Input id="confirm-password" type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required />
                  </div>}
                  <Button type="submit" disabled={busy} className="w-full">{busy && <Loader2 className="size-4 animate-spin" />}{kind === 'reset' ? 'Salvar nova senha' : 'Aceitar convite'}</Button>
                  {!choosingPassword && <Link to="/recuperar-senha" className="block text-sm text-primary underline">Esqueci minha senha</Link>}
                </>}
              </form>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}