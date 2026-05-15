import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PadrinhoSelector, findMemberBySlug, type Member } from './padrinho-selector';
import { validatePassword } from '@/lib/password-validation';
import { authService } from '@/lib/authService';
import {
  academicService,
  type CityOption,
  type CourseOption,
  type StateOption,
  type UniversityOption,
} from '@/services/academicService';

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

const isValidCPF = (value: string) => {
  const cpf = value.replace(/\D/g, '');

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (base: string, factor: number) => {
    const total = base
      .split('')
      .reduce((sum, digit) => sum + Number(digit) * factor--, 0);
    const remainder = (total * 10) % 11;

    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateDigit(cpf.slice(0, 10), 11);

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
};

const NOT_APPLICABLE = 'not_applicable';

export default function SignUp({ onToggle, padrinhoSlug }: SignUpProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  // Step 0 — Dados Acadêmicos
  const [ra, setRa] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [emailUniversity, setEmailUniversity] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [currentSemester, setCurrentSemester] = useState('');
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [isCitySearchOpen, setIsCitySearchOpen] = useState(false);
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [universitySearch, setUniversitySearch] = useState('');
  const [isUniversitySearchOpen, setIsUniversitySearchOpen] = useState(false);
  const [isSearchingUniversities, setIsSearchingUniversities] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [isCourseSearchOpen, setIsCourseSearchOpen] = useState(false);
  const [isLoadingAcademicData, setIsLoadingAcademicData] = useState(false);
  const [academicDataError, setAcademicDataError] = useState('');

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

  const clearFieldError = (...fieldNames: string[]) => {
    setErrors(prev => {
      const next = { ...prev };
      fieldNames.forEach(fieldName => {
        delete next[fieldName];
      });
      return next;
    });
  };

  const setFieldValidation = (fieldName: string, message?: string) => {
    setErrors(prev => {
      const next = { ...prev };

      if (message) next[fieldName] = message;
      else delete next[fieldName];

      return next;
    });
  };

  const validateRequiredField = (fieldName: string, value: string, message: string) => {
    setFieldValidation(fieldName, value.trim() ? undefined : message);
  };

  const validateEmailField = (fieldName: string, value: string, requiredMessage: string) => {
    if (!value.trim()) {
      setFieldValidation(fieldName, requiredMessage);
      return;
    }

    setFieldValidation(
      fieldName,
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : 'Email inválido'
    );
  };

  const validateCourseSelection = (nextCourseId = courseId, nextCityId = cityId) => {
    if (!nextCourseId) {
      setFieldValidation('courseId', 'Curso é obrigatório');
      return;
    }

    if (universityId === NOT_APPLICABLE || nextCourseId === NOT_APPLICABLE) {
      setFieldValidation('courseId');
      return;
    }

    const courseUniversityId = courses
      .find(course => course.id === nextCourseId)
      ?.courseUniversities?.find(
        courseUniversity =>
          courseUniversity.university_id === universityId &&
          courseUniversity.city_id === nextCityId
      )?.id;

    setFieldValidation(
      'courseId',
      courseUniversityId ? undefined : 'Curso não disponível para a cidade selecionada'
    );
  };

  useEffect(() => {
    if (padrinhoSlug) {
      const found = findMemberBySlug(padrinhoSlug);
      if (found) setPadrinho(found);
      else setErrors(prev => ({ ...prev, padrinho: 'Padrinho não encontrado' }));
    }
  }, [padrinhoSlug]);

  useEffect(() => {
    const loadAcademicData = async () => {
      setIsLoadingAcademicData(true);
      setAcademicDataError('');

      try {
        const stateOptions = await academicService.getStates();

        setStates(
          [...stateOptions].sort((a, b) =>
            a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
          )
        );
      } catch {
        setAcademicDataError('Não foi possível carregar os dados acadêmicos. Tente novamente.');
      } finally {
        setIsLoadingAcademicData(false);
      }
    };

    loadAcademicData();
  }, []);

  useEffect(() => {
    if (!stateId) {
      setCities([]);
      setCityId('');
      setCitySearch('');
      setUniversityId('');
      setUniversitySearch('');
      setUniversities([]);
      return;
    }

    const loadCities = async () => {
      setCityId('');
      setCitySearch('');
      setUniversityId('');
      setUniversitySearch('');
      setUniversities([]);
      try {
        const cityOptions = await academicService.getCitiesByState(stateId);
        setCities(
          [...cityOptions].sort((a, b) =>
            a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
          )
        );
      } catch {
        setCities([]);
        setAcademicDataError('Não foi possível carregar as cidades deste estado.');
      }
    };

    loadCities();
  }, [stateId]);

  const filteredCities = useMemo(() => {
    const query = citySearch.trim().toLowerCase();

    if (!query) return cities.slice(0, 50);

    return cities
      .filter(city => city.name.toLowerCase().includes(query))
      .slice(0, 50);
  }, [cities, citySearch]);

  const filteredCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();

    if (!query) return courses;

    return courses
      .filter(course => course.name.toLowerCase().includes(query));
  }, [courses, courseSearch]);

  useEffect(() => {
    if (universityId && universityId !== NOT_APPLICABLE) {
      return;
    }

    if (!cityId || universityId === NOT_APPLICABLE) {
      if (universityId !== NOT_APPLICABLE) {
        setUniversityId('');
        setUniversitySearch('');
      }
      setUniversities([]);
      return;
    }

    const query = universitySearch.trim();
    if (query.length < 2) {
      const timeoutId = window.setTimeout(async () => {
        setIsSearchingUniversities(true);
        setAcademicDataError('');

        try {
          const universityOptions = await academicService.getUniversities({
            cityId,
            stateId,
          });
          setUniversities(universityOptions.slice(0, 5));
        } catch {
          setUniversities([]);
          setAcademicDataError('NÃ£o foi possÃ­vel buscar universidades.');
        } finally {
          setIsSearchingUniversities(false);
        }
      }, 250);

      return () => window.clearTimeout(timeoutId);
    }

    if (universitySearch === 'Nao se aplica') {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearchingUniversities(true);
      setAcademicDataError('');

      try {
        const universityOptions = await academicService.getUniversities({
          q: query,
          cityId,
          stateId,
        });

        setUniversities(universityOptions.slice(0, 30));
        setIsUniversitySearchOpen(true);
      } catch {
        setUniversities([]);
        setAcademicDataError('Não foi possível buscar universidades.');
      } finally {
        setIsSearchingUniversities(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [cityId, stateId, universitySearch, universityId]);

  useEffect(() => {
    if (!universityId || universityId === NOT_APPLICABLE) {
      setCourses([]);
      setCourseId(universityId === NOT_APPLICABLE ? NOT_APPLICABLE : '');
      setCourseSearch(universityId === NOT_APPLICABLE ? 'Nao se aplica' : '');
      return;
    }

    const loadCourses = async () => {
      setCourseId('');
      setCourseSearch('');
      try {
        let courseOptions = await academicService.getCoursesByUniversity(universityId, cityId);

        if (courseOptions.length === 0) {
          courseOptions = await academicService.getCoursesByUniversity(universityId);
        }

        setCourses(
          [...courseOptions].sort((a, b) =>
            a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
          )
        );
      } catch {
        setCourses([]);
        setAcademicDataError('Não foi possível carregar os cursos desta universidade.');
      }
    };

    loadCourses();
  }, [universityId, cityId]);

  const selectedCourseUniversityId =
    universityId !== NOT_APPLICABLE && courseId !== NOT_APPLICABLE
      ? (() => {
          const courseUniversities =
            courses.find(course => course.id === courseId)?.courseUniversities || [];

          return (
            courseUniversities.find(
              courseUniversity =>
                courseUniversity.university_id === universityId &&
                courseUniversity.city_id === cityId
            )?.id ||
            courseUniversities.find(
              courseUniversity => courseUniversity.university_id === universityId
            )?.id
          );
        })()
      : undefined;
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!ra) newErrors.ra = 'RA é obrigatório';
      if (!admissionDate) newErrors.admissionDate = 'Data de ingresso é obrigatória';
      if (!emailUniversity) newErrors.emailUniversity = 'Email acadêmico é obrigatório';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailUniversity))
        newErrors.emailUniversity = 'Email inválido';
      if (!stateId) newErrors.stateId = 'Estado é obrigatório';
      if (!cityId) newErrors.cityId = 'Cidade é obrigatória';
      if (!universityId) newErrors.universityId = 'Universidade é obrigatória';
      if (!courseId) newErrors.courseId = 'Curso é obrigatório';
      if (!currentSemester) newErrors.currentSemester = 'Semestre atual é obrigatório';
      if (false && universityId !== NOT_APPLICABLE && courseId !== NOT_APPLICABLE && !selectedCourseUniversityId)
        newErrors.courseId = 'Curso não disponível para a cidade selecionada';
    }

    if (step === 1) {
      if (!nome) newErrors.nome = 'Nome é obrigatório';
      if (!sobrenome) newErrors.sobrenome = 'Sobrenome é obrigatório';
      if (!dataNascimento) newErrors.dataNascimento = 'Data de nascimento é obrigatória';
      if (!cpf) newErrors.cpf = 'CPF é obrigatório';
      else if (!isValidCPF(cpf)) newErrors.cpf = 'CPF inválido';
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
      await authService.signUp({
        name: `${nome} ${sobrenome}`,
        cpf,
        phone: telefone,
        email_personal: emailPessoal,
        email_university: emailUniversity,
        birth_date: dataNascimento,
        admission_date: admissionDate,
        ra,
        password: senha,
        city_id: cityId,
        sponsor: padrinho?.name,
        course_university_id: selectedCourseUniversityId,
        current_semester:
          currentSemester && currentSemester !== NOT_APPLICABLE
            ? Number(currentSemester)
            : undefined,
        university_not_applicable: universityId === NOT_APPLICABLE,
        course_not_applicable: courseId === NOT_APPLICABLE,
        current_semester_not_applicable: currentSemester === NOT_APPLICABLE,
      });

      setRegistrationCompleted(true);
    } catch (error: unknown) {
      const responseMessage =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as any).response?.data?.message
          : undefined;
      const message = Array.isArray(responseMessage)
        ? responseMessage.join(', ')
        : typeof responseMessage === 'string'
          ? responseMessage
          : 'Erro ao criar conta. Tente novamente.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = ['Dados Acadêmicos', 'Dados Pessoais', 'Senha'];
  const progress = ((currentStep + 1) / stepTitles.length) * 100;

  if (registrationCompleted) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Cadastro em análise</CardTitle>
          <CardDescription>
            Ótimo ter você conosco, peço apenas mais um pouco de paciência, seu cadastro está em
            análise, será notificado assim que esse processo for concluído.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/')}>
            Voltar para o início
          </Button>
        </CardContent>
      </Card>
    );
  }

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
                onChange={e => {
                  const value = e.target.value;
                  setRa(value);
                  validateRequiredField('ra', value, 'RA é obrigatório');
                }}
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
                onChange={e => {
                  const value = e.target.value;
                  setAdmissionDate(value);
                  validateRequiredField('admissionDate', value, 'Data de ingresso é obrigatória');
                }}
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
                onChange={e => {
                  const value = e.target.value;
                  setEmailUniversity(value);
                  validateEmailField('emailUniversity', value, 'Email acadêmico é obrigatório');
                }}
                className={errors.emailUniversity ? 'border-destructive' : ''}
              />
              {errors.emailUniversity && (
                <p className="text-sm text-destructive">{errors.emailUniversity}</p>
              )}
            </div>
            {academicDataError && (
              <div className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-md">
                {academicDataError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={stateId}
                  onValueChange={value => {
                    setStateId(value);
                    setFieldValidation('stateId', value ? undefined : 'Estado é obrigatório');
                    setFieldValidation('cityId', 'Cidade é obrigatória');
                  }}
                  disabled={isLoadingAcademicData}
                >
                  <SelectTrigger className={`w-full ${errors.stateId ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(state => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.uf} - {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.stateId && <p className="text-sm text-destructive">{errors.stateId}</p>}
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <div className="relative">
                  <Input
                    value={citySearch}
                    onChange={event => {
                      const value = event.target.value;
                      setCitySearch(value);
                      setCityId('');
                      setUniversityId('');
                      setUniversitySearch('');
                      setUniversities([]);
                      setCourseId('');
                      setCourseSearch('');
                      setCourses([]);
                      setIsCitySearchOpen(true);
                      setFieldValidation(
                        'cityId',
                        value.trim() ? 'Selecione uma cidade da lista' : 'Cidade obrigatoria'
                      );
                    }}
                    onFocus={() => setIsCitySearchOpen(true)}
                    onBlur={() => window.setTimeout(() => setIsCitySearchOpen(false), 150)}
                    disabled={!stateId || isLoadingAcademicData}
                    placeholder={stateId ? 'Digite a cidade' : 'Selecione um estado primeiro'}
                    className={errors.cityId ? 'border-destructive' : ''}
                  />
                  {isCitySearchOpen && stateId && (
                    <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-background shadow-lg">
                      {filteredCities.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Nenhuma cidade encontrada
                        </div>
                      )}
                      {filteredCities.map(city => (
                        <button
                          key={city.id}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                          onMouseDown={event => event.preventDefault()}
                          onClick={() => {
                            setCityId(city.id);
                            setCitySearch(city.name);
                            setUniversityId('');
                            setUniversitySearch('');
                            setUniversities([]);
                            setCourseId('');
                            setCourseSearch('');
                            setCourses([]);
                            setIsCitySearchOpen(false);
                            setFieldValidation('cityId');
                          }}
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="hidden">
                <Select
                  value={cityId}
                  onValueChange={value => {
                    setCityId(value);
                    setUniversityId('');
                    setUniversitySearch('');
                    setUniversities([]);
                    setCourseId('');
                    setCourses([]);
                    setFieldValidation('cityId', value ? undefined : 'Cidade é obrigatória');
                    if (courseId) validateCourseSelection(courseId, value);
                  }}
                  disabled={!stateId}
                >
                  <SelectTrigger className={`w-full ${errors.cityId ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
                {errors.cityId && <p className="text-sm text-destructive">{errors.cityId}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Universidade</Label>
              <div className="relative">
                <Input
                  value={universitySearch}
                  onChange={event => {
                    const value = event.target.value;
                    setUniversitySearch(value);
                    setUniversityId('');
                    setCourseId('');
                    setCourseSearch('');
                    setCourses([]);
                    setIsUniversitySearchOpen(true);
                    setFieldValidation(
                      'universityId',
                      value.trim() ? 'Selecione uma universidade da lista' : 'Universidade obrigatoria'
                    );
                  }}
                  onFocus={() => setIsUniversitySearchOpen(true)}
                  onBlur={() => window.setTimeout(() => setIsUniversitySearchOpen(false), 150)}
                  disabled={!cityId || isLoadingAcademicData}
                  placeholder={cityId ? 'Digite pelo menos 2 letras' : 'Selecione uma cidade primeiro'}
                  className={errors.universityId ? 'border-destructive' : ''}
                />
                {isUniversitySearchOpen && cityId && (
                  <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-background shadow-lg">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                      onMouseDown={event => event.preventDefault()}
                      onClick={() => {
                        setUniversityId(NOT_APPLICABLE);
                        setUniversitySearch('Nao se aplica');
                        setUniversities([]);
                        setIsUniversitySearchOpen(false);
                        setCourseId(NOT_APPLICABLE);
                        setCourseSearch('Nao se aplica');
                        setCourses([]);
                        setFieldValidation('universityId');
                        setFieldValidation('courseId');
                      }}
                    >
                      Nao se aplica
                    </button>
                    {isSearchingUniversities && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Buscando...</div>
                    )}
                    {!isSearchingUniversities &&
                      universitySearch.trim().length >= 2 &&
                      universities.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Nenhuma universidade encontrada
                        </div>
                      )}
                    {universities.map(university => (
                      <button
                        key={university.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                        onMouseDown={event => event.preventDefault()}
                        onClick={() => {
                          setUniversityId(university.id);
                          setUniversitySearch(
                            university.acronym
                              ? `${university.acronym} - ${university.name}`
                              : university.name
                          );
                          setIsUniversitySearchOpen(false);
                          setCourseSearch('');
                          setFieldValidation('universityId');
                          setFieldValidation('courseId', 'Curso obrigatorio');
                        }}
                      >
                        <span className="font-medium">
                          {university.acronym || university.name}
                        </span>
                        {university.acronym && (
                          <span className="block text-xs text-muted-foreground">
                            {university.name}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="hidden">
              <Select
                value={universityId}
                onValueChange={value => {
                  setUniversityId(value);
                  setFieldValidation(
                    'universityId',
                    value ? undefined : 'Universidade é obrigatória'
                  );
                  if (value === NOT_APPLICABLE) setFieldValidation('courseId');
                  else setFieldValidation('courseId', 'Curso é obrigatório');
                }}
                disabled={isLoadingAcademicData}
              >
                <SelectTrigger className={`w-full ${errors.universityId ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NOT_APPLICABLE}>Não se aplica</SelectItem>
                  {universities.map(university => (
                    <SelectItem key={university.id} value={university.id}>
                      {university.acronym ? `${university.acronym} - ${university.name}` : university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
              {errors.universityId && (
                <p className="text-sm text-destructive">{errors.universityId}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Curso</Label>
              <div className="relative">
                <Input
                  value={courseSearch}
                  onChange={event => {
                    const value = event.target.value;
                    setCourseSearch(value);
                    setCourseId('');
                    setIsCourseSearchOpen(true);
                    setFieldValidation(
                      'courseId',
                      value.trim() ? 'Selecione um curso da lista' : 'Curso obrigatorio'
                    );
                  }}
                  onFocus={() => setIsCourseSearchOpen(true)}
                  onBlur={() => window.setTimeout(() => setIsCourseSearchOpen(false), 150)}
                  disabled={!universityId || universityId === NOT_APPLICABLE}
                  placeholder={
                    universityId && universityId !== NOT_APPLICABLE
                      ? 'Digite o curso'
                      : 'Selecione uma universidade primeiro'
                  }
                  className={errors.courseId ? 'border-destructive' : ''}
                />
                {isCourseSearchOpen && universityId && universityId !== NOT_APPLICABLE && (
                  <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-background shadow-lg">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                      onMouseDown={event => event.preventDefault()}
                      onClick={() => {
                        setCourseId(NOT_APPLICABLE);
                        setCourseSearch('Nao se aplica');
                        setIsCourseSearchOpen(false);
                        setFieldValidation('courseId');
                      }}
                    >
                      Nao se aplica
                    </button>
                    {filteredCourses.length === 0 && courseSearch.trim() && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Nenhum curso encontrado
                      </div>
                    )}
                    {filteredCourses.map(course => (
                      <button
                        key={course.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                        onMouseDown={event => event.preventDefault()}
                        onClick={() => {
                          setCourseId(course.id);
                          setCourseSearch(course.name);
                          setIsCourseSearchOpen(false);
                          validateCourseSelection(course.id);
                        }}
                      >
                        {course.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="hidden">
              <Select
                value={courseId}
                onValueChange={value => {
                  setCourseId(value);
                  validateCourseSelection(value);
                }}
                disabled={!universityId || universityId === NOT_APPLICABLE}
              >
                <SelectTrigger className={`w-full ${errors.courseId ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NOT_APPLICABLE}>Não se aplica</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
              {errors.courseId && <p className="text-sm text-destructive">{errors.courseId}</p>}
            </div>
            <div className="space-y-2">
              <Label>Semestre atual</Label>
              <Select
                value={currentSemester}
                onValueChange={value => {
                  setCurrentSemester(value);
                  setFieldValidation(
                    'currentSemester',
                    value ? undefined : 'Semestre atual é obrigatório'
                  );
                }}
              >
                <SelectTrigger
                  className={`w-full ${errors.currentSemester ? 'border-destructive' : ''}`}
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NOT_APPLICABLE}>Não se aplica</SelectItem>
                  {Array.from({ length: 12 }, (_, index) => String(index + 1)).map(semester => (
                    <SelectItem key={semester} value={semester}>
                      {semester}º semestre
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currentSemester && (
                <p className="text-sm text-destructive">{errors.currentSemester}</p>
              )}
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
                  onChange={e => {
                    const value = e.target.value;
                    setNome(value);
                    validateRequiredField('nome', value, 'Nome é obrigatório');
                  }}
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
                  onChange={e => {
                    const value = e.target.value;
                    setSobrenome(value);
                    validateRequiredField('sobrenome', value, 'Sobrenome é obrigatório');
                  }}
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
                onChange={e => {
                  const value = e.target.value;
                  setDataNascimento(value);
                  validateRequiredField(
                    'dataNascimento',
                    value,
                    'Data de nascimento é obrigatória'
                  );
                }}
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
                onChange={e => {
                  const value = formatCPF(e.target.value);
                  setCpf(value);
                  if (!value) setFieldValidation('cpf', 'CPF é obrigatório');
                  else setFieldValidation('cpf', isValidCPF(value) ? undefined : 'CPF inválido');
                }}
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
                onChange={e => {
                  const value = formatPhone(e.target.value);
                  setTelefone(value);
                  if (!value) setFieldValidation('telefone', 'Telefone é obrigatório');
                  else
                    setFieldValidation(
                      'telefone',
                      value.replace(/\D/g, '').length >= 10 ? undefined : 'Telefone inválido'
                    );
                }}
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
                onChange={e => {
                  const value = e.target.value;
                  setEmailPessoal(value);
                  validateEmailField('emailPessoal', value, 'Email pessoal é obrigatório');
                }}
                className={errors.emailPessoal ? 'border-destructive' : ''}
              />
              {errors.emailPessoal && (
                <p className="text-sm text-destructive">{errors.emailPessoal}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Padrinho (opcional)</Label>
              <PadrinhoSelector
                selectedPadrinho={padrinho}
                onSelect={selected => {
                  setPadrinho(selected);
                  clearFieldError('padrinho');
                }}
              />
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
                  onChange={e => {
                    const value = e.target.value;
                    setSenha(value);

                    if (!value) {
                      setFieldValidation('senha', 'Senha é obrigatória');
                    } else {
                      const validation = validatePassword(value);
                      setFieldValidation('senha', validation.isValid ? undefined : validation.message);
                    }

                    if (confirmarSenha) {
                      setFieldValidation(
                        'confirmarSenha',
                        value === confirmarSenha ? undefined : 'Senhas não coincidem'
                      );
                    }
                  }}
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
                  onChange={e => {
                    const value = e.target.value;
                    setConfirmarSenha(value);
                    if (!value) setFieldValidation('confirmarSenha', 'Confirmação obrigatória');
                    else
                      setFieldValidation(
                        'confirmarSenha',
                        senha === value ? undefined : 'Senhas não coincidem'
                      );
                  }}
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
