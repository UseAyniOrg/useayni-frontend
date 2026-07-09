import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
import { authService } from '@/lib/auth/authService';
import { useAuthContext } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '../common/FormField';
import { loginFormSchema, type LoginFormData } from '@/schemas/signIn';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_DURATION_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPTS_STORAGE_KEY = 'useayni:login-attempts';

type LoginAttemptEntry = {
  attempts: number;
  blockedUntil: number | null;
};

type LoginAttemptsStore = Record<string, LoginAttemptEntry>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readAttemptsStore(): LoginAttemptsStore {
  const rawStore = localStorage.getItem(LOGIN_ATTEMPTS_STORAGE_KEY);
  if (!rawStore) return {};

  try {
    return JSON.parse(rawStore) as LoginAttemptsStore;
  } catch {
    return {};
  }
}

function writeAttemptsStore(store: LoginAttemptsStore) {
  localStorage.setItem(LOGIN_ATTEMPTS_STORAGE_KEY, JSON.stringify(store));
}

function getAttemptEntry(email: string): LoginAttemptEntry {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return { attempts: 0, blockedUntil: null };

  const store = readAttemptsStore();
  return store[normalizedEmail] ?? { attempts: 0, blockedUntil: null };
}

function setAttemptEntry(email: string, entry: LoginAttemptEntry) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;

  const store = readAttemptsStore();
  store[normalizedEmail] = entry;
  writeAttemptsStore(store);
}

function clearAttemptEntry(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;

  const store = readAttemptsStore();
  delete store[normalizedEmail];
  writeAttemptsStore(store);
}

function isEmailNotFoundMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    (normalized.includes('email') && normalized.includes('nao encontrado')) ||
    (normalized.includes('email') && normalized.includes('não encontrado')) ||
    (normalized.includes('email') && normalized.includes('nao existe')) ||
    (normalized.includes('email') && normalized.includes('não existe')) ||
    (normalized.includes('usuario') && normalized.includes('nao encontrado')) ||
    (normalized.includes('usuário') && normalized.includes('não encontrado'))
  );
}

function isWrongPasswordMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    (normalized.includes('senha') && normalized.includes('incorreta')) ||
    (normalized.includes('senha') && normalized.includes('invalida')) ||
    (normalized.includes('senha') && normalized.includes('inválida'))
  );
}

export default function SignIn() {
  const {
    register,
    control,
    handleSubmit,
    watch,
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
  const { setUser } = useAuthContext();

  const error = Object.values(errors)[0]?.message ?? errors.root?.message;
  const [showPassword, setShowPassword] = useState(false);
  const emailValue = watch('email');

  const [isLoading, setIsLoading] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const isBlocked = blockedUntil !== null && blockedUntil > Date.now();

  useEffect(() => {
    const normalizedEmail = normalizeEmail(emailValue ?? '');
    if (!normalizedEmail) {
      setBlockedUntil(null);
      setRemainingTime(0);
      return;
    }

    const entry = getAttemptEntry(normalizedEmail);
    if (entry.blockedUntil && entry.blockedUntil > Date.now()) {
      setBlockedUntil(entry.blockedUntil);
      setRemainingTime(Math.floor((entry.blockedUntil - Date.now()) / 1000));
      return;
    }

    if (entry.blockedUntil && entry.blockedUntil <= Date.now()) {
      clearAttemptEntry(normalizedEmail);
    }

    setBlockedUntil(null);
    setRemainingTime(0);
  }, [emailValue]);

  useEffect(() => {
    if (!blockedUntil) return;
    const interval = setInterval(() => {
      const diff = Math.floor((blockedUntil - Date.now()) / 1000);
      if (diff <= 0) {
        const normalizedEmail = normalizeEmail(emailValue ?? '');
        if (normalizedEmail) {
          clearAttemptEntry(normalizedEmail);
        }
        setBlockedUntil(null);
        setRemainingTime(0);
        clearInterval(interval);
      } else {
        setRemainingTime(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [blockedUntil, emailValue]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: LoginFormData) => {
    const normalizedEmail = normalizeEmail(data.email);
    const currentEntry = getAttemptEntry(normalizedEmail);

    if (currentEntry.blockedUntil && currentEntry.blockedUntil > Date.now()) {
      setBlockedUntil(currentEntry.blockedUntil);
      return;
    }

    if (isBlocked) return;
    clearErrors();
    setIsLoading(true);

    try {
      const { user } = await authService.login({
        personalEmail: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      clearAttemptEntry(normalizedEmail);
      setUser(user);
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
        const retryAfter = err?.response?.data?.retryAfter ?? 900;
        const blockedUntilFromApi = Date.now() + retryAfter * 1000;
        setAttemptEntry(normalizedEmail, {
          attempts: MAX_FAILED_LOGIN_ATTEMPTS,
          blockedUntil: blockedUntilFromApi,
        });
        setBlockedUntil(blockedUntilFromApi);
        return;
      }

      if (status === 401) {
        const newAttempts = currentEntry.attempts + 1;
        const shouldBlock = newAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;
        const nextBlockedUntil = shouldBlock ? Date.now() + LOGIN_BLOCK_DURATION_MS : null;

        setAttemptEntry(normalizedEmail, {
          attempts: newAttempts,
          blockedUntil: nextBlockedUntil,
        });

        if (isEmailNotFoundMessage(message)) {
          setError('email', { message: 'Email não encontrado.' });
        } else if (isWrongPasswordMessage(message)) {
          setError('password', { message: 'Senha incorreta.' });
        } else {
          setError('root', { message: 'Email ou senha incorretos.' });
        }

        if (shouldBlock && nextBlockedUntil) {
          setError('root', {
            message: 'Muitas tentativas inválidas. Login bloqueado por 15 minutos.',
          });
          setBlockedUntil(nextBlockedUntil);
        }
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

        <CardDescription>Entre na sua conta para continuar</CardDescription>
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

          <FormField id="email" label="Email pessoal" error={errors.email}>
            <Input
              id="email"
              type="email"
              placeholder="Email pessoal cadastrado"
              disabled={isLoading || isBlocked}
              {...register('email')}
            />
          </FormField>

          <FormField id="password" label="Senha" error={errors.password}>
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

        <div className="mt-4 text-center text-sm">
          Nao tem uma conta?{' '}
          <button
            onClick={() => navigate('/cadastro')}
            className="text-primary hover:underline font-medium"
          >
            Cadastre-se
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
