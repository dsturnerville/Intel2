import { cn } from '@/lib/utils';
import { DispositionStatus, DealStatus } from '@/types/disposition';

interface StatusBadgeProps {
  status: DispositionStatus | DealStatus;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Disposition statuses
  'Draft': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  'Under Review': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Approved to List': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Archived': 'bg-slate-600/20 text-slate-500 border-slate-600/30',
  // Deal statuses
  'Pre-Listing': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  'Listed': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Under Contract': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'Due Diligence': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Pending Close': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Closed': 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30',
  'Terminated': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status] || 'bg-muted text-muted-foreground border-border',
        className
      )}
    >
      {status}
    </span>
  );
}
