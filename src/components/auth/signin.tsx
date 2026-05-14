import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

import { authService } from '@/lib/authService';
import { useAuthContext } from '@/contexts/AuthContext';

interface SignInProps {
  onToggle: () => void;
}

export default function SignIn({
  onToggle,
}: SignInProps) {
  const navigate = useNavigate();

  const { setUser } = useAuthContext();

  const [email, setEmail] = useState('');

  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [error, setError] = useState('');

  const [isLoading, setIsLoading] =
    useState(false);

  const [blockedUntil, setBlockedUntil] =
    useState<number | null>(null);

  const [remainingTime, setRemainingTime] =
    useState(0);

  const isBlocked =
    blockedUntil !== null &&
    blockedUntil > Date.now();

  useEffect(() => {
    if (!blockedUntil) return;

    const interval = setInterval(() => {
      const diff = Math.floor(
        (blockedUntil - Date.now()) / 1000
      );

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

    return `${min}:${sec
      .toString()
      .padStart(2, '0')}`;
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isBlocked) return;

    setError('');
    setIsLoading(true);

    try {
      const { user } =
        await authService.login({
          personalEmail: email,
          password,
          rememberMe,
        });

      setUser(user);

      navigate('/home');
    } catch (error: unknown) {
      const responseMessage =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as any).response?.data?.message
          : undefined;
      const message = Array.isArray(responseMessage)
        ? responseMessage.join(', ')
        : typeof responseMessage === 'string'
          ? responseMessage
          : 'Credenciais invalidas';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Entrar
        </CardTitle>

        <CardDescription>
          Entre na sua conta para
          continuar
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-md border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isBlocked && (
            <Alert>
              <AlertTitle>
                Login bloqueado
              </AlertTitle>

              <AlertDescription>
                Tente novamente em{' '}
                <strong>
                  {formatTime(
                    remainingTime
                  )}
                </strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email pessoal</Label>
            <Input
              id="email"
              type="email"
              placeholder="email pessoal cadastrado"
              value={email}
              onChange={e =>
                setEmail(
                  e.target.value
                )
              }
              required
              disabled={
                isLoading || isBlocked
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Senha
            </Label>

            <div className="relative">
              <Input
                id="password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                placeholder="Digite sua senha"
                value={password}
                onChange={e =>
                  setPassword(
                    e.target.value
                  )
                }
                className="pr-10"
                required
                disabled={
                  isLoading ||
                  isBlocked
                }
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                disabled={
                  isLoading ||
                  isBlocked
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={checked =>
                  setRememberMe(
                    checked as boolean
                  )
                }
                disabled={
                  isLoading ||
                  isBlocked
                }
              />

              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none"
              >
                Lembrar de mim
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading || isBlocked
            }
          >
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
          <button onClick={onToggle} className="text-primary hover:underline font-medium">
            Cadastre-se
          </button>
        </div>
      </CardContent>
    </Card>
  );
}