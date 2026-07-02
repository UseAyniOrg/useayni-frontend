import { Progress } from '@/components/ui/progress';
import type { MemberProfileViewModel, ProfilePersona } from '../types';
import { ProfileLinkButton, ProfileSectionCard } from './profile-ui';

interface ProfileEngagementProps {
  profile: MemberProfileViewModel;
  persona: ProfilePersona;
}

export function ProfileEngagement({ profile, persona }: ProfileEngagementProps) {
  const isOwner = persona === 'owner' || persona === 'admin';

  return (
    <ProfileSectionCard title="Presença e Engajamento">
      <div className="space-y-6">
        <div className="rounded-2xl bg-[#f8faff] p-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#797b7d]">
            Reuniões
          </p>
          <p className="mt-2 text-3xl font-bold text-black">{profile.meetingAttendanceRate}%</p>
          <p className="text-sm text-black/60">de presença</p>
          <Progress
            value={profile.meetingAttendanceRate}
            className="mt-3 h-2.5 bg-[#e1e8fd]"
          />
          {isOwner ? (
            <div className="mt-3">
              <ProfileLinkButton>Ver lista</ProfileLinkButton>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl bg-[#f8faff] p-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#797b7d]">
            Eventos
          </p>
          <p className="mt-2 text-3xl font-bold text-black">{profile.events.length}</p>
          <p className="text-sm text-black/60">participações</p>
          <ul className="mt-4 space-y-3">
            {profile.events.map((event) => (
              <li
                key={event.id}
                className="flex items-start justify-between gap-3 border-b border-black/5 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-black">{event.name}</p>
                  <p className="text-xs text-black/50">{event.typeLabel}</p>
                </div>
                <span className="shrink-0 text-xs text-black/50">{event.dateLabel}</span>
              </li>
            ))}
          </ul>
          {isOwner ? (
            <div className="mt-3">
              <ProfileLinkButton>Ver lista</ProfileLinkButton>
            </div>
          ) : null}
        </div>
      </div>
    </ProfileSectionCard>
  );
}
