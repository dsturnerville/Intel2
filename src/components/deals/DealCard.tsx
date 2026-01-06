import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DealStatusBadge } from './DealStatusBadge';
import { Deal } from '@/types/deal';
import { formatCurrency } from '@/utils/calculations';
import { ExternalLink, FileText, Plus } from 'lucide-react';

interface DealCardProps {
  deal?: Deal;
  onCreateDeal?: () => void;
  onViewDeal?: (deal: Deal) => void;
  emptyMessage?: string;
  emptyButtonLabel?: string;
}

export function DealCard({ 
  deal, 
  onCreateDeal, 
  onViewDeal,
  emptyMessage = 'No deal linked',
  emptyButtonLabel = 'Add New Deal',
}: DealCardProps) {
  if (!deal) {
    return (
      <Card className="border-border border-dashed bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-10 w-10 text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            {emptyMessage}
          </p>
          {onCreateDeal && (
            <Button onClick={onCreateDeal} className="gap-2">
              <Plus className="h-4 w-4" />
              {emptyButtonLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">{deal.name}</CardTitle>
          </div>
          {onViewDeal && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-primary"
              onClick={() => onViewDeal(deal)}
            >
              View Deal
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground capitalize">
              {deal.dealType} Deal
            </p>
          </div>
          <DealStatusBadge status={deal.status} />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
          {deal.askingPrice !== undefined && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Asking Price</p>
              <p className="font-mono text-sm">{formatCurrency(deal.askingPrice)}</p>
            </div>
          )}
          {deal.purchasePrice !== undefined && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Purchase Price</p>
              <p className="font-mono text-sm">{formatCurrency(deal.purchasePrice)}</p>
            </div>
          )}
          {deal.closeProbability !== undefined && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Close Probability</p>
              <p className="font-mono text-sm">{deal.closeProbability}%</p>
            </div>
          )}
        </div>

        {deal.expectedCloseDate && (
          <div className="text-xs text-muted-foreground">
            Expected close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
