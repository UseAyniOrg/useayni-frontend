import {
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  Target,
  Users,
} from 'lucide-react';
import type { MemberProfileViewModel, ProfileMetric } from '../types';
import { ProfileSectionCard } from './profile-ui';

interface ProfileMetricsProps {
  profile: MemberProfileViewModel;
}

function MetricIcon({ icon }: { icon: ProfileMetric['icon'] }) {
  const className = 'size-8 text-[#004e90]';
  switch (icon) {
    case 'projects':
      return <FolderKanban className={className} />;
    case 'tasks':
      return <CheckCircle2 className={className} />;
    case 'events':
      return <CalendarDays className={className} />;
    case 'meetings':
      return <Users className={className} />;
    case 'goals':
      return <Target className={className} />;
    default:
      return null;
  }
}

export function ProfileMetrics({ profile }: ProfileMetricsProps) {
  return (
    <ProfileSectionCard title="Trajetória">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {profile.metrics.map((metric) => (
          <div
            key={metric.id}
            className="flex flex-col items-center rounded-2xl bg-[#f8faff] px-3 py-4 text-center"
          >
            <MetricIcon icon={metric.icon} />
            <p className="mt-2 text-2xl font-bold text-black">{metric.value}</p>
            <p className="text-xs font-medium text-black/60">{metric.label}</p>
          </div>
        ))}
      </div>
    </ProfileSectionCard>
  );
}
