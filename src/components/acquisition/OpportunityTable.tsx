import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Opportunity } from '@/types/opportunity';
import { useOpportunityMutations } from '@/hooks/useOpportunities';
import { toast } from 'sonner';

interface OpportunityTableProps {
  opportunities: Opportunity[];
  isLoading: boolean;
}

type SortField = 'address' | 'city' | 'state' | 'zipCode' | 'msa' | 'type' | 'bedrooms' | 'bathrooms' | 'squareFeet' | 'yearBuilt' | 'occupancy' | 'askingPrice' | 'currentRent' | 'leaseStart' | 'leaseEnd' | 'annualHoa' | 'propertyTax' | 'rentAvm' | 'salesAvm' | 'offerPrice' | 'projectedNoi' | 'projectedCapRate' | 'totalAcquisitionCost' | 'projectedAnnualReturn';
type SortDirection = 'asc' | 'desc';

export function OpportunityTable({ opportunities, isLoading }: OpportunityTableProps) {
  const [sortField, setSortField] = useState<SortField>('address');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { updateOpportunity, deleteOpportunity } = useOpportunityMutations();

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

  const handleToggleIncluded = async (opportunity: Opportunity) => {
    const result = await updateOpportunity(opportunity.id, { included: !opportunity.included });
    if (!result.success) {
      toast.error('Failed to update property');
    }
  };

  const handleDelete = async (opportunityId: string) => {
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
        No properties uploaded yet. Click "Upload Properties" to add properties.
      </div>
    );
  }

  return (
    <div className="border rounded-lg w-full max-w-full overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12 whitespace-nowrap sticky left-0 bg-muted/50 z-10">Include</TableHead>
              <SortableHeader field="address">Address</SortableHeader>
              <SortableHeader field="city">City</SortableHeader>
              <SortableHeader field="state">State</SortableHeader>
              <SortableHeader field="zipCode">Zip Code</SortableHeader>
              <SortableHeader field="msa">MSA</SortableHeader>
              <SortableHeader field="type">Type</SortableHeader>
              <SortableHeader field="bedrooms">Beds</SortableHeader>
              <SortableHeader field="bathrooms">Baths</SortableHeader>
              <SortableHeader field="squareFeet">Sq Ft</SortableHeader>
              <SortableHeader field="yearBuilt">Year Built</SortableHeader>
              <SortableHeader field="occupancy">Occupancy</SortableHeader>
              <SortableHeader field="askingPrice" className="text-right">Asking Price</SortableHeader>
              <SortableHeader field="currentRent" className="text-right">Current Rent</SortableHeader>
              <SortableHeader field="leaseStart">Lease Start</SortableHeader>
              <SortableHeader field="leaseEnd">Lease End</SortableHeader>
              <SortableHeader field="annualHoa" className="text-right">Annual HOA</SortableHeader>
              <SortableHeader field="propertyTax" className="text-right">Property Tax</SortableHeader>
              <SortableHeader field="rentAvm" className="text-right">Rent AVM</SortableHeader>
              <SortableHeader field="salesAvm" className="text-right">Sales AVM</SortableHeader>
              <SortableHeader field="offerPrice" className="text-right">Offer Price</SortableHeader>
              <SortableHeader field="projectedNoi" className="text-right">Projected NOI</SortableHeader>
              <SortableHeader field="projectedCapRate" className="text-right">Cap Rate</SortableHeader>
              <SortableHeader field="totalAcquisitionCost" className="text-right">Total Acq Cost</SortableHeader>
              <SortableHeader field="projectedAnnualReturn" className="text-right">Annual Return</SortableHeader>
              <TableHead className="w-12 whitespace-nowrap sticky right-0 bg-muted/50 z-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOpportunities.map((opportunity) => (
              <TableRow 
                key={opportunity.id}
                className={!opportunity.included ? 'opacity-50 bg-muted/20' : ''}
              >
                <TableCell className="sticky left-0 bg-background z-10">
                  <Checkbox
                    checked={opportunity.included}
                    onCheckedChange={() => handleToggleIncluded(opportunity)}
                  />
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                  {opportunity.address1}
                  {opportunity.address2 && (
                    <span className="text-muted-foreground"> {opportunity.address2}</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">{opportunity.city}</TableCell>
                <TableCell className="whitespace-nowrap">{opportunity.state}</TableCell>
                <TableCell className="whitespace-nowrap">{opportunity.zipCode}</TableCell>
                <TableCell className="whitespace-nowrap">{opportunity.msa || '-'}</TableCell>
                <TableCell>
                  {opportunity.type ? (
                    <Badge variant="outline">{opportunity.type}</Badge>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-center">{opportunity.bedrooms ?? '-'}</TableCell>
                <TableCell className="text-center">{opportunity.bathrooms ?? '-'}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {opportunity.squareFeet ? opportunity.squareFeet.toLocaleString() : '-'}
                </TableCell>
                <TableCell className="text-center">{opportunity.yearBuilt ?? '-'}</TableCell>
                <TableCell>
                  {opportunity.occupancy ? (
                    <Badge 
                      variant={opportunity.occupancy === 'Occupied' ? 'default' : 'secondary'}
                    >
                      {opportunity.occupancy}
                    </Badge>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(opportunity.askingPrice)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(opportunity.currentRent)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(opportunity.leaseStart)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(opportunity.leaseEnd)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(opportunity.annualHoa)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(opportunity.propertyTax)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(opportunity.rentAvm)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(opportunity.salesAvm)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(opportunity.offerPrice)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(opportunity.projectedNoi)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatPercent(opportunity.projectedCapRate)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatCurrency(opportunity.totalAcquisitionCost)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{formatPercent(opportunity.projectedAnnualReturn)}</TableCell>
                <TableCell className="sticky right-0 bg-background z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(opportunity.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
