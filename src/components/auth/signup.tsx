import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  academicService,
  type CityOption,
  type CourseOption,
  type StateOption,
  type UniversityOption,
} from '@/services/academicService';
import { useSelect } from '@/hooks/useSelect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { signUpSchema, type SignUpData } from '@/schemas/signUp';
import FormField from '../common/formField';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  PadrinhoSelector,
  findMemberById,
  findMemberBySlug,
  type Member,
} from '../common/padrinhoSelector';
import { authService } from '@/lib/auth/authService';
import { formatCPF } from '@/utils/cpf';
import { formatPhone } from '@/utils/phone';
import SearchCombobox from '../common/searchCombobox';

const TOTAL_STEPS = 3;
const NOT_APPLICABLE = 'not_applicable';

interface SignUpProps {
  padrinhoSlug?: string | null;
  sponsorMemberId?: string | null;
}

const isUuid = (value?: string) =>
  !!value &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const getApiErrorMessage = (error: unknown) => {
  const responseMessage =
    typeof error === 'object' && error !== null && 'response' in error
      ? (error as any).response?.data?.message
      : undefined;

  if (Array.isArray(responseMessage)) return responseMessage.join(', ');
  if (typeof responseMessage === 'string') return responseMessage;
  return 'Erro ao criar conta. Tente novamente.';
};

