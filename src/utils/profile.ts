export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function formatTenure(admissionDate: Date | string | undefined): string {
  if (!admissionDate) return 'Membro do CreaJr-PR';

  const start = new Date(admissionDate);
  if (Number.isNaN(start.getTime())) return 'Membro do CreaJr-PR';

  const now = new Date();
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 0) months = 0;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
  if (remainingMonths > 0) {
    parts.push(`${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`);
  }
  if (parts.length === 0) parts.push('menos de 1 mês');

  return `${parts.join(' e ')} no CreaJr-PR`;
}

export function isVeteranMember(admissionDate: Date | string | undefined): boolean {
  if (!admissionDate) return false;
  const start = new Date(admissionDate);
  if (Number.isNaN(start.getTime())) return false;

  const diffMs = Date.now() - start.getTime();
  const twoYearsMs = 2 * 365.25 * 24 * 60 * 60 * 1000;
  return diffMs >= twoYearsMs;
}

export function groupSkillsByCategory(
  skills: Array<{ id: string; name: string; category: string }>
) {
  const order = ['GESTÃO', 'SOFT SKILLS', 'TÉCNICA'] as const;
  const grouped = new Map<string, typeof skills>();

  for (const skill of skills) {
    const list = grouped.get(skill.category) ?? [];
    list.push(skill);
    grouped.set(skill.category, list);
  }

  return order
    .filter((category) => grouped.has(category))
    .map((category) => ({
      category,
      skills: grouped.get(category) ?? [],
    }));
}
