import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { MemberProfileViewModel, ProfilePersona } from '../types';
import { getInitials } from '../utils';
import { ProfileLinkButton, ProfileSectionCard } from './profile-ui';

interface ProfileRecommendationsProps {
  profile: MemberProfileViewModel;
  persona: ProfilePersona;
}

export function ProfileRecommendations({ profile, persona }: ProfileRecommendationsProps) {
  const visibleRecommendations = profile.recommendations.slice(0, 3);
  const isOwner = persona === 'owner' || persona === 'admin';

  return (
    <ProfileSectionCard
      title="Recomendações"
      action={
        <ProfileLinkButton className="inline-flex items-center gap-1">
          Filtrar
        </ProfileLinkButton>
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ProfileLinkButton>Ver mais</ProfileLinkButton>
          {isOwner ? (
            <button
              type="button"
              className="rounded-xl bg-[#e1e8fd] px-4 py-2 text-sm font-medium text-black"
            >
              Solicitar recomendação
            </button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-4">
        {visibleRecommendations.map((recommendation) => (
          <article
            key={recommendation.id}
            className="rounded-2xl border border-black/5 bg-[#f8faff] p-4"
          >
            <div className="flex gap-3">
              <Avatar className="size-12 rounded-full bg-[#004ac6]">
                <AvatarFallback className="rounded-full bg-[#004ac6] text-sm font-semibold text-white">
                  {getInitials(recommendation.authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-black">{recommendation.authorName}</p>
                  <span className="text-sm text-black/50">- {recommendation.authorRole}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-black/80">{recommendation.text}</p>
                <p className="mt-2 text-xs text-black/50">{recommendation.dateLabel}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </ProfileSectionCard>
  );
}
