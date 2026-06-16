import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Eye, EyeOff } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '@/utils/email';
import { validatePassword } from '@/utils/password';
import { formatPhone } from '@/utils/phone';
import { validatePhone } from '@/utils/phone';

export function ForgotPassword() {
  const [step, setStep] = useState(0); // 0 -> informar email/telefone; 1 -> informar código; 2 -> informar nova senha
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  const [sucessMessage, setSucessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = window.setInterval(() => {
      setResendTimer(previous => previous - 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [resendTimer]);

  const handleSendCode = (e: FormEvent) => {
    e.preventDefault();

    if (verificationType === 'email' && !validateEmail(email)) {
      setError('O e-mail informado é inválido!');
      return;
    }

    if (verificationType === 'phone' && !validatePhone(phone)) {
      setError('O telefone informado é inválido!');
      return;
    }

    setResendTimer(300);
    setStep(1);
    setError('');
    setSucessMessage(
      `Se o ${
        verificationType === 'phone' ? 'telefone' : 'e-mail'
      } informado estiver cadastrado, um código de verificação foi enviado.`
    );

    // Solicitação pro backend
  };

  const handleVerifyCode = () => {
    // Simular verificação
    setStep(2);
    setError('');
    setSucessMessage('');
  };

  const handleResetPassword = () => {
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Senhas não coincidem');
      return;
    }
    setError('');
    navigate('/login');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
        <CardDescription>Escolha um método para recuperar sua conta</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-100 px-4 py-3 text-sm text-center text-red-700">
              {error}
            </div>
          )}

          {sucessMessage && (
            <div className="rounded-md border border-green-200 bg-green-100 px-4 py-3 text-sm text-center text-green-700">
              {sucessMessage}
            </div>
          )}

          {step !== 2 && (
            <>
              <Tabs
                defaultValue="email"
                onValueChange={v => setVerificationType(v as 'email' | 'phone')}
              >
                <TabsList className="w-full">
                  <TabsTrigger
                    value="email"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    disabled={step === 1}
                  >
                    E-mail
                  </TabsTrigger>
                  <TabsTrigger
                    value="phone"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    disabled={step === 1}
                  >
                    Telefone
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSendCode} className="flex items-end gap-2">
                <div className="flex-grow space-y-2">
                  {verificationType === 'email' && (
                    <>
                      <Label htmlFor='email'>Email</Label>
                      <Input
                        id='email'
                        type="email"
                        value={email}
                        required
                        placeholder="Email para receber o código"
                        onChange={e => setEmail(e.target.value)}
                      />
                    </>
                  )}
                  {verificationType === 'phone' && (
                    <>
                      <Label htmlFor='phone'>Telefone</Label>
                      <Input
                        id='phone'
                        type="tel"
                        value={phone}
                        required
                        placeholder="Telefone para receber o código"
                        onChange={e => {
                          const value = formatPhone(e.target.value);
                          setPhone(value);
                        }}
                      />
                    </>
                  )}
                </div>
                {resendTimer <= 0 && (
                  <Button variant="outline" type='submit'>
                    Enviar Código
                  </Button>
                )}
                {resendTimer > 0 && (
                  <Button variant="outline" disabled>
                    {resendTimer}s
                  </Button>
                )}
              </form>

              <form onSubmit={handleVerifyCode} className="space-y-2">
                <Label htmlFor='verificationCode'>Código de verificação</Label>
                <div className="flex">
                  <InputOTP
                    id='verificationCode'
                    maxLength={6}
                    value={otpValue}
                    onChange={setOtpValue}
                    disabled={!(step == 1)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Nova senha</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Digite sua nova senha"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/login')} className="flex-1">
              Cancelar
            </Button>

            {step !== 2 && (
              <Button onClick={handleVerifyCode} className="flex-1" disabled={otpValue.length < 6}>
                Verificar Código
              </Button>
            )}

            {step === 2 && (
              <Button onClick={handleResetPassword} className="flex-1">
                Alterar Senha
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
