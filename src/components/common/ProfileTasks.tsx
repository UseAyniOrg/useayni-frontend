import { CheckCircle2, Hourglass } from 'lucide-react';
import type { MemberProfileViewModel, ProfilePersona } from '@/types/profile';
import { ProfileLinkButton, ProfileSectionCard } from './profile-ui';

interface ProfileTasksProps {
  profile: MemberProfileViewModel;
  persona: ProfilePersona;
}

export function ProfileTasks({ profile, persona }: ProfileTasksProps) {
  const isOwner = persona === 'owner' || persona === 'admin';

  return (
    <ProfileSectionCard
      title="Tarefas em projetos"
      footer={isOwner ? <ProfileLinkButton>Ver lista</ProfileLinkButton> : undefined}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center rounded-2xl bg-[#f8faff] px-4 py-6 text-center">
          <CheckCircle2 className="size-10 text-[#004e90]" />
          <p className="mt-3 text-3xl font-bold text-black">{profile.taskSummary.completed}</p>
          <p className="text-sm text-black/60">concluídas</p>
        </div>
        <div className="flex flex-col items-center rounded-2xl bg-[#f8faff] px-4 py-6 text-center">
          <Hourglass className="size-10 text-[#004e90]" />
          <p className="mt-3 text-3xl font-bold text-black">{profile.taskSummary.inProgress}</p>
          <p className="text-sm text-black/60">em andamento</p>
        </div>
      </div>
    </ProfileSectionCard>
  );
}
