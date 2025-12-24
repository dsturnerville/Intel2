import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Property } from '@/types/disposition';
import { formatCurrency } from '@/utils/calculations';
import { Search, Home, Plus } from 'lucide-react';

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableProperties: Property[];
  onAddProperties: (propertyIds: string[]) => void;
}

export function AddPropertyDialog({
  open,
  onOpenChange,
  availableProperties,
  onAddProperties,
}: AddPropertyDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredProperties = availableProperties.filter((property) => {
    const query = searchQuery.toLowerCase();
    return (
      property.address.toLowerCase().includes(query) ||
      property.city.toLowerCase().includes(query) ||
      property.market.toLowerCase().includes(query) ||
      property.zipCode.includes(query)
    );
  });

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAdd = () => {
    onAddProperties(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSearchQuery('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add Properties to Disposition
          </DialogTitle>
          <DialogDescription>
            Select one or more properties to include in this disposition underwriting.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address, city, or market..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>

        {/* Property List */}
        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? 'No properties match your search'
                : 'All properties are already in this disposition'}
            </div>
          ) : (
            filteredProperties.map((property) => (
              <div
                key={property.id}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedIds.has(property.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/30 hover:border-primary/30'
                }`}
                onClick={() => toggleSelection(property.id)}
              >
                <Checkbox
                  checked={selectedIds.has(property.id)}
                  onCheckedChange={() => toggleSelection(property.id)}
                />
                <div className="p-2 bg-muted rounded-md">
                  <Home className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{property.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {property.city}, {property.state} • {property.market}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">
                    {formatCurrency(property.estimatedMarketValue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {property.market}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {selectedIds.size} {selectedIds.size === 1 ? 'property' : 'properties'} selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={selectedIds.size === 0}>
              Add Selected
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
