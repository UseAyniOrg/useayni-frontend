import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { miscellaneousRoute, miscellaneousService } from '@/services/miscellaneousService';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BasicInfoStep } from '@/components/miscellaneous/steps/BasicInfoStep';
import { Label } from '@/components/ui/label';
import type { Miscellaneous, ExternalRegistrationField } from '@/services/miscellaneousService';
import { EventRegistrationFieldsEditor } from '@/components/miscellaneous/EventRegistrationFieldsEditor';
import { MediaUploader } from '@/components/media/MediaUploader';
import { Plus } from 'lucide-react';
import { fromDateTimeLocal, toDateTimeLocal } from '@/utils/dateTime';

export default function MiscellaneousEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rolesAndPermissions, isLoading: rolesLoading } = useRolesAndPermissions();

  const [misc, setMisc] = useState<Miscellaneous | null>(null);
  const [registrationFields, setRegistrationFields] = useState<ExternalRegistrationField[]>([]);
  const [fields, setFields] = useState<Record<string, string | number | undefined>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverAssetId, setCoverAssetId] = useState<string>();
  const [bannerAssetId, setBannerAssetId] = useState<string>();
  const [mapAssetId, setMapAssetId] = useState<string>();
  const [sponsorAssets, setSponsorAssets] = useState<Array<{ key: number; assetId?: string }>>([]);

  useEffect(() => {
    if (!id) return;
    miscellaneousService.getById(id).then((m) => {
      setMisc(m);
      setRegistrationFields(m.external_registration_schema ?? []);
      setCoverAssetId(m.cover_asset_id);
      setBannerAssetId(m.banner_asset_id);
      setMapAssetId(m.map_asset_id);
      setSponsorAssets((m.sponsor_asset_ids ?? []).map((assetId, index) => ({
        key: Date.now() + index,
        assetId,
      })));
      setFields({
        title: m.title,
        description: m.description,
        start_date: toDateTimeLocal(m.start_date),
        end_date: toDateTimeLocal(m.end_date),
        stream_link: m.stream_link,
        capacity_presential: m.capacity_presential,
        capacity_online: m.capacity_online,
        meeting_link: m.meeting_link,
        agenda: m.agenda,
        goal_target: m.goal_target,
        goal_unit: m.goal_unit,
        goal_progress: m.goal_progress,
        activity_status: m.activity_status,
        activity_priority: m.activity_priority,
        location_zip: (m as any).location_zip,
        location_street: (m as any).location_street,
        location_number: (m as any).location_number,
        location_neighborhood: (m as any).location_neighborhood,
        location_city: (m as any).location_city,
        location_state: (m as any).location_state,
      });
    }).catch(() => setError('Não foi possível carregar a miscelânea para edição.')).finally(() => setLoading(false));
  }, [id]);

  const setField = (name: string, value: string | number | undefined) =>
    setFields((prev) => ({ ...prev, [name]: value }));

  const save = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await miscellaneousService.update(id, {
        ...fields,
        start_date: fromDateTimeLocal(fields.start_date as string) ?? fields.start_date,
        end_date: fromDateTimeLocal(fields.end_date as string),
        ...(misc?.type === 'event' ? { external_registration_schema: registrationFields } : {}),
        cover_asset_id: coverAssetId ?? null,
        banner_asset_id: bannerAssetId ?? null,
        map_asset_id: mapAssetId ?? null,
        sponsor_asset_ids: sponsorAssets.flatMap(({ assetId }) => assetId ? [assetId] : []),
      });
      navigate(miscellaneousRoute(`/${id}`));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Carregando miscelânea...</p>;
  if (!misc) return <p role="alert" className="p-6 text-destructive">{error}</p>;

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={rolesLoading} />
      <SidebarInset>
        <AppHeader title={`Editar: ${misc.title}`} />
        <main className="flex-1 overflow-auto p-6 max-w-2xl mx-auto space-y-6">
          {/* Type locked */}
          <div className="flex items-center gap-2 rounded-lg border border-dashed p-3">
            <Label className="text-muted-foreground text-sm">Tipo (imutável):</Label>
            <span className="text-sm font-medium capitalize">{misc.type}</span>
          </div>

          <BasicInfoStep type={misc.type} values={fields} onChange={setField} />
          {misc.type === 'event' && <EventRegistrationFieldsEditor fields={registrationFields} onChange={setRegistrationFields} />}
          <section className="space-y-3 rounded-lg border p-4">
            <h2 className="font-semibold">Imagens e arquivos</h2>
            <MediaUploader
              category={misc.type === 'event' ? 'event-cover' : misc.type === 'form' ? 'form-cover' : 'miscellaneous-cover'}
              label={misc.type === 'form' ? 'Capa do formulário' : 'Capa da publicação'}
              hint={misc.type === 'event' ? 'Evento: Figma 1600 x 1000 px (16:10); pode haver recorte no cabeçalho.' : undefined}
              assetId={coverAssetId}
              onChange={setCoverAssetId}
            />
            {misc.type === 'event' && (
              <>
                <MediaUploader
                  category="event-banner"
                  label="Banner do evento"
                  hint="Figma: 1600 x 700 px (aprox. 2,29:1); mantenha o assunto no centro."
                  assetId={bannerAssetId}
                  onChange={setBannerAssetId}
                />
                <MediaUploader
                  category="event-map"
                  label="Mapa do local"
                  hint="Preserve a proporção original; lado maior de até 1600 px."
                  assetId={mapAssetId}
                  onChange={setMapAssetId}
                />
                <h3 className="text-sm font-medium">Artes dos patrocinadores</h3>
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
                  <Plus className="mr-1 h-4 w-4" /> Adicionar arte de patrocinador
                </Button>
              </>
            )}
          </section>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => navigate(miscellaneousRoute(`/${id}`))}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</Button>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
