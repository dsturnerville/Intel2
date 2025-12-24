import { DispositionAggregates } from '@/types/disposition';
import { formatCurrency, formatPercent } from '@/utils/calculations';
import { MetricCard } from './MetricCard';
import { Building2, DollarSign, TrendingUp, Receipt, PiggyBank, Percent } from 'lucide-react';
interface PortfolioSummaryProps {
  aggregates: DispositionAggregates;
}
export function PortfolioSummary({
  aggregates
}: PortfolioSummaryProps) {
  const isGain = aggregates.totalGainLossVsBasis >= 0;
  return <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">SUMMARY</h3>
        <span className="text-xs text-muted-foreground">
          ({aggregates.propertyCount} {aggregates.propertyCount === 1 ? 'property' : 'properties'})
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="Total Sale Price" value={formatCurrency(aggregates.totalProjectedSalePrice)} icon={DollarSign} size="sm" />

        <MetricCard label="Total Basis" value={formatCurrency(aggregates.totalAcquisitionBasis)} icon={Building2} size="sm" />

        <MetricCard label="Selling Costs" value={formatCurrency(aggregates.totalSellingCosts)} subValue={formatPercent(aggregates.totalProjectedSalePrice > 0 ? aggregates.totalSellingCosts / aggregates.totalProjectedSalePrice : 0)} icon={Receipt} size="sm" />

        <MetricCard label="Net Proceeds" value={formatCurrency(aggregates.totalNetSaleProceeds)} icon={PiggyBank} size="sm" />

        <MetricCard label="Total Gain/Loss" value={`${isGain ? '+' : ''}${formatCurrency(aggregates.totalGainLossVsBasis)}`} trend={isGain ? 'up' : 'down'} icon={TrendingUp} size="sm" />

        <MetricCard label="Portfolio ROI" value={formatPercent(aggregates.weightedAverageROI)} subValue={aggregates.portfolioIRR !== undefined ? `${formatPercent(aggregates.portfolioIRR)} IRR` : `${aggregates.averageHoldPeriodYears.toFixed(1)} yr avg hold`} trend={aggregates.weightedAverageROI >= 0 ? 'up' : 'down'} icon={Percent} size="sm" />
      </div>

      {/* Detailed costs breakdown */}
      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Selling Costs Breakdown
        </h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Broker Commission</p>
            <p className="font-mono text-sm">{formatCurrency(aggregates.totalBrokerCommission)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Closing Costs</p>
            <p className="font-mono text-sm">{formatCurrency(aggregates.totalClosingCosts)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Seller Concessions</p>
            <p className="font-mono text-sm">{formatCurrency(aggregates.totalSellerConcessions)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Make Ready / CapEx</p>
            <p className="font-mono text-sm">{formatCurrency(aggregates.totalMakeReadyCapex)}</p>
          </div>
        </div>
      </div>
    </div>;
}