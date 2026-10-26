export interface PeopleTableColumn { key: string; label: string; date?: boolean }
export interface PeopleTableRow { id: string; name: string; values: Record<string, string> }
export type FilterOperator = 'contains' | 'not_contains' | 'equals' | 'starts_with' | 'empty' | 'not_empty' | 'gte' | 'lte';
export interface PeopleTableFilter { id: number; column: string; operator: FilterOperator; value: string }

export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

export function filterPeopleRows(rows: PeopleTableRow[], search: string, filters: PeopleTableFilter[]): PeopleTableRow[] {
  const query = normalizeSearch(search);
  return rows.filter(row => {
    if (query && !Object.values(row.values).some(value => normalizeSearch(value).includes(query))) return false;
    return filters.every(filter => {
      const value = normalizeSearch(row.values[filter.column] ?? '');
      const expected = normalizeSearch(filter.value);
      if (filter.operator === 'empty') return !value;
      if (filter.operator === 'not_empty') return Boolean(value);
      if (!expected) return true;
      switch (filter.operator) {
        case 'contains': return value.includes(expected);
        case 'not_contains': return !value.includes(expected);
        case 'equals': return value === expected;
        case 'starts_with': return value.startsWith(expected);
        case 'gte': return Boolean(value) && value.slice(0, 10) >= expected;
        case 'lte': return Boolean(value) && value.slice(0, 10) <= expected;
      }
    });
  });
}

export function textValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(textValue).join(', ');
  return Object.entries(value).map(([key, item]) => `${key}: ${textValue(item)}`).join('; ');
}

export function addDataColumns(values: Record<string, string>, columns: Map<string, PeopleTableColumn>,
  prefix: string, label: string, input: unknown, labels: Record<string, string> = {}) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return;
  for (const [key, value] of Object.entries(input)) {
    const columnKey = `${prefix}.${key}`;
    columns.set(columnKey, { key: columnKey, label: `${label}: ${labels[key] ?? key}` });
    values[columnKey] = textValue(value);
  }

}

export function addRegistrationColumns(values: Record<string, string>, columns: Map<string, PeopleTableColumn>,
    profile: Record<string, unknown>, answers: unknown) {
    const schema = profile.event_registration_schema;
    const labels: Record<string, string> = {};
    if (Array.isArray(schema)) for (const field of schema) {
      if (typeof field === 'object' && field !== null && typeof field.key === 'string' && typeof field.label === 'string') {
        labels[field.key] = field.label;
        columns.set(`answers.${field.key}`, { key: `answers.${field.key}`, label: `Evento: ${field.label}` });
      }
    }
    const profileLabels: Record<string, string> = {};
    if (Array.isArray(profile.profile_fields)) for (const field of profile.profile_fields) {
      if (typeof field === 'object' && field !== null && typeof field.key === 'string' && typeof field.label === 'string') {
        profileLabels[field.key] = field.label;
        columns.set(`profile.${field.key}`, { key: `profile.${field.key}`, label: `Cadastro: ${field.label}` });
      }
    }
    addDataColumns(values, columns, 'profile', 'Cadastro', profile.profile_data, profileLabels);
    addDataColumns(values, columns, 'academic', 'Acadêmico', profile.academic_data);
    addDataColumns(values, columns, 'answers', 'Evento', answers, labels);
}
