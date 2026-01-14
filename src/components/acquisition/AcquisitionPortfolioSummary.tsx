import { Card, CardContent } from '@/components/ui/card';
import { AcquisitionAggregates } from '@/types/acquisition';
import { formatCurrency, formatPercent } from '@/utils/acquisitionCalculations';
import { Building2, DollarSign, TrendingUp, Calculator } from 'lucide-react';

interface AcquisitionPortfolioSummaryProps {
  aggregates: AcquisitionAggregates;
}

export function AcquisitionPortfolioSummary({ aggregates }: AcquisitionPortfolioSummaryProps) {
  const metrics = [
    {
      label: 'Units',
      value: aggregates.propertyCount.toString(),
      icon: Building2,
    },
    {
      label: 'Total Offer Price',
      value: formatCurrency(aggregates.totalOfferPrice),
      icon: DollarSign,
    },
    {
      label: 'Total Projected NOI',
      value: formatCurrency(aggregates.totalProjectedNOI),
      icon: Calculator,
    },
    {
      label: 'Avg Cap Rate',
      value: formatPercent(aggregates.avgProjectedCapRate),
      icon: TrendingUp,
    },
    {
      label: 'Total Acquisition Cost',
      value: formatCurrency(aggregates.totalAcquisitionCost),
      icon: DollarSign,
    },
    {
      label: 'Avg Annual Return',
      value: formatPercent(aggregates.avgProjectedAnnualReturn),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <metric.icon className="h-4 w-4" />
              <span className="text-xs">{metric.label}</span>
            </div>
            <p className="text-lg font-semibold">{metric.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
