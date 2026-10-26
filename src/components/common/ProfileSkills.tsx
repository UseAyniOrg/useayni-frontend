import { useState } from 'react';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { MemberProfileViewModel, ProfilePersona } from '@/types/profile';
import { groupSkillsByCategory } from '@/utils/profile';
import { getAllSkills } from '@/utils/map-profile-view-model';
import {
  ProfileLinkButton,
  ProfileSectionCard,
  SkillChip,
} from './profile-ui';

interface ProfileSkillsProps {
  profile: MemberProfileViewModel;
  persona: ProfilePersona;
}

export function ProfileSkills({ profile, persona }: ProfileSkillsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isOwner = persona === 'owner' || persona === 'admin';
  const grouped = groupSkillsByCategory(profile.skills);
  const allSkills = getAllSkills();
  const allGrouped = groupSkillsByCategory(allSkills);

  return (
    <>
      <ProfileSectionCard
        title="Habilidades"
        action={
          isOwner ? (
            <button type="button" className="rounded-lg bg-[#bee2ff] p-2 text-[#004e90]">
              <Pencil className="size-4" />
            </button>
          ) : undefined
        }
        footer={
          profile.hiddenSkillsCount > 0 ? (
            <ProfileLinkButton onClick={() => setModalOpen(true)}>
              Ver todas (+{profile.hiddenSkillsCount})
            </ProfileLinkButton>
          ) : undefined
        }
      >
        <div className="space-y-5">
          {grouped.map(({ category, skills }) => (
            <div key={category}>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#797b7d]">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <SkillChip key={skill.id} label={skill.name} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ProfileSectionCard>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>Habilidades</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {allGrouped.map(({ category, skills }) => (
              <div key={category}>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#797b7d]">
                  {category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <SkillChip key={skill.id} label={skill.name} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <ProfileLinkButton onClick={() => setModalOpen(false)}>Fechar</ProfileLinkButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
