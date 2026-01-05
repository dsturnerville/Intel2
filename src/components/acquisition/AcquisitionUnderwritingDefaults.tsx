import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AcquisitionDefaults } from '@/types/acquisition';
import { formatPercent } from '@/utils/acquisitionCalculations';

interface AcquisitionUnderwritingDefaultsProps {
  defaults: AcquisitionDefaults;
  onUpdate: (defaults: AcquisitionDefaults) => void;
  onApplyToAll?: () => void;
  readOnly?: boolean;
}

export function AcquisitionUnderwritingDefaults({
  defaults,
  onUpdate,
  onApplyToAll,
  readOnly = false,
}: AcquisitionUnderwritingDefaultsProps) {
  const handleChange = (key: keyof AcquisitionDefaults, value: number) => {
    onUpdate({ ...defaults, [key]: value });
  };

  const handlePercentChange = (key: keyof AcquisitionDefaults, stringValue: string) => {
    const value = parseFloat(stringValue) / 100;
    if (!isNaN(value)) {
      handleChange(key, value);
    }
  };

  const handleDollarChange = (key: keyof AcquisitionDefaults, stringValue: string) => {
    const value = parseFloat(stringValue);
    if (!isNaN(value)) {
      handleChange(key, value);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Underwriting Assumptions</CardTitle>
        {onApplyToAll && !readOnly && (
          <Button variant="outline" size="sm" onClick={onApplyToAll}>
            Apply to All Properties
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Income Assumptions */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Income Assumptions</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="miscIncome">Misc Income (%)</Label>
              <Input
                id="miscIncome"
                type="number"
                step="0.1"
                value={(defaults.miscIncomePercent * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('miscIncomePercent', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacancyBadDebt">Vacancy & Bad Debt (%)</Label>
              <Input
                id="vacancyBadDebt"
                type="number"
                step="0.1"
                value={(defaults.vacancyBadDebtPercent * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('vacancyBadDebtPercent', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Management & Fees */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Management & Fees</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pmFee">PM Fee (%)</Label>
              <Input
                id="pmFee"
                type="number"
                step="0.1"
                value={(defaults.pmFeePercent * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('pmFeePercent', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leasingFee">Leasing Fee (%)</Label>
              <Input
                id="leasingFee"
                type="number"
                step="0.1"
                value={(defaults.leasingFeePercent * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('leasingFeePercent', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cmFee">CM Fee (%)</Label>
              <Input
                id="cmFee"
                type="number"
                step="0.1"
                value={(defaults.cmFeePercent * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('cmFeePercent', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closingCosts">Closing Costs (%)</Label>
              <Input
                id="closingCosts"
                type="number"
                step="0.1"
                value={(defaults.closingCostsPercent * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('closingCostsPercent', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Insurance */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Insurance</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insPremiumRate">Ins Premium Rate (%)</Label>
              <Input
                id="insPremiumRate"
                type="number"
                step="0.01"
                value={(defaults.insPremiumRate * 100).toFixed(2)}
                onChange={(e) => handlePercentChange('insPremiumRate', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insFactorRate">Ins Factor Rate</Label>
              <Input
                id="insFactorRate"
                type="number"
                step="0.1"
                value={defaults.insFactorRate.toFixed(1)}
                onChange={(e) => handleDollarChange('insFactorRate', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insLiabilityPremium">Ins Liability Premium ($)</Label>
              <Input
                id="insLiabilityPremium"
                type="number"
                step="1"
                value={defaults.insLiabilityPremium.toFixed(0)}
                onChange={(e) => handleDollarChange('insLiabilityPremium', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replacementCost">Replacement Cost / SF ($)</Label>
              <Input
                id="replacementCost"
                type="number"
                step="1"
                value={defaults.replacementCostPerSF.toFixed(0)}
                onChange={(e) => handleDollarChange('replacementCostPerSF', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Taxes */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Taxes</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effectiveTaxRate">Effective Tax Rate (%)</Label>
              <Input
                id="effectiveTaxRate"
                type="number"
                step="0.01"
                value={(defaults.effectiveTaxRatePercent * 100).toFixed(2)}
                onChange={(e) => handlePercentChange('effectiveTaxRatePercent', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxIncrease">Tax Increase (%)</Label>
              <Input
                id="taxIncrease"
                type="number"
                step="0.1"
                value={(defaults.taxIncreasePercent * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('taxIncreasePercent', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Operating Costs */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Operating Costs</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lostRent">Lost Rent ($)</Label>
              <Input
                id="lostRent"
                type="number"
                step="1"
                value={defaults.lostRent.toFixed(0)}
                onChange={(e) => handleDollarChange('lostRent', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="utilities">Utilities ($)</Label>
              <Input
                id="utilities"
                type="number"
                step="1"
                value={defaults.utilities.toFixed(0)}
                onChange={(e) => handleDollarChange('utilities', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rmPercent">R&M (%)</Label>
              <Input
                id="rmPercent"
                type="number"
                step="0.1"
                value={(defaults.rmPercent * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('rmPercent', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Turnover */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Turnover</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="turnoverCost">Turnover Cost ($)</Label>
              <Input
                id="turnoverCost"
                type="number"
                step="100"
                value={defaults.turnoverCost.toFixed(0)}
                onChange={(e) => handleDollarChange('turnoverCost', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="turnoverRate">Turnover Rate (%)</Label>
              <Input
                id="turnoverRate"
                type="number"
                step="1"
                value={(defaults.turnoverRatePercent * 100).toFixed(0)}
                onChange={(e) => handlePercentChange('turnoverRatePercent', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blendedTurnover">Blended Turnover ($)</Label>
              <Input
                id="blendedTurnover"
                type="number"
                step="1"
                value={defaults.blendedTurnover.toFixed(0)}
                onChange={(e) => handleDollarChange('blendedTurnover', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="turnCost">Turn Cost ($)</Label>
              <Input
                id="turnCost"
                type="number"
                step="100"
                value={defaults.turnCost.toFixed(0)}
                onChange={(e) => handleDollarChange('turnCost', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <Separator />
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Vacancy</p>
              <p className="font-semibold">{formatPercent(defaults.vacancyBadDebtPercent)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total PM/CM Fees</p>
              <p className="font-semibold">{formatPercent(defaults.pmFeePercent + defaults.cmFeePercent)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tax Rate</p>
              <p className="font-semibold">{formatPercent(defaults.effectiveTaxRatePercent)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Closing Costs</p>
              <p className="font-semibold">{formatPercent(defaults.closingCostsPercent)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
