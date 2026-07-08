import {z} from "zod";
import { requiredStr } from "./requiredString";
import { validateCPF } from "@/utils/cpf";
import { validatePhone } from "@/utils/phone";
import { validatePassword } from "@/utils/password";

export const signUpSchema = z
  .object({
    ra: requiredStr('RA é obrigatório'),
    admissionDate: requiredStr('Data de ingresso é obrigatória'),
    academicEmail: requiredStr('Email acadêmico é obrigatório').email('Email inválido'),
    stateId: requiredStr('Estado é obrigatório'),
    cityId: requiredStr('Cidade é obrigatória'),
    universityId: requiredStr('Universidade é obrigatória'),
    courseId: requiredStr('Curso é obrigatório'),
    currentSemester: requiredStr('Semestre atual é obrigatório'),

    name: requiredStr('Nome é obrigatório'),
    surname: requiredStr('Sobrenome é obrigatório'),
    birthDate: requiredStr('Data de nascimento é obrigatória'),
    cpf: requiredStr('CPF é obrigatório').refine(validateCPF, 'CPF inválido'),
    phone: requiredStr('Telefone é obrigatório').refine(validatePhone, 'Telefone inválido'),
    email: requiredStr('Email pessoal é obrigatório').email('Email inválido'),
    padrinho: z.unknown().optional(),

    password: requiredStr('Senha é obrigatória').superRefine((data, ctx) => {
      const result = validatePassword(data);
      !result.isValid && ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message });
    }),
    confirmPassword: requiredStr('Confirmar senha é obrigatória'),
  })
  .refine(d => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  });

export type SignUpData = z.infer<typeof signUpSchema>;
