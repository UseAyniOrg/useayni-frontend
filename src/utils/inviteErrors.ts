import { getApiErrorStatus, parseApiError } from './parseApiError';

/** Maps backend invite errors to user-facing Portuguese messages (RN-034–038). */
export function parseInviteError(
  error: unknown,
  context: 'send' | 'accept' | 'reject' | 'cancel' | 'list' = 'send'
): string {
  const status = getApiErrorStatus(error);
  const message = parseApiError(error, '').toLowerCase();

  if (status === 403) {
    return 'Você não tem permissão para realizar esta ação nesta miscelânea.';
  }

  if (status === 404) {
    return context === 'list'
      ? 'Não foi possível carregar os convites.'
      : 'Convite ou miscelânea não encontrado.';
  }

  if (status === 409 || message.includes('vaga') || message.includes('limite')) {
    return 'Não foi possível aceitar: o limite de vagas desta miscelânea foi atingido.';
  }

  if (
    status === 400 &&
    (message.includes('pendente') || message.includes('duplicad') || message.includes('já existe'))
  ) {
    return 'Já existe um convite pendente para este usuário nesta miscelânea.';
  }

  if (status === 400 && (message.includes('expir') || message.includes('expired'))) {
    return 'Este convite expirou e não pode mais ser aceito.';
  }

  if (status === 400 && message.includes('cancel')) {
    return 'Apenas convites pendentes podem ser cancelados.';
  }

  const fallbacks: Record<typeof context, string> = {
    send: 'Não foi possível enviar o convite.',
    accept: 'Não foi possível aceitar o convite.',
    reject: 'Não foi possível recusar o convite.',
    cancel: 'Não foi possível cancelar o convite.',
    list: 'Não foi possível carregar os convites.',
  };

  return parseApiError(error, fallbacks[context]);
}
