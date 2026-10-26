import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/auth/authService';
import type { RegistrationFieldDefinition } from '@/lib/auth/authTypes';
import { validateEmail } from '@/utils/email';
import { validatePassword } from '@/utils/password';
import { Link, useSearchParams } from 'react-router-dom';
import { safeReturnTo } from '@/lib/auth/accessContext';
import { RegistrationProfileFields, selectedProfileData } from './RegistrationProfileFields';
import type { RegistrationProfileProps } from './signup';
import { formatCPF, validateCPF } from '@/utils/cpf';

export default function GenericSignUp({
  fields,
  profiles, profileKey, setProfileKey, profileData, setProfileData,
}: {
  fields: RegistrationFieldDefinition[];
} & RegistrationProfileProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [cpf, setCpf] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, string | number | boolean>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [params] = useSearchParams();
  const returnTo = safeReturnTo(params.get('returnTo'));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Informe um email válido.');
      return;
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }
    if (password !== confirmation) { setError('As senhas não coincidem.'); return; }
    if (cpf && !validateCPF(cpf)) { setError('Informe um CPF válido.'); return; }
    for (const field of fields) {
      const value = field.field_key === 'cpf' ? cpf : customFields[field.field_key];
      if (field.required && (value === undefined || value === '' || value === false)) {
        setError(`O campo "${field.label}" é obrigatório.`);
        return;
      }
      if (field.field_type === 'file' && field.required) {
        setError(`O campo de arquivo "${field.label}" ainda não pode ser enviado por este formulário.`);
        return;
      }
    }

    setIsLoading(true);
    try {
      await authService.signUp({
        name: name.trim(),
        email_personal: email.trim(),
        phone: phone.trim() || undefined,
        password,
        confirm_password: confirmation,
        cpf: cpf.replace(/\D/g, '') || undefined,
        custom_fields: customFields,
        organization_profile_key: profileKey,
        profile_data: selectedProfileData(profiles, profileKey, profileData),
        accepted_profile_sharing: true,
      });
      setIsComplete(true);
    } catch (cause: unknown) {
      const responseMessage =
        typeof cause === 'object' && cause !== null && 'response' in cause
          ? (cause as { response?: { data?: { message?: unknown } } }).response?.data?.message
          : undefined;
      setError(typeof responseMessage === 'string' ? responseMessage : 'Não foi possível enviar seu cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Cadastro enviado</CardTitle>
          <CardDescription>Seu vínculo será analisado pela organização.</CardDescription>
          {returnTo && <p className="text-sm text-muted-foreground">Após a aprovação, entre com sua conta para concluir a inscrição no evento.</p>}
          <Link to={returnTo ?? '/login'} className="text-sm text-primary underline">{returnTo ? 'Voltar ao evento' : 'Ir para o login'}</Link>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Os dados adicionais são definidos por esta organização.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          {error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="signup-name">Nome completo</Label>
            <Input id="signup-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email da conta</Label>
            <Input id="signup-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-cpf">CPF{fields.some(field => field.field_key === 'cpf' && field.required) ? ' *' : ' (opcional)'}</Label>
            <Input id="signup-cpf" inputMode="numeric" autoComplete="off" maxLength={14} required={fields.some(field => field.field_key === 'cpf' && field.required)} value={cpf} onChange={event => setCpf(formatCPF(event.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-phone">Telefone (opcional)</Label>
            <Input id="signup-phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
          <RegistrationProfileFields profiles={profiles} selected={profileKey} onSelect={setProfileKey} values={profileData} onChange={setProfileData} />
          {fields.filter(field => field.field_key !== 'cpf').map((field) => (
            <div className="space-y-2" key={field.field_key}>
              <Label htmlFor={`custom-${field.field_key}`}>
                {field.label}{field.required ? ' *' : ''}
              </Label>
              {field.field_type === 'select' ? (
                <select
                  id={`custom-${field.field_key}`}
                  className="w-full rounded-md border bg-background px-3 py-2"
                  value={String(customFields[field.field_key] ?? '')}
                  onChange={(event) => setCustomFields((current) => ({ ...current, [field.field_key]: event.target.value }))}
                  required={field.required}
                >
                  <option value="">Selecione</option>
                  {(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : field.field_type === 'checkbox' ? (
                <input
                  id={`custom-${field.field_key}`}
                  type="checkbox"
                  checked={customFields[field.field_key] === true}
                  onChange={(event) => setCustomFields((current) => ({ ...current, [field.field_key]: event.target.checked }))}
                  required={field.required}
                />
              ) : field.field_type === 'file' ? (
                <p className="text-sm text-muted-foreground">
                  O envio de arquivos para o campo “{field.label}” ainda não está habilitado.
                </p>
              ) : (
                <Input
                  id={`custom-${field.field_key}`}
                  type={field.field_type === 'number' || field.field_type === 'date' ? field.field_type : 'text'}
                  value={String(customFields[field.field_key] ?? '')}
                  onChange={(event) => setCustomFields((current) => ({
                    ...current,
                    [field.field_key]: field.field_type === 'number' && event.target.value !== ''
                      ? Number(event.target.value)
                      : event.target.value,
                  }))}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="signup-password">Senha</Label>
            <Input id="signup-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <p className="text-xs text-muted-foreground">Use letras maiúsculas e minúsculas, número e caractere especial.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-confirm-password">Confirme a senha</Label>
            <Input id="signup-confirm-password" type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required />
          </div>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" required />Autorizo o compartilhamento destes dados com a organização para meu cadastro e seu armazenamento na minha conta para reaproveitamento mediante confirmação.</label>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar cadastro'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
