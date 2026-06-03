import { z } from 'zod';

export const required = (message: string) => z.string().trim().min(1, message);