export default function SignUp({ padrinhoSlug, sponsorMemberId }: SignUpProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAcademicData, setIsLoadingAcademicData] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [padrinho, setPadrinho] = useState<Member | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const states = useSelect<StateOption>();
  const cities = useSelect<CityOption>();
  const universities = useSelect<UniversityOption>();
  const courses = useSelect<CourseOption>();

  const {
    control,
    formState: { errors },
    handleSubmit: submitForm,
    register,
    setError,
    setValue,
    trigger,
    watch,
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      ra: '',
      admissionDate: '',
      academicEmail: '',
      stateId: '',
      cityId: '',
      universityId: '',
      courseId: '',
      currentSemester: '',
      name: '',
      surname: '',
      birthDate: '',
      cpf: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const selectedUniversityId = watch('universityId');
  const selectedCourseId = watch('courseId');

  const stepTitles = ['Dados Acadêmicos', 'Dados Pessoais', 'Senha'];
  const stepFields: Record<number, Array<keyof SignUpData>> = {
    1: [
      'ra',
      'admissionDate',
      'academicEmail',
      'stateId',
      'cityId',
      'universityId',
      'courseId',
      'currentSemester',
    ],
    2: ['name', 'surname', 'birthDate', 'cpf', 'email', 'phone'],
    3: ['password', 'confirmPassword'],
  };

  const stateOptions = useMemo(
    () =>
      states.list.map(state => ({
        id: state.id,
        label: state.name,
        description: state.uf,
      })),
    [states.list]
  );

  const cityOptions = useMemo(() => {
    const query = cities.search.trim().toLowerCase();
    return cities.list
      .filter(city => !query || city.name.toLowerCase().includes(query))
      .slice(0, 50)
      .map(city => ({ id: city.id, label: city.name }));
  }, [cities.list, cities.search]);

  const universityOptions = useMemo(
    () => [
      { id: NOT_APPLICABLE, label: 'Não se aplica' },
      ...universities.list.map(university => ({
        id: university.id,
        label: university.acronym ? `${university.acronym} - ${university.name}` : university.name,
      })),
    ],
    [universities.list]
  );

  const courseOptions = useMemo(() => {
    const query = courses.search.trim().toLowerCase();
    return [
      { id: NOT_APPLICABLE, label: 'Não se aplica' },
      ...courses.list
        .filter(course => !query || course.name.toLowerCase().includes(query))
        .map(course => ({ id: course.id, label: course.name })),
    ];
  }, [courses.list, courses.search]);

  const selectedCourseUniversityId =
    selectedUniversityId !== NOT_APPLICABLE && selectedCourseId !== NOT_APPLICABLE
      ? (() => {
          const courseUniversities =
            courses.list.find(course => course.id === selectedCourseId)?.courseUniversities || [];

          return (
            courseUniversities.find(
              courseUniversity =>
                courseUniversity.university_id === selectedUniversityId &&
                courseUniversity.city_id === cities.value
            )?.id ||
            courseUniversities.find(
              courseUniversity => courseUniversity.university_id === selectedUniversityId
            )?.id
          );
        })()
      : undefined;

  const progress = (step / TOTAL_STEPS) * 100;

  const updateField = (field: keyof SignUpData, value: string, shouldValidate = true) => {
    setValue(field, value, { shouldDirty: true, shouldValidate });
  };

  const handleNext = async () => {
    if (!(await trigger(stepFields[step]))) return;
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const onSubmit = async (data: SignUpData) => {
    if (!(await trigger(stepFields[3]))) return;

    setIsLoading(true);

    try {
      const sponsorId = padrinho?.id;
      const sponsorIsUuid = isUuid(sponsorId);

      await authService.signUp(
        {
          name: `${data.name} ${data.surname}`,
          cpf: data.cpf,
          phone: data.phone,
          email_personal: data.email,
          email_university: data.academicEmail,
          birth_date: data.birthDate,
          admission_date: data.admissionDate,
          ra: data.ra,
          password: data.password,
          city_id: data.cityId,
          sponsor: sponsorIsUuid ? sponsorId : padrinho?.name,
          course_university_id: selectedCourseUniversityId,
          current_semester:
            data.currentSemester && data.currentSemester !== NOT_APPLICABLE
              ? Number(data.currentSemester)
              : undefined,
          university_not_applicable: data.universityId === NOT_APPLICABLE,
          course_not_applicable: data.courseId === NOT_APPLICABLE,
          current_semester_not_applicable: data.currentSemester === NOT_APPLICABLE,
        },
        sponsorIsUuid ? sponsorId : undefined
      );

      setRegistrationCompleted(true);
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadStates = async () => {
      setIsLoadingAcademicData(true);

      try {
        const stateOptions = await academicService.getStates();
        if (!isMounted) return;
        states.setList(
          [...stateOptions].sort((a, b) =>
            a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
          )
        );
      } catch {
        setError('root', { message: 'Não foi possível carregar os estados.' });
      } finally {
        if (isMounted) setIsLoadingAcademicData(false);
      }
    };

    loadStates();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialSponsor = async () => {
      if (sponsorMemberId) {
        const found = await findMemberById(sponsorMemberId);
        if (!isMounted) return;
        setPadrinho(
          found || {
            id: sponsorMemberId,
            name: 'Padrinho informado',
            slug: '',
            course: '',
            university: '',
          }
        );
        return;
      }

      if (padrinhoSlug) {
        const found = await findMemberBySlug(padrinhoSlug);
        if (!isMounted) return;
        if (found) setPadrinho(found);
        else setError('root', { message: 'Padrinho não encontrado.' });
      }
    };

    loadInitialSponsor();

    return () => {
      isMounted = false;
    };
  }, [padrinhoSlug, sponsorMemberId]);

  useEffect(() => {
    if (!states.value) {
      cities.clear();
      universities.clear();
      courses.clear();
      updateField('stateId', '', false);
      updateField('cityId', '', false);
      updateField('universityId', '', false);
      updateField('courseId', '', false);
      return;
    }

    let isMounted = true;
    cities.clear();
    universities.clear();
    courses.clear();
    updateField('stateId', states.value);
    updateField('cityId', '', false);
    updateField('universityId', '', false);
    updateField('courseId', '', false);

    const loadCities = async () => {
      setIsLoadingAcademicData(true);

      try {
        const cityOptions = await academicService.getCitiesByState(states.value!);
        if (!isMounted) return;
        cities.setList(
          [...cityOptions].sort((a, b) =>
            a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
          )
        );
      } catch {
        setError('root', { message: 'Não foi possível carregar as cidades.' });
      } finally {
        if (isMounted) setIsLoadingAcademicData(false);
      }
    };

    loadCities();

    return () => {
      isMounted = false;
    };
  }, [states.value]);

  useEffect(() => {
    if (!cities.value || !states.value) {
      universities.clear();
      courses.clear();
      updateField('cityId', '', false);
      updateField('universityId', '', false);
      updateField('courseId', '', false);
      return;
    }

    let isMounted = true;
    universities.clear();
    courses.clear();
    updateField('cityId', cities.value);
    updateField('universityId', '', false);
    updateField('courseId', '', false);

    const loadUniversities = async () => {
      setIsLoadingAcademicData(true);

      try {
        const universityOptions = await academicService.getUniversities({
          cityId: cities.value,
          stateId: states.value,
        });
        if (!isMounted) return;
        universities.setList(universityOptions.slice(0, 30));
      } catch {
        setError('root', { message: 'Não foi possível carregar as universidades.' });
      } finally {
        if (isMounted) setIsLoadingAcademicData(false);
      }
    };

    loadUniversities();

    return () => {
      isMounted = false;
    };
  }, [cities.value]);

  useEffect(() => {
    if (!selectedUniversityId || selectedUniversityId === NOT_APPLICABLE) {
      courses.clear();
      if (selectedUniversityId === NOT_APPLICABLE) {
        courses.setSearch('Não se aplica');
        updateField('courseId', NOT_APPLICABLE);
      }
      return;
    }

    let isMounted = true;
    courses.clear();
    updateField('courseId', '', false);

    const loadCourses = async () => {
      setIsLoadingAcademicData(true);

      try {
        let courseOptions = await academicService.getCoursesByUniversity(
          selectedUniversityId,
          cities.value
        );

        if (courseOptions.length === 0) {
          courseOptions = await academicService.getCoursesByUniversity(selectedUniversityId);
        }

        if (!isMounted) return;
        courses.setList(
          [...courseOptions].sort((a, b) =>
            a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
          )
        );
      } catch {
        setError('root', { message: 'Não foi possível carregar os cursos.' });
      } finally {
        if (isMounted) setIsLoadingAcademicData(false);
      }
    };

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, [selectedUniversityId]);

  useEffect(() => {
    if (!cities.value || !states.value || selectedUniversityId === NOT_APPLICABLE) return;

    const query = universities.search.trim();
    const timeoutId = window.setTimeout(
      async () => {
        setIsLoadingAcademicData(true);

        try {
          const universityOptions = await academicService.getUniversities({
            q: query.length >= 2 ? query : undefined,
            cityId: cities.value,
            stateId: states.value,
          });
          universities.setList(universityOptions.slice(0, query.length >= 2 ? 30 : 5));
        } catch {
          setError('root', { message: 'Não foi possível buscar universidades.' });
        } finally {
          setIsLoadingAcademicData(false);
        }
      },
      query.length >= 2 ? 350 : 250
    );

    return () => window.clearTimeout(timeoutId);
  }, [universities.search]);

  if (registrationCompleted) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Cadastro em análise</CardTitle>
          <CardDescription>
            Ótimo ter você conosco. Seu cadastro está em análise e você será notificado assim que
            esse processo for concluído.
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

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Cadastrar</CardTitle>
        <CardDescription>
          {stepTitles[step - 1]} - Passo {step} de {TOTAL_STEPS}
        </CardDescription>
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitForm(onSubmit)} className="space-y-4">
          {errors.root?.message && (
            <div className="rounded-md bg-red-50 p-3 text-center text-sm text-red-500">
              {errors.root.message}
            </div>
          )}

          {step === 1 && (
            <>
              <FormField id="ra" label="RA (Registro Acadêmico)" error={errors.ra}>
                <Input placeholder="Digite seu RA" {...register('ra')} />
              </FormField>

              <FormField
                id="admissionDate"
                label="Data de ingresso no curso"
                error={errors.admissionDate}
              >
                <Input
                  type="date"
                  min="0001-01-01"
                  max="9999-12-31"
                  {...register('admissionDate')}
                />
              </FormField>

              <FormField id="academicEmail" label="Email acadêmico" error={errors.academicEmail}>
                <Input
                  type="email"
                  placeholder="seu@universidade.edu.br"
                  {...register('academicEmail')}
                />
              </FormField>

              <FormField id="stateId" label="Estado" error={errors.stateId}>
                <Controller
                  control={control}
                  name="stateId"
                  render={() => (
                    <SearchCombobox
                      disabled={isLoadingAcademicData}
                      emptyMessage="Estado não encontrado"
                      onSearchChange={states.setSearch}
                      onValueChange={value => {
                        states.setValue(value || '');
                        updateField('stateId', value || '');
                        const selected = states.list.find(state => state.id === value);
                        states.setSearch(selected?.name || '');
                      }}
                      options={stateOptions}
                      placeholder="Selecione o estado"
                      search={states.search}
                      value={states.value}
                    />
                  )}
                />
              </FormField>

              <FormField id="cityId" label="Cidade" error={errors.cityId}>
                <Controller
                  control={control}
                  name="cityId"
                  render={() => (
                    <SearchCombobox
                      disabled={!states.value || isLoadingAcademicData}
                      emptyMessage="Cidade não encontrada"
                      onSearchChange={cities.setSearch}
                      onValueChange={value => {
                        cities.setValue(value || '');
                        updateField('cityId', value || '');
                        const selected = cities.list.find(city => city.id === value);
                        cities.setSearch(selected?.name || '');
                      }}
                      options={cityOptions}
                      placeholder={
                        states.value ? 'Digite a cidade' : 'Selecione um estado primeiro'
                      }
                      search={cities.search}
                      value={cities.value}
                    />
                  )}
                />
              </FormField>

              <FormField id="universityId" label="Universidade" error={errors.universityId}>
                <Controller
                  control={control}
                  name="universityId"
                  render={() => (
                    <SearchCombobox
                      disabled={!cities.value || isLoadingAcademicData}
                      emptyMessage="Universidade não encontrada"
                      onSearchChange={universities.setSearch}
                      onValueChange={value => {
                        universities.setValue(value || '');
                        updateField('universityId', value || '');
                        const selected = universityOptions.find(option => option.id === value);
                        universities.setSearch(selected?.label || '');
                      }}
                      options={universityOptions}
                      placeholder={
                        cities.value ? 'Digite a universidade' : 'Selecione uma cidade primeiro'
                      }
                      search={universities.search}
                      value={selectedUniversityId}
                    />
                  )}
                />
              </FormField>

              <FormField id="courseId" label="Curso" error={errors.courseId}>
                <Controller
                  control={control}
                  name="courseId"
                  render={() => (
                    <SearchCombobox
                      disabled={!selectedUniversityId || selectedUniversityId === NOT_APPLICABLE}
                      emptyMessage="Curso não encontrado"
                      onSearchChange={courses.setSearch}
                      onValueChange={value => {
                        courses.setValue(value || '');
                        updateField('courseId', value || '');
                        const selected = courseOptions.find(option => option.id === value);
                        courses.setSearch(selected?.label || '');
                      }}
                      options={courseOptions}
                      placeholder={
                        selectedUniversityId && selectedUniversityId !== NOT_APPLICABLE
                          ? 'Digite o curso'
                          : 'Selecione uma universidade primeiro'
                      }
                      search={courses.search}
                      value={selectedCourseId}
                    />
                  )}
                />
              </FormField>

              <FormField id="currentSemester" label="Semestre atual" error={errors.currentSemester}>
                <Controller
                  control={control}
                  name="currentSemester"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NOT_APPLICABLE}>Não se aplica</SelectItem>
                        {Array.from({ length: 12 }, (_, index) => String(index + 1)).map(
                          semester => (
                            <SelectItem key={semester} value={semester}>
                              {semester}º semestre
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField id="name" label="Nome" error={errors.name}>
                  <Input placeholder="Nome" {...register('name')} />
                </FormField>
                <FormField id="surname" label="Sobrenome" error={errors.surname}>
                  <Input placeholder="Sobrenome" {...register('surname')} />
                </FormField>
              </div>

              <FormField id="birthDate" label="Data de nascimento" error={errors.birthDate}>
                <Input type="date" min="0001-01-01" max="9999-12-31" {...register('birthDate')} />
              </FormField>

              <FormField id="cpf" label="CPF" error={errors.cpf}>
                <Controller
                  control={control}
                  name="cpf"
                  render={({ field }) => (
                    <Input
                      placeholder="000.000.000-00"
                      value={field.value}
                      onChange={event => field.onChange(formatCPF(event.target.value))}
                    />
                  )}
                />
              </FormField>

              <FormField id="phone" label="Telefone" error={errors.phone}>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <Input
                      placeholder="(11) 99999-9999"
                      value={field.value}
                      onChange={event => field.onChange(formatPhone(event.target.value))}
                    />
                  )}
                />
              </FormField>

              <FormField id="email" label="Email pessoal" error={errors.email}>
                <Input type="email" placeholder="seu@email.com" {...register('email')} />
              </FormField>

              <FormField id="padrinho" label="Padrinho (opcional)">
                <PadrinhoSelector selectedPadrinho={padrinho} onSelect={setPadrinho} />
              </FormField>
            </>
          )}

          {step === 3 && (
            <>
              <FormField id="password" label="Senha" error={errors.password}>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    className="pr-10"
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormField>

              <FormField
                id="confirmPassword"
                label="Confirmar senha"
                error={errors.confirmPassword}
              >
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    className="pr-10"
                    {...register('confirmPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
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
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                Voltar
              </Button>
            )}
            {step < TOTAL_STEPS && (
              <Button type="button" className="flex-1" onClick={handleNext}>
                Próximo
              </Button>
            )}
            {step === TOTAL_STEPS && (
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Criando conta...' : 'Finalizar'}
              </Button>
            )}
          </div>
        </form>

        {step === 1 && (
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-medium text-primary hover:underline"
            >
              Entrar
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
