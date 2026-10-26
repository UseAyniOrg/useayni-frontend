import { useState } from 'react';
import { Award, Briefcase, Clock3, ExternalLink, Mail, Pencil, Share2, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { MemberProfileViewModel, ProfilePersona } from '@/types/profile';
import { getInitials } from '@/utils/profile';
import { ProfileActionPill, ProfileBadge, ProfileLinkButton } from './profile-ui';

interface ProfileHeaderProps {
  profile: MemberProfileViewModel;
  persona: ProfilePersona;
}

export function ProfileHeader({ profile, persona }: ProfileHeaderProps) {
  const [academicModalOpen, setAcademicModalOpen] = useState(false);
  const isOwner = persona === 'owner' || persona === 'admin';
  const primaryRole = profile.roles.find(role => role.isPrimary) ?? profile.roles[0];
  const primaryEnrollment = profile.enrollments[0];

  const handleShare = async () => {
    const url = `${window.location.origin}/membros/${profile.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: profile.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      // Usuário cancelou o share nativo ou clipboard indisponível
    }
  };

  return (
    <>
      <section className="overflow-hidden rounded-3xl bg-white shadow-[0_3px_3px_rgba(0,0,0,0.25)]">
        <div className="relative bg-[#004ac6] px-6 pb-20 pt-6 md:px-8">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ProfileActionPill
              label="compartilhar"
              icon={<Share2 className="size-3.5" />}
              onClick={handleShare}
            />
            {isOwner ? (
              <ProfileActionPill label="editar perfil" icon={<Pencil className="size-3.5" />} />
            ) : null}
          </div>
        </div>

        <div className="relative px-6 pb-6 md:px-8">
          <div className="-mt-14 flex flex-wrap items-end gap-4">
            <div className="relative">
              <Avatar className="size-24 rounded-full border-4 border-white bg-[#004ac6] shadow-md md:size-[109px]">
                <AvatarImage src={profile.profilePictureUrl} alt={profile.name} />
                <AvatarFallback className="rounded-full bg-[#004ac6] text-3xl font-bold text-white">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              {profile.status === 'active' ? (
                <span className="absolute bottom-1 right-1 size-4 rounded-full border-2 border-white bg-[#0e9254]" />
              ) : null}
            </div>

            <div className="min-w-0 flex-1 pb-1 pt-2">
              <h1 className="text-2xl font-bold text-black">{profile.name}</h1>
              {profile.nickname ? (
                <p className="text-sm font-light text-black/80">"{profile.nickname}"</p>
              ) : null}

              <div className="mt-2 flex flex-wrap gap-2">
                {profile.semesterHeadLabel ? (
                  <ProfileBadge
                    label={profile.semesterHeadLabel}
                    icon={<Award className="size-3.5" />}
                  />
                ) : null}
                {profile.isVeteran ? (
                  <ProfileBadge label="Veterano" icon={<Trophy className="size-3.5" />} />
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {primaryRole ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Briefcase className="mt-0.5 size-4 shrink-0 text-black" />
                    <div>
                      <p className="text-sm font-bold text-black">{primaryRole.name}</p>
                      {primaryRole.periodLabel ? (
                        <p className="text-sm font-light text-black/70">
                          {primaryRole.periodLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {profile.secondaryRoleLabel ? (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-[#e1e8fd] px-2 py-1 text-sm font-medium text-[#004e90]">
                      <Briefcase className="size-3.5" />
                      {profile.secondaryRoleLabel}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <div className="flex items-start gap-2">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-black" />
                <p className="text-sm font-bold text-black">{profile.tenureLabel}</p>
              </div>

              {profile.email && isOwner ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 shrink-0 text-black" />
                    <p className="text-sm font-bold text-black">E-mail de contato</p>
                  </div>
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 pl-6 text-sm font-medium text-[#18619d] hover:underline"
                  >
                    {profile.email}
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              ) : null}
            </div>

            {profile.biography ? (
              <div className="rounded-2xl bg-[#f8faff] p-4">
                <h3 className="mb-2 text-sm font-bold text-black">Sobre</h3>
                <p className="text-sm leading-relaxed text-black/70">{profile.biography}</p>
              </div>
            ) : null}

            {primaryEnrollment ? (
              <div className="rounded-2xl border border-[#2138a2]/15 bg-[#e1e8fd] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-black">Vínculo acadêmico</h3>
                  {profile.enrollments.length > 1 || isOwner ? (
                    <ProfileLinkButton onClick={() => setAcademicModalOpen(true)}>
                      Ver mais
                    </ProfileLinkButton>
                  ) : null}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#004e90]">
                    UTFPR
                  </div>
                  <div className="grid flex-1 gap-3 sm:grid-cols-[auto_1fr]">
                    <div className="text-sm font-semibold text-black/50">
                      <p>{primaryEnrollment.semesterLabel}</p>
                      <p>{primaryEnrollment.termLabel}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">
                        {primaryEnrollment.universityName}
                      </p>
                      <p className="text-sm text-black/50">{primaryEnrollment.courseName}</p>
                      {primaryEnrollment.cityLabel ? (
                        <p className="text-sm text-black/50">{primaryEnrollment.cityLabel}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <Dialog open={academicModalOpen} onOpenChange={setAcademicModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle>Vínculos acadêmicos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {profile.enrollments.map(enrollment => (
              <div
                key={enrollment.id}
                className="rounded-2xl border border-[#2138a2]/15 bg-[#e1e8fd] p-4"
              >
                <div className="flex gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#004e90]">
                    UTFPR
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black/50">
                      {enrollment.semesterLabel} · {enrollment.termLabel}
                    </p>
                    <p className="font-bold text-black">{enrollment.universityName}</p>
                    <p className="text-sm text-black/50">{enrollment.courseName}</p>
                    <p className="text-sm text-black/50">{enrollment.cityLabel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
