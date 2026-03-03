import { RentalComp } from '@/data/mockRentalComps';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/utils/calculations';
import { CheckSquare, Square } from 'lucide-react';

interface RentalCompsListProps {
  comps: RentalComp[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  highlightedId: string | null;
  onHover: (id: string | null) => void;
}

const statusVariant = (status: RentalComp['status']) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Pending': return 'amber';
    case 'Leased': return 'gray';
  }
};

export function RentalCompsList({
  comps,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  highlightedId,
  onHover,
}: RentalCompsListProps) {
  const allSelected = comps.length > 0 && selectedIds.size === comps.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-muted-foreground">
          {comps.length} comps found
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="text-xs h-7"
          >
            {allSelected ? (
              <><Square className="h-3.5 w-3.5 mr-1" /> Deselect All</>
            ) : (
              <><CheckSquare className="h-3.5 w-3.5 mr-1" /> Select All</>
            )}
          </Button>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {comps.map((comp) => (
            <div
              key={comp.id}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                highlightedId === comp.id ? 'bg-accent' : ''
              }`}
              onMouseEnter={() => onHover(comp.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onToggleSelect(comp.id)}
            >
              <Checkbox
                checked={selectedIds.has(comp.id)}
                onCheckedChange={() => onToggleSelect(comp.id)}
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{comp.address}</p>
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">
                    {formatCurrency(comp.rent)}/mo
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{comp.bedrooms}bd/{comp.bathrooms}ba</span>
                  <span>·</span>
                  <span>{comp.sqft.toLocaleString()} sqft</span>
                  <span>·</span>
                  <span>{comp.distance} mi</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant={statusVariant(comp.status) as any} className="text-[10px] h-5">
                    {comp.status}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {comp.daysOnMarket}d on market
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    · {comp.source}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {comps.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No comps match the current filters
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
