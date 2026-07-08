import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { api } from '@/lib/api';

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
}

const SOCIAL_LINKS = [
  { key: 'linkedin_url', label: 'LinkedIn' },
  { key: 'github_url', label: 'GitHub' },
  { key: 'instagram_url', label: 'Instagram' },
  { key: 'twitter_url', label: 'Twitter' },
  { key: 'youtube_url', label: 'YouTube' },
] as const;

export default function MemberProfile() {
  const { memberSlugName } = useParams<{ memberSlugName: string }>();
  const { data: rolesAndPermissions, isLoading: loadingRoles } = useRolesAndPermissions();
  const { profile, isLoading: loadingProfile, error, refetch } = useMemberProfile(memberSlugName);
  const { user } = useAuthContext();
  const { member: currentMember } = useCurrentMember();

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const isOwner = !!profile && !!currentMember && currentMember.slug === memberSlugName;

  const openEdit = () => {
    if (!profile) return;
    setForm({
      name: profile.name ?? '',
      phone: profile.phone ?? '',
      biography: profile.biography ?? '',
      profile_picture_url: profile.profile_picture_url ?? '',
      banner_url: profile.banner_url ?? '',
      linkedin_url: profile.linkedin_url ?? '',
      github_url: profile.github_url ?? '',
      instagram_url: profile.instagram_url ?? '',
      twitter_url: profile.twitter_url ?? '',
      youtube_url: profile.youtube_url ?? '',
      curriculum_url: profile.curriculum_url ?? '',
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await api.put(`/members/id/${user.id}`, form);
      setEditOpen(false);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const socialLinks = SOCIAL_LINKS.filter(s => profile?.[s.key]);

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={loadingRoles} />
      <SidebarInset>
        <AppHeader title="Perfil" />
        <main className="flex-1 overflow-auto">
          {loadingProfile && (
            <div className="p-8 text-sm text-muted-foreground">Carregando perfil…</div>
          )}
          {error && (
            <div className="p-8 text-sm text-destructive">Erro ao carregar perfil: {error.message}</div>
          )}
          {!loadingProfile && !error && !profile && (
            <div className="p-8 text-sm text-muted-foreground">Membro não encontrado.</div>
          )}

          {profile && (
            <>
              {/* Banner */}
              <div className="relative h-36 bg-muted">
                {profile.banner_url && (
                  <img src={profile.banner_url} alt="banner" className="w-full h-full object-cover" />
                )}
                {isOwner && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-3 right-3"
                    onClick={openEdit}
                  >
                    Editar perfil
                  </Button>
                )}
              </div>

              {/* Avatar + nome */}
              <div className="px-6 pb-6">
                <div className="flex items-end gap-4 -mt-10 mb-4">
                  <Avatar className="h-20 w-20 border-4 border-background">
                    <AvatarImage src={profile.profile_picture_url} alt={profile.name} />
                    <AvatarFallback className="text-lg font-semibold">{getInitials(profile.name)}</AvatarFallback>
                  </Avatar>
                  {!profile.banner_url && isOwner && (
                    <Button size="sm" variant="outline" className="ml-auto mb-1" onClick={openEdit}>
                      Editar perfil
                    </Button>
                  )}
                </div>

                <h1 className="text-xl font-bold">{profile.name}</h1>
                {profile.roles && profile.roles.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {profile.roles.map(r => (
                      <span key={r.id} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {r.name}
                      </span>
                    ))}
                  </div>
                )}
                {profile.biography && (
                  <p className="mt-3 text-sm text-muted-foreground">{profile.biography}</p>
                )}

                {/* Info grid */}
                <div className="mt-6 grid sm:grid-cols-2 gap-3">
                  {profile.course && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Curso</p>
                      <p className="text-sm font-medium">{profile.course.name}</p>
                    </div>
                  )}
                  {profile.university && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Universidade</p>
                      <p className="text-sm font-medium">{profile.university.name}</p>
                    </div>
                  )}
                  {profile.city && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Cidade</p>
                      <p className="text-sm font-medium">{profile.city.name}</p>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Telefone</p>
                      <p className="text-sm font-medium">{profile.phone}</p>
                    </div>
                  )}
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">RA</p>
                    <p className="text-sm font-medium">{profile.ra}</p>
                  </div>
                </div>

                {/* Padrinho */}
                {profile.sponsor && (
                  <div className="mt-4 rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Padrinho / Madrinha</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{getInitials(profile.sponsor.name)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{profile.sponsor.name}</p>
                    </div>
                  </div>
                )}

                {/* Redes sociais */}
                {socialLinks.length > 0 && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {socialLinks.map(s => (
                      <a
                        key={s.key}
                        href={profile[s.key]!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border px-3 py-1 text-xs hover:bg-muted transition-colors"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </SidebarInset>

      {/* Dialog de edição */}
      <Dialog open={editOpen} onOpenChange={v => !v && setEditOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { key: 'name', label: 'Nome' },
              { key: 'phone', label: 'Telefone' },
              { key: 'profile_picture_url', label: 'URL da foto de perfil' },
              { key: 'banner_url', label: 'URL do banner' },
              { key: 'curriculum_url', label: 'URL do currículo' },
              { key: 'linkedin_url', label: 'LinkedIn' },
              { key: 'github_url', label: 'GitHub' },
              { key: 'instagram_url', label: 'Instagram' },
              { key: 'twitter_url', label: 'Twitter' },
              { key: 'youtube_url', label: 'YouTube' },
            ].map(f => (
              <div key={f.key} className="space-y-1">
                <Label>{f.label}</Label>
                <Input value={form[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} />
              </div>
            ))}
            <div className="space-y-1">
              <Label>Biografia</Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
                value={form.biography ?? ''}
                onChange={e => set('biography', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
