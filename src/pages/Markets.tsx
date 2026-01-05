import { useState } from 'react';
import { useMarkets, useMarketMutations, Market, MarketInsert } from '@/hooks/useMarkets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';

const DEFAULT_MARKET: MarketInsert = {
  market_name: '',
  market_code: null,
  misc_income_percent: 0.02,
  vacancy_percent: 0.05,
  bad_debt_percent: 0.01,
  pm_fee_percent: 0.08,
  leasing_fee_percent: 0.5,
  cm_fee_percent: 0.02,
  closing_costs_percent: 0.02,
  ins_premium_rate_percent: 0.004,
  ins_factor_rate_percent: 1.0,
  ins_liability_premium: 150,
  replacement_cost_sf: 150,
  lost_rent: 0,
  utilities: 0,
  repairs_maintenance_percent: 0.05,
  turnover_costs: 2500,
  turnover_rate_percent: 0.25,
  blended_turnover: 625,
};

export default function Markets() {
  const { data: markets, isLoading } = useMarkets();
  const { createMarket, updateMarket, deleteMarket } = useMarketMutations();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [deletingMarket, setDeletingMarket] = useState<Market | null>(null);
  const [formData, setFormData] = useState<MarketInsert>(DEFAULT_MARKET);
  // Track raw input values for percent fields during editing
  const [percentInputs, setPercentInputs] = useState<Record<string, string>>({});

  const openCreate = () => {
    setEditingMarket(null);
    setFormData(DEFAULT_MARKET);
    setPercentInputs({});
    setIsFormOpen(true);
  };

  const openEdit = (market: Market) => {
    setEditingMarket(market);
    setFormData({
      market_name: market.market_name,
      market_code: market.market_code,
      misc_income_percent: market.misc_income_percent,
      vacancy_percent: market.vacancy_percent,
      bad_debt_percent: market.bad_debt_percent,
      pm_fee_percent: market.pm_fee_percent,
      leasing_fee_percent: market.leasing_fee_percent,
      cm_fee_percent: market.cm_fee_percent,
      closing_costs_percent: market.closing_costs_percent,
      ins_premium_rate_percent: market.ins_premium_rate_percent,
      ins_factor_rate_percent: market.ins_factor_rate_percent,
      ins_liability_premium: market.ins_liability_premium,
      replacement_cost_sf: market.replacement_cost_sf,
      lost_rent: market.lost_rent,
      utilities: market.utilities,
      repairs_maintenance_percent: market.repairs_maintenance_percent,
      turnover_costs: market.turnover_costs,
      turnover_rate_percent: market.turnover_rate_percent,
      blended_turnover: market.blended_turnover,
    });
    setPercentInputs({});
    setIsFormOpen(true);
  };

  const openDelete = (market: Market) => {
    setDeletingMarket(market);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.market_name.trim()) return;

    if (editingMarket) {
      await updateMarket.mutateAsync({ id: editingMarket.id, updates: formData });
    } else {
      await createMarket.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingMarket) return;
    await deleteMarket.mutateAsync(deletingMarket.id);
    setIsDeleteOpen(false);
    setDeletingMarket(null);
  };

  const updateField = (field: keyof MarketInsert, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePercentChange = (field: keyof MarketInsert, value: string) => {
    // Store raw input value for display
    setPercentInputs(prev => ({ ...prev, [field]: value }));
    
    // Update formData with parsed value
    if (value === '' || value === '-') {
      setFormData(prev => ({ ...prev, [field]: null }));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setFormData(prev => ({ ...prev, [field]: numValue / 100 }));
      }
    }
  };

  const handlePercentBlur = (field: keyof MarketInsert) => {
    // On blur, clear the raw input so it shows the formatted value
    setPercentInputs(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleCurrencyChange = (field: keyof MarketInsert, value: string) => {
    if (value === '' || value === '-') {
      setFormData(prev => ({ ...prev, [field]: null }));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setFormData(prev => ({ ...prev, [field]: numValue }));
      }
    }
  };

  const getPercentDisplayValue = (field: keyof MarketInsert): string => {
    // If we have a raw input value (user is typing), show that
    if (field in percentInputs) {
      return percentInputs[field];
    }
    // Otherwise show formatted value
    const value = formData[field] as number | null | undefined;
    if (value === null || value === undefined) return '';
    return (value * 100).toFixed(2);
  };

  const getCurrencyDisplayValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return '-';
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return `$${value.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Markets</h1>
          <p className="text-muted-foreground">Manage MSA-level underwriting defaults</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Market
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Market List
          </CardTitle>
          <CardDescription>
            {markets?.length || 0} market{markets?.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {markets && markets.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Vacancy</TableHead>
                    <TableHead className="text-right">PM Fee</TableHead>
                    <TableHead className="text-right">CM Fee</TableHead>
                    <TableHead className="text-right">Closing Costs</TableHead>
                    <TableHead className="text-right">R&M</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {markets.map((market) => (
                    <TableRow key={market.id}>
                      <TableCell className="font-medium">{market.market_name}</TableCell>
                      <TableCell>{market.market_code || '-'}</TableCell>
                      <TableCell className="text-right">{formatPercent(market.vacancy_percent)}</TableCell>
                      <TableCell className="text-right">{formatPercent(market.pm_fee_percent)}</TableCell>
                      <TableCell className="text-right">{formatPercent(market.cm_fee_percent)}</TableCell>
                      <TableCell className="text-right">{formatPercent(market.closing_costs_percent)}</TableCell>
                      <TableCell className="text-right">{formatPercent(market.repairs_maintenance_percent)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(market)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDelete(market)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No markets configured yet.</p>
              <p className="text-sm">Click "Add Market" to create your first market.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingMarket ? 'Edit Market' : 'Add Market'}</DialogTitle>
            <DialogDescription>
              {editingMarket ? 'Update market underwriting defaults' : 'Create a new market with underwriting defaults'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="market_name">Market Name (MSA) *</Label>
                  <Input
                    id="market_name"
                    value={formData.market_name}
                    onChange={(e) => updateField('market_name', e.target.value)}
                    placeholder="e.g., Dallas-Fort Worth-Arlington"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="market_code">Market Code</Label>
                  <Input
                    id="market_code"
                    value={formData.market_code || ''}
                    onChange={(e) => updateField('market_code', e.target.value || null)}
                    placeholder="e.g., DFW"
                  />
                </div>
              </div>

              {/* Income & Vacancy */}
              <div>
                <h4 className="text-sm font-medium mb-3">Income & Vacancy</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="misc_income_percent">Misc Income (%)</Label>
                    <Input
                      id="misc_income_percent"
                      type="text"
                      inputMode="decimal"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={getPercentDisplayValue('misc_income_percent')}
                      onChange={(e) => handlePercentChange('misc_income_percent', e.target.value)}
                      onBlur={() => handlePercentBlur('misc_income_percent')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vacancy_percent">Vacancy (%)</Label>
                    <Input
                      id="vacancy_percent"
                      type="text"
                      inputMode="decimal"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={getPercentDisplayValue('vacancy_percent')}
                      onChange={(e) => handlePercentChange('vacancy_percent', e.target.value)}
                      onBlur={() => handlePercentBlur('vacancy_percent')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bad_debt_percent">Bad Debt (%)</Label>
                    <Input
                      id="bad_debt_percent"
                      type="text"
                      inputMode="decimal"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={getPercentDisplayValue('bad_debt_percent')}
                      onChange={(e) => handlePercentChange('bad_debt_percent', e.target.value)}
                      onBlur={() => handlePercentBlur('bad_debt_percent')}
                    />
                  </div>
                </div>
              </div>

              {/* Management Fees */}
              <div>
                <h4 className="text-sm font-medium mb-3">Management & Fees</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pm_fee_percent">PM Fee (%)</Label>
                    <Input
                      id="pm_fee_percent"
                      type="text"
                      inputMode="decimal"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={getPercentDisplayValue('pm_fee_percent')}
                      onChange={(e) => handlePercentChange('pm_fee_percent', e.target.value)}
                      onBlur={() => handlePercentBlur('pm_fee_percent')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leasing_fee_percent">Leasing Fee (%)</Label>
                    <Input
                      id="leasing_fee_percent"
                      type="text"
                      inputMode="decimal"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={getPercentDisplayValue('leasing_fee_percent')}
                      onChange={(e) => handlePercentChange('leasing_fee_percent', e.target.value)}
                      onBlur={() => handlePercentBlur('leasing_fee_percent')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cm_fee_percent">CM Fee (%)</Label>
                    <Input
                      id="cm_fee_percent"
                      type="text"
                      inputMode="decimal"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={getPercentDisplayValue('cm_fee_percent')}
                      onChange={(e) => handlePercentChange('cm_fee_percent', e.target.value)}
                      onBlur={() => handlePercentBlur('cm_fee_percent')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closing_costs_percent">Closing Costs (%)</Label>
                    <Input
                      id="closing_costs_percent"
                      type="text"
                      inputMode="decimal"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={getPercentDisplayValue('closing_costs_percent')}
                      onChange={(e) => handlePercentChange('closing_costs_percent', e.target.value)}
                      onBlur={() => handlePercentBlur('closing_costs_percent')}
                    />
                  </div>
                </div>
              </div>

              {/* Insurance */}
              <div>
                <h4 className="text-sm font-medium mb-3">Insurance</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ins_premium_rate_percent">Premium Rate (%)</Label>
                    <Input
                      id="ins_premium_rate_percent"
                      type="text"
                      inputMode="decimal"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={getPercentDisplayValue('ins_premium_rate_percent')}
                      onChange={(e) => handlePercentChange('ins_premium_rate_percent', e.target.value)}
                      onBlur={() => handlePercentBlur('ins_premium_rate_percent')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ins_factor_rate_percent">Factor Rate (%)</Label>
                    <Input
                      id="ins_factor_rate_percent"
                      type="text"
                      inputMode="decimal"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={getPercentDisplayValue('ins_factor_rate_percent')}
                      onChange={(e) => handlePercentChange('ins_factor_rate_percent', e.target.value)}
                      onBlur={() => handlePercentBlur('ins_factor_rate_percent')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ins_liability_premium">Liability Premium ($)</Label>
                    <Input
                      id="ins_liability_premium"
                      type="text"
                      inputMode="decimal"
                      value={getCurrencyDisplayValue(formData.ins_liability_premium)}
                      onChange={(e) => handleCurrencyChange('ins_liability_premium', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replacement_cost_sf">Replacement Cost/SF ($)</Label>
                    <Input
                      id="replacement_cost_sf"
                      type="text"
                      inputMode="decimal"
                      value={getCurrencyDisplayValue(formData.replacement_cost_sf)}
                      onChange={(e) => handleCurrencyChange('replacement_cost_sf', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Operating Costs */}
              <div>
                <h4 className="text-sm font-medium mb-3">Operating Costs</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lost_rent">Lost Rent ($)</Label>
                    <Input
                      id="lost_rent"
                      type="text"
                      inputMode="decimal"
                      value={getCurrencyDisplayValue(formData.lost_rent)}
                      onChange={(e) => handleCurrencyChange('lost_rent', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="utilities">Utilities ($)</Label>
                    <Input
                      id="utilities"
                      type="text"
                      inputMode="decimal"
                      value={getCurrencyDisplayValue(formData.utilities)}
                      onChange={(e) => handleCurrencyChange('utilities', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repairs_maintenance_percent">Repairs & Maintenance (%)</Label>
                    <Input
                      id="repairs_maintenance_percent"
                      type="text"
                      inputMode="decimal"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={getPercentDisplayValue('repairs_maintenance_percent')}
                      onChange={(e) => handlePercentChange('repairs_maintenance_percent', e.target.value)}
                      onBlur={() => handlePercentBlur('repairs_maintenance_percent')}
                    />
                  </div>
                </div>
              </div>

              {/* Turnover */}
              <div>
                <h4 className="text-sm font-medium mb-3">Turnover</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="turnover_costs">Turnover Costs ($)</Label>
                    <Input
                      id="turnover_costs"
                      type="text"
                      inputMode="decimal"
                      value={getCurrencyDisplayValue(formData.turnover_costs)}
                      onChange={(e) => handleCurrencyChange('turnover_costs', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="turnover_rate_percent">Turnover Rate (%)</Label>
                    <Input
                      id="turnover_rate_percent"
                      type="text"
                      inputMode="decimal"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={getPercentDisplayValue('turnover_rate_percent')}
                      onChange={(e) => handlePercentChange('turnover_rate_percent', e.target.value)}
                      onBlur={() => handlePercentBlur('turnover_rate_percent')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blended_turnover">Blended Turnover ($)</Label>
                    <Input
                      id="blended_turnover"
                      type="text"
                      inputMode="decimal"
                      value={getCurrencyDisplayValue(formData.blended_turnover)}
                      onChange={(e) => handleCurrencyChange('blended_turnover', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.market_name.trim() || createMarket.isPending || updateMarket.isPending}
            >
              {editingMarket ? 'Save Changes' : 'Create Market'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Market</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingMarket?.market_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
