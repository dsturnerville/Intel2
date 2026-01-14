import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { Opportunity } from '@/types/opportunity';
import { AcquisitionDefaults } from '@/types/acquisition';
import { useOpportunityMutations } from '@/hooks/useOpportunities';
import { OpportunityUnderwritingEditor } from './OpportunityUnderwritingEditor';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OpportunityTableProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  defaults?: AcquisitionDefaults;
}

type SortField = 'address' | 'city' | 'state' | 'zipCode' | 'msa' | 'market' | 'type' | 'bedrooms' | 'bathrooms' | 'squareFeet' | 'yearBuilt' | 'occupancy' | 'askingPrice' | 'currentRent' | 'leaseStart' | 'leaseEnd' | 'annualHoa' | 'propertyTax' | 'rentAvm' | 'salesAvm' | 'offerPrice' | 'projectedNoi' | 'projectedCapRate' | 'totalAcquisitionCost' | 'projectedAnnualReturn';
type SortDirection = 'asc' | 'desc';

const DEFAULT_UNDERWRITING: AcquisitionDefaults = {
  miscIncomePercent: 0.02,
  vacancyBadDebtPercent: 0.05,
  pmFeePercent: 0.08,
  insPremiumRate: 0.004,
  insFactorRate: 1.0,
  insLiabilityPremium: 150,
  replacementCostPerSF: 150,
  lostRent: 0,
  leasingFeePercent: 0.5,
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

export function OpportunityTable({ opportunities, isLoading, defaults = DEFAULT_UNDERWRITING }: OpportunityTableProps) {
  const [sortField, setSortField] = useState<SortField>('address');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { updateOpportunity, deleteOpportunity } = useOpportunityMutations();

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedOpportunities = [...opportunities].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    switch (sortField) {
      case 'address':
        aVal = a.address1;
        bVal = b.address1;
        break;
      case 'city':
        aVal = a.city;
        bVal = b.city;
        break;
      case 'state':
        aVal = a.state;
        bVal = b.state;
        break;
      case 'zipCode':
        aVal = a.zipCode;
        bVal = b.zipCode;
        break;
      case 'msa':
        aVal = a.msa || '';
        bVal = b.msa || '';
        break;
      case 'market':
        aVal = a.marketName || '';
        bVal = b.marketName || '';
        break;
      case 'type':
        aVal = a.type || '';
        bVal = b.type || '';
        break;
      case 'bedrooms':
        aVal = a.bedrooms || 0;
        bVal = b.bedrooms || 0;
        break;
      case 'bathrooms':
        aVal = a.bathrooms || 0;
        bVal = b.bathrooms || 0;
        break;
      case 'squareFeet':
        aVal = a.squareFeet || 0;
        bVal = b.squareFeet || 0;
        break;
      case 'yearBuilt':
        aVal = a.yearBuilt || 0;
        bVal = b.yearBuilt || 0;
        break;
      case 'occupancy':
        aVal = a.occupancy || '';
        bVal = b.occupancy || '';
        break;
      case 'askingPrice':
        aVal = a.askingPrice || 0;
        bVal = b.askingPrice || 0;
        break;
      case 'currentRent':
        aVal = a.currentRent || 0;
        bVal = b.currentRent || 0;
        break;
      case 'leaseStart':
        aVal = a.leaseStart || '';
        bVal = b.leaseStart || '';
        break;
      case 'leaseEnd':
        aVal = a.leaseEnd || '';
        bVal = b.leaseEnd || '';
        break;
      case 'annualHoa':
        aVal = a.annualHoa || 0;
        bVal = b.annualHoa || 0;
        break;
      case 'propertyTax':
        aVal = a.propertyTax || 0;
        bVal = b.propertyTax || 0;
        break;
      case 'rentAvm':
        aVal = a.rentAvm || 0;
        bVal = b.rentAvm || 0;
        break;
      case 'salesAvm':
        aVal = a.salesAvm || 0;
        bVal = b.salesAvm || 0;
        break;
      case 'offerPrice':
        aVal = a.offerPrice || 0;
        bVal = b.offerPrice || 0;
        break;
      case 'projectedNoi':
        aVal = a.projectedNoi || 0;
        bVal = b.projectedNoi || 0;
        break;
      case 'projectedCapRate':
        aVal = a.projectedCapRate || 0;
        bVal = b.projectedCapRate || 0;
        break;
      case 'totalAcquisitionCost':
        aVal = a.totalAcquisitionCost || 0;
        bVal = b.totalAcquisitionCost || 0;
        break;
      case 'projectedAnnualReturn':
        aVal = a.projectedAnnualReturn || 0;
        bVal = b.projectedAnnualReturn || 0;
        break;
    }

    if (typeof aVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal);
    }
    return sortDirection === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal;
  });

  const handleToggleIncluded = async (opportunity: Opportunity, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await updateOpportunity(opportunity.id, { included: !opportunity.included });
    if (!result.success) {
      toast.error('Failed to update property');
    }
  };

  const handleDelete = async (opportunityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await deleteOpportunity(opportunityId);
    if (result.success) {
      toast.success('Property removed');
    } else {
      toast.error('Failed to remove property');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  const SortableHeader = ({ field, children, className = '' }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/80 whitespace-nowrap ${className}`}
      onClick={() => handleSort(field)}
    >
      {children} <SortIcon field={field} />
    </TableHead>
  );

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return `$${value.toLocaleString()}`;
  };

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return `${value.toFixed(2)}%`;
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No units uploaded yet. Click "Upload Properties" to add units.
      </div>
    );
  }

  return (
    <div className="border rounded-lg w-full max-w-full overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10 whitespace-nowrap"></TableHead>
              <TableHead className="w-12 whitespace-nowrap sticky left-0 bg-muted/50 z-10">Include</TableHead>
              <SortableHeader field="address">Address</SortableHeader>
              <SortableHeader field="city">City</SortableHeader>
              <SortableHeader field="state">State</SortableHeader>
              <SortableHeader field="market">Market</SortableHeader>
              <SortableHeader field="occupancy">Occupancy</SortableHeader>
              <SortableHeader field="askingPrice" className="text-right">Asking Price</SortableHeader>
              <SortableHeader field="currentRent" className="text-right">Current Rent</SortableHeader>
              <SortableHeader field="offerPrice" className="text-right">Offer Price</SortableHeader>
              <SortableHeader field="projectedNoi" className="text-right">Projected NOI</SortableHeader>
              <SortableHeader field="projectedCapRate" className="text-right">Cap Rate</SortableHeader>
              <TableHead className="w-12 whitespace-nowrap sticky right-0 bg-muted/50 z-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOpportunities.map((opportunity) => {
              const isExpanded = expandedRows.has(opportunity.id);
              
              return (
                <>
                  <TableRow 
                    key={opportunity.id}
                    className={cn(
                      'group hover:bg-muted/30 transition-colors cursor-pointer',
                      !opportunity.included && 'opacity-50 bg-muted/20'
                    )}
                    onClick={() => toggleRow(opportunity.id)}
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
                    <TableCell className="sticky left-0 bg-background z-10" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={opportunity.included}
                        onCheckedChange={() => handleToggleIncluded(opportunity, { stopPropagation: () => {} } as React.MouseEvent)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md">
                          <Home className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{opportunity.address1}</p>
                          <p className="text-xs text-muted-foreground">
                            {opportunity.city}, {opportunity.state} {opportunity.zipCode}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{opportunity.city}</TableCell>
                    <TableCell className="whitespace-nowrap">{opportunity.state}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{opportunity.marketName || '-'}</TableCell>
                    <TableCell>
                      {opportunity.occupancy ? (
                        <Badge 
                          variant={opportunity.occupancy === 'Occupied' ? 'default' : 'secondary'}
                        >
                          {opportunity.occupancy}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap font-mono">{formatCurrency(opportunity.askingPrice)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap font-mono">{formatCurrency(opportunity.currentRent)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap font-mono font-semibold">{formatCurrency(opportunity.offerPrice)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap font-mono">{formatCurrency(opportunity.projectedNoi)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap font-mono text-primary font-semibold">{formatPercent(opportunity.projectedCapRate)}</TableCell>
                    <TableCell className="sticky right-0 bg-background z-10" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(opportunity.id, e)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Expanded row with details */}
                  {isExpanded && (
                    <TableRow key={`${opportunity.id}-expanded`} className="bg-muted/30">
                      <TableCell colSpan={13} className="p-4">
                        <OpportunityUnderwritingEditor
                          opportunity={opportunity}
                          defaults={defaults}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
