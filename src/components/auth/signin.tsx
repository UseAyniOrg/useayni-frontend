import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
import { authService } from '@/lib/auth/authService';
import { useAuthContext } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { currentAccessContext, resolveTenantSlug, safeReturnTo } from '@/lib/auth/accessContext';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '../common/FormField';
import { loginFormSchema, type LoginFormData } from '@/schemas/signIn';

export default function SignIn() {
  const {
    register,
    control,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthContext();
  const isAdminLogin = location.pathname === '/admin/login';
  const error = Object.values(errors)[0]?.message ?? errors.root?.message;
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const isBlocked = blockedUntil !== null && blockedUntil > Date.now();

  useEffect(() => {
    if (!blockedUntil) return;
    const interval = setInterval(() => {
      const diff = Math.floor((blockedUntil - Date.now()) / 1000);
      if (diff <= 0) {
        setBlockedUntil(null);
        setRemainingTime(0);
        clearInterval(interval);
      } else {
        setRemainingTime(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [blockedUntil]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: LoginFormData) => {
    if (isBlocked) return;
    clearErrors();
    setIsLoading(true);
    try {
      const { user } = await authService.login({
        personalEmail: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      const isPlatformHost = !resolveTenantSlug();
      if (isAdminLogin) {
        const adminRoles = isPlatformHost
          ? ['EQUIPE_TECNICA']
          : ['organization.admin', 'organization.manage'];
        if (!adminRoles.some((role) => user.roles.includes(role))) {
          await authService.logout();
          setError('root', { message: 'Esta conta não tem permissão para acessar a administração.' });
          return;
        }
        setUser(user);
        if (user.password_change_required) {
          navigate(`/definir-senha?access=${currentAccessContext()}`, { replace: true });
          return;
        }
        navigate('/admin');
        return;
      }
      setUser(user);
      const returnTo = safeReturnTo(new URLSearchParams(location.search).get('returnTo'));
      if (isPlatformHost) {
        const selectionPath = returnTo
          ? `/selecionar-organizacao?returnTo=${encodeURIComponent(returnTo)}`
          : '/selecionar-organizacao';
        navigate(selectionPath, { replace: true });
        return;
      }
      const destination = user.password_change_required
        ? `/definir-senha${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`
        : returnTo ?? '/home';
      if (user.password_change_required) {
        navigate(destination, { replace: true });
        return;
      }
      if (returnTo) {
        navigate(returnTo, { replace: true });
        return;
      }
      navigate('/home');
    } catch (error: unknown) {
      const err = error as any;
      const status = err?.response?.status;
      const responseMessage =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as any).response?.data?.message
          : undefined;
      const message = Array.isArray(responseMessage)
        ? responseMessage.join(', ')
        : typeof responseMessage === 'string'
        ? responseMessage
        : 'Credenciais invalidas';
      // RATE LIMIT
      if (status === 429) {
        setError('root', {
          message: 'Muitas tentativas. Tente novamente mais tarde.',
        });
        // backend ideal envia retryAfter
        const retryAfter = err?.response?.data?.retryAfter || 900;
        setBlockedUntil(Date.now() + retryAfter * 1000);
        return;
      }
      setError('root', { message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Entrar</CardTitle>

        <CardDescription>{isAdminLogin
          ? resolveTenantSlug() ? 'Administração da organização: use seu vínculo de administrador.' : 'SuperAdmin: administração da plataforma.'
          : 'Acesso de membro e comunidade, sem permissões administrativas.'}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isBlocked && (
            <Alert variant="destructive">
              <ShieldAlert />
              <AlertTitle>Login bloqueado</AlertTitle>

              <AlertDescription>
                Tente novamente em <strong>{formatTime(remainingTime)}</strong>
              </AlertDescription>
            </Alert>
          )}

          <FormField id="email" label="Email pessoal">
            <Input
              id="email"
              type="email"
              placeholder="Email pessoal cadastrado"
              disabled={isLoading || isBlocked}
              {...register('email')}
            />
          </FormField>

          <FormField id="password" label="Senha">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                className="pr-10"
                disabled={isLoading || isBlocked}
                {...register('password')}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || isBlocked}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </FormField>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="rememberMe"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading || isBlocked}
                  />
                )}
              />

              <label htmlFor="rememberMe" className="text-sm font-medium leading-none">
                Lembrar de mim
              </label>
            </div>
            <div>
              <button
                type="button"
                className="text-primary hover:underline font-medium text-sm"
                onClick={() => navigate('/recuperar-senha')}
              >
                Esqueci minha senha
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || isBlocked}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando...
              </span>
            ) : isBlocked ? (
              'Bloqueado temporariamente'
            ) : (
              'Entrar'
            )}
          </Button>
        </form>

        {!isAdminLogin && (
          <div className="mt-4 text-center text-sm">
            Nao tem uma conta?{' '}
            <button
              onClick={() => navigate('/cadastro')}
              className="text-primary hover:underline font-medium"
            >
              Cadastre-se
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
