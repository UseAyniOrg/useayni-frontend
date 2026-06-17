import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  memberApprovalService,
  type PendingMember,
} from '@/services/memberApprovalService';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  User,
  GraduationCap,
  Phone,
  Mail,
  CalendarDays,
  BookOpen,
  Building2,
  MapPin,
  ArrowLeft,
  Loader2,
  Users,
  AlertCircle,
} from 'lucide-react';

export default function MemberApproval() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [members, setMembers] = useState<PendingMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [dialog, setDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | null;
    member: PendingMember | null;
  }>({ open: false, type: null, member: null });

  const [isActing, setIsActing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [selected, setSelected] = useState<PendingMember | null>(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await memberApprovalService.getPendingMembers();
      setMembers(data);
      setSelected(prev =>
        prev ? data.find(m => m.id === prev.id) ?? data[0] ?? null : data[0] ?? null
      );
    } catch {
      setError('Não foi possível carregar os membros pendentes. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const openDialog = (type: 'approve' | 'reject', member: PendingMember) => {
    setActionError('');
    setDialog({ open: true, type, member });
  };

  const closeDialog = () => {
    setDialog({ open: false, type: null, member: null });
    setActionError('');
  };

  const handleConfirm = async () => {
    if (!dialog.member || !dialog.type) return;
    setIsActing(true);
    setActionError('');
    try {
      if (dialog.type === 'approve') {
        await memberApprovalService.approveMember(dialog.member.id);
      } else {
        await memberApprovalService.rejectMember(dialog.member.id);
      }
      closeDialog();
      await fetchMembers();
    } catch {
      setActionError(
        dialog.type === 'approve'
          ? 'Erro ao aprovar. Verifique sua conexão e tente novamente.'
          : 'Erro ao recusar. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setIsActing(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf?: string) => {
    if (!cpf) return '—';
    const d = cpf.replace(/\D/g, '');
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const activeCourse = (member: PendingMember) => {
    if (!member.memberCourses?.length) return null;
    return member.memberCourses.find(mc => mc.status === 'active') || member.memberCourses[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alice-blue to-bright-snow">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando membros...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-alice-blue to-bright-snow">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home')} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <img src="/Ayni.svg" alt="Ayni Logo" className="h-8 w-auto" />
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Aprovação de Membros</h1>
          {user?.name && (
            <p className="text-xs text-muted-foreground">
              Revisando como <span className="font-medium text-foreground">{user.name}</span>
            </p>
          )}
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
          <Users className="w-3 h-3" />
          {members.length} pendente{members.length !== 1 ? 's' : ''}
        </Badge>
      </header>

      {/* Erro */}
      {error && (
        <div className="max-w-5xl mx-auto mt-6 px-6">
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
        </div>
      )}

      {/* Vazio */}
      {!error && members.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-lg font-semibold">Tudo em dia!</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Não há membros aguardando aprovação no momento.
          </p>
        </div>
      )}

      {/* Lista + detalhes */}
      {!error && members.length > 0 && (
        <div className="flex h-[calc(100vh-65px)]">
          {/* Sidebar */}
          <aside className="w-80 border-r overflow-y-auto shrink-0 bg-white">
            <div className="px-4 py-3 border-b bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Aguardando revisão
              </p>
            </div>
            {members.map(member => {
              const course = activeCourse(member);
              const isSelected = selected?.id === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => setSelected(member)}
                  className={`w-full text-left px-4 py-4 border-b transition-colors ${
                    isSelected
                      ? 'bg-alice-blue border-l-4 border-l-primary shadow-sm'
                      : 'hover:bg-alice-blue/40 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      <span className="text-sm font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email_personal}</p>
                    </div>
                  </div>
                  {course?.courseUniversity && (
                    <p className="text-xs text-muted-foreground mt-2 pl-[52px] truncate">
                      {course.courseUniversity.course?.name}
                      {course.courseUniversity.university?.name && (
                        <> · {course.courseUniversity.university.name}</>
                      )}
                    </p>
                  )}
                </button>
              );
            })}
          </aside>

          {/* Detalhes */}
          <main className="flex-1 overflow-y-auto p-8">
            {selected ? (
              <MemberDetail
                member={selected}
                onApprove={() => openDialog('approve', selected)}
                onReject={() => openDialog('reject', selected)}
                formatDate={formatDate}
                formatCPF={formatCPF}
                activeCourse={activeCourse}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Selecione um membro para ver os detalhes
              </div>
            )}
          </main>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialog.open} onOpenChange={open => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.type === 'approve' ? 'Aprovar membro' : 'Recusar cadastro'}
            </DialogTitle>
            <DialogDescription>
              {dialog.type === 'approve' ? (
                <>
                  Ao aprovar, <strong>{dialog.member?.name}</strong> terá acesso completo à
                  plataforma.
                </>
              ) : (
                <>
                  Ao recusar, o cadastro de <strong>{dialog.member?.name}</strong> será{' '}
                  <strong>excluído permanentemente</strong>. O membro poderá se recadastrar se
                  desejar.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {actionError}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={isActing}>
              Cancelar
            </Button>
            <Button
              variant={dialog.type === 'approve' ? 'default' : 'destructive'}
              onClick={handleConfirm}
              disabled={isActing}
              className="gap-2"
            >
              {isActing && <Loader2 className="w-4 h-4 animate-spin" />}
              {dialog.type === 'approve' ? 'Confirmar aprovação' : 'Confirmar recusa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type PendingMemberCourse = NonNullable<PendingMember['memberCourses']>[number];
interface MemberDetailProps {
  member: PendingMember;
  onApprove: () => void;
  onReject: () => void;
  formatDate: (d?: string) => string;
  formatCPF: (cpf?: string) => string;
  activeCourse: (m: PendingMember) => PendingMemberCourse | null;
}

function MemberDetail({ member, onApprove, onReject, formatDate, formatCPF, activeCourse }: MemberDetailProps) {
  const course = activeCourse(member);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho com resumo rápido */}
      <div className="flex items-center gap-5 pb-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-primary">
            {member.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold">{member.name}</h2>
          <Badge className="mt-1 text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-50">
            Cadastro pendente
          </Badge>
          {/* Resumo rápido logo abaixo do nome */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {member.city && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {member.city.name}
              </span>
            )}
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
          </div>
        </div>
      </div>

      {/* Dados pessoais */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <User className="w-4 h-4 text-primary" /> Dados pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-5 text-sm">
          <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="E-mail pessoal" value={member.email_personal} />
          <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Telefone" value={member.phone} />
          <InfoRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Nascimento" value={formatDate(member.birth_date)} />
          <InfoRow icon={<User className="w-3.5 h-3.5" />} label="CPF" value={formatCPF(member.cpf)} />
          {member.city && (
            <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Cidade" value={member.city.name} />
          )}
        </CardContent>
      </Card>

      {/* Dados acadêmicos */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <GraduationCap className="w-4 h-4 text-primary" /> Dados acadêmicos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-5 text-sm">
          <InfoRow icon={<BookOpen className="w-3.5 h-3.5" />} label="RA" value={member.ra} />
          <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="E-mail acadêmico" value={member.email_university} />
          <InfoRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Ingresso" value={formatDate(member.admission_date)} />
          {course?.courseUniversity?.course && (
            <InfoRow icon={<BookOpen className="w-3.5 h-3.5" />} label="Curso" value={course.courseUniversity.course.name} />
          )}
          {course?.courseUniversity?.university && (
            <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Universidade" value={course.courseUniversity.university.name} className="col-span-2" />
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-3 pt-2 pb-6">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          onClick={onReject}
        >
          <XCircle className="w-4 h-4" />
          Recusar
        </Button>
        <Button size="lg" className="flex-1 gap-2" onClick={onApprove}>
          <CheckCircle2 className="w-4 h-4" />
          Aprovar Membro
        </Button>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  className = '',
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold">{value || '—'}</p>
    </div>
  );
}
