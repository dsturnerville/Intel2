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

type SortField = 'address' | 'city' | 'type' | 'currentRent' | 'salesAvm';
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
      toast.error('Failed to update opportunity');
    }
  };

  const handleDelete = async (opportunityId: string) => {
    const result = await deleteOpportunity(opportunityId);
    if (result.success) {
      toast.success('Opportunity removed');
    } else {
      toast.error('Failed to remove opportunity');
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
        No opportunities uploaded yet. Click "Upload Opportunities" to add properties.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">Include</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort('address')}
            >
              Address <SortIcon field="address" />
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort('city')}
            >
              City <SortIcon field="city" />
            </TableHead>
            <TableHead>State</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort('type')}
            >
              Type <SortIcon field="type" />
            </TableHead>
            <TableHead>Beds/Baths</TableHead>
            <TableHead>Occupancy</TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort('currentRent')}
            >
              Current Rent <SortIcon field="currentRent" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort('salesAvm')}
            >
              Sales AVM <SortIcon field="salesAvm" />
            </TableHead>
            <TableHead className="w-12"></TableHead>
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
              <TableCell className="font-medium">
                {opportunity.address1}
                {opportunity.address2 && (
                  <span className="text-muted-foreground"> {opportunity.address2}</span>
                )}
              </TableCell>
              <TableCell>{opportunity.city}</TableCell>
              <TableCell>{opportunity.state}</TableCell>
              <TableCell>
                {opportunity.type && (
                  <Badge variant="outline">{opportunity.type}</Badge>
                )}
              </TableCell>
              <TableCell>
                {opportunity.bedrooms || '-'} / {opportunity.bathrooms || '-'}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={opportunity.occupancy === 'Occupied' ? 'default' : 'secondary'}
                >
                  {opportunity.occupancy}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {opportunity.currentRent 
                  ? `$${opportunity.currentRent.toLocaleString()}`
                  : '-'
                }
              </TableCell>
              <TableCell className="text-right">
                {opportunity.salesAvm 
                  ? `$${opportunity.salesAvm.toLocaleString()}`
                  : '-'
                }
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
  );
}
