import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DispositionProperty, 
  DispositionDefaults, 
  PropertyUnderwritingInputs,
  SalePriceMethodology 
} from '@/types/disposition';
import { calculatePropertyUnderwriting, formatPercent } from '@/utils/calculations';
import { Settings, RotateCcw } from 'lucide-react';

interface PropertyUnderwritingEditorProps {
  property: DispositionProperty;
  defaults: DispositionDefaults;
  onUpdate: (updates: Partial<DispositionProperty>) => void;
  readOnly?: boolean;
}

export function PropertyUnderwritingEditor({
  property,
  defaults,
  onUpdate,
  readOnly = false,
}: PropertyUnderwritingEditorProps) {
  const [inputs, setInputs] = useState<PropertyUnderwritingInputs>(property.inputs);

  useEffect(() => {
    setInputs(property.inputs);
  }, [property.inputs]);

  const handleInputChange = (field: keyof PropertyUnderwritingInputs, value: any) => {
    const newInputs = { ...inputs, [field]: value };
    
    // If we're changing any value, we're no longer using defaults
    if (field !== 'useDispositionDefaults') {
      newInputs.useDispositionDefaults = false;
    }
    
    setInputs(newInputs);
    
    // Recalculate outputs
    const newOutputs = calculatePropertyUnderwriting(property.property, newInputs, defaults);
    onUpdate({ inputs: newInputs, outputs: newOutputs });
  };

  const handlePercentChange = (field: keyof PropertyUnderwritingInputs, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      handleInputChange(field, numValue / 100);
    }
  };

  const handleResetToDefaults = () => {
    const newInputs: PropertyUnderwritingInputs = {
      useDispositionDefaults: true,
    };
    setInputs(newInputs);
    
    const newOutputs = calculatePropertyUnderwriting(property.property, newInputs, defaults);
    onUpdate({ inputs: newInputs, outputs: newOutputs });
  };

  const handleToggleDefaults = (useDefaults: boolean) => {
    if (useDefaults) {
      handleResetToDefaults();
    } else {
      // Copy current defaults as starting point for custom values
      const newInputs: PropertyUnderwritingInputs = {
        useDispositionDefaults: false,
        salePriceMethodology: defaults.salePriceMethodology,
        capRate: defaults.capRate,
        discountToMarketValue: defaults.discountToMarketValue,
        brokerFeePercent: defaults.brokerFeePercent,
        closingCostPercent: defaults.closingCostPercent,
        sellerConcessionsPercent: defaults.sellerConcessionsPercent,
        makeReadyCapexPercent: defaults.makeReadyCapexPercent,
        holdingPeriodMonths: defaults.holdingPeriodMonths,
        flatSalePrice: inputs.flatSalePrice,
      };
      setInputs(newInputs);
      
      const newOutputs = calculatePropertyUnderwriting(property.property, newInputs, defaults);
      onUpdate({ inputs: newInputs, outputs: newOutputs });
    }
  };

  // Get effective values (from inputs or defaults)
  const effectiveMethodology = inputs.useDispositionDefaults 
    ? defaults.salePriceMethodology 
    : (inputs.salePriceMethodology ?? defaults.salePriceMethodology);
  const effectiveCapRate = inputs.useDispositionDefaults 
    ? defaults.capRate 
    : (inputs.capRate ?? defaults.capRate);
  const effectiveDiscount = inputs.useDispositionDefaults 
    ? defaults.discountToMarketValue 
    : (inputs.discountToMarketValue ?? defaults.discountToMarketValue);
  const effectiveBrokerFee = inputs.useDispositionDefaults 
    ? defaults.brokerFeePercent 
    : (inputs.brokerFeePercent ?? defaults.brokerFeePercent);
  const effectiveClosingCost = inputs.useDispositionDefaults 
    ? defaults.closingCostPercent 
    : (inputs.closingCostPercent ?? defaults.closingCostPercent);
  const effectiveConcessions = inputs.useDispositionDefaults 
    ? defaults.sellerConcessionsPercent 
    : (inputs.sellerConcessionsPercent ?? defaults.sellerConcessionsPercent);
  const effectiveMakeReady = inputs.useDispositionDefaults 
    ? defaults.makeReadyCapexPercent 
    : (inputs.makeReadyCapexPercent ?? defaults.makeReadyCapexPercent);
  const effectiveHoldingPeriod = inputs.useDispositionDefaults 
    ? defaults.holdingPeriodMonths 
    : (inputs.holdingPeriodMonths ?? defaults.holdingPeriodMonths);

  return (
    <div className="space-y-4">
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
              <Switch
                id={`use-defaults-${property.id}`}
                checked={inputs.useDispositionDefaults}
                onCheckedChange={handleToggleDefaults}
              />
              <Label 
                htmlFor={`use-defaults-${property.id}`}
                className="text-xs cursor-pointer"
              >
                Use Portfolio Defaults
              </Label>
            </div>
            {!inputs.useDispositionDefaults && (
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
      <div className="grid grid-cols-4 gap-4">
        {/* Sale Price Methodology */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Methodology</Label>
          {readOnly || inputs.useDispositionDefaults ? (
            <p className="text-sm font-mono">{effectiveMethodology}</p>
          ) : (
            <Select
              value={effectiveMethodology}
              onValueChange={(value) => handleInputChange('salePriceMethodology', value as SalePriceMethodology)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cap Rate Based">Cap Rate Based</SelectItem>
                <SelectItem value="Comp Based">Comp Based</SelectItem>
                <SelectItem value="Flat Price Input">Flat Price</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Cap Rate - only show if Cap Rate Based */}
        {effectiveMethodology === 'Cap Rate Based' && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Cap Rate</Label>
            {readOnly || inputs.useDispositionDefaults ? (
              <p className="text-sm font-mono">{formatPercent(effectiveCapRate)}</p>
            ) : (
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={(effectiveCapRate * 100).toFixed(1)}
                  onChange={(e) => handlePercentChange('capRate', e.target.value)}
                  className="h-8 text-xs pr-6"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
            )}
          </div>
        )}

        {/* Discount to Market - only show if Comp Based */}
        {effectiveMethodology === 'Comp Based' && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Market Discount</Label>
            {readOnly || inputs.useDispositionDefaults ? (
              <p className="text-sm font-mono">{formatPercent(effectiveDiscount)}</p>
            ) : (
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={(effectiveDiscount * 100).toFixed(1)}
                  onChange={(e) => handlePercentChange('discountToMarketValue', e.target.value)}
                  className="h-8 text-xs pr-6"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
            )}
          </div>
        )}

        {/* Flat Sale Price - only show if Flat Price Input */}
        {effectiveMethodology === 'Flat Price Input' && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Sale Price</Label>
            {readOnly ? (
              <p className="text-sm font-mono">${(inputs.flatSalePrice ?? 0).toLocaleString()}</p>
            ) : (
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="1000"
                  value={inputs.flatSalePrice ?? property.property.estimatedMarketValue}
                  onChange={(e) => handleInputChange('flatSalePrice', parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs pl-5"
                />
              </div>
            )}
          </div>
        )}

        {/* Broker Fee */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Broker Fee</Label>
          {readOnly || inputs.useDispositionDefaults ? (
            <p className="text-sm font-mono">{formatPercent(effectiveBrokerFee)}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                value={(effectiveBrokerFee * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('brokerFeePercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>

        {/* Closing Cost */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Closing Cost</Label>
          {readOnly || inputs.useDispositionDefaults ? (
            <p className="text-sm font-mono">{formatPercent(effectiveClosingCost)}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                value={(effectiveClosingCost * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('closingCostPercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>

        {/* Seller Concessions */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Concessions</Label>
          {readOnly || inputs.useDispositionDefaults ? (
            <p className="text-sm font-mono">{formatPercent(effectiveConcessions)}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                value={(effectiveConcessions * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('sellerConcessionsPercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>

        {/* Make Ready CapEx */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Make Ready</Label>
          {readOnly || inputs.useDispositionDefaults ? (
            <p className="text-sm font-mono">{formatPercent(effectiveMakeReady)}</p>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                value={(effectiveMakeReady * 100).toFixed(1)}
                onChange={(e) => handlePercentChange('makeReadyCapexPercent', e.target.value)}
                className="h-8 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>

        {/* Holding Period */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Hold Period (mo)</Label>
          {readOnly || inputs.useDispositionDefaults ? (
            <p className="text-sm font-mono">{effectiveHoldingPeriod}</p>
          ) : (
            <Input
              type="number"
              step="1"
              value={effectiveHoldingPeriod}
              onChange={(e) => handleInputChange('holdingPeriodMonths', parseInt(e.target.value) || 0)}
              className="h-8 text-xs"
            />
          )}
        </div>
      </div>
    </div>
  );
}
