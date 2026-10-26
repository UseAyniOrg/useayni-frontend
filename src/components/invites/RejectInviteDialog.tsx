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

interface RejectInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  miscellaneousTitle?: string;
  onConfirm: (rejectionReason?: string) => Promise<void>;
}

export function RejectInviteDialog({
  open,
  onOpenChange,
  miscellaneousTitle,
  onConfirm,
}: RejectInviteDialogProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(reason.trim() || undefined);
      setReason('');
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setReason('');
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recusar convite</DialogTitle>
          <DialogDescription>
            {miscellaneousTitle
              ? `Tem certeza que deseja recusar o convite para "${miscellaneousTitle}"?`
              : 'Tem certeza que deseja recusar este convite?'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="rejection-reason">Justificativa (opcional)</Label>
          <Textarea
            id="rejection-reason"
            placeholder="Informe o motivo da recusa, se desejar..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            disabled={isLoading}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Recusando...
              </>
            ) : (
              'Recusar convite'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
