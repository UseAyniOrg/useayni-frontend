export function apiErrorMessage(cause: unknown, fallback: string): string {
  if (typeof cause === 'object' && cause !== null && 'response' in cause) {
    const data = (cause as { response?: { data?: { message?: unknown; issues?: unknown } } }).response?.data;
    const message = typeof data?.message === 'string' ? data.message
      : Array.isArray(data?.message) ? data.message.filter(value => typeof value === 'string').join(' ') : '';
    const issues = Array.isArray(data?.issues) ? data.issues.flatMap(issue => {
      if (typeof issue !== 'object' || issue === null || typeof issue.message !== 'string') return [];
      return [typeof issue.path === 'string' && issue.path ? `${issue.path}: ${issue.message}` : issue.message];
    }).join(' ') : '';
    if (message || issues) return [message, issues].filter(Boolean).join(' ');
  }
  if (cause instanceof Error && cause.message === 'Network Error') return 'Não foi possível conectar à API. Confira a conexão e a origem permitida do site.';
  return cause instanceof Error ? cause.message : fallback;
}