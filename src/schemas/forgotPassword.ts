import z from 'zod';
import { requiredStr } from './requiredString';
import { validatePassword } from '@/utils/password';
import { validatePhone } from '@/utils/phone';

export const forgotPasswordFormSchema = z
  .object({
    verificationType: z.enum(['email', 'phone']),
    email: z.string().optional(),
    phone: z.string().optional(),
    otpValue: requiredStr('Código é obrigatório').length(6, 'Código inválido'),
    password: requiredStr('Senha é obrigatória').superRefine((data, ctx) => {
      const result = validatePassword(data);
      if (!result.isValid) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message });
      }
    }),
    confirmPassword: requiredStr('Confirmar senha é obrigatória'),
  })
  .superRefine((data, ctx) => {
    if (data.verificationType === 'email') {
      if (!data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: 'Email é obrigatório',
        });
      } else if (!z.string().email().safeParse(data.email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: 'Email inválido',
        });
      }
    }

    if (data.verificationType === 'phone') {
      if (!data.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone'],
          message: 'Telefone é obrigatório',
        });
      } else if (!validatePhone(data.phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone'],
          message: 'Telefone inválido',
        });
      }
    }

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'As senhas não coincidem',
      });
    }
  });

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;
