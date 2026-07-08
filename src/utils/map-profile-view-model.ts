import type { MemberProfileData, MemberProfileEnrichment } from '@/hooks/useMemberProfile';
import { formatTenure, isVeteranMember } from './profile';
import { P1_DEFAULTS } from '../pages/member-profile/data/p1-profile-supplements';
import type { MemberProfileViewModel, MemberStatus } from '../types/profile';

interface MapProfileOptions {
  slug: string;
  enrichment?: MemberProfileEnrichment | null;
  viewerEmail?: string;
  viewerId?: string;
}

const USE_PROFILE_MOCKS = import.meta.env.VITE_USE_PROFILE_MOCKS === 'true';

function mapMemberStatus(status?: string): MemberStatus {
  const normalized = status?.toLowerCase();
  if (normalized === 'inactive' || normalized === 'inativo') return 'inactive';
  if (normalized === 'suspended' || normalized === 'suspenso') return 'suspended';
  return 'active';
}

function formatSemesterLabel(currentSemester?: number | null): string | undefined {
  if (!currentSemester || currentSemester <= 0) return undefined;
  return `${currentSemester}º período`;
}

function resolveEmail(
  profile: MemberProfileData,
  enrichment?: MemberProfileEnrichment | null,
  viewerEmail?: string,
  viewerId?: string
): string | undefined {
  const isOwner = viewerId && profile.id === viewerId;

  if (isOwner) {
    return (
      enrichment?.email_personal ||
      enrichment?.email_university ||
      profile.email_personal ||
      profile.email_university ||
      viewerEmail
    );
  }

  return undefined;
}

export function mapProfileToViewModel(
  profile: MemberProfileData,
  { slug, enrichment, viewerEmail, viewerId }: MapProfileOptions
): MemberProfileViewModel {
  const secondaryRole = profile.roles?.[1];
  const currentSemester = enrichment?.current_semester ?? profile.current_semester;
  const semesterLabel = formatSemesterLabel(currentSemester);
  const resolvedSlug = enrichment?.slug || profile.slug || slug;
  const resolvedStatus = mapMemberStatus(enrichment?.status ?? profile.status);

  const enrollment =
    profile.university && profile.course
      ? {
          id: 'primary',
          universityName: profile.university.name,
          courseName: profile.course.name,
          semesterLabel: semesterLabel ?? '—',
          termLabel: '—',
          cityLabel: profile.city?.name ?? '',
        }
      : null;

  const mock = USE_PROFILE_MOCKS ? P1_DEFAULTS : null;

  return {
    id: profile.id,
    slug: resolvedSlug,
    name: profile.name,
    nickname: undefined,
    email: resolveEmail(profile, enrichment, viewerEmail, viewerId),
    status: resolvedStatus,
    profilePictureUrl: profile.profile_picture_url,
    biography: profile.biography,
    roles: (profile.roles ?? []).map((role, index) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      periodLabel: index === 0 ? undefined : undefined,
      isPrimary: index === 0,
    })),
    secondaryRoleLabel: secondaryRole?.name,
    enrollments: enrollment ? [enrollment] : [],
    semesterHeadLabel: undefined,
    isVeteran: isVeteranMember(profile.admission_date),
    tenureLabel: formatTenure(profile.admission_date),
    skills: mock?.skills ?? [],
    hiddenSkillsCount: mock?.hiddenSkillsCount ?? 0,
    goals: mock?.goals ?? [],
    metrics: mock?.metrics ?? [],
    projects: mock?.projects ?? [],
    taskSummary: mock?.taskSummary ?? { completed: 0, inProgress: 0 },
    meetingAttendanceRate: mock?.meetingAttendanceRate ?? 0,
    events: mock?.events ?? [],
    mentorship: {
      sponsor: profile.sponsor,
      menteesCount: 0,
      mentees: [],
    },
    recommendations: mock?.recommendations ?? [],
  };
}

export function getAllSkills() {
  return USE_PROFILE_MOCKS ? P1_DEFAULTS.skills : [];
}
