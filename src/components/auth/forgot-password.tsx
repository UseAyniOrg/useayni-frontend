import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import FormField from '../common/FormField';
import { formatPhone } from '@/utils/phone';
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormData,
} from '@/schemas/forgotPassword';

const RESEND_SECONDS = 300;

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
    trigger,
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      verificationType: 'email',
      email: '',
      phone: '',
      otpValue: '',
      password: '',
      confirmPassword: '',
    },
  });

  const verificationType = watch('verificationType');
  const otpValue = watch('otpValue');
  const error = errors.root?.message;

  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = window.setInterval(() => {
      setResendTimer(previous => previous - 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [resendTimer]);

  const handleVerificationTypeChange = (value: string) => {
    const nextType = value as ForgotPasswordFormData['verificationType'];

    setValue('verificationType', nextType, { shouldDirty: true });
    clearErrors(['email', 'phone']);
    setSuccessMessage('');
  };

  const handleSendCode = async () => {
    const fields: Array<keyof ForgotPasswordFormData> =
      verificationType === 'email' ? ['verificationType', 'email'] : ['verificationType', 'phone'];

    if (!(await trigger(fields))) return;

    setResendTimer(RESEND_SECONDS);
    setStep(1);
    clearErrors();
    setSuccessMessage(
      `Se o ${
        verificationType === 'phone' ? 'telefone' : 'e-mail'
      } informado estiver cadastrado, um código de verificação foi enviado.`
    );

    // TODO: chamar o backend para solicitar o código quando o endpoint estiver disponível.
  };

  const handleVerifyCode = async () => {
    if (!(await trigger('otpValue'))) return;

    setStep(2);
    clearErrors();
    setSuccessMessage('');

    // TODO: chamar o backend para validar o código quando o endpoint estiver disponível.
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (!(await trigger(['password', 'confirmPassword']))) return;

    try {
      clearErrors();
      setSuccessMessage('');

      const resetPayload = {
        verificationType: data.verificationType,
        email: data.email,
        phone: data.phone,
        otpValue: data.otpValue,
        password: data.password,
      };
      void resetPayload;

      navigate('/login');
    } catch {
      setError('root', { message: 'Não foi possível alterar sua senha.' });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
        <CardDescription>Escolha um método para recuperar sua conta</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-100 px-4 py-3 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-md border border-green-200 bg-green-100 px-4 py-3 text-center text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {step !== 2 && (
            <>
              <Controller
                control={control}
                name="verificationType"
                render={({ field }) => (
                  <Tabs value={field.value} onValueChange={handleVerificationTypeChange}>
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
                )}
              />

              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  {verificationType === 'email' && (
                    <FormField id="email" label="Email" error={errors.email}>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email para receber o código"
                        disabled={step === 1}
                        {...register('email')}
                      />
                    </FormField>
                  )}

                  {verificationType === 'phone' && (
                    <FormField id="phone" label="Telefone" error={errors.phone}>
                      <Controller
                        control={control}
                        name="phone"
                        render={({ field }) => (
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="Telefone para receber o código"
                            disabled={step === 1}
                            value={field.value}
                            onChange={event => field.onChange(formatPhone(event.target.value))}
                          />
                        )}
                      />
                    </FormField>
                  )}
                </div>

                <Button
                  variant="outline"
                  type="button"
                  onClick={handleSendCode}
                  disabled={resendTimer > 0}
                >
                  {resendTimer > 0 ? `${resendTimer}s` : 'Enviar Código'}
                </Button>
              </div>

              <FormField id="verificationCode" label="Código de verificação" error={errors.otpValue}>
                <Controller
                  control={control}
                  name="otpValue"
                  render={({ field }) => (
                    <InputOTP
                      id="verificationCode"
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={step !== 1}
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
                  )}
                />
              </FormField>
            </>
          )}

          {step === 2 && (
            <>
              <FormField id="password" label="Nova senha" error={errors.password}>
                <div className="relative">
                  <Input
                    id="password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Digite sua nova senha"
                    className="pr-10"
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(previous => !previous)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormField>

              <FormField
                id="confirmPassword"
                label="Confirmar nova senha"
                error={errors.confirmPassword}
              >
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua nova senha"
                    className="pr-10"
                    {...register('confirmPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(previous => !previous)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormField>
            </>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/login')}
              className="flex-1"
            >
              Cancelar
            </Button>

            {step !== 2 && (
              <Button
                type="button"
                onClick={handleVerifyCode}
                className="flex-1"
                disabled={otpValue.length < 6}
              >
                Verificar Código
              </Button>
            )}

            {step === 2 && (
              <Button type="submit" className="flex-1">
                Alterar Senha
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
