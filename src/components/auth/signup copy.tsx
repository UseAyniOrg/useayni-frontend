import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { validateCPF } from '@/utils/cpf';
import { required } from '@/schemas/requiredField';
import { validatePhone } from '@/utils/phone';
import { validatePassword } from '@/utils/password';
import { useEffect, useState } from 'react';
import {
  academicService,
  type CityOption,
  type CourseOption,
  type UniversityOption,
  type StateOption,
} from '@/services/academicService';
import { useSelect } from '@/hooks/useSelect';

const signUpSchema = z
  .object({
    ra: required('RA é obrigatório'),
    admissionDate: required('Data de ingresso é obrigatória'),
    academicEmail: required('Email acadêmico é obrigatório').email('Email inválido'),
    stateId: required('Estado é obrigatório'),
    cityId: required('Cidade é obrigatória'),
    universityId: required('Universidade é obrigatória'),
    courseId: required('Curso é obrigatório'),
    currentSemester: required('Semestre atual é obrigatório'),

    name: required('Nome é obrigatório'),
    surname: required('Sobrenome é obrigatório'),
    birthDate: required('Data de nascimento é obrigatória'),
    cpf: required('CPF é obrigatório').refine(validateCPF, 'CPF inválido'),
    phone: required('Telefone é obrigatório').refine(validatePhone, 'Telefone inválido'),
    email: required('Email pessoal é obrigatório').email('Email inválido'),
    padrinho: z.object(),

    password: required('Senha é obrigatória').superRefine((data, ctx) => {
      const result = validatePassword(data);
      !result.isValid && ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message });
    }),
    confirmPassword: required('Confirmar senha é obrigatória'),
  })
  .refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  });

type SignUpData = z.infer<typeof signUpSchema>;
const NOT_APPLICABLE = 'not_applicable';

export default function signup() {
  // Form
  const {
    setValues,
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
  });
  const states = useSelect<StateOption>();
  const cities = useSelect<CityOption>();
  const universities = useSelect<UniversityOption>();
  const courses = useSelect<CourseOption>();

  // Step
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const stepFields: Record<number, (keyof SignUpData)[]> = {
    0: ["ra", "admissionDate", "academicEmail", "stateId", "cityId", "universityId", "courseId", "currentSemester"],
    1: ["name", "surname", "birthDate", "cpf", "email", "padrinho"],
    2: ["password", "confirmPassword"]
  };
  const handleNext = () => setStep(prev => prev + 1 as 0 | 1 | 2);
  const handleBack = () => setStep(prev => prev - 1 as 0 | 1 | 2);

  // Messages
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAcademicData, setIsLoadingAcademicData] = useState(false);
  const [apiError, setApiError] = useState('');
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  

  useEffect(() => {
    const getStates = async () => states.setList(await academicService.getStates());
    getStates();
  }, []);

  return <></>;
}
