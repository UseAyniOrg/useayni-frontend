import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/lib/authService';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut, CheckCircle2, Mail } from 'lucide-react';

export default function PendingApproval() {
  const { user, clearAuth } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alice-blue to-bright-snow p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/Ayni.svg" alt="Ayni Logo" className="h-16 w-auto" />
        </div>

        <Card className="w-full shadow-md">
          <CardHeader className="text-center pb-2 pt-6">
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <span className="absolute inset-0 rounded-full bg-amber-200 opacity-40 animate-ping" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Cadastro em análise</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 px-8 pb-8 pt-2 text-center">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {user?.name ? (
                <>
                  Olá, <span className="font-semibold text-foreground">{user.name.split(' ')[0]}</span>!{' '}
                </>
              ) : 'Olá! '}
              Seu cadastro foi recebido e está aguardando aprovação de uma liderança do CREA-JR.
            </p>

            <div className="text-left space-y-4 border rounded-lg px-4 py-4 bg-muted/30">
              <Step done label="Cadastro enviado" description="Seus dados foram registrados com sucesso." />
              <Step pending label="Aguardando aprovação" description="Uma liderança irá revisar seu perfil em breve." />
              <Step locked label="Acesso liberado" description="Você receberá acesso completo à plataforma." />
            </div>

            {user?.email && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-left">
                <Mail className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Se tiver dúvidas, entre em contato com a liderança da sua instituição
                  ou aguarde o contato pelo e-mail{' '}
                  <span className="font-semibold">{user.email}</span>.
                </p>
              </div>
            )}

            <Button variant="outline" className="w-full gap-2 h-11" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Sair da conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StepProps {
  label: string;
  description: string;
  done?: boolean;
  pending?: boolean;
  locked?: boolean;
}

function Step({ label, description, done, pending, locked }: StepProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">
        {done && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        {pending && (
          <div className="w-5 h-5 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
        )}
        {locked && (
          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 bg-muted" />
        )}
      </div>
      <div>
        <p className={`text-sm font-medium ${locked ? 'text-muted-foreground/50' : ''}`}>
          {label}
        </p>
        <p className={`text-xs mt-0.5 ${locked ? 'text-muted-foreground/40' : 'text-muted-foreground'}`}>
          {description}
        </p>
      </div>
    </div>
  );
}