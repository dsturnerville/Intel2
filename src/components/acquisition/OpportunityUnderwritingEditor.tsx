import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Opportunity } from '@/types/opportunity';
import { AcquisitionDefaults } from '@/types/acquisition';
import { useOpportunityMutations } from '@/hooks/useOpportunities';
import { useMarkets, Market } from '@/hooks/useMarkets';
import { Settings, RotateCcw, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface OpportunityUnderwritingEditorProps {
  opportunity: Opportunity;
  defaults: AcquisitionDefaults;
  readOnly?: boolean;
}

export function OpportunityUnderwritingEditor({
  opportunity,
  defaults,
  readOnly = false,
}: OpportunityUnderwritingEditorProps) {
  const { updateOpportunity } = useOpportunityMutations();
  const { data: markets = [] } = useMarkets();
  const [useDefaults, setUseDefaults] = useState(opportunity.useAcquisitionDefaults);
  const [selectedMarketId, setSelectedMarketId] = useState(opportunity.marketId || '');
  const [localInputs, setLocalInputs] = useState({
    miscIncomePercent: opportunity.miscIncomePercent,
    vacancyBadDebtPercent: opportunity.vacancyBadDebtPercent,
    pmFeePercent: opportunity.pmFeePercent,
    insPremiumRate: opportunity.insPremiumRate,
    insFactorRate: opportunity.insFactorRate,
    insLiabilityPremium: opportunity.insLiabilityPremium,
    replacementCostPerSF: opportunity.replacementCostPerSF,
    lostRent: opportunity.lostRent,
    leasingFeePercent: opportunity.leasingFeePercent,
    utilities: opportunity.utilities,
    turnoverCost: opportunity.turnoverCost,
    turnoverRatePercent: opportunity.turnoverRatePercent,
    blendedTurnover: opportunity.blendedTurnover,
    effectiveTaxRatePercent: opportunity.effectiveTaxRatePercent,
    taxIncreasePercent: opportunity.taxIncreasePercent,
    rmPercent: opportunity.rmPercent,
    turnCost: opportunity.turnCost,
    cmFeePercent: opportunity.cmFeePercent,
    closingCostsPercent: opportunity.closingCostsPercent,
  });

  useEffect(() => {
    setUseDefaults(opportunity.useAcquisitionDefaults);
    setLocalInputs({
      miscIncomePercent: opportunity.miscIncomePercent,
      vacancyBadDebtPercent: opportunity.vacancyBadDebtPercent,
      pmFeePercent: opportunity.pmFeePercent,
      insPremiumRate: opportunity.insPremiumRate,
      insFactorRate: opportunity.insFactorRate,
      insLiabilityPremium: opportunity.insLiabilityPremium,
      replacementCostPerSF: opportunity.replacementCostPerSF,
      lostRent: opportunity.lostRent,
      leasingFeePercent: opportunity.leasingFeePercent,
      utilities: opportunity.utilities,
      turnoverCost: opportunity.turnoverCost,
      turnoverRatePercent: opportunity.turnoverRatePercent,
      blendedTurnover: opportunity.blendedTurnover,
      effectiveTaxRatePercent: opportunity.effectiveTaxRatePercent,
      taxIncreasePercent: opportunity.taxIncreasePercent,
      rmPercent: opportunity.rmPercent,
      turnCost: opportunity.turnCost,
      cmFeePercent: opportunity.cmFeePercent,
      closingCostsPercent: opportunity.closingCostsPercent,
    });
  }, [opportunity]);

  const selectedMarket = markets.find(m => m.id === selectedMarketId);

  const formatPercent = (value: number | undefined, decimals: number = 2): string => {
    if (value === undefined || value === null) return '-';
    return `${(value * 100).toFixed(decimals)}%`;
  };

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null) return '-';
    return `$${value.toLocaleString()}`;
  };

  const getEffectiveValue = (field: keyof typeof localInputs): number => {
    if (useDefaults) {
      return defaults[field as keyof AcquisitionDefaults] as number;
    }
    return (localInputs[field] ?? defaults[field as keyof AcquisitionDefaults]) as number;
  };

  const handleToggleDefaults = async (checked: boolean) => {
    setUseDefaults(checked);
    const result = await updateOpportunity(opportunity.id, {
      useAcquisitionDefaults: checked,
    });
    if (!result.success) {
      toast.error('Failed to update property');
      setUseDefaults(!checked);
    }
  };

  const handleResetToDefaults = async () => {
    setUseDefaults(true);
    const result = await updateOpportunity(opportunity.id, {
      useAcquisitionDefaults: true,
    });
    if (!result.success) {
      toast.error('Failed to reset to defaults');
    }
  };

  const handleMarketChange = async (marketId: string) => {
    setSelectedMarketId(marketId);
    const result = await updateOpportunity(opportunity.id, {
      marketId: marketId || undefined,
    });
    if (!result.success) {
      toast.error('Failed to update market');
      setSelectedMarketId(opportunity.marketId || '');
    }
  };

  const handleApplyMarketDefaults = async () => {
    if (!selectedMarket) {
      toast.error('Please select a market first');
      return;
    }

    // Map market fields to opportunity fields
    const marketDefaults: Partial<Opportunity> = {
      useAcquisitionDefaults: false,
      miscIncomePercent: selectedMarket.misc_income_percent ?? undefined,
      vacancyBadDebtPercent: (selectedMarket.vacancy_percent ?? 0) + (selectedMarket.bad_debt_percent ?? 0),
      pmFeePercent: selectedMarket.pm_fee_percent ?? undefined,
      leasingFeePercent: selectedMarket.leasing_fee_percent ?? undefined,
      cmFeePercent: selectedMarket.cm_fee_percent ?? undefined,
      closingCostsPercent: selectedMarket.closing_costs_percent ?? undefined,
      insPremiumRate: selectedMarket.ins_premium_rate_percent ?? undefined,
      insFactorRate: selectedMarket.ins_factor_rate_percent ?? undefined,
      insLiabilityPremium: selectedMarket.ins_liability_premium ?? undefined,
      replacementCostPerSF: selectedMarket.replacement_cost_sf ?? undefined,
      lostRent: selectedMarket.lost_rent ?? undefined,
      utilities: selectedMarket.utilities ?? undefined,
      rmPercent: selectedMarket.repairs_maintenance_percent ?? undefined,
      turnoverCost: selectedMarket.turnover_costs ?? undefined,
      turnoverRatePercent: selectedMarket.turnover_rate_percent ?? undefined,
      blendedTurnover: selectedMarket.blended_turnover ?? undefined,
    };

    const result = await updateOpportunity(opportunity.id, marketDefaults);
    if (result.success) {
      setUseDefaults(false);
      toast.success(`Applied defaults from ${selectedMarket.market_name}`);
    } else {
      toast.error('Failed to apply market defaults');
    }
  };

  const handlePercentChange = async (field: keyof Opportunity, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const decimalValue = numValue / 100;
    
    const result = await updateOpportunity(opportunity.id, {
      useAcquisitionDefaults: false,
      [field]: decimalValue,
    });
    
    if (!result.success) {
      toast.error('Failed to update property');
    }
  };

  return (
    <div className="space-y-4">
      {/* Market Selection */}
      {!readOnly && (
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 flex-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Label className="text-xs font-medium whitespace-nowrap">Market:</Label>
            <Select value={selectedMarketId} onValueChange={handleMarketChange}>
              <SelectTrigger className="h-8 text-xs max-w-[200px]">
                <SelectValue placeholder="Select market..." />
              </SelectTrigger>
              <SelectContent>
                {markets.map((market) => (
                  <SelectItem key={market.id} value={market.id}>
                    {market.market_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedMarketId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyMarketDefaults}
              className="gap-1 text-xs h-7"
            >
              <MapPin className="h-3 w-3" />
              Apply Market Defaults
            </Button>
          )}
        </div>
      )}

      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Underwriting Assumptions
          </h4>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label 
                htmlFor={`use-defaults-${opportunity.id}`}
                className="text-xs cursor-pointer"
              >
                Use Acquisition Defaults
              </Label>
              <Switch
                id={`use-defaults-${opportunity.id}`}
                checked={useDefaults}
                onCheckedChange={handleToggleDefaults}
              />
            </div>
            {!useDefaults && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetToDefaults}
                className="gap-1 text-xs h-7"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Underwriting inputs grid */}
      <div className="grid grid-cols-5 gap-4">
        {/* Income & Vacancy */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Misc Income %</Label>
          {readOnly || useDefaults ? (
            <p className="text-sm font-mono">{formatPercent(getEffectiveValue('miscIncomePercent'))}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                defaultValue={(getEffectiveValue('miscIncomePercent') * 100).toFixed(1)}
                onBlur={(e) => handlePercentChange('miscIncomePercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Vacancy/Bad Debt %</Label>
          {readOnly || useDefaults ? (
            <p className="text-sm font-mono">{formatPercent(getEffectiveValue('vacancyBadDebtPercent'))}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                defaultValue={(getEffectiveValue('vacancyBadDebtPercent') * 100).toFixed(1)}
                onBlur={(e) => handlePercentChange('vacancyBadDebtPercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">PM Fee %</Label>
          {readOnly || useDefaults ? (
            <p className="text-sm font-mono">{formatPercent(getEffectiveValue('pmFeePercent'))}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                defaultValue={(getEffectiveValue('pmFeePercent') * 100).toFixed(1)}
                onBlur={(e) => handlePercentChange('pmFeePercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">R&M %</Label>
          {readOnly || useDefaults ? (
            <p className="text-sm font-mono">{formatPercent(getEffectiveValue('rmPercent'))}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                defaultValue={(getEffectiveValue('rmPercent') * 100).toFixed(1)}
                onBlur={(e) => handlePercentChange('rmPercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">CM Fee %</Label>
          {readOnly || useDefaults ? (
            <p className="text-sm font-mono">{formatPercent(getEffectiveValue('cmFeePercent'))}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                defaultValue={(getEffectiveValue('cmFeePercent') * 100).toFixed(1)}
                onBlur={(e) => handlePercentChange('cmFeePercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Leasing Fee %</Label>
          {readOnly || useDefaults ? (
            <p className="text-sm font-mono">{formatPercent(getEffectiveValue('leasingFeePercent'))}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                defaultValue={(getEffectiveValue('leasingFeePercent') * 100).toFixed(1)}
                onBlur={(e) => handlePercentChange('leasingFeePercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Turnover Rate %</Label>
          {readOnly || useDefaults ? (
            <p className="text-sm font-mono">{formatPercent(getEffectiveValue('turnoverRatePercent'))}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                defaultValue={(getEffectiveValue('turnoverRatePercent') * 100).toFixed(1)}
                onBlur={(e) => handlePercentChange('turnoverRatePercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Eff. Tax Rate %</Label>
          {readOnly || useDefaults ? (
            <p className="text-sm font-mono">{formatPercent(getEffectiveValue('effectiveTaxRatePercent'))}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                defaultValue={(getEffectiveValue('effectiveTaxRatePercent') * 100).toFixed(1)}
                onBlur={(e) => handlePercentChange('effectiveTaxRatePercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tax Increase %</Label>
          {readOnly || useDefaults ? (
            <p className="text-sm font-mono">{formatPercent(getEffectiveValue('taxIncreasePercent'))}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                defaultValue={(getEffectiveValue('taxIncreasePercent') * 100).toFixed(1)}
                onBlur={(e) => handlePercentChange('taxIncreasePercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Closing Costs %</Label>
          {readOnly || useDefaults ? (
            <p className="text-sm font-mono">{formatPercent(getEffectiveValue('closingCostsPercent'))}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                defaultValue={(getEffectiveValue('closingCostsPercent') * 100).toFixed(1)}
                onBlur={(e) => handlePercentChange('closingCostsPercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Calculated Outputs */}
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Property Details
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Year Built:</span>{' '}
              <span className="font-mono">{opportunity.yearBuilt ?? '-'}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Sq Ft:</span>{' '}
              <span className="font-mono">{opportunity.squareFeet?.toLocaleString() ?? '-'}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Beds/Baths:</span>{' '}
              <span className="font-mono">{opportunity.bedrooms ?? '-'} / {opportunity.bathrooms ?? '-'}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Property Tax:</span>{' '}
              <span className="font-mono">{formatCurrency(opportunity.propertyTax)}</span>
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rent & Income
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Current Rent:</span>{' '}
              <span className="font-mono">{formatCurrency(opportunity.currentRent)}/mo</span>
            </p>
            <p>
              <span className="text-muted-foreground">Rent AVM:</span>{' '}
              <span className="font-mono">{formatCurrency(opportunity.rentAvm)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Occupancy:</span>{' '}
              <span className="font-mono">{opportunity.occupancy}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Annual HOA:</span>{' '}
              <span className="font-mono">{formatCurrency(opportunity.annualHoa)}</span>
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pricing
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Asking Price:</span>{' '}
              <span className="font-mono">{formatCurrency(opportunity.askingPrice)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Sales AVM:</span>{' '}
              <span className="font-mono">{formatCurrency(opportunity.salesAvm)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Offer Price:</span>{' '}
              <span className="font-mono font-semibold">{formatCurrency(opportunity.offerPrice)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Total Acq Cost:</span>{' '}
              <span className="font-mono">{formatCurrency(opportunity.totalAcquisitionCost)}</span>
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Return Metrics
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Projected NOI:</span>{' '}
              <span className="font-mono">{formatCurrency(opportunity.projectedNoi)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Cap Rate:</span>{' '}
              <span className="font-mono text-primary font-semibold">
                {opportunity.projectedCapRate !== undefined
                  ? `${opportunity.projectedCapRate.toFixed(2)}%`
                  : '-'}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Annual Return:</span>{' '}
              <span className="font-mono text-primary font-semibold">
                {opportunity.projectedAnnualReturn !== undefined
                  ? `${opportunity.projectedAnnualReturn.toFixed(2)}%`
                  : '-'}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Using Defaults:</span>{' '}
              <span className={useDefaults ? 'text-emerald-400' : 'text-amber-400'}>
                {useDefaults ? 'Yes' : 'Custom'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}