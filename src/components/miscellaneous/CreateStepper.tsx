import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TypeSelectorStep } from './steps/TypeSelectorStep';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { VisibilityScopeStep } from './steps/VisibilityScopeStep';
import { PeopleStep } from './steps/PeopleStep';
import { TypeBadge, StatusBadge } from './StatusBadge';
import { miscellaneousService } from '@/services/miscellaneousService';
import { miscellaneousRoute } from '@/services/miscellaneousService';
import type { MiscType, MiscParticipation, ScopeRule, Miscellaneous, ExternalRegistrationField } from '@/services/miscellaneousService';
import type { MemberSearchResult } from '@/services/memberService';
import { MediaUploader } from '@/components/media/MediaUploader';
import { EventRegistrationFieldsEditor } from './EventRegistrationFieldsEditor';
import { fromDateTimeLocal } from '@/utils/dateTime';

const STEPS = ['Tipo', 'Informações', 'Acesso', 'Pessoas', 'Revisão'];

function estimateStatus(scopeRules: ScopeRule[], roles: string[]): 'active' | 'pending_approval' {
  const wideScope = scopeRules.some((r) => ['cae', 'car', 'city', 'general', 'org_unit'].includes(r.type));
  if (!wideScope) return 'active';
  if (roles.some((r) => ['EQUIPE_TECNICA', 'organization.admin', 'organization.manage', 'CAE', 'CAR'].includes(r))) return 'active';
  return 'pending_approval';
}

interface Props {
  userRoles?: string[];
  initialType?: MiscType;
}

export function CreateStepper({ userRoles = ['MEMBRO'], initialType }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(initialType ? 1 : 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<MiscType | undefined>(initialType);
  const [fields, setFields] = useState<Record<string, string | number | undefined>>({});
  const [participation, setParticipation] = useState<MiscParticipation>('public');
  const [scopeRules, setScopeRules] = useState<ScopeRule[]>([]);
  const [parent, setParent] = useState<Miscellaneous | undefined>();
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>();
  const [coOwners, setCoOwners] = useState<MemberSearchResult[]>([]);
  const [initialMembers, setInitialMembers] = useState<MemberSearchResult[]>([]);
  const [registrationFields, setRegistrationFields] = useState<ExternalRegistrationField[]>([]);
  const [coverAssetId, setCoverAssetId] = useState<string>();
  const [bannerAssetId, setBannerAssetId] = useState<string>();
  const [mapAssetId, setMapAssetId] = useState<string>();
  const [sponsorAssets, setSponsorAssets] = useState<Array<{ key: number; assetId?: string }>>([]);

  const setField = (name: string, value: string | number | undefined) =>
    setFields((prev) => ({ ...prev, [name]: value }));

  const estimated = estimateStatus(scopeRules, userRoles);
  const canManageScope = userRoles.some((role) =>
    ['EQUIPE_TECNICA', 'organization.admin', 'organization.manage'].includes(role),
  );

  // Date validation against parent
  const validateDates = (): string | null => {
    if (!parent) return null;
    const start = fields.start_date ? new Date(fields.start_date as string) : null;
    const end = fields.end_date ? new Date(fields.end_date as string) : null;
    if (parent.start_date && start && start < new Date(parent.start_date)) {
      return `Data de início não pode ser anterior ao pai (${new Date(parent.start_date).toLocaleDateString('pt-BR')})`;
    }
    if (parent.end_date && end && end > new Date(parent.end_date)) {
      return `Data de término não pode ser posterior ao pai (${new Date(parent.end_date).toLocaleDateString('pt-BR')})`;
    }
    return null;
  };

  const canNext = () => {
    if (step === 0) return !!type;
    if (step === 1) return !!fields.title && !!fields.description && !!fields.start_date && !validateDates();
    return true;
  };

  const handleSubmit = async () => {
    const dateError = validateDates();
    if (dateError) { setError(dateError); return; }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...fields,
        start_date: fromDateTimeLocal(fields.start_date as string) ?? fields.start_date,
        end_date: fromDateTimeLocal(fields.end_date as string),
        type,
        participation_type: participation,
        scope_rules: scopeRules.length ? scopeRules : undefined,
        max_participants: maxParticipants,
        parent_id: parent?.id,
        co_owner_ids: coOwners.map((m) => m.id),
        initial_member_ids: initialMembers.map((m) => m.id),
        external_registration_schema: type === 'event' ? registrationFields : undefined,
        cover_asset_id: coverAssetId,
        banner_asset_id: bannerAssetId,
        map_asset_id: mapAssetId,
        sponsor_asset_ids: sponsorAssets.flatMap(({ assetId }) => assetId ? [assetId] : []),
      };
      const result = await miscellaneousService.create(payload);
      const id = result.miscellaneous.id;
      // Forms go to the builder, others go to detail
      navigate(type === 'form' ? miscellaneousRoute(`/${id}/formulario`) : miscellaneousRoute(`/${id}`));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Erro ao criar miscelânea');
    } finally {
      setLoading(false);
    }
  };

  const dateError = step === 1 ? validateDates() : null;

  return (
    <div className="flex min-h-full w-full flex-col gap-6 px-4 py-5 lg:px-8">
      {/* Progress */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background py-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium
              ${i < step ? 'bg-primary text-primary-foreground' : i === step ? 'border-2 border-primary text-primary' : 'border border-muted-foreground/30 text-muted-foreground'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`hidden text-xs sm:block ${i === step ? 'font-medium' : 'text-muted-foreground'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-w-0 flex-1 py-2">
        {step === 0 && <TypeSelectorStep value={type} onChange={(t) => { setType(t); setStep(1); }} />}
        {step === 1 && type && (
          <>
            <BasicInfoStep type={type} values={fields} onChange={setField} />
            <section className="mt-6 space-y-3 border-t pt-4">
              <div>
                <h3 className="font-semibold">Imagens e arquivos</h3>
                <p className="text-sm text-muted-foreground">
                  As imagens são comprimidas no navegador antes do envio seguro ao armazenamento da organização.
                </p>
              </div>
              <MediaUploader
                category={type === 'event' ? 'event-cover' : type === 'form' ? 'form-cover' : 'miscellaneous-cover'}
                label={type === 'form' ? 'Capa do formulário' : 'Capa da publicação'}
                hint={type === 'event' ? 'Evento: Figma 1600 x 1000 px (16:10); pode haver recorte no cabeçalho.' : undefined}
                assetId={coverAssetId}
                onChange={setCoverAssetId}
              />
              {type === 'event' && (
                <>
                  <MediaUploader
                    category="event-banner"
                    label="Banner do evento (opcional)"
                    hint="Figma: 1600 x 700 px (aprox. 2,29:1); mantenha o assunto no centro."
                    assetId={bannerAssetId}
                    onChange={setBannerAssetId}
                  />
                  <MediaUploader
                    category="event-map"
                    label="Mapa do local (opcional)"
                    hint="Preserve a proporção original; lado maior de até 1600 px."
                    assetId={mapAssetId}
                    onChange={setMapAssetId}
                  />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Artes dos patrocinadores</h4>
                    {sponsorAssets.map((sponsor, index) => (
                      <MediaUploader
                        key={sponsor.key}
                        category="sponsor-art"
                        label={`Arte de patrocinador ${index + 1}`}
                        hint="Figma: 600 x 250 px (aprox. 2,4:1); prefira fundo transparente."
                        assetId={sponsor.assetId}
                        onChange={(assetId) => setSponsorAssets((current) =>
                          current.map((item) => item.key === sponsor.key ? { ...item, assetId } : item),
                        )}
                      />
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSponsorAssets((current) => [...current, { key: Date.now() + current.length }])}
                    >
                      Adicionar arte de patrocinador
                    </Button>
                  </div>
                </>
              )}
            </section>
            {type === 'event' && (
              <EventRegistrationFieldsEditor fields={registrationFields} onChange={setRegistrationFields} />
            )}
            {dateError && <p className="mt-2 text-sm text-destructive">{dateError}</p>}
          </>
        )}
        {step === 2 && type && (
          <VisibilityScopeStep
            type={type}
            participation={participation}
            scopeRules={scopeRules}
            parent={parent}
            maxParticipants={maxParticipants}
            onParticipationChange={setParticipation}
            onScopeRulesChange={setScopeRules}
            onParentChange={setParent}
            onMaxParticipantsChange={setMaxParticipants}
            estimatedStatus={estimated}
            canManageScope={canManageScope}
          />
        )}
        {step === 3 && type && (
          <PeopleStep
            type={type}
            participation={participation}
            coOwners={coOwners}
            initialMembers={initialMembers}
            onAddCoOwner={(m) => setCoOwners((p) => [...p, m])}
            onRemoveCoOwner={(id) => setCoOwners((p) => p.filter((x) => x.id !== id))}
            onAddMember={(m) => setInitialMembers((p) => [...p, m])}
            onRemoveMember={(id) => setInitialMembers((p) => p.filter((x) => x.id !== id))}
          />
        )}
        {step === 4 && type && (
          <div className="space-y-4">
            <h3 className="font-semibold">Revisão</h3>
            <div className="flex flex-wrap gap-2">
              <TypeBadge type={type} />
              <StatusBadge status={estimated} />
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${participation === 'public' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                {participation === 'public' ? '🔓 Aberta' : '🔒 Fechada'}
              </span>
            </div>
            <div className="rounded-md bg-muted p-4 text-sm space-y-1">
              <p><span className="font-medium">Título:</span> {fields.title as string}</p>
              <p><span className="font-medium">Início:</span> {fields.start_date as string}</p>
              {fields.end_date && <p><span className="font-medium">Término:</span> {fields.end_date as string}</p>}
              {parent && <p><span className="font-medium">Pai:</span> {parent.title}</p>}
              {scopeRules.length > 0 && <p><span className="font-medium">Regras de escopo:</span> {scopeRules.length} regra(s)</p>}
              {maxParticipants && <p><span className="font-medium">Limite de participantes:</span> {maxParticipants}</p>}
              {coOwners.length > 0 && <p><span className="font-medium">Co-responsáveis:</span> {coOwners.map((m) => m.name).join(', ')}</p>}
              {initialMembers.length > 0 && <p><span className="font-medium">Membros iniciais:</span> {initialMembers.map((m) => m.name).join(', ')}</p>}
              {type === 'form' && (
                <p className="text-muted-foreground mt-2">Após criar, você será redirecionado para o builder de perguntas.</p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Voltar
        </Button>
        {step < 4 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
            Próximo
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Criando…' : type === 'form' ? 'Criar e ir para o builder →' : 'Criar miscelânea'}
          </Button>
        )}
      </div>
    </div>
  );
}
