export function normalizeQuery(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

export function paginateItems<T>(items: T[], requestedPage: number, requestedSize: number) {
  const pageSize = Number.isFinite(requestedSize) ? Math.max(1, Math.floor(requestedSize)) : 25;
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Number.isFinite(requestedPage) ? Math.max(1, Math.min(pages, Math.floor(requestedPage))) : 1;
  return { items: items.slice((page - 1) * pageSize, page * pageSize), page, pageSize, pages, total };
}