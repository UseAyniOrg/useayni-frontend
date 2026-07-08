import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { api } from '@/lib/api';
import { type Member } from '@/services/memberService';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search,
  Loader2,
  AlertCircle,
  Users,
  BookOpen,
  Building2,
  MapPin,
} from 'lucide-react';

export default function MemberList() {
  const navigate = useNavigate();
  const { data: rolesAndPermissions, isLoading: isLoadingRoles } = useRolesAndPermissions();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get<Member[]>('/members');
      const approved = response.data.filter(m => m.registration_status === 'approved');
      setMembers(approved);
    } catch {
      setError('Não foi possível carregar os membros. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const activeCourse = (member: Member) => {
    if (!member.memberCourses?.length) return null;
    return member.memberCourses.find(mc => mc.status === 'active') || member.memberCourses[0];
  };

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email_personal.toLowerCase().includes(search.toLowerCase()) ||
    m.ra.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={isLoadingRoles} />
      <SidebarInset>
        <AppHeader title="Membros" />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Topo */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Listagem de Membros</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Membros aprovados visíveis para sua área
                </p>
              </div>
              {!isLoading && !error && (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                  <Users className="w-3 h-3" />
                  {filtered.length} membro{filtered.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou RA..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Carregando */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Carregando membros...</span>
              </div>
            )}

            {/* Erro */}
            {!isLoading && error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-red-700 hover:text-red-800"
                  onClick={fetchMembers}
                >
                  Tentar novamente
                </Button>
              </div>
            )}

            {/* Vazio */}
            {!isLoading && !error && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                  <Users className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="font-semibold">
                  {search ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado'}
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {search
                    ? 'Tente buscar por outro nome, e-mail ou RA.'
                    : 'Não há membros aprovados na sua área no momento.'}
                </p>
              </div>
            )}

            {/* Lista */}
            {!isLoading && !error && filtered.length > 0 && (
              <div className="grid gap-3">
                {filtered.map(member => {
                  const course = activeCourse(member);
                  return (
                    <Card
                      key={member.id}
                      className="bg-white hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => member.slug && navigate(`/membros/${member.slug}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {member.profile_picture_url ? (
                              <img
                                src={member.profile_picture_url}
                                alt={member.name}
                                className="w-11 h-11 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-base font-bold text-primary">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Info principal */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {member.email_personal}
                            </p>
                          </div>

                          {/* Info secundária */}
                          <div className="hidden md:flex items-center gap-4 shrink-0">
                            {course?.courseUniversity?.course && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <BookOpen className="w-3 h-3" />
                                {course.courseUniversity.course.name}
                              </span>
                            )}
                            {course?.courseUniversity?.university && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Building2 className="w-3 h-3" />
                                {course.courseUniversity.university.name}
                              </span>
                            )}
                            {member.city && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {member.city.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}