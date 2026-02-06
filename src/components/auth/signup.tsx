import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { PadrinhoSelector, findMemberBySlug, type Member } from "./padrinho-selector";
import { validatePassword } from "@/lib/password-validation";

interface SignUpProps {
  onToggle: () => void;
  padrinhoSlug?: string | null;
}

interface Member {
  id: string;
  name: string;
  slug: string;
  course: string;
  university: string;
  avatar?: string;
}

const mockFaculdades = ["UNIFESP", "USP", "UNESP", "PUC-SP"];
const mockCampus = ["São Paulo", "Diadema", "Guarulhos", "Santos"];
const mockCursos = [
  "Ciência da Computação",
  "Engenharia de Software",
  "Sistemas de Informação",
  "Análise e Desenvolvimento",
];

const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4,5})(\d{4})/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, "");
  return cleanCPF.length === 11;
};

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, "");
  return cleanPhone.length >= 10;
};

export default function SignUp({ onToggle, padrinhoSlug }: SignUpProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [codeSent, setCodeSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  // Step 1
  const [faculdade, setFaculdade] = useState("");
  const [campus, setCampus] = useState("");
  const [curso, setCurso] = useState("");
  const [ra, setRa] = useState("");

  // Step 2
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [emailPessoal, setEmailPessoal] = useState("");
  const [emailAcademico, setEmailAcademico] = useState("");
  const [padrinho, setPadrinho] = useState<Member | null>(null);

  // Step 3
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  // Step 4
  const [tipoVerificacao, setTipoVerificacao] = useState("");

  useEffect(() => {
    if (padrinhoSlug) {
      const foundMember = findMemberBySlug(padrinhoSlug);
      if (foundMember) {
        setPadrinho(foundMember);
      } else {
        setErrors(prev => ({ ...prev, padrinho: "Padrinho não encontrado" }));
      }
    }
  }, [padrinhoSlug]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!faculdade) newErrors.faculdade = "Faculdade é obrigatória";
        if (!campus) newErrors.campus = "Campus é obrigatório";
        if (!curso) newErrors.curso = "Curso é obrigatório";
        break;
      case 1:
        if (!nome) newErrors.nome = "Nome é obrigatório";
        if (!sobrenome) newErrors.sobrenome = "Sobrenome é obrigatório";
        if (!dataNascimento)
          newErrors.dataNascimento = "Data de nascimento é obrigatória";
        if (!cpf) newErrors.cpf = "CPF é obrigatório";
        else if (!validateCPF(cpf)) newErrors.cpf = "CPF inválido";
        if (!telefone) newErrors.telefone = "Telefone é obrigatório";
        else if (!validatePhone(telefone))
          newErrors.telefone = "Telefone inválido";
        if (!emailPessoal)
          newErrors.emailPessoal = "Email pessoal é obrigatório";
        else if (!validateEmail(emailPessoal))
          newErrors.emailPessoal = "Email inválido";
        if (emailAcademico && !validateEmail(emailAcademico))
          newErrors.emailAcademico = "Email acadêmico inválido";
        break;
      case 2:
        if (!senha) newErrors.senha = "Senha é obrigatória";
        else {
          const validation = validatePassword(senha);
          if (!validation.isValid) newErrors.senha = validation.message;
        }
        if (!confirmarSenha)
          newErrors.confirmarSenha = "Confirmação de senha é obrigatória";
        else if (senha !== confirmarSenha)
          newErrors.confirmarSenha = "Senhas não coincidem";
        break;
      case 3:
        if (!tipoVerificacao)
          newErrors.tipoVerificacao = "Selecione um método de verificação";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSendCode = () => {
    if (validateStep(3)) {
      setCodeSent(true);
      setResendTimer(300);
      setCurrentStep(4);
      console.log("Código enviado para", tipoVerificacao);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 4) {
      if (otpValue.length === 6) {
        console.log("Cadastro completo", { otpValue });
      } else {
        setErrors({ codigo: "Digite o código completo" });
      }
    } else if (currentStep === 3 && !codeSent) {
      handleSendCode();
    } else {
      handleNext();
    }
  };

  const handleResendCode = () => {
    setResendTimer(300);
    console.log("Código reenviado");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="faculdade">Faculdade</Label>
              <Select value={faculdade} onValueChange={setFaculdade}>
                <SelectTrigger
                  id="faculdade"
                  className={
                    errors.faculdade ? "w-full border-destructive" : "w-full"
                  }>
                  <SelectValue placeholder="Selecione a faculdade" />
                </SelectTrigger>
                <SelectContent>
                  {mockFaculdades.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.faculdade && (
                <p className="text-sm text-destructive">{errors.faculdade}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="campus">Campus</Label>
              <Select value={campus} onValueChange={setCampus}>
                <SelectTrigger
                  id="campus"
                  className={
                    errors.campus ? "w-full border-destructive" : "w-full"
                  }>
                  <SelectValue placeholder="Selecione o campus" />
                </SelectTrigger>
                <SelectContent>
                  {mockCampus.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.campus && (
                <p className="text-sm text-destructive">{errors.campus}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="curso">Curso</Label>
              <Select value={curso} onValueChange={setCurso}>
                <SelectTrigger
                  id="curso"
                  className={
                    errors.curso ? "w-full border-destructive" : "w-full"
                  }>
                  <SelectValue placeholder="Selecione o curso" />
                </SelectTrigger>
                <SelectContent>
                  {mockCursos.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.curso && (
                <p className="text-sm text-destructive">{errors.curso}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ra">RA (opcional)</Label>
              <Input
                id="ra"
                placeholder="Digite seu RA"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
              />
            </div>
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
                  onChange={(e) => setNome(e.target.value)}
                  className={errors.nome ? "border-destructive" : ""}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobrenome">Sobrenome</Label>
                <Input
                  id="sobrenome"
                  placeholder="Sobrenome"
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                  className={errors.sobrenome ? "border-destructive" : ""}
                />
                {errors.sobrenome && (
                  <p className="text-sm text-destructive">{errors.sobrenome}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de nascimento</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className={errors.dataNascimento ? "border-destructive" : ""}
              />
              {errors.dataNascimento && (
                <p className="text-sm text-destructive">
                  {errors.dataNascimento}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                className={errors.cpf ? "border-destructive" : ""}
              />
              {errors.cpf && (
                <p className="text-sm text-destructive">{errors.cpf}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                className={errors.telefone ? "border-destructive" : ""}
              />
              {errors.telefone && (
                <p className="text-sm text-destructive">{errors.telefone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailPessoal">Email pessoal</Label>
              <Input
                id="emailPessoal"
                type="email"
                placeholder="seu@email.com"
                value={emailPessoal}
                onChange={(e) => setEmailPessoal(e.target.value)}
                className={errors.emailPessoal ? "border-destructive" : ""}
              />
              {errors.emailPessoal && (
                <p className="text-sm text-destructive">
                  {errors.emailPessoal}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailAcademico">Email acadêmico (opcional)</Label>
              <Input
                id="emailAcademico"
                type="email"
                placeholder="seu@unifesp.br"
                value={emailAcademico}
                onChange={(e) => setEmailAcademico(e.target.value)}
                className={errors.emailAcademico ? "border-destructive" : ""}
              />
              {errors.emailAcademico && (
                <p className="text-sm text-destructive">
                  {errors.emailAcademico}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Padrinho (opcional)</Label>
              <PadrinhoSelector
                selectedPadrinho={padrinho}
                onSelect={setPadrinho}
              />
              {errors.padrinho && (
                <p className="text-sm text-destructive">{errors.padrinho}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showSenha ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={errors.senha ? "border-destructive pr-10" : "pr-10"}
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
              {errors.senha && (
                <p className="text-sm text-destructive">{errors.senha}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmarSenha ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className={errors.confirmarSenha ? "border-destructive pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                >
                  {showConfirmarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmarSenha && (
                <p className="text-sm text-destructive">
                  {errors.confirmarSenha}
                </p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipoVerificacao">
                Como deseja receber o código?
              </Label>
              <Select
                value={tipoVerificacao}
                onValueChange={setTipoVerificacao}>
                <SelectTrigger
                  id="tipoVerificacao"
                  className={
                    errors.tipoVerificacao ? "border-destructive" : ""
                  }>
                  <SelectValue placeholder="Escolha o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email pessoal</SelectItem>
                  <SelectItem value="email-academico">
                    Email acadêmico
                  </SelectItem>
                  <SelectItem value="telefone">Telefone</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipoVerificacao && (
                <p className="text-sm text-destructive">
                  {errors.tipoVerificacao}
                </p>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
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
              {errors.codigo && (
                <p className="text-sm text-destructive text-center">
                  {errors.codigo}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleResendCode}
              disabled={resendTimer > 0}
              className="w-full">
              {resendTimer > 0
                ? `Reenviar em ${Math.floor(resendTimer / 60)}:${(
                    resendTimer % 60
                  )
                    .toString()
                    .padStart(2, "0")}`
                : "Reenviar código"}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const stepTitles = [
    "Dados Acadêmicos",
    "Dados Pessoais",
    "Senha",
    "Método de Verificação",
    "Código de Verificação",
  ];
  const totalSteps = codeSent ? 5 : 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Cadastrar</CardTitle>
        <CardDescription>
          {stepTitles[currentStep]} - Passo {currentStep + 1} de {totalSteps}
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
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1">
                Voltar
              </Button>
            )}
            <Button type="submit" className="flex-1">
              {currentStep === 4
                ? "Finalizar"
                : currentStep === 3 && !codeSent
                ? "Enviar Código"
                : "Próximo"}
            </Button>
          </div>
        </form>
        {currentStep === 0 && (
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <button
              onClick={onToggle}
              className="text-primary hover:underline font-medium">
              Entrar
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
