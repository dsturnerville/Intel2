import { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { DispositionProperty, DispositionDefaults } from '@/types/disposition';
import { formatCurrency, formatPercent, calculatePropertyUnderwriting } from '@/utils/calculations';
import { PropertyUnderwritingEditor } from './PropertyUnderwritingEditor';
import { 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Check, 
  X,
  Home,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface PropertyTableProps {
  properties: DispositionProperty[];
  defaults: DispositionDefaults;
  onRemoveProperty: (propertyId: string) => void;
  onUpdateProperty: (propertyId: string, updates: Partial<DispositionProperty>) => void;
  readOnly?: boolean;
}

export function PropertyTable({
  properties,
  defaults,
  onRemoveProperty,
  onUpdateProperty,
  readOnly = false,
}: PropertyTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const startEditing = (id: string, field: string, currentValue: number) => {
    setEditingCell({ id, field });
    setEditValue(currentValue.toString());
  };

  const saveEdit = (dp: DispositionProperty) => {
    if (!editingCell) return;

    const numValue = parseFloat(editValue);
    if (isNaN(numValue)) {
      setEditingCell(null);
      return;
    }

    // Update the flat sale price and recalculate
    const newInputs = {
      ...dp.inputs,
      useDispositionDefaults: false,
      flatSalePrice: numValue,
      salePriceMethodology: 'Flat Price Input' as const,
    };

    const newOutputs = calculatePropertyUnderwriting(dp.property, newInputs, defaults);

    onUpdateProperty(dp.propertyId, {
      inputs: newInputs,
      outputs: newOutputs,
    });

    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-table-header hover:bg-table-header">
            <TableHead className="w-10"></TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Property
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Beds/Baths
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Occupancy
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Rent
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Basis
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              <span className="flex items-center justify-end gap-1">
                Sale Price
                <Edit2 className="h-3 w-3 text-primary/50" />
              </span>
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Selling Costs
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Net Proceeds
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Gain/Loss
            </TableHead>
            {!readOnly && <TableHead className="w-10"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((dp) => {
            const isExpanded = expandedRows.has(dp.id);
            const isEditing = editingCell?.id === dp.id && editingCell?.field === 'salePrice';
            const gainLoss = dp.outputs.gainLossVsBasis;
            const isGain = gainLoss >= 0;

            return (
              <>
                <TableRow
                  key={dp.id}
                  className="group hover:bg-table-hover transition-colors cursor-pointer"
                  onClick={() => toggleRow(dp.id)}
                >
                  <TableCell className="p-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-md">
                        <Home className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{dp.property.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {dp.property.city}, {dp.property.state} {dp.property.zipCode}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {dp.property.beds}/{dp.property.baths}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        dp.property.occupancyStatus === 'Occupied'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : dp.property.occupancyStatus === 'Vacant'
                          ? 'bg-slate-500/20 text-slate-400'
                          : 'bg-amber-500/20 text-amber-400'
                      )}
                    >
                      {dp.property.occupancyStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(dp.property.currentRent)}/mo
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">
                    {formatCurrency(dp.property.acquisitionBasis)}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-28 h-7 text-right font-mono text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(dp);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => saveEdit(dp)}
                        >
                          <Check className="h-3 w-3 text-emerald-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={cancelEdit}
                        >
                          <X className="h-3 w-3 text-rose-400" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        className={cn(
                          'font-mono text-sm px-2 py-1 rounded border transition-all',
                          !readOnly
                            ? 'border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10 cursor-pointer'
                            : 'border-transparent'
                        )}
                        onClick={() =>
                          !readOnly &&
                          startEditing(dp.id, 'salePrice', dp.outputs.projectedSalePrice)
                        }
                        disabled={readOnly}
                      >
                        {formatCurrency(dp.outputs.projectedSalePrice)}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">
                    {formatCurrency(dp.outputs.totalSellingCosts)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-medium">
                    {formatCurrency(dp.outputs.netSaleProceeds)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isGain ? (
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-rose-400" />
                      )}
                      <span
                        className={cn(
                          'font-mono text-sm font-medium',
                          isGain ? 'text-emerald-400' : 'text-rose-400'
                        )}
                      >
                        {isGain ? '+' : ''}
                        {formatCurrency(gainLoss)}
                      </span>
                    </div>
                  </TableCell>
                  {!readOnly && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveProperty(dp.propertyId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>

                {/* Expanded row with details */}
                {isExpanded && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={readOnly ? 10 : 11} className="p-4 space-y-4">
                      {/* Underwriting Editor */}
                      <PropertyUnderwritingEditor
                        property={dp}
                        defaults={defaults}
                        onUpdate={(updates) => onUpdateProperty(dp.propertyId, updates)}
                        readOnly={readOnly}
                      />
                      
                      <Separator />
                      
                      <div className="grid grid-cols-4 gap-6">
                        {/* Property Details */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Property Details
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-muted-foreground">Sq Ft:</span>{' '}
                              <span className="font-mono">{dp.property.sqft.toLocaleString()}</span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Year Built:</span>{' '}
                              <span className="font-mono">{dp.property.yearBuilt}</span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Acquired:</span>{' '}
                              <span className="font-mono">
                                {new Date(dp.property.acquisitionDate).toLocaleDateString()}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Market Value:</span>{' '}
                              <span className="font-mono">
                                {formatCurrency(dp.property.estimatedMarketValue)}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Selling Costs Breakdown */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Selling Costs
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-muted-foreground">Broker:</span>{' '}
                              <span className="font-mono">
                                {formatCurrency(dp.outputs.brokerCommission)}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Closing:</span>{' '}
                              <span className="font-mono">
                                {formatCurrency(dp.outputs.closingCosts)}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Concessions:</span>{' '}
                              <span className="font-mono">
                                {formatCurrency(dp.outputs.sellerConcessions)}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Make Ready:</span>{' '}
                              <span className="font-mono">
                                {formatCurrency(dp.outputs.makeReadyCapex)}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Returns */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Return Metrics
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-muted-foreground">Simple Return:</span>{' '}
                              <span
                                className={cn(
                                  'font-mono',
                                  dp.outputs.simpleReturn >= 0
                                    ? 'text-emerald-400'
                                    : 'text-rose-400'
                                )}
                              >
                                {formatPercent(dp.outputs.simpleReturn)}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Annualized:</span>{' '}
                              <span
                                className={cn(
                                  'font-mono',
                                  (dp.outputs.annualizedReturn ?? 0) >= 0
                                    ? 'text-emerald-400'
                                    : 'text-rose-400'
                                )}
                              >
                                {dp.outputs.annualizedReturn !== undefined
                                  ? formatPercent(dp.outputs.annualizedReturn)
                                  : 'N/A'}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Hold Period:</span>{' '}
                              <span className="font-mono">
                                {dp.outputs.holdPeriodYears.toFixed(1)} yrs
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Override Status
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-muted-foreground">Using Defaults:</span>{' '}
                              <span className={dp.inputs.useDispositionDefaults ? 'text-emerald-400' : 'text-amber-400'}>
                                {dp.inputs.useDispositionDefaults ? 'Yes' : 'Custom'}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Methodology:</span>{' '}
                              <span className="font-mono text-xs">
                                {dp.inputs.useDispositionDefaults
                                  ? defaults.salePriceMethodology
                                  : dp.inputs.salePriceMethodology || defaults.salePriceMethodology}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
