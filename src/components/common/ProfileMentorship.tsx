import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { MemberProfileViewModel } from '@/types/profile';
import { getInitials } from '@/utils/profile';
import { ProfileLinkButton, ProfileSectionCard } from './profile-ui';

interface ProfileMentorshipProps {
  profile: MemberProfileViewModel;
}

export function ProfileMentorship({ profile }: ProfileMentorshipProps) {
  const { sponsor, menteesCount } = profile.mentorship;

  return (
    <ProfileSectionCard title="Mentoria" footer={<ProfileLinkButton>Ver lista</ProfileLinkButton>}>
      <div className="space-y-5">
        {sponsor ? (
          <div>
            <p className="mb-2 text-sm font-semibold text-black/60">Padrinho</p>
            <div className="flex items-center gap-3">
              <Avatar className="size-11 rounded-full bg-[#004ac6]">
                <AvatarImage src={undefined} alt={sponsor.name} />
                <AvatarFallback className="rounded-full bg-[#004ac6] text-sm font-semibold text-white">
                  {getInitials(sponsor.name)}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium text-black">{sponsor.name}</p>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl bg-[#f8faff] p-4">
          <p className="text-3xl font-bold text-black">{menteesCount}</p>
          <p className="text-sm text-black/60">apadrinhados</p>
        </div>
      </div>
    </ProfileSectionCard>
  );
}
