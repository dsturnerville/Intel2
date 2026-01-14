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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AcquisitionProperty } from '@/types/acquisition';
import { formatCurrency, formatPercent } from '@/utils/acquisitionCalculations';
import { MoreHorizontal, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AcquisitionPropertyTableProps {
  properties: AcquisitionProperty[];
  onRemoveProperty?: (id: string) => void;
  onSelectProperty?: (property: AcquisitionProperty) => void;
}

export function AcquisitionPropertyTable({
  properties,
  onRemoveProperty,
  onSelectProperty,
}: AcquisitionPropertyTableProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No units added yet.</p>
        <p className="text-sm">Add units to start underwriting.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Market</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
            <TableHead className="text-right">Current Rent</TableHead>
            <TableHead className="text-right">Projected NOI</TableHead>
            <TableHead className="text-right">Offer Price</TableHead>
            <TableHead className="text-right">Cap Rate</TableHead>
            <TableHead className="text-right">Annual Return</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((ap) => (
            <TableRow
              key={ap.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectProperty?.(ap)}
            >
              <TableCell>
                <div>
                  <p className="font-medium">{ap.property.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {ap.property.city}, {ap.property.state}
                  </p>
                </div>
              </TableCell>
              <TableCell>{ap.property.market}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(ap.property.estimatedMarketValue)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(ap.property.currentRent)}/mo
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(ap.outputs.projectedNOI)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(ap.outputs.offerPrice)}
              </TableCell>
              <TableCell className="text-right">
                {formatPercent(ap.outputs.projectedCapRate)}
              </TableCell>
              <TableCell className="text-right">
                {formatPercent(ap.outputs.projectedAnnualReturn)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/units/${ap.propertyId}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Unit
                      </Link>
                    </DropdownMenuItem>
                    {onRemoveProperty && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveProperty(ap.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
