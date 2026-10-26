import { useMemo, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useAuthContext } from '@/contexts/AuthContext';
import { ProfileHeader } from '@/components/common/ProfileHeader';
import { ProfileSkills } from '@/components/common/ProfileSkills';
import { ProfileGoals } from '@/components/common/ProfileGoals';
import { ProfileMetrics } from '@/components/common/ProfileMetrics';
import { ProfileProjects } from '@/components/common/ProfileProjects';
import { ProfileEngagement } from '@/components/common/ProfileEngagement';
import { ProfileTasks } from '@/components/common/ProfileTasks';
import { ProfileMentorship } from '@/components/common/ProfileMentorship';
import { ProfileRecommendations } from '@/components/common/ProfileRecommendations';
import { useProfilePersona } from '../../hooks/useProfilePersona';
import { mapProfileToViewModel } from '../../utils/map-profile-view-model';

function ProfilePageLayout({ children }: { children: ReactNode }) {
  const { data: rolesAndPermissions, isLoading } = useRolesAndPermissions();

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={isLoading} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

export default function MemberProfile() {
  const { memberSlugName } = useParams<{ memberSlugName: string }>();
  const { user } = useAuthContext();
  const {
    profile,
    enrichment,
    isLoading: loadingProfile,
    error,
  } = useMemberProfile(memberSlugName, user?.id);
  const persona = useProfilePersona(profile?.id);

  const viewModel = useMemo(() => {
    if (!profile || !memberSlugName) return null;
    return mapProfileToViewModel(profile, {
      slug: memberSlugName,
      enrichment,
      viewerEmail: user?.email,
      viewerId: user?.id,
    });
  }, [profile, memberSlugName, enrichment, user?.email, user?.id]);

  if (error) {
    return (
      <ProfilePageLayout>
        <AppHeader title="Perfil do Membro" />
        <main className="flex-1 overflow-auto p-4">
          <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error.message}
          </div>
        </main>
      </ProfilePageLayout>
    );
  }

  if (loadingProfile) {
    return (
      <ProfilePageLayout>
        <AppHeader title="Perfil do Membro" />
        <main className="flex-1 overflow-auto p-4">
          <div className="text-muted-foreground">Carregando perfil...</div>
        </main>
      </ProfilePageLayout>
    );
  }

  if (!viewModel) {
    return (
      <ProfilePageLayout>
        <AppHeader title="Perfil do Membro" />
        <main className="flex-1 overflow-auto p-4">
          <div>Membro não encontrado</div>
        </main>
      </ProfilePageLayout>
    );
  }

  const hasSkills = viewModel.skills.length > 0;
  const hasGoals = viewModel.goals.length > 0;
  const hasMetrics = viewModel.metrics.some(metric => metric.value > 0);
  const hasProjects = viewModel.projects.length > 0;
  const hasEngagement = viewModel.meetingAttendanceRate > 0 || viewModel.events.length > 0;
  const hasTasks = viewModel.taskSummary.completed > 0 || viewModel.taskSummary.inProgress > 0;
  const hasMentorship = Boolean(viewModel.mentorship.sponsor);
  const hasRecommendations = viewModel.recommendations.length > 0;

  return (
    <ProfilePageLayout>
      <AppHeader title={`Perfil - ${viewModel.name}`} />
      <main className="flex-1 overflow-auto bg-[#fafafa] p-4 md:p-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <ProfileHeader profile={viewModel} persona={persona} />

          {(hasSkills || hasGoals) && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {hasSkills ? (
                <div className="lg:col-span-5">
                  <ProfileSkills profile={viewModel} persona={persona} />
                </div>
              ) : null}
              {hasGoals ? (
                <div className={hasSkills ? 'lg:col-span-7' : 'lg:col-span-12'}>
                  <ProfileGoals profile={viewModel} />
                </div>
              ) : null}
            </div>
          )}

          {hasMetrics ? <ProfileMetrics profile={viewModel} /> : null}
          {hasProjects ? <ProfileProjects profile={viewModel} /> : null}

          {(hasEngagement || hasTasks) && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {hasEngagement ? <ProfileEngagement profile={viewModel} persona={persona} /> : null}
              {hasTasks ? <ProfileTasks profile={viewModel} persona={persona} /> : null}
            </div>
          )}

          {(hasMentorship || hasRecommendations) && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {hasMentorship ? (
                <div className="lg:col-span-1">
                  <ProfileMentorship profile={viewModel} />
                </div>
              ) : null}
              {hasRecommendations ? (
                <div className={hasMentorship ? 'lg:col-span-2' : 'lg:col-span-3'}>
                  <ProfileRecommendations profile={viewModel} persona={persona} />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </ProfilePageLayout>
  );
}
