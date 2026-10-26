import { useEffect, useMemo, useState } from 'react';
import { miscellaneousService, type ExternalEventRegistration } from '@/services/miscellaneousService';
import { PeopleDataTable } from '../PeopleDataTable';
import { addRegistrationColumns, textValue, type PeopleTableColumn, type PeopleTableRow } from '../peopleTableData';

export function ExternalRegistrationsTab({ miscId }: { miscId: string }) {
  const [registrations, setRegistrations] = useState<ExternalEventRegistration[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let current = true;
    setLoading(true); setError(''); setRegistrations([]);
    miscellaneousService.getExternalRegistrations(miscId)
      .then(items => { if (current) setRegistrations(items); })
      .catch(() => { if (current) setError('Não foi possível carregar as inscrições públicas deste evento.'); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [miscId]);
  const data = useMemo(() => {
    const columns = new Map<string, PeopleTableColumn>([
      ['name', { key: 'name', label: 'Nome' }], ['email', { key: 'email', label: 'Email' }],
      ['phone', { key: 'phone', label: 'Telefone' }], ['cpf', { key: 'cpf', label: 'CPF' }],
      ['membership', { key: 'membership', label: 'Vínculo' }], ['profileType', { key: 'profileType', label: 'Tipo de cadastro' }],
      ['registered', { key: 'registered', label: 'Inscrição', date: true }],
      ['consent.at', { key: 'consent.at', label: 'Consentimento do perfil', date: true }],
      ['consent.version', { key: 'consent.version', label: 'Versão do consentimento' }],
    ]);
    const rows: PeopleTableRow[] = registrations.map(registration => {
      const profile = registration.shared_profile;
      const values: Record<string, string> = {
        name: textValue(profile.name) || 'Participante', email: textValue(profile.email), phone: textValue(profile.phone), cpf: textValue(profile.cpf),
        membership: registration.membership_type === 'internal' ? 'Interno' : 'Externo',
        profileType: textValue(profile.organization_profile_name) || (registration.profile_type === 'academic' ? 'Acadêmico (legado)' : 'Básico'),
        registered: registration.created_at, 'consent.at': registration.profile_consent_at, 'consent.version': registration.profile_consent_version,
      };
      addRegistrationColumns(values, columns, profile, registration.registration_data);
      return { id: registration.id, name: values.name, values };
    });
    return { columns: [...columns.values()], rows };
  }, [registrations]);
  if (loading) return <p className="text-sm text-muted-foreground">Carregando inscrições públicas...</p>;
  if (error) return <p role="alert" className="text-sm text-destructive">{error}</p>;
  return <PeopleDataTable key={miscId} title="Inscrições pela página pública" {...data} />;
}
