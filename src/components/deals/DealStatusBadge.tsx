import { Badge } from '@/components/ui/badge';
import { DealStatus } from '@/types/deal';

interface DealStatusBadgeProps {
  status: DealStatus;
}

const statusStyles: Record<DealStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  'Pre-Listing': { variant: 'secondary' },
  'LOI Submitted': { variant: 'outline', className: 'border-blue-500 text-blue-600' },
  'LOI Accepted': { variant: 'outline', className: 'border-blue-600 text-blue-700 bg-blue-50' },
  'Listed': { variant: 'outline', className: 'border-primary text-primary' },
  'Under Contract': { variant: 'default', className: 'bg-amber-500 hover:bg-amber-600' },
  'PSA Executed': { variant: 'default', className: 'bg-amber-600 hover:bg-amber-700' },
  'Due Diligence': { variant: 'outline', className: 'border-orange-500 text-orange-600' },
  'Pending Close': { variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
  'Closed': { variant: 'default', className: 'bg-green-700 hover:bg-green-800' },
  'Terminated': { variant: 'destructive' },
};

export function DealStatusBadge({ status }: DealStatusBadgeProps) {
  const style = statusStyles[status] || { variant: 'secondary' as const };
  
  return (
    <Badge variant={style.variant} className={style.className}>
      {status}
    </Badge>
  );
}
