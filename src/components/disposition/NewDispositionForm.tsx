import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDispositionMutations, useMarkets } from '@/hooks/useDispositions';
import { DispositionDefaults, DispositionType, SalePriceMethodology } from '@/types/disposition';
import { formatPercent } from '@/utils/calculations';
import { ArrowLeft, Plus, Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Validation schema
const dispositionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  type: z.enum(['Single Property', 'Portfolio']),
  targetListDate: z.string().optional(),
  targetCloseDate: z.string().optional(),
  investmentThesis: z.string().max(2000, 'Investment thesis must be less than 2000 characters').optional(),
  exitStrategyNotes: z.string().max(2000, 'Exit strategy notes must be less than 2000 characters').optional(),
});

const DEFAULT_UNDERWRITING: DispositionDefaults = {
  salePriceMethodology: 'Comp Based',
  capRate: 0.055,
  discountToMarketValue: 0.03,
  brokerFeePercent: 0.05,
  closingCostPercent: 0.02,
  sellerConcessionsPercent: 0.01,
  makeReadyCapexPercent: 0.015,
  holdingPeriodMonths: 3,
};

export function NewDispositionForm() {
  const navigate = useNavigate();
  const { markets } = useMarkets();
  const { createDisposition, saving } = useDispositionMutations();

  const [name, setName] = useState('');
  const [type, setType] = useState<DispositionType>('Single Property');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [targetListDate, setTargetListDate] = useState('');
  const [targetCloseDate, setTargetCloseDate] = useState('');
  const [investmentThesis, setInvestmentThesis] = useState('');
  const [exitStrategyNotes, setExitStrategyNotes] = useState('');
  const [defaults, setDefaults] = useState<DispositionDefaults>(DEFAULT_UNDERWRITING);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDefaultChange = (field: keyof DispositionDefaults, value: string | number) => {
    setDefaults((prev) => ({ ...prev, [field]: value }));
  };

  const handlePercentChange = (field: keyof DispositionDefaults, value: string) => {
    const numValue = parseFloat(value) / 100;
    if (!isNaN(numValue)) {
      handleDefaultChange(field, numValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const validation = dispositionSchema.safeParse({
      name,
      type,
      targetListDate: targetListDate || undefined,
      targetCloseDate: targetCloseDate || undefined,
      investmentThesis: investmentThesis || undefined,
      exitStrategyNotes: exitStrategyNotes || undefined,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const result = await createDisposition({
      name: validation.data.name,
      type: validation.data.type,
      markets: selectedMarkets,
      targetListDate: validation.data.targetListDate,
      targetCloseDate: validation.data.targetCloseDate,
      investmentThesis: validation.data.investmentThesis,
      exitStrategyNotes: validation.data.exitStrategyNotes,
      defaults,
    });

    if (result.success && result.id) {
      toast.success('Disposition created successfully');
      navigate(`/dispositions/${result.id}`);
    } else {
      toast.error(result.error || 'Failed to create disposition');
    }
  };

  const toggleMarket = (market: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(market) ? prev.filter((m) => m !== market) : [...prev, market]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dispositions">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">New Disposition</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Create a new property disposition scenario
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSubmit} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create Disposition
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
          {/* Basic Info */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Disposition Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Q2 2025 Dallas Portfolio Sale"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-input border-border"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={type} onValueChange={(v) => setType(v as DispositionType)}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single Property">Single Property</SelectItem>
                      <SelectItem value="Portfolio">Portfolio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetListDate">Target List Date</Label>
                  <Input
                    id="targetListDate"
                    type="date"
                    value={targetListDate}
                    onChange={(e) => setTargetListDate(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetCloseDate">Target Close Date</Label>
                  <Input
                    id="targetCloseDate"
                    type="date"
                    value={targetCloseDate}
                    onChange={(e) => setTargetCloseDate(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
              </div>

              {markets.length > 0 && (
                <div className="space-y-2">
                  <Label>Markets</Label>
                  <div className="flex flex-wrap gap-2">
                    {markets.map((market) => (
                      <Button
                        key={market}
                        type="button"
                        variant={selectedMarkets.includes(market) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleMarket(market)}
                      >
                        {market}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strategy */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Strategy & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="investmentThesis">Investment Thesis</Label>
                <Textarea
                  id="investmentThesis"
                  placeholder="Why is now the right time to sell these assets?"
                  value={investmentThesis}
                  onChange={(e) => setInvestmentThesis(e.target.value)}
                  className="bg-input border-border min-h-[100px]"
                />
                {errors.investmentThesis && (
                  <p className="text-xs text-destructive">{errors.investmentThesis}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="exitStrategyNotes">Exit Strategy Notes</Label>
                <Textarea
                  id="exitStrategyNotes"
                  placeholder="Additional notes about the exit strategy..."
                  value={exitStrategyNotes}
                  onChange={(e) => setExitStrategyNotes(e.target.value)}
                  className="bg-input border-border min-h-[100px]"
                />
                {errors.exitStrategyNotes && (
                  <p className="text-xs text-destructive">{errors.exitStrategyNotes}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Underwriting Defaults */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Underwriting Defaults</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                These assumptions will apply to all properties added to this disposition
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sale Price Methodology */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Sale Price Methodology</Label>
                  <Select
                    value={defaults.salePriceMethodology}
                    onValueChange={(v) =>
                      handleDefaultChange('salePriceMethodology', v as SalePriceMethodology)
                    }
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
                    value={(defaults.capRate * 100).toFixed(1)}
                    onChange={(e) => handlePercentChange('capRate', e.target.value)}
                    className="bg-input border-border font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Discount to Market (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={(defaults.discountToMarketValue * 100).toFixed(1)}
                    onChange={(e) => handlePercentChange('discountToMarketValue', e.target.value)}
                    className="bg-input border-border font-mono"
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
                      value={(defaults.brokerFeePercent * 100).toFixed(1)}
                      onChange={(e) => handlePercentChange('brokerFeePercent', e.target.value)}
                      className="bg-input border-border font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Closing Costs (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={(defaults.closingCostPercent * 100).toFixed(1)}
                      onChange={(e) => handlePercentChange('closingCostPercent', e.target.value)}
                      className="bg-input border-border font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Seller Concessions (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={(defaults.sellerConcessionsPercent * 100).toFixed(1)}
                      onChange={(e) => handlePercentChange('sellerConcessionsPercent', e.target.value)}
                      className="bg-input border-border font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Make Ready / CapEx (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={(defaults.makeReadyCapexPercent * 100).toFixed(1)}
                      onChange={(e) => handlePercentChange('makeReadyCapexPercent', e.target.value)}
                      className="bg-input border-border font-mono"
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
                    value={defaults.holdingPeriodMonths}
                    onChange={(e) =>
                      handleDefaultChange('holdingPeriodMonths', parseInt(e.target.value) || 0)
                    }
                    className="bg-input border-border font-mono"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <span>
                    <strong className="text-foreground">Total Selling Costs:</strong>{' '}
                    {formatPercent(
                      defaults.brokerFeePercent +
                        defaults.closingCostPercent +
                        defaults.sellerConcessionsPercent +
                        defaults.makeReadyCapexPercent
                    )}
                  </span>
                  <span>
                    <strong className="text-foreground">Effective Proceeds:</strong>{' '}
                    {formatPercent(
                      1 -
                        (defaults.brokerFeePercent +
                          defaults.closingCostPercent +
                          defaults.sellerConcessionsPercent +
                          defaults.makeReadyCapexPercent +
                          defaults.discountToMarketValue)
                    )}{' '}
                    of market value
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Disposition
            </Button>
            <Link to="/dispositions">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
