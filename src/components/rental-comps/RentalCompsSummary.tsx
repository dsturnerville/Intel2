import { RentalComp, calculateMedian } from '@/data/mockRentalComps';
import { formatCurrency } from '@/utils/calculations';

interface RentalCompsSummaryProps {
  selectedComps: RentalComp[];
}

export function RentalCompsSummary({ selectedComps }: RentalCompsSummaryProps) {
  const rents = selectedComps.map((c) => c.rent);
  const median = calculateMedian(rents);
  const avg = rents.length > 0 ? rents.reduce((a, b) => a + b, 0) / rents.length : 0;
  const min = rents.length > 0 ? Math.min(...rents) : 0;
  const max = rents.length > 0 ? Math.max(...rents) : 0;

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Selected: </span>
            <span className="font-medium">{selectedComps.length} comps</span>
          </div>
          {selectedComps.length > 0 && (
            <>
              <div>
                <span className="text-muted-foreground">Median: </span>
                <span className="font-semibold text-primary">{formatCurrency(median)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg: </span>
                <span className="font-medium">{formatCurrency(Math.round(avg))}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Range: </span>
                <span className="font-medium">
                  {formatCurrency(min)} – {formatCurrency(max)}
                </span>
              </div>
            </>
          )}
        </div>
        {selectedComps.length > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">Suggested Rent: </span>
            <span className="font-bold text-lg text-primary">{formatCurrency(median)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
