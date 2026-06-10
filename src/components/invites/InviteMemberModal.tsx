import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { UserSearchCombobox } from './UserSearchCombobox';
import { inviteService } from '@/services/inviteService';
import { parseInviteError } from '@/utils/inviteErrors';
import type { MemberSearchResult } from '@/types/invite';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  miscellaneousId: string;
  onInviteSent?: () => void;
}

export function InviteMemberModal({
  open,
  onOpenChange,
  miscellaneousId,
  onInviteSent,
}: InviteMemberModalProps) {
  const [selectedUser, setSelectedUser] = useState<MemberSearchResult | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setSelectedUser(null);
    setMessage('');
    setError('');
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      setError('Selecione um usuário para convidar.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await inviteService.sendInvite(miscellaneousId, {
        invitedUserId: selectedUser.id,
        message: message.trim() || undefined,
      });
      resetForm();
      onOpenChange(false);
      onInviteSent?.();
    } catch (err) {
      setError(parseInviteError(err, 'send'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Convidar membros</DialogTitle>
          <DialogDescription>
            Busque um usuário da plataforma e envie um convite individual para esta miscelânea.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <UserSearchCombobox
            selectedUser={selectedUser}
            onSelect={setSelectedUser}
            disabled={isLoading}
          />

          <div className="space-y-2">
            <Label htmlFor="invite-message">Mensagem (opcional)</Label>
            <Textarea
              id="invite-message"
              placeholder="Escreva uma mensagem para o convidado..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !selectedUser}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar convite'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
