import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UnderwritingDefaultValues {
  salePriceMethodology: 'Cap Rate Based' | 'Comp Based' | 'Flat Price Input';
  capRate: number;
  discountToMarket: number;
  brokerFeePercent: number;
  closingCostPercent: number;
  sellerConcessionsPercent: number;
  makeReadyCapexPercent: number;
  holdPeriodYears: number;
}

interface UnderwritingDefaultsProps {
  defaults: UnderwritingDefaultValues;
  onUpdate: (defaults: UnderwritingDefaultValues) => void;
  readOnly?: boolean;
}

export function UnderwritingDefaults({
  defaults,
  onUpdate,
  readOnly = false,
}: UnderwritingDefaultsProps) {
  const [localDefaults, setLocalDefaults] = useState(defaults);

  useEffect(() => {
    setLocalDefaults(defaults);
  }, [defaults]);

  const handleChange = <K extends keyof UnderwritingDefaultValues>(
    key: K,
    value: UnderwritingDefaultValues[K]
  ) => {
    const updated = { ...localDefaults, [key]: value };
    setLocalDefaults(updated);
    onUpdate(updated);
  };

  const handlePercentChange = (key: keyof UnderwritingDefaultValues, value: string) => {
    const numValue = parseFloat(value) / 100;
    if (!isNaN(numValue)) {
      handleChange(key, numValue);
    }
  };

  const totalSellingCosts =
    (localDefaults.brokerFeePercent || 0) +
    (localDefaults.closingCostPercent || 0) +
    (localDefaults.sellerConcessionsPercent || 0) +
    (localDefaults.makeReadyCapexPercent || 0);

  const effectiveProceeds = 1 - totalSellingCosts;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Underwriting Assumptions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
            Sale Price Methodology
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Methodology</Label>
              <Select
                value={localDefaults.salePriceMethodology}
                onValueChange={(value) =>
                  handleChange('salePriceMethodology', value as UnderwritingDefaultValues['salePriceMethodology'])
                }
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cap Rate Based">Cap Rate Based</SelectItem>
                  <SelectItem value="Comp Based">Comp Based</SelectItem>
                  <SelectItem value="Flat Price Input">Flat Price Input</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cap Rate</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={((localDefaults.capRate || 0) * 100).toFixed(2)}
                  onChange={(e) => handlePercentChange('capRate', e.target.value)}
                  disabled={readOnly}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Discount to Market</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={((localDefaults.discountToMarket || 0) * 100).toFixed(2)}
                  onChange={(e) => handlePercentChange('discountToMarket', e.target.value)}
                  disabled={readOnly}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Selling Costs</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Broker Fee</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={((localDefaults.brokerFeePercent || 0) * 100).toFixed(2)}
                  onChange={(e) => handlePercentChange('brokerFeePercent', e.target.value)}
                  disabled={readOnly}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Closing Costs</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={((localDefaults.closingCostPercent || 0) * 100).toFixed(2)}
                  onChange={(e) => handlePercentChange('closingCostPercent', e.target.value)}
                  disabled={readOnly}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Seller Concessions</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={((localDefaults.sellerConcessionsPercent || 0) * 100).toFixed(2)}
                  onChange={(e) => handlePercentChange('sellerConcessionsPercent', e.target.value)}
                  disabled={readOnly}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Make Ready/CapEx</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={((localDefaults.makeReadyCapexPercent || 0) * 100).toFixed(2)}
                  onChange={(e) => handlePercentChange('makeReadyCapexPercent', e.target.value)}
                  disabled={readOnly}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Hold Period</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Hold Period (Years)</Label>
              <Input
                type="number"
                step="0.5"
                value={localDefaults.holdPeriodYears || 0}
                onChange={(e) => handleChange('holdPeriodYears', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Selling Costs</span>
            <span className="font-medium">{(totalSellingCosts * 100).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Effective Proceeds</span>
            <span className="font-medium">{(effectiveProceeds * 100).toFixed(2)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
