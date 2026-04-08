import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Eye, EyeOff } from 'lucide-react';
import { validatePassword } from '@/lib/password-validation';

interface ForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPassword({ isOpen, onClose }: ForgotPasswordProps) {
  const [step, setStep] = useState(0);
  const [tipoVerificacao, setTipoVerificacao] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarNovaSenha, setShowConfirmarNovaSenha] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = window.setInterval(() => {
      setResendTimer(previous => previous - 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [resendTimer]);

  const handleSendCode = () => {
    if (!tipoVerificacao) {
      setError('Selecione um método de verificação');
      return;
    }
    setResendTimer(300);
    setStep(1);
    setError('');
  };

  const handleVerifyCode = () => {
    if (otpValue.length !== 6) {
      setError('Digite o código completo');
      return;
    }
    // Simular verificação
    setStep(2);
    setError('');
  };

  const handleResetPassword = () => {
    const validation = validatePassword(novaSenha);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      setError('Senhas não coincidem');
      return;
    }
    setError('');
    handleClose();
  };

  const handleResendCode = () => {
    setError('');
    setResendTimer(300);
  };

  const handleClose = () => {
    setStep(0);
    setTipoVerificacao('');
    setOtpValue('');
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 0 && 'Recuperar Senha'}
            {step === 1 && 'Verificar Código'}
            {step === 2 && 'Nova Senha'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>Como deseja receber o código?</Label>
                <Select value={tipoVerificacao} onValueChange={setTipoVerificacao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSendCode} className="flex-1">
                  Enviar Código
                </Button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Código de verificação</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
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
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={resendTimer > 0}
                className="w-full"
              >
                {resendTimer > 0
                  ? `Reenviar em ${Math.floor(resendTimer / 60)}:${(resendTimer % 60).toString().padStart(2, '0')}`
                  : 'Reenviar código'}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleVerifyCode} className="flex-1">
                  Verificar
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Nova senha</Label>
                <div className="relative">
                  <Input
                    type={showNovaSenha ? 'text' : 'password'}
                    placeholder="Digite sua nova senha"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNovaSenha(!showNovaSenha)}
                  >
                    {showNovaSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    type={showConfirmarNovaSenha ? 'text' : 'password'}
                    placeholder="Confirme sua nova senha"
                    value={confirmarNovaSenha}
                    onChange={e => setConfirmarNovaSenha(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmarNovaSenha(!showConfirmarNovaSenha)}
                  >
                    {showConfirmarNovaSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleResetPassword} className="flex-1">
                  Alterar Senha
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
