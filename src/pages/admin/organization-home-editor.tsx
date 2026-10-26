import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, GripVertical, Save, Send } from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { PlatformSidebar } from '@/components/layout/PlatformSidebar';
import { MediaUploader } from '@/components/media/MediaUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import {
  orgHomeService,
  type OrgHomeEditorData,
  type OrgHomeSection,
} from '@/services/orgHomeService';
import { organizationService, type Organization } from '@/services/organizationService';
import { editorFormSchema, type EditorFormValues } from '@/schemas/orgHomeSchema';
import { apiErrorMessage } from '@/utils/apiError';
import '../org-home-fonts.css';

const EMPTY_FORM: EditorFormValues = {
  theme: {
    primary_color: '#0e79b2',
    secondary_color: '#0d1b2a',
    background_color: '#020617',
    logo_background_color: '#0d1b2a',
    logo_asset_id: '',
    favicon_asset_id: '',
    font_family: 'Inter',
  },
  seo: { title: '', description: '', og_image_asset_id: '' },
  social_links: { instagram: '', linkedin: '', facebook: '', youtube: '', tiktok: '' },
  contact: { address: '', phone: '', whatsapp: '', email: '', map_url: '' },
};

function objectValue(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function listValue(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.map(objectValue) : [];
}

function toHsl(hex: string): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;
  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  return `${hue} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => {
    const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string): number {
  const values = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function editorValues(data: OrgHomeEditorData): EditorFormValues {
  const { config } = data;
  const fontFamily = config.theme.font_family;
  return {
    theme: {
      ...EMPTY_FORM.theme,
      ...config.theme,
      background_color: config.theme.background_color ?? EMPTY_FORM.theme.background_color,
      logo_background_color: config.theme.logo_background_color ?? EMPTY_FORM.theme.logo_background_color,
      logo_asset_id: config.theme.logo_asset_id ?? '',
      favicon_asset_id: config.theme.favicon_asset_id ?? '',
      font_family: fontFamily === 'Lato' || fontFamily === 'Poppins' ? fontFamily : 'Inter',
    },
    seo: {
      ...EMPTY_FORM.seo,
      ...config.seo,
      og_image_asset_id: config.seo.og_image_asset_id ?? '',
    },
    social_links: { ...EMPTY_FORM.social_links, ...config.social_links },
    contact: { ...EMPTY_FORM.contact, ...config.contact },
  };
}

function compact(values: Record<string, string>) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value.trim() !== ''));
}

export default function OrganizationHomeEditorPage() {
  const { user, isTechTeam } = useAuthContext();
  const { tenant } = useTenant();
  const isPlatformAdmin = isTechTeam && !user?.support_session_id;
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [editor, setEditor] = useState<OrgHomeEditorData | null>(null);
  const [activeSection, setActiveSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EditorFormValues>({
    resolver: zodResolver(editorFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const isOrganizationAdmin = user?.roles.some((role) =>
    ['organization.admin', 'organization.manage'].includes(role),
  ) ?? false;
  const canEdit = isPlatformAdmin || isOrganizationAdmin || Boolean(user?.support_session_id);

  useEffect(() => {
    if (!isPlatformAdmin) return;
    let active = true;
    organizationService.listAll()
      .then((items) => {
        if (!active) return;
        setOrganizations(items);
        setSelectedOrganizationId((current) => current || items[0]?.id || '');
      })
      .catch((cause: unknown) => {
        if (active) setError(apiErrorMessage(cause, 'Não foi possível carregar organizações.'));
      });
    return () => {
      active = false;
    };
  }, [isPlatformAdmin]);

  useEffect(() => {
    if (!canEdit || (isPlatformAdmin && !selectedOrganizationId)) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError('');
    orgHomeService.getEditor(isPlatformAdmin ? selectedOrganizationId : undefined)
      .then((data) => {
        if (!active) return;
        setEditor(data);
        setActiveSection((current) =>
          data.sections.some((section) => section.type === current)
            ? current
            : data.sections[0]?.type ?? '',
        );
        reset(editorValues(data));
      })
      .catch((cause: unknown) => {
        if (active) {
          setEditor(null);
          setError(apiErrorMessage(cause, 'Não foi possível carregar a home.'));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [canEdit, isPlatformAdmin, selectedOrganizationId, reset]);

  const sections = editor?.sections ?? [];
  const primaryColor = watch('theme.primary_color');
  const secondaryColor = watch('theme.secondary_color');
  const fontFamily = watch('theme.font_family');
  const logoAssetId = watch('theme.logo_asset_id');
  const backgroundColor = watch('theme.background_color');
  const logoBackgroundColor = watch('theme.logo_background_color');
  const ratio = useMemo(
    () => contrastRatio(primaryColor || '#0e79b2', '#ffffff'),
    [primaryColor],
  );
  const previewStyle = {
    '--primary': toHsl(primaryColor || '#0e79b2'),
    '--secondary': toHsl(secondaryColor || '#0d1b2a'),
    fontFamily: `"${fontFamily}", sans-serif`,
  } as CSSProperties;

  const saveDraft = async (values: EditorFormValues) => {
    if (!editor || saving || pendingUploads > 0) return false;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await orgHomeService.saveDraft({
        config: {
          theme: {
            primary_color: values.theme.primary_color,
            secondary_color: values.theme.secondary_color,
            background_color: values.theme.background_color,
            logo_background_color: values.theme.logo_background_color,
            logo_asset_id: values.theme.logo_asset_id || null,
            favicon_asset_id: values.theme.favicon_asset_id || null,
            font_family: values.theme.font_family,
          },
          seo: {
            title: values.seo.title,
            description: values.seo.description,
            og_image_asset_id: values.seo.og_image_asset_id || null,
          },
          social_links: compact(values.social_links),
          contact: compact(values.contact),
        },
        sections,
      }, isPlatformAdmin ? selectedOrganizationId : undefined);
      setEditor((current) => current ? {
        ...current,
        config: { ...current.config, ...response.config, status: 'DRAFT' },
        sections: response.sections,
      } : current);
      setSuccess('Rascunho salvo. Publique para atualizar a página pública.');
      return true;
    } catch (cause: unknown) {
      setError(apiErrorMessage(cause, 'Não foi possível salvar o rascunho.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const publish = async (values: EditorFormValues) => {
    const saved = await saveDraft(values);
    if (!saved) return;
    setSaving(true);
    setError('');
    try {
      const config = await orgHomeService.publish(isPlatformAdmin ? selectedOrganizationId : undefined);
      setEditor((current) => current ? { ...current, config } : current);
      setSuccess('Home publicada com sucesso.');
    } catch (cause: unknown) {
      setError(apiErrorMessage(cause, 'Não foi possível publicar a home.'));
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (type: string, update: (section: OrgHomeSection) => OrgHomeSection) => {
    setEditor((current) => current ? {
      ...current,
      sections: current.sections.map((section) => section.type === type ? update(section) : section),
    } : current);
  };

  const onUploadStateChange = (uploading: boolean) => setPendingUploads(count => Math.max(0, count + (uploading ? 1 : -1)));
  const invalidForm = () => { setSuccess(''); setError('Confira os campos destacados antes de salvar ou publicar.'); };

  const reorderSections = (event: DragEndEvent) => {
    if (!event.over || event.active.id === event.over.id || !editor) return;
    const oldIndex = editor.sections.findIndex((section) => section.type === event.active.id);
    const newIndex = editor.sections.findIndex((section) => section.type === event.over?.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setEditor((current) => current ? {
      ...current,
      sections: arrayMove(current.sections, oldIndex, newIndex)
        .map((section, order_index) => ({ ...section, order_index })),
    } : current);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const selectedOrganization = organizations.find((organization) => organization.id === selectedOrganizationId);
  const currentOrganizationName = isPlatformAdmin ? selectedOrganization?.name : tenant?.name;
  const currentSlug = isPlatformAdmin ? selectedOrganization?.slug : tenant?.slug;
  const previewUrl = currentSlug
    ? ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) || window.location.hostname.endsWith('.localhost')
      ? `${window.location.origin}/o/${currentSlug}`
      : `https://${currentSlug}.useayni.com`
    : undefined;

  if (!canEdit) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Acesso restrito</h1>
        <p className="mt-2 text-muted-foreground">Somente administradores da organização podem editar a home pública.</p>
      </main>
    );
  }

  return (
    <SidebarProvider>
      {isPlatformAdmin ? <PlatformSidebar /> : <AppSidebar />}
      <SidebarInset>
        <AppHeader title="Editor da home pública" />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{currentOrganizationName ?? 'Organização'}</p>
                <h1 className="mt-1 text-3xl font-semibold">Home pública</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Organize as seções, personalize a identidade e publique a página que qualquer pessoa verá.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {previewUrl && (
                  <Button type="button" variant="outline" onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}>
                    <Eye className="mr-2 h-4 w-4" /> Abrir home
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setPreviewOpen((open) => !open)}>
                  <Eye className="mr-2 h-4 w-4" /> {previewOpen ? 'Fechar prévia' : 'Pré-visualizar rascunho'}
                </Button>
              </div>
            </header>

            {isPlatformAdmin && (
              <Card>
                <CardContent className="pt-5">
                  <Label htmlFor="home-organization">Organização selecionada</Label>
                  <select
                    id="home-organization"
                    className="mt-2 w-full rounded-md border bg-background px-3 py-2 sm:max-w-xl"
                    value={selectedOrganizationId}
                    disabled={saving || pendingUploads > 0}
                    onChange={(event) => setSelectedOrganizationId(event.target.value)}
                  >
                    <option value="">Selecione uma organização</option>
                    {organizations.map((organization) => (
                      <option key={organization.id} value={organization.id}>
                        {organization.name} ({organization.slug})
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            )}

            {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            {success && <p role="status" className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">{success}</p>}
            {loading ? (
              <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <div className="h-96 animate-pulse rounded-xl bg-muted" />
                <div className="h-96 animate-pulse rounded-xl bg-muted" />
              </div>
            ) : editor ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
                  <p className="text-sm">
                    Estado:{' '}
                    <strong>{editor.config.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho não publicado'}</strong>
                    {editor.config.published_at && (
                      <span className="text-muted-foreground"> · última publicação {new Date(editor.config.published_at).toLocaleString('pt-BR')}</span>
                    )}
                  </p>
                  <p className={ratio >= 4.5 ? 'text-sm text-green-700 dark:text-green-300' : 'text-sm text-amber-700 dark:text-amber-300'}>
                    Contraste do botão: {ratio.toFixed(2)}:1 {ratio >= 4.5 ? '· WCAG AA' : '· abaixo do WCAG AA'}
                  </p>
                </div>

                {previewOpen && (
                  <Card style={previewStyle}>
                    <CardContent className="pt-6">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Prévia do rascunho</p>
                      <div
                        className="mt-4 rounded-2xl p-8 text-white"
                        style={{ background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))` }}
                      >
                        {logoAssetId && <img src={`/m/${logoAssetId}`} alt={`Logo de ${currentOrganizationName ?? 'organização'}`} className="mb-4 max-h-20 max-w-48 object-contain" />}
                        <p className="text-sm">{currentOrganizationName}</p>
                        <h2 className="mt-3 text-3xl font-bold">
                          {stringValue(objectValue(sections.find((section) => section.type === 'HERO')?.config).slides &&
                            listValue(objectValue(sections.find((section) => section.type === 'HERO')?.config).slides)[0]?.title) ||
                            'Uma comunidade que transforma participação em impacto.'}
                        </h2>
                        <p className="mt-4 max-w-2xl text-white/85">
                          {sections.filter((section) => section.enabled).map((section) => section.title).filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <form onSubmit={handleSubmit(saveDraft, invalidForm)} className="space-y-6">
                  <fieldset disabled={saving} className="grid min-w-0 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
                    <Card className="h-fit">
                      <CardHeader>
                        <CardTitle className="text-lg">Seções da página</CardTitle>
                        <p className="text-sm text-muted-foreground">Arraste para reordenar e altere a visibilidade.</p>
                      </CardHeader>
                      <CardContent>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorderSections}>
                          <SortableContext items={sections.map((section) => section.type)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                              {sections.map((section) => (
                                <SortableSectionRow
                                  key={section.type}
                                  section={section}
                                  active={activeSection === section.type}
                                  onSelect={() => setActiveSection(section.type)}
                                  onToggle={() => updateSection(section.type, (current) => ({ ...current, enabled: !current.enabled }))}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader><CardTitle className="text-lg">Identidade visual e SEO</CardTitle></CardHeader>
                        <CardContent className="grid gap-5 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="home-primary">Cor primária</Label>
                            <div className="flex gap-2">
                              <Input id="home-primary" type="color" className="h-10 w-16 p-1" value={primaryColor} onChange={event => setValue('theme.primary_color', event.target.value, { shouldDirty: true, shouldValidate: true })} />
                              <Input aria-label="Código da cor primária" value={primaryColor} onChange={event => setValue('theme.primary_color', event.target.value, { shouldDirty: true, shouldValidate: true })} />
                            </div>
                            {errors.theme?.primary_color && <p className="text-xs text-destructive">{errors.theme.primary_color.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="home-secondary">Cor secundária</Label>
                            <div className="flex gap-2">
                              <Input id="home-secondary" type="color" className="h-10 w-16 p-1" value={secondaryColor} onChange={event => setValue('theme.secondary_color', event.target.value, { shouldDirty: true, shouldValidate: true })} />
                              <Input aria-label="Código da cor secundária" value={secondaryColor} onChange={event => setValue('theme.secondary_color', event.target.value, { shouldDirty: true, shouldValidate: true })} />
                            </div>
                            {errors.theme?.secondary_color && <p className="text-xs text-destructive">{errors.theme.secondary_color.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="home-background">Cor de fundo</Label>
                            <div className="flex gap-2">
                              <Input id="home-background" type="color" className="h-10 w-16 p-1" value={backgroundColor} onChange={event => setValue('theme.background_color', event.target.value, { shouldDirty: true, shouldValidate: true })} />
                              <Input aria-label="Código da cor de fundo" value={backgroundColor} onChange={event => setValue('theme.background_color', event.target.value, { shouldDirty: true, shouldValidate: true })} />
                            </div>
                            {errors.theme?.background_color && <p className="text-xs text-destructive">{errors.theme.background_color.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="home-logo-background">Fundo da logo nos formulários</Label>
                            <div className="flex gap-2">
                              <Input id="home-logo-background" type="color" className="h-10 w-16 p-1" value={logoBackgroundColor} onChange={event => setValue('theme.logo_background_color', event.target.value, { shouldDirty: true, shouldValidate: true })} />
                              <Input aria-label="Código do fundo da logo" value={logoBackgroundColor} onChange={event => setValue('theme.logo_background_color', event.target.value, { shouldDirty: true, shouldValidate: true })} />
                            </div>
                            {errors.theme?.logo_background_color && <p className="text-xs text-destructive">{errors.theme.logo_background_color.message}</p>}
                            <div className="flex h-16 items-center justify-center rounded-md border p-2" style={{ backgroundColor: logoBackgroundColor }}>
                              {logoAssetId ? <img src={`/m/${logoAssetId}`} alt="Prévia da logo" className="max-h-12 max-w-48 object-contain" /> : <span className="text-xs font-semibold text-white">Prévia do fundo da logo</span>}
                            </div>
                            <p className="text-xs text-muted-foreground">Esta cor aparece atrás da logo nas telas de login e cadastro desta organização.</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="home-font">Fonte</Label>
                            <select id="home-font" className="h-10 w-full rounded-md border bg-background px-3" {...register('theme.font_family')}>
                              <option value="Inter">Inter</option>
                              <option value="Lato">Lato</option>
                              <option value="Poppins">Poppins</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Título para mecanismos de busca</Label>
                            <Input {...register('seo.title')} maxLength={200} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Descrição SEO</Label>
                            <Textarea {...register('seo.description')} maxLength={1000} rows={3} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <MediaUploader
                              category="org-home-logo"
                              label="Logotipo (público, até 512px)"
                              hint="Figma: 512 x 512 px, quadrado; use margem interna e transparência."
                              visibility="PUBLIC"
                              preserveExisting
                              deferRemoval
                              adminOrganizationId={isPlatformAdmin ? selectedOrganizationId : undefined}
                              onUploadStateChange={onUploadStateChange}
                              assetId={watch('theme.logo_asset_id') || undefined}
                              onChange={(assetId) => setValue('theme.logo_asset_id', assetId ?? '', { shouldDirty: true })}
                            />
                          </div>
                          <div className="space-y-2">
                            <MediaUploader category="org-home-logo" label="Ícone da página (favicon)" hint="Figma: 512 x 512 px, quadrado; use um símbolo simples." visibility="PUBLIC" preserveExisting deferRemoval
                              adminOrganizationId={isPlatformAdmin ? selectedOrganizationId : undefined} onUploadStateChange={onUploadStateChange}
                              assetId={watch('theme.favicon_asset_id') || undefined}
                              onChange={assetId => setValue('theme.favicon_asset_id', assetId ?? '', { shouldDirty: true })} />
                          </div>
                          <div className="space-y-2">
                            <MediaUploader category="org-home-card" label="Imagem de compartilhamento (SEO)" hint="Figma: 1200 x 630 px (1,91:1)." visibility="PUBLIC" preserveExisting deferRemoval
                              adminOrganizationId={isPlatformAdmin ? selectedOrganizationId : undefined} onUploadStateChange={onUploadStateChange}
                              assetId={watch('seo.og_image_asset_id') || undefined}
                              onChange={assetId => setValue('seo.og_image_asset_id', assetId ?? '', { shouldDirty: true })} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle className="text-lg">Conteúdo da seção</CardTitle></CardHeader>
                        <CardContent>
                          {sections.find((section) => section.type === activeSection) ? (
                            <SectionEditor
                              section={sections.find((section) => section.type === activeSection)!}
                              onChange={(next) => updateSection(activeSection, () => next)}
                              adminOrganizationId={isPlatformAdmin ? selectedOrganizationId : undefined}
                              onUploadStateChange={onUploadStateChange}
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground">Selecione uma seção para editar.</p>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle className="text-lg">Contato e redes sociais</CardTitle></CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                          <Field label="Email de contato" error={errors.contact?.email?.message}>
                            <Input type="email" {...register('contact.email')} />
                          </Field>
                          <Field label="Telefone">
                            <Input {...register('contact.phone')} />
                          </Field>
                          <Field label="WhatsApp">
                            <Input {...register('contact.whatsapp')} />
                          </Field>
                          <Field label="Endereço">
                            <Input {...register('contact.address')} />
                          </Field>
                          <Field label="Link do mapa" error={errors.contact?.map_url?.message}>
                            <Input {...register('contact.map_url')} placeholder="https://" />
                          </Field>
                          <Field label="Instagram" error={errors.social_links?.instagram?.message}>
                            <Input {...register('social_links.instagram')} placeholder="https://" />
                          </Field>
                          <Field label="LinkedIn" error={errors.social_links?.linkedin?.message}>
                            <Input {...register('social_links.linkedin')} placeholder="https://" />
                          </Field>
                          <Field label="Facebook" error={errors.social_links?.facebook?.message}>
                            <Input {...register('social_links.facebook')} placeholder="https://" />
                          </Field>
                          <Field label="YouTube" error={errors.social_links?.youtube?.message}>
                            <Input {...register('social_links.youtube')} placeholder="https://" />
                          </Field>
                          <Field label="TikTok" error={errors.social_links?.tiktok?.message}>
                            <Input {...register('social_links.tiktok')} placeholder="https://" />
                          </Field>
                        </CardContent>
                      </Card>
                    </div>
                  </fieldset>

                  <Separator />
                  {pendingUploads > 0 && <p role="status" className="text-sm text-muted-foreground">Aguardando o envio de {pendingUploads} imagem(ns)...</p>}
                  <div className="flex flex-wrap justify-end gap-3">
                    <Button type="submit" variant="outline" disabled={saving || pendingUploads > 0}>
                      <Save className="mr-2 h-4 w-4" /> {saving ? 'Salvando...' : 'Salvar rascunho'}
                    </Button>
                    <Button type="button" disabled={saving || pendingUploads > 0} onClick={handleSubmit(publish, invalidForm)}>
                      <Send className="mr-2 h-4 w-4" /> {saving ? 'Publicando...' : 'Salvar e publicar'}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <Card><CardContent className="pt-6">Selecione uma organização para editar a home pública.</CardContent></Card>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SortableSectionRow({
  section,
  active,
  onSelect,
  onToggle,
}: {
  section: OrgHomeSection;
  active: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.type });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-md border p-2 ${active ? 'border-primary bg-primary/5' : 'bg-background'}`}
    >
      <button
        type="button"
        className="cursor-grab rounded p-1 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Arrastar seção ${section.title || section.type}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button type="button" className="min-w-0 flex-1 text-left" onClick={onSelect}>
        <span className="block truncate text-sm font-medium">{section.title || section.type}</span>
        <span className="block text-xs text-muted-foreground">{section.type}</span>
      </button>
      <label className="flex items-center gap-1 text-xs">
        <input type="checkbox" checked={section.enabled} onChange={onToggle} />
        Visível
      </label>
    </div>
  );
}

function SectionEditor({
  section,
  onChange,
  adminOrganizationId,
  onUploadStateChange,
}: {
  section: OrgHomeSection;
  onChange: (next: OrgHomeSection) => void;
  adminOrganizationId?: string;
  onUploadStateChange: (uploading: boolean) => void;
}) {
  const config = objectValue(section.config);
  const setConfig = (next: Record<string, unknown>) => onChange({ ...section, config: next });
  const items = listValue(config.items);
  const slides = listValue(config.slides);

  const updateItem = (index: number, key: string, value: string) => {
    const nextItems = items.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const next = { ...item };
      if (key.endsWith('_asset_id') && !value) delete next[key];
      else next[key] = value;
      return next;
    });
    setConfig({ ...config, items: nextItems });
  };

  const updateSlide = (index: number, key: string, value: string | undefined) => {
    const nextSlides = slides.map((slide, slideIndex) =>
      slideIndex === index ? { ...slide, [key]: value } : slide,
    );
    setConfig({ ...config, slides: nextSlides });
  };

  return (
    <div className="space-y-5">
      <Field label="Título">
        <Input value={section.title} maxLength={255} onChange={(event) => onChange({ ...section, title: event.target.value })} />
      </Field>
      <Field label="Subtítulo">
        <Textarea value={section.subtitle} maxLength={500} rows={2} onChange={(event) => onChange({ ...section, subtitle: event.target.value })} />
      </Field>
      {section.type === 'HERO' && (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <Card key={index}>
              <CardContent className="space-y-4 pt-5">
                <p className="text-sm font-semibold">Banner {index + 1}</p>
                <Field label="Título do banner">
                  <Input value={stringValue(slide.title)} onChange={(event) => updateSlide(index, 'title', event.target.value)} />
                </Field>
                <Field label="Descrição">
                  <Textarea value={stringValue(slide.description)} onChange={(event) => updateSlide(index, 'description', event.target.value)} />
                </Field>
                <Field label="Texto alternativo da imagem">
                  <Input value={stringValue(slide.image_alt)} onChange={(event) => updateSlide(index, 'image_alt', event.target.value)} />
                </Field>
                <MediaUploader
                  category="org-home-banner"
                  label="Imagem pública do banner (até 1920px)"
                  hint="Figma: 1600 x 1200 px (4:3). Não inclua texto essencial na imagem."
                  visibility="PUBLIC"
                  preserveExisting
                  deferRemoval
                  adminOrganizationId={adminOrganizationId}
                  onUploadStateChange={onUploadStateChange}
                  assetId={stringValue(slide.image_asset_id) || undefined}
                  onChange={(assetId) => updateSlide(index, 'image_asset_id', assetId)}
                />
                <Field label="Texto do botão">
                  <Input value={stringValue(slide.button_text)} onChange={(event) => updateSlide(index, 'button_text', event.target.value)} />
                </Field>
                <Field label="Link do botão">
                  <Input value={stringValue(slide.button_url)} onChange={(event) => updateSlide(index, 'button_url', event.target.value)} />
                </Field>
                {slides.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setConfig({ ...config, slides: slides.filter((_, slideIndex) => slideIndex !== index) })}>
                    Remover banner
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            disabled={slides.length >= 10}
            onClick={() => setConfig({
              ...config,
              slides: [...slides, { title: '', description: '', button_text: 'Saiba mais', button_url: '/cadastro' }],
            })}
          >
            Adicionar banner
          </Button>
        </div>
      )}
      {(section.type === 'CAMINHOS' || section.type === 'VANTAGENS' || section.type === 'PARCEIROS') && (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={index}>
              <CardContent className="space-y-3 pt-5">
                <Field label={section.type === 'PARCEIROS' ? 'Nome do parceiro' : 'Título'}>
                  <Input value={stringValue(item.title ?? item.name)} onChange={(event) => updateItem(index, section.type === 'PARCEIROS' ? 'name' : 'title', event.target.value)} />
                </Field>
                {section.type !== 'PARCEIROS' && (
                  <Field label="Descrição">
                    <Textarea value={stringValue(item.description)} onChange={(event) => updateItem(index, 'description', event.target.value)} />
                  </Field>
                )}
                {section.type === 'CAMINHOS' && (
                  <Field label="Destino">
                    <Input value={stringValue(item.url)} onChange={(event) => updateItem(index, 'url', event.target.value)} />
                  </Field>
                )}
                {section.type === 'PARCEIROS' && (
                  <>
                    <Field label="Texto alternativo do logotipo">
                      <Input value={stringValue(item.image_alt)} onChange={(event) => updateItem(index, 'image_alt', event.target.value)} />
                    </Field>
                    <MediaUploader
                      category="org-home-card"
                      label="Logotipo público do parceiro (até 1200px)"
                      hint="Figma: 600 x 300 px (2:1); prefira fundo transparente."
                      visibility="PUBLIC"
                      preserveExisting
                      deferRemoval
                      adminOrganizationId={adminOrganizationId}
                      onUploadStateChange={onUploadStateChange}
                      assetId={stringValue(item.logo_asset_id) || undefined}
                      onChange={(assetId) => updateItem(index, 'logo_asset_id', assetId ?? '')}
                    />
                    <Field label="Site do parceiro (opcional)">
                      <Input value={stringValue(item.url)} onChange={(event) => updateItem(index, 'url', event.target.value)} />
                    </Field>
                  </>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => setConfig({ ...config, items: items.filter((_, itemIndex) => itemIndex !== index) })}>
                  Remover item
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            disabled={items.length >= (section.type === 'PARCEIROS' ? 40 : 12)}
            onClick={() => setConfig({
              ...config,
              items: [...items, section.type === 'PARCEIROS'
                ? { name: '', image_alt: '' }
                : { title: '', description: '', ...(section.type === 'CAMINHOS' ? { url: '/cadastro' } : {}) }],
            })}
          >
            Adicionar item
          </Button>
        </div>
      )}
      {section.type === 'NUMEROS' && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={config.include_member_count === true}
              onChange={(event) => setConfig({ ...config, include_member_count: event.target.checked })}
            />
            Exibir quantidade de membros aprovados
          </label>
          {items.map((item, index) => (
            <div className="grid gap-2 sm:grid-cols-2" key={index}>
              <Input aria-label="Rótulo do número" value={stringValue(item.label)} onChange={(event) => updateItem(index, 'label', event.target.value)} placeholder="Ex.: Projetos realizados" />
              <Input aria-label="Valor do número" value={stringValue(item.value)} onChange={(event) => updateItem(index, 'value', event.target.value)} placeholder="Ex.: 25" />
            </div>
          ))}
          <Button type="button" variant="outline" disabled={items.length >= 8} onClick={() => setConfig({ ...config, items: [...items, { label: '', value: '' }] })}>
            Adicionar número
          </Button>
        </div>
      )}
      {(section.type === 'AGENDA' || section.type === 'NOTICIAS') && (
        <Field label="Quantidade de itens">
          <Input
            type="number"
            min={1}
            max={12}
            value={Number(config.limit ?? 4)}
            onChange={(event) => setConfig({ ...config, limit: Number(event.target.value) })}
          />
        </Field>
      )}
      {section.type === 'TALENTOS' && (
        <>
          <Field label="Texto da chamada">
            <Textarea value={stringValue(config.description)} onChange={(event) => setConfig({ ...config, description: event.target.value })} />
          </Field>
          <Field label="Texto do botão">
            <Input value={stringValue(config.button_text)} onChange={(event) => setConfig({ ...config, button_text: event.target.value })} />
          </Field>
          <p className="text-xs text-muted-foreground">
            A seção e o botão só aparecem quando a funcionalidade Rede de talentos estiver habilitada para a organização.
          </p>
        </>
      )}
      {section.type === 'CONTATO' && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={objectValue(config).show_map !== false}
            onChange={(event) => setConfig({ ...config, show_map: event.target.checked })}
          />
          Mostrar link do mapa quando houver endereço
        </label>
      )}
      {!['HERO', 'CAMINHOS', 'VANTAGENS', 'PARCEIROS', 'NUMEROS', 'AGENDA', 'NOTICIAS', 'TALENTOS', 'CONTATO'].includes(section.type) && (
        <p className="text-sm text-muted-foreground">
          Esta seção faz parte de uma fase futura. Ela pode ser organizada e habilitada quando estiver pronta.
        </p>
      )}
    </div>
  );
}
