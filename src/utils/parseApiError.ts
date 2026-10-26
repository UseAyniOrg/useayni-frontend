import { isAxiosError } from 'axios';

interface NestErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

function getErrorBody(error: unknown): { status?: number; data?: NestErrorBody } | undefined {
  if (isAxiosError(error)) {
    return { status: error.response?.status, data: error.response?.data as NestErrorBody };
  }
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: NestErrorBody } }).response;
    return response ? { status: response.status, data: response.data } : undefined;
  }
  return undefined;
}

export function parseApiError(
  error: unknown,
  fallback = 'Ocorreu um erro inesperado. Tente novamente.'
): string {
  const body = getErrorBody(error);
  const message = body?.data?.message;

  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string' && message.trim()) return message;

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return getErrorBody(error)?.status;
}
