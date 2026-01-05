import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Checkbox } from '@/components/ui/checkbox';
import { AcquisitionUnderwritingDefaults } from '@/components/acquisition/AcquisitionUnderwritingDefaults';
import { useAcquisitionMutations } from '@/hooks/useAcquisitions';
import { useMarkets } from '@/hooks/useDispositions';
import { AcquisitionDefaults, AcquisitionType } from '@/types/acquisition';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_UNDERWRITING: AcquisitionDefaults = {
  miscIncomePercent: 0.02,
  vacancyBadDebtPercent: 0.05,
  pmFeePercent: 0.08,
  insPremiumRate: 0.004,
  insFactorRate: 1.0,
  insLiabilityPremium: 150,
  replacementCostPerSF: 150,
  lostRent: 0,
  leasingFeePercent: 0.005,
  utilities: 0,
  turnoverCost: 2500,
  turnoverRatePercent: 0.25,
  blendedTurnover: 625,
  effectiveTaxRatePercent: 0.012,
  taxIncreasePercent: 0.03,
  rmPercent: 0.05,
  turnCost: 2500,
  cmFeePercent: 0.02,
  closingCostsPercent: 0.02,
};

const TYPES: AcquisitionType[] = ['Single Property', 'Portfolio', 'Bulk Purchase'];

export default function NewAcquisition() {
  const navigate = useNavigate();
  const { createAcquisition, saving } = useAcquisitionMutations();
  const { markets } = useMarkets();

  const [name, setName] = useState('');
  const [type, setType] = useState<AcquisitionType>('Single Property');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [targetCloseDate, setTargetCloseDate] = useState('');
  const [investmentThesis, setInvestmentThesis] = useState('');
  const [strategyNotes, setStrategyNotes] = useState('');
  const [defaults, setDefaults] = useState<AcquisitionDefaults>(DEFAULT_UNDERWRITING);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const toggleMarket = (market: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(market) ? prev.filter((m) => m !== market) : [...prev, market]
    );
  };

  const handleSubmit = async () => {
    // Validate
    const newErrors: { name?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const result = await createAcquisition({
      name: name.trim(),
      type,
      markets: selectedMarkets,
      targetCloseDate: targetCloseDate || undefined,
      investmentThesis: investmentThesis || undefined,
      strategyNotes: strategyNotes || undefined,
      defaults,
    });

    if (result.success && result.id) {
      toast.success('Acquisition created');
      navigate(`/acquisitions/${result.id}`);
    } else {
      toast.error(result.error || 'Failed to create acquisition');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/acquisitions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">New Acquisition</h1>
            <p className="text-muted-foreground">Create a new acquisition scenario</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create Acquisition
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Q1 2026 Dallas Portfolio"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as AcquisitionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Target Close Date</Label>
            <Input
              type="date"
              value={targetCloseDate}
              onChange={(e) => setTargetCloseDate(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="space-y-2">
            <Label>Markets</Label>
            <div className="flex flex-wrap gap-2">
              {markets.map((market) => (
                <div
                  key={market}
                  className="flex items-center gap-2 px-3 py-1.5 border rounded-full cursor-pointer hover:bg-muted"
                  onClick={() => toggleMarket(market)}
                >
                  <Checkbox checked={selectedMarkets.includes(market)} />
                  <span className="text-sm">{market}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Strategy & Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Investment Thesis</Label>
            <Textarea
              placeholder="Describe the investment thesis..."
              value={investmentThesis}
              onChange={(e) => setInvestmentThesis(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Strategy Notes</Label>
            <Textarea
              placeholder="Additional notes..."
              value={strategyNotes}
              onChange={(e) => setStrategyNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Underwriting Defaults */}
      <AcquisitionUnderwritingDefaults
        defaults={defaults}
        onUpdate={setDefaults}
      />
    </div>
  );
}
