import { Badge } from '@/components/ui/badge';
import type { InviteStatus } from '@/types/invite';
import { INVITE_STATUS_LABELS } from '@/utils/invite';
import { cn } from '@/lib/utils';

const STATUS_VARIANT: Record<
  InviteStatus,
  'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'muted' | 'outline'
> = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'destructive',
  cancelled: 'muted',
  expired: 'outline',
};

interface InviteStatusBadgeProps {
  status: InviteStatus;
  className?: string;
}

export function InviteStatusBadge({ status, className }: InviteStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={cn(className)}>
      {INVITE_STATUS_LABELS[status]}
    </Badge>
  );
}
