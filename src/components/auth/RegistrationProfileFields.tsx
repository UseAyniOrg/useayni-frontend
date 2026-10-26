import type { Dispatch, SetStateAction } from 'react';
import type { ExternalProfileType } from '@/services/externalProfileService';
import type { ExternalRegistrationField } from '@/services/miscellaneousService';

interface Props {
  profiles: ExternalProfileType[];
  selected: string;
  onSelect: (key: string) => void;
  values: Record<string, unknown>;
  onChange: Dispatch<SetStateAction<Record<string, unknown>>>;
}

export function RegistrationProfileFields({ profiles, selected, onSelect, values, onChange }: Props) {
  const profile = profiles.find(item => item.key === selected);
  return <fieldset className="space-y-3 rounded-lg border p-4">
    <legend className="px-1 font-medium">Perfil nesta organização</legend>
    <label className="grid gap-1 text-sm">
      <span>Tipo de cadastro</span>
      <select className="rounded-md border bg-background px-3 py-2" value={selected} onChange={event => onSelect(event.target.value)} required>
        <option value="">Selecione</option>
        {profiles.map(item => <option key={item.key} value={item.key}>{item.name}</option>)}
      </select>
    </label>
    {profile && <>
      <p className="text-sm text-muted-foreground">{profile.description}</p>
      <RegistrationDataFields fields={profile.fields} values={values} onChange={onChange} />
    </>}
  </fieldset>;
}

export function RegistrationDataFields({ fields, values, onChange }: {
  fields: ExternalRegistrationField[];
  values: Record<string, unknown>;
  onChange: Dispatch<SetStateAction<Record<string, unknown>>>;
}) {
  return <>{fields.map(field => <label key={field.key} className="grid gap-1 text-sm">
        <span>{field.label}{field.required ? ' *' : ''}</span>
        {field.type === 'select' ? <select className="rounded-md border bg-background px-3 py-2"
          value={String(values[field.key] ?? '')} required={field.required}
          onChange={event => onChange(current => ({ ...current, [field.key]: event.target.value }))}>
          <option value="">Selecione</option>
          {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
        </select> : field.type === 'checkbox' ? <input type="checkbox" checked={values[field.key] === true} required={field.required}
          onChange={event => onChange(current => ({ ...current, [field.key]: event.target.checked }))} />
          : <input className="rounded-md border bg-background px-3 py-2" type={field.type} required={field.required}
            value={String(values[field.key] ?? '')} maxLength={field.type === 'email' ? 255 : 2000}
            onChange={event => onChange(current => ({ ...current, [field.key]: field.type === 'number' && event.target.value !== '' ? Number(event.target.value) : event.target.value }))} />}
      </label>)}</>;
}

export function selectedProfileData(profiles: ExternalProfileType[], selected: string, values: Record<string, unknown>) {
  return Object.fromEntries((profiles.find(profile => profile.key === selected)?.fields ?? [])
    .filter(field => values[field.key] !== undefined && values[field.key] !== '')
    .map(field => [field.key, values[field.key]]));
}
