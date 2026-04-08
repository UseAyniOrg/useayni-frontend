import { z } from 'zod';

// Exemplo de schema de validação de formulário de login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Exemplo de schema de validação de usuário
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

// Exemplo de schema de validação de API response
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;

// Uso em componente React:
// import { loginSchema, type LoginFormData } from '@/schemas/validation';
//
// const handleSubmit = (data: unknown) => {
//   const result = loginSchema.safeParse(data);
//   if (!result.success) {
//     console.error(result.error.errors);
//     return;
//   }
//   // result.data é tipado como LoginFormData
//   console.log(result.data);
// };
