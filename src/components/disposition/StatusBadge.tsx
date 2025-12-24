import { cn } from '@/lib/utils';
import { DispositionStatus, DealStatus } from '@/types/disposition';

interface StatusBadgeProps {
  status: DispositionStatus | DealStatus;
  className?: string;
}

// Untitled UI-inspired badge styles using design system tokens
const statusStyles: Record<string, string> = {
  // Disposition statuses
  'Draft': 'bg-badge-gray-bg text-badge-gray-text border-badge-gray-border',
  'Under Review': 'bg-badge-amber-bg text-badge-amber-text border-badge-amber-border',
  'Approved to List': 'bg-badge-success-bg text-badge-success-text border-badge-success-border',
  'Archived': 'bg-badge-gray-bg text-badge-gray-text border-badge-gray-border',
  // Deal statuses
  'Pre-Listing': 'bg-badge-gray-bg text-badge-gray-text border-badge-gray-border',
  'Listed': 'bg-badge-blue-bg text-badge-blue-text border-badge-blue-border',
  'Under Contract': 'bg-badge-purple-bg text-badge-purple-text border-badge-purple-border',
  'Due Diligence': 'bg-badge-amber-bg text-badge-amber-text border-badge-amber-border',
  'Pending Close': 'bg-badge-success-bg text-badge-success-text border-badge-success-border',
  'Closed': 'bg-badge-success-bg text-badge-success-text border-badge-success-border',
  'Terminated': 'bg-badge-rose-bg text-badge-rose-text border-badge-rose-border',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status] || 'bg-badge-gray-bg text-badge-gray-text border-badge-gray-border',
        className
      )}
    >
      {status}
    </span>
  );
}
