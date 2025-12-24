import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { Deal } from '@/types/disposition';
import { formatCurrency } from '@/utils/calculations';
import { ExternalLink, FileText, Plus } from 'lucide-react';

interface LinkedDealProps {
  deal?: Deal;
  onCreateDeal: () => void;
}

export function LinkedDeal({ deal, onCreateDeal }: LinkedDealProps) {
  if (!deal) {
    return (
      <Card className="border-border border-dashed bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-10 w-10 text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            No deal linked to this disposition
          </p>
          <Button onClick={onCreateDeal} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Deal from Disposition
          </Button>
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
            <CardTitle className="text-base font-semibold">Linked Deal</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-primary">
            View Deal
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{deal.name}</p>
            <p className="text-xs text-muted-foreground">
              {deal.propertyIds.length} {deal.propertyIds.length === 1 ? 'property' : 'properties'}
            </p>
          </div>
          <StatusBadge status={deal.status} />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
          {deal.listPrice && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">List Price</p>
              <p className="font-mono text-sm">{formatCurrency(deal.listPrice)}</p>
            </div>
          )}
          {deal.offerPrice && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Offer Price</p>
              <p className="font-mono text-sm">{formatCurrency(deal.offerPrice)}</p>
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
