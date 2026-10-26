import { z } from 'zod';

export const requiredStr = (message: string) => z.string().trim().min(1, message);
