import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth/authService';
import { safeReturnTo } from '@/lib/auth/accessContext';

export default function TemporaryPasswordPage() {
  const { user, clearAuth } = useAuthContext();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }

    setSaving(true);
    try {
      await authService.changeTemporaryPassword(password, fullName.trim());
      clearAuth();
      const loginPath = user?.access_context === 'member' ? '/login' : '/admin/login';
      const returnTo = safeReturnTo(params.get('returnTo'));
      navigate(`${loginPath}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`, { replace: true });
    } catch (cause: unknown) {
      const message = typeof cause === 'object' && cause !== null && 'response' in cause
        ? (cause as { response?: { data?: { message?: unknown } } }).response?.data?.message
        : undefined;
      setError(typeof message === 'string' ? message : 'Não foi possível definir a nova senha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-12">
      <form onSubmit={(event) => void submit(event)} className="w-full max-w-md space-y-6">
        <header className="space-y-3">
          <KeyRound className="h-8 w-8 text-primary" />
          <p className="text-sm text-muted-foreground">Acesso inicial</p>
          <h1 className="text-2xl font-semibold">Defina sua senha pessoal</h1>
          <p className="text-sm text-muted-foreground">
            Confirme seu nome e escolha uma senha pessoal diferente da temporária. Depois, entre novamente com a nova senha.
          </p>
        </header>
        <div className="space-y-2">
          <Label htmlFor="full-name">Nome completo</Label>
          <Input id="full-name" autoComplete="name" minLength={2} maxLength={255} required value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">Nova senha</Label>
          <Input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirme a nova senha</Label>
          <Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar senha e continuar'}
        </Button>
      </form>
    </main>
  );
}
