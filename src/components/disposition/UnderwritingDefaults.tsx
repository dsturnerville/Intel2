import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { DispositionDefaults, SalePriceMethodology } from '@/types/disposition';
import { formatPercent } from '@/utils/calculations';
import { Settings, RefreshCw } from 'lucide-react';

interface UnderwritingDefaultsProps {
  defaults: DispositionDefaults;
  onUpdate: (defaults: DispositionDefaults) => void;
  onApplyToAll: () => void;
  readOnly?: boolean;
}

export function UnderwritingDefaults({
  defaults,
  onUpdate,
  onApplyToAll,
  readOnly = false,
}: UnderwritingDefaultsProps) {
  const [localDefaults, setLocalDefaults] = useState(defaults);

  const handleChange = (field: keyof DispositionDefaults, value: string | number) => {
    const newDefaults = { ...localDefaults, [field]: value };
    setLocalDefaults(newDefaults);
    onUpdate(newDefaults);
  };

  const handlePercentChange = (field: keyof DispositionDefaults, value: string) => {
    const numValue = parseFloat(value) / 100;
    if (!isNaN(numValue)) {
      handleChange(field, numValue);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">
              Underwriting Assumptions
            </CardTitle>
          </div>
          {!readOnly && (
            <Button
              variant="subtle"
              size="sm"
              onClick={onApplyToAll}
              className="gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Apply to All Properties
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          These assumptions apply to all properties unless overridden individually
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sale Price Methodology */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Sale Price Methodology</Label>
            <Select
              value={localDefaults.salePriceMethodology}
              onValueChange={(value) =>
                handleChange('salePriceMethodology', value as SalePriceMethodology)
              }
              disabled={readOnly}
            >
              <SelectTrigger className="bg-input border-border">
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
            <Label className="text-xs text-muted-foreground">Cap Rate (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={(localDefaults.capRate * 100).toFixed(1)}
              onChange={(e) => handlePercentChange('capRate', e.target.value)}
              className="bg-input border-border font-mono"
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Discount to Market (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={(localDefaults.discountToMarketValue * 100).toFixed(1)}
              onChange={(e) => handlePercentChange('discountToMarketValue', e.target.value)}
              className="bg-input border-border font-mono"
              disabled={readOnly}
            />
          </div>
        </div>

        {/* Selling Costs */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Selling Costs
          </h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Broker Fee (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={(localDefaults.brokerFeePercent * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('brokerFeePercent', e.target.value)}
                className="bg-input border-border font-mono"
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Closing Costs (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={(localDefaults.closingCostPercent * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('closingCostPercent', e.target.value)}
                className="bg-input border-border font-mono"
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Seller Concessions (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={(localDefaults.sellerConcessionsPercent * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('sellerConcessionsPercent', e.target.value)}
                className="bg-input border-border font-mono"
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Make Ready / CapEx (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={(localDefaults.makeReadyCapexPercent * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('makeReadyCapexPercent', e.target.value)}
                className="bg-input border-border font-mono"
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Holding Period */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Holding Period (months)</Label>
            <Input
              type="number"
              value={localDefaults.holdingPeriodMonths}
              onChange={(e) => handleChange('holdingPeriodMonths', parseInt(e.target.value) || 0)}
              className="bg-input border-border font-mono"
              disabled={readOnly}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>
              <strong className="text-foreground">Total Selling Costs:</strong>{' '}
              {formatPercent(
                localDefaults.brokerFeePercent +
                  localDefaults.closingCostPercent +
                  localDefaults.sellerConcessionsPercent +
                  localDefaults.makeReadyCapexPercent
              )}
            </span>
            <span>
              <strong className="text-foreground">Effective Proceeds:</strong>{' '}
              {formatPercent(
                1 -
                  (localDefaults.brokerFeePercent +
                    localDefaults.closingCostPercent +
                    localDefaults.sellerConcessionsPercent +
                    localDefaults.makeReadyCapexPercent +
                    localDefaults.discountToMarketValue)
              )}{' '}
              of market value
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
