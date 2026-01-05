import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Opportunity } from '@/types/opportunity';
import { useOpportunityMutations } from '@/hooks/useOpportunities';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface OpportunityTableProps {
  opportunities: Opportunity[];
  isLoading: boolean;
}

type SortField = 'address' | 'city' | 'state' | 'type' | 'currentRent' | 'salesAvm' | 'rentAvm' | 'offerPrice';
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
      case 'type':
        aVal = a.type || '';
        bVal = b.type || '';
        break;
      case 'currentRent':
        aVal = a.currentRent || 0;
        bVal = b.currentRent || 0;
        break;
      case 'salesAvm':
        aVal = a.salesAvm || 0;
        bVal = b.salesAvm || 0;
        break;
      case 'rentAvm':
        aVal = a.rentAvm || 0;
        bVal = b.rentAvm || 0;
        break;
      case 'offerPrice':
        aVal = a.offerPrice || 0;
        bVal = b.offerPrice || 0;
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

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return '-';
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'MM/dd/yyyy');
    } catch {
      return '-';
    }
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
    <div className="w-full max-w-full border rounded-lg overflow-hidden">
      <div className="max-w-full overflow-x-auto min-w-0">
        <Table className="min-w-[2200px]">
          <TableHeader>
            <TableRow className="bg-muted/50">
            <TableHead className="w-12 whitespace-nowrap">Include</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/80 whitespace-nowrap"
              onClick={() => handleSort('address')}
            >
              Address <SortIcon field="address" />
            </TableHead>
            <TableHead className="whitespace-nowrap">Address 2</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/80 whitespace-nowrap"
              onClick={() => handleSort('city')}
            >
              City <SortIcon field="city" />
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/80 whitespace-nowrap"
              onClick={() => handleSort('state')}
            >
              State <SortIcon field="state" />
            </TableHead>
            <TableHead className="whitespace-nowrap">Zip Code</TableHead>
            <TableHead className="whitespace-nowrap">MSA</TableHead>
            <TableHead className="whitespace-nowrap text-center">Beds</TableHead>
            <TableHead className="whitespace-nowrap text-center">Baths</TableHead>
            <TableHead className="whitespace-nowrap text-right">Sq Ft</TableHead>
            <TableHead className="whitespace-nowrap text-center">Year Built</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/80 whitespace-nowrap"
              onClick={() => handleSort('type')}
            >
              Type <SortIcon field="type" />
            </TableHead>
            <TableHead className="whitespace-nowrap">Occupancy</TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/80 whitespace-nowrap"
              onClick={() => handleSort('currentRent')}
            >
              Current Rent <SortIcon field="currentRent" />
            </TableHead>
            <TableHead className="whitespace-nowrap">Lease Start</TableHead>
            <TableHead className="whitespace-nowrap">Lease End</TableHead>
            <TableHead className="text-right whitespace-nowrap">Annual HOA</TableHead>
            <TableHead className="text-right whitespace-nowrap">Property Tax</TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/80 whitespace-nowrap"
              onClick={() => handleSort('rentAvm')}
            >
              Rent AVM <SortIcon field="rentAvm" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/80 whitespace-nowrap"
              onClick={() => handleSort('salesAvm')}
            >
              Sales AVM <SortIcon field="salesAvm" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/80 whitespace-nowrap"
              onClick={() => handleSort('offerPrice')}
            >
              Offer Price <SortIcon field="offerPrice" />
            </TableHead>
            <TableHead className="w-12 whitespace-nowrap"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOpportunities.map((opportunity) => (
            <TableRow 
              key={opportunity.id}
              className={!opportunity.included ? 'opacity-50 bg-muted/20' : ''}
            >
              <TableCell>
                <Checkbox
                  checked={opportunity.included}
                  onCheckedChange={() => handleToggleIncluded(opportunity)}
                />
              </TableCell>
              <TableCell className="font-medium whitespace-nowrap">
                {opportunity.address1}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {opportunity.address2 || '-'}
              </TableCell>
              <TableCell className="whitespace-nowrap">{opportunity.city}</TableCell>
              <TableCell className="whitespace-nowrap">{opportunity.state}</TableCell>
              <TableCell className="whitespace-nowrap">{opportunity.zipCode}</TableCell>
              <TableCell className="whitespace-nowrap">{opportunity.msa || '-'}</TableCell>
              <TableCell className="text-center">{opportunity.bedrooms || '-'}</TableCell>
              <TableCell className="text-center">{opportunity.bathrooms || '-'}</TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {opportunity.squareFeet?.toLocaleString() || '-'}
              </TableCell>
              <TableCell className="text-center">{opportunity.yearBuilt || '-'}</TableCell>
              <TableCell>
                {opportunity.type ? (
                  <Badge variant="outline">{opportunity.type}</Badge>
                ) : '-'}
              </TableCell>
              <TableCell>
                {opportunity.occupancy ? (
                  <Badge 
                    variant={opportunity.occupancy === 'Occupied' ? 'default' : 'secondary'}
                  >
                    {opportunity.occupancy}
                  </Badge>
                ) : '-'}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {formatCurrency(opportunity.currentRent)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(opportunity.leaseStart)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(opportunity.leaseEnd)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {formatCurrency(opportunity.annualHoa)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {formatCurrency(opportunity.propertyTax)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {formatCurrency(opportunity.rentAvm)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {formatCurrency(opportunity.salesAvm)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {formatCurrency(opportunity.offerPrice)}
              </TableCell>
              <TableCell>
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
