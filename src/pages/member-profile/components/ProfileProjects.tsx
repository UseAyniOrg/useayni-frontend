import { cn } from '@/lib/utils';
import type { MemberProfileViewModel } from '../types';
import { ProfileLinkButton, ProfileSectionCard } from './profile-ui';

interface ProfileProjectsProps {
  profile: MemberProfileViewModel;
}

export function ProfileProjects({ profile }: ProfileProjectsProps) {
  const visibleProjects = profile.projects.slice(0, 3);

  return (
    <ProfileSectionCard
      title="Projetos"
      footer={<ProfileLinkButton>Ver todos os projetos</ProfileLinkButton>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {visibleProjects.map((project) => (
          <article
            key={project.id}
            className="rounded-2xl border border-black/5 bg-[#f8faff] p-4 transition-colors hover:bg-[#eef3ff]"
          >
            <h3 className="line-clamp-2 min-h-[3rem] text-sm font-semibold text-black">
              {project.name}
            </h3>
            <p className="mt-2 text-xs text-black/50">{project.periodLabel}</p>
            <div className="mt-4 flex items-center justify-between gap-2">
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs font-medium',
                  project.status === 'active'
                    ? 'bg-[#0e9254]/15 text-[#0e9254]'
                    : 'bg-black/10 text-black/60'
                )}
              >
                {project.statusLabel}
              </span>
              <span className="text-xs font-medium text-black/70">{project.roleLabel}</span>
            </div>
          </article>
        ))}
      </div>
    </ProfileSectionCard>
  );
}
