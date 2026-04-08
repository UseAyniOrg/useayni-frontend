import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PadrinhoSelector, findMemberBySlug, type Member } from './padrinho-selector';
import { validatePassword } from '@/lib/password-validation';
import { authService } from '@/lib/authService';
import { useAuthContext } from '@/contexts/AuthContext';

interface SignUpProps {
  onToggle: () => void;
  padrinhoSlug?: string | null;
}

const formatCPF = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');

const formatPhone = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');

export default function SignUp({ onToggle, padrinhoSlug }: SignUpProps) {
  const navigate = useNavigate();
  const { setUser } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Step 0 — Dados Acadêmicos
  const [ra, setRa] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [emailUniversity, setEmailUniversity] = useState('');
  // TODO: Integrar seletores de universidade/curso/cidade com a API quando disponível
  // const [courseUniversityId, setCourseUniversityId] = useState("");

  // Step 1 — Dados Pessoais
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [emailPessoal, setEmailPessoal] = useState('');
  const [padrinho, setPadrinho] = useState<Member | null>(null);

  // Step 2 — Senha
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  // OTP / Verificação — comentado até implementação futura
  // const [tipoVerificacao, setTipoVerificacao] = useState("");
  // const [otpValue, setOtpValue] = useState("");
  // const [codeSent, setCodeSent] = useState(false);
  // const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (padrinhoSlug) {
      const found = findMemberBySlug(padrinhoSlug);
      if (found) setPadrinho(found);
      else setErrors(prev => ({ ...prev, padrinho: 'Padrinho não encontrado' }));
    }
  }, [padrinhoSlug]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!ra) newErrors.ra = 'RA é obrigatório';
      if (!admissionDate) newErrors.admissionDate = 'Data de ingresso é obrigatória';
      if (!emailUniversity) newErrors.emailUniversity = 'Email acadêmico é obrigatório';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailUniversity))
        newErrors.emailUniversity = 'Email inválido';
    }

    if (step === 1) {
      if (!nome) newErrors.nome = 'Nome é obrigatório';
      if (!sobrenome) newErrors.sobrenome = 'Sobrenome é obrigatório';
      if (!dataNascimento) newErrors.dataNascimento = 'Data de nascimento é obrigatória';
      if (!cpf) newErrors.cpf = 'CPF é obrigatório';
      else if (cpf.replace(/\D/g, '').length !== 11) newErrors.cpf = 'CPF inválido';
      if (!telefone) newErrors.telefone = 'Telefone é obrigatório';
      else if (telefone.replace(/\D/g, '').length < 10) newErrors.telefone = 'Telefone inválido';
      if (!emailPessoal) newErrors.emailPessoal = 'Email pessoal é obrigatório';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPessoal))
        newErrors.emailPessoal = 'Email inválido';
    }

    if (step === 2) {
      if (!senha) newErrors.senha = 'Senha é obrigatória';
      else {
        const validation = validatePassword(senha);
        if (!validation.isValid) newErrors.senha = validation.message;
      }
      if (!confirmarSenha) newErrors.confirmarSenha = 'Confirmação obrigatória';
      else if (senha !== confirmarSenha) newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    setCurrentStep(s => s - 1);
    setErrors({});
    setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 2) {
      handleNext();
      return;
    }

    if (!validateStep(2)) return;

    setIsLoading(true);
    setApiError('');

    try {
      const { user } = await authService.signUp({
        name: `${nome} ${sobrenome}`,
        cpf,
        phone: telefone,
        email_personal: emailPessoal,
        email_university: emailUniversity,
        birth_date: dataNascimento,
        admission_date: admissionDate,
        ra,
        password: senha,
        sponsor: padrinho?.name,
        // course_university_id: courseUniversityId || undefined,
      });

      setUser(user);
      navigate('/home');
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as any).response?.data?.message === 'string'
          ? (error as any).response.data.message
          : 'Erro ao criar conta. Tente novamente.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = ['Dados Acadêmicos', 'Dados Pessoais', 'Senha'];
  const progress = ((currentStep + 1) / stepTitles.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ra">RA (Registro Acadêmico)</Label>
              <Input
                id="ra"
                placeholder="Digite seu RA"
                value={ra}
                onChange={e => setRa(e.target.value)}
                className={errors.ra ? 'border-destructive' : ''}
              />
              {errors.ra && <p className="text-sm text-destructive">{errors.ra}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admissionDate">Data de ingresso</Label>
              <Input
                id="admissionDate"
                type="date"
                value={admissionDate}
                onChange={e => setAdmissionDate(e.target.value)}
                className={errors.admissionDate ? 'border-destructive' : ''}
              />
              {errors.admissionDate && (
                <p className="text-sm text-destructive">{errors.admissionDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailUniversity">Email acadêmico</Label>
              <Input
                id="emailUniversity"
                type="email"
                placeholder="seu@universidade.edu.br"
                value={emailUniversity}
                onChange={e => setEmailUniversity(e.target.value)}
                className={errors.emailUniversity ? 'border-destructive' : ''}
              />
              {errors.emailUniversity && (
                <p className="text-sm text-destructive">{errors.emailUniversity}</p>
              )}
            </div>
            {/* TODO: Adicionar seletores de universidade, curso e cidade quando integração com API estiver pronta */}
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Nome"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className={errors.nome ? 'border-destructive' : ''}
                />
                {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobrenome">Sobrenome</Label>
                <Input
                  id="sobrenome"
                  placeholder="Sobrenome"
                  value={sobrenome}
                  onChange={e => setSobrenome(e.target.value)}
                  className={errors.sobrenome ? 'border-destructive' : ''}
                />
                {errors.sobrenome && <p className="text-sm text-destructive">{errors.sobrenome}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de nascimento</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={dataNascimento}
                onChange={e => setDataNascimento(e.target.value)}
                className={errors.dataNascimento ? 'border-destructive' : ''}
              />
              {errors.dataNascimento && (
                <p className="text-sm text-destructive">{errors.dataNascimento}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={e => setCpf(formatCPF(e.target.value))}
                className={errors.cpf ? 'border-destructive' : ''}
              />
              {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={e => setTelefone(formatPhone(e.target.value))}
                className={errors.telefone ? 'border-destructive' : ''}
              />
              {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailPessoal">Email pessoal</Label>
              <Input
                id="emailPessoal"
                type="email"
                placeholder="seu@email.com"
                value={emailPessoal}
                onChange={e => setEmailPessoal(e.target.value)}
                className={errors.emailPessoal ? 'border-destructive' : ''}
              />
              {errors.emailPessoal && (
                <p className="text-sm text-destructive">{errors.emailPessoal}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Padrinho (opcional)</Label>
              <PadrinhoSelector selectedPadrinho={padrinho} onSelect={setPadrinho} />
              {errors.padrinho && <p className="text-sm text-destructive">{errors.padrinho}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {apiError && (
              <div className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-md">
                {apiError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showSenha ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  className={errors.senha ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowSenha(!showSenha)}
                >
                  {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.senha && <p className="text-sm text-destructive">{errors.senha}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmarSenha ? 'text' : 'password'}
                  placeholder="Confirme sua senha"
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  className={errors.confirmarSenha ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                >
                  {showConfirmarSenha ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmarSenha && (
                <p className="text-sm text-destructive">{errors.confirmarSenha}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Cadastrar</CardTitle>
        <CardDescription>
          {stepTitles[currentStep]} — Passo {currentStep + 1} de {stepTitles.length}
        </CardDescription>
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                Voltar
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {currentStep === 2 ? (isLoading ? 'Criando conta...' : 'Finalizar') : 'Próximo'}
            </Button>
          </div>
        </form>
        {currentStep === 0 && (
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <button onClick={onToggle} className="text-primary hover:underline font-medium">
              Entrar
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
