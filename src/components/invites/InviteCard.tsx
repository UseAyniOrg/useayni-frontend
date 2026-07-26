import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InviteStatusBadge } from './InviteStatusBadge';
import { RejectInviteDialog } from './RejectInviteDialog';
import { inviteService } from '@/services/inviteService';
import { parseInviteError } from '@/utils/inviteErrors';
import type { MiscellaneousInvite } from '@/types/invite';
import {
  formatInviteDate,
  getEffectiveInviteStatus,
  isInviteExpired,
} from '@/utils/invite';

interface InviteCardProps {
  invite: MiscellaneousInvite;
  onUpdated?: () => void;
  showActions?: boolean;
}

export function InviteCard({ invite, onUpdated, showActions = true }: InviteCardProps) {
  const [error, setError] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const status = getEffectiveInviteStatus(invite);
  const canRespond = showActions && status === 'pending' && !isInviteExpired(invite);

  const handleAccept = async () => {
    setError('');
    setIsAccepting(true);
    try {
      await inviteService.acceptInvite(invite.miscellaneousId, invite.id);
      onUpdated?.();
    } catch (err) {
      setError(parseInviteError(err, 'accept'));
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async (rejectionReason?: string) => {
    setError('');
    await inviteService.rejectInvite(invite.miscellaneousId, invite.id, { rejectionReason });
    onUpdated?.();
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-base truncate">
                {invite.miscellaneous?.title ?? 'Miscelânea'}
              </CardTitle>
              {invite.invitedByUser && (
                <CardDescription>
                  Convidado por {invite.invitedByUser.name}
                </CardDescription>
              )}
            </div>
            <InviteStatusBadge status={status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {invite.message && (
            <p className="text-sm text-muted-foreground border-l-2 border-muted pl-3">
              {invite.message}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Enviado em {formatInviteDate(invite.createdAt)}</span>
            {status === 'pending' && (
              <span>Expira em {formatInviteDate(invite.expiresAt)}</span>
            )}
            {invite.respondedAt && (
              <span>Respondido em {formatInviteDate(invite.respondedAt)}</span>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {canRespond && (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAccept} disabled={isAccepting}>
                {isAccepting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Aceitar
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsRejectOpen(true)}
                disabled={isAccepting}
              >
                <X className="h-4 w-4" />
                Recusar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <RejectInviteDialog
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        miscellaneousTitle={invite.miscellaneous?.title}
        onConfirm={handleReject}
      />
    </>
  );
}
