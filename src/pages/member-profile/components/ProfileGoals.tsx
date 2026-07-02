import { Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { MemberProfileViewModel } from '../types';
import { ProfileLinkButton, ProfileSectionCard, SkillChip } from './profile-ui';

interface ProfileGoalsProps {
  profile: MemberProfileViewModel;
}

export function ProfileGoals({ profile }: ProfileGoalsProps) {
  const achievements = profile.goals.filter((goal) => goal.type === 'achievement');
  const inProgress = profile.goals.filter((goal) => goal.type === 'in_progress');

  return (
    <ProfileSectionCard
      title="Metas e conquistas"
      footer={<ProfileLinkButton>Ver mais</ProfileLinkButton>}
    >
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#797b7d]">
            Conquistas
          </p>
          <div className="flex flex-wrap gap-2">
            {achievements.map((goal) => (
              <SkillChip key={goal.id} label={goal.name} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#797b7d]">
            Em progresso
          </p>
          <div className="space-y-4">
            {inProgress.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-[#004e90]" />
                    <p className="text-sm font-medium text-black">{goal.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#004e90]">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-3.5 bg-[#e1e8fd]" />
                {goal.description ? (
                  <p className="text-sm text-black/60">{goal.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProfileSectionCard>
  );
}
