export type ProfilePersona = 'owner' | 'visitor' | 'admin';

export type MemberStatus = 'active' | 'inactive' | 'suspended';

export type SkillCategory = 'GESTÃO' | 'SOFT SKILLS' | 'TÉCNICA';

export interface ProfileRole {
  id: string;
  name: string;
  description?: string;
  periodLabel?: string;
  isPrimary?: boolean;
}

export interface AcademicEnrollment {
  id: string;
  universityName: string;
  courseName: string;
  semesterLabel: string;
  termLabel: string;
  cityLabel: string;
}

export interface ProfileSkill {
  id: string;
  name: string;
  category: SkillCategory;
}

export interface ProfileGoal {
  id: string;
  name: string;
  description?: string;
  progress: number;
  type: 'achievement' | 'in_progress';
}

export interface ProfileMetric {
  id: string;
  label: string;
  value: number;
  icon: 'projects' | 'tasks' | 'events' | 'meetings' | 'goals';
}

export interface ProfileProject {
  id: string;
  name: string;
  status: 'active' | 'closed';
  statusLabel: string;
  periodLabel: string;
  roleLabel: string;
}

export interface ProfileTaskSummary {
  completed: number;
  inProgress: number;
}

export interface ProfileEvent {
  id: string;
  name: string;
  typeLabel: string;
  dateLabel: string;
}

export interface ProfileRecommendation {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  dateLabel: string;
}

export interface ProfileMentorship {
  sponsor?: {
    id: string;
    name: string;
  };
  menteesCount: number;
  mentees: Array<{ id: string; name: string }>;
}

export interface MemberProfileViewModel {
  id: string;
  slug: string;
  name: string;
  nickname?: string;
  email?: string;
  status: MemberStatus;
  profilePictureUrl?: string;
  biography?: string;
  roles: ProfileRole[];
  secondaryRoleLabel?: string;
  enrollments: AcademicEnrollment[];
  semesterHeadLabel?: string;
  isVeteran: boolean;
  tenureLabel: string;
  skills: ProfileSkill[];
  hiddenSkillsCount: number;
  goals: ProfileGoal[];
  metrics: ProfileMetric[];
  projects: ProfileProject[];
  taskSummary: ProfileTaskSummary;
  meetingAttendanceRate: number;
  events: ProfileEvent[];
  mentorship: ProfileMentorship;
  recommendations: ProfileRecommendation[];
}
