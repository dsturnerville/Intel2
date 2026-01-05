import { Badge } from '@/components/ui/badge';
import { AcquisitionStatus } from '@/types/acquisition';

interface AcquisitionStatusBadgeProps {
  status: AcquisitionStatus;
}

const statusStyles: Record<AcquisitionStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  'In Review': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  'Under Contract': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Closed: 'bg-primary/10 text-primary border-primary/20',
  Archived: 'bg-muted text-muted-foreground',
};

export function AcquisitionStatusBadge({ status }: AcquisitionStatusBadgeProps) {
  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {status}
    </Badge>
  );
}
