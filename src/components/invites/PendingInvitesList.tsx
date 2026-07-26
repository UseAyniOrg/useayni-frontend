import { useCallback, useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InviteStatusBadge } from './InviteStatusBadge';
import { inviteService } from '@/services/inviteService';
import { parseInviteError } from '@/utils/inviteErrors';
import type { MiscellaneousInvite } from '@/types/invite';
import { formatInviteDate, getEffectiveInviteStatus } from '@/utils/invite';
import { Skeleton } from '@/components/ui/skeleton';

interface PendingInvitesListProps {
  miscellaneousId: string;
  canManage?: boolean;
  refreshKey?: number;
}

export function PendingInvitesList({
  miscellaneousId,
  canManage = true,
  refreshKey = 0,
}: PendingInvitesListProps) {
  const [invites, setInvites] = useState<MiscellaneousInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelTarget, setCancelTarget] = useState<MiscellaneousInvite | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadInvites = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await inviteService.listMiscInvites(miscellaneousId);
      setInvites(data);
    } catch (err) {
      setError(parseInviteError(err, 'list'));
    } finally {
      setIsLoading(false);
    }
  }, [miscellaneousId]);

  useEffect(() => {
    loadInvites();
  }, [loadInvites, refreshKey]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await inviteService.cancelInvite(miscellaneousId, cancelTarget.id);
      setCancelTarget(null);
      await loadInvites();
    } catch (err) {
      setError(parseInviteError(err, 'cancel'));
    } finally {
      setIsCancelling(false);
    }
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error && invites.length === 0) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Nenhum convite enviado para esta miscelânea.
      </p>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário convidado</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expira em</TableHead>
            {canManage && <TableHead className="w-[100px]">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map(invite => {
            const status = getEffectiveInviteStatus(invite);
            const userName = invite.invitedUser?.name ?? 'Usuário';
            return (
              <TableRow key={invite.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={invite.invitedUser?.avatar} alt={userName} />
                      <AvatarFallback>{initials(userName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{userName}</p>
                      {invite.invitedUser?.email && (
                        <p className="text-xs text-muted-foreground">{invite.invitedUser.email}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <InviteStatusBadge status={status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatInviteDate(invite.expiresAt)}
                </TableCell>
                {canManage && (
                  <TableCell>
                    {status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCancelTarget(invite)}
                        title="Cancelar convite"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={!!cancelTarget} onOpenChange={open => !open && setCancelTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar convite</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar o convite para{' '}
              <strong>{cancelTarget?.invitedUser?.name ?? 'este usuário'}</strong>? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={isCancelling}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Cancelar convite'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
