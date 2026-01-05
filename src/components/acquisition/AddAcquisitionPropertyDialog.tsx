import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAvailableProperties } from '@/hooks/useDispositions';
import { formatCurrency } from '@/utils/acquisitionCalculations';
import { Search, Loader2 } from 'lucide-react';

interface AddAcquisitionPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingPropertyIds: string[];
  onAddProperties: (propertyIds: string[]) => void;
}

export function AddAcquisitionPropertyDialog({
  open,
  onOpenChange,
  existingPropertyIds,
  onAddProperties,
}: AddAcquisitionPropertyDialogProps) {
  const { properties, loading } = useAvailableProperties(existingPropertyIds);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const filteredProperties = properties.filter((p) => {
    const searchLower = search.toLowerCase();
    return (
      p.address.toLowerCase().includes(searchLower) ||
      p.city.toLowerCase().includes(searchLower) ||
      p.market.toLowerCase().includes(searchLower)
    );
  });

  const toggleProperty = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    onAddProperties(selectedIds);
    setSelectedIds([]);
    setSearch('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedIds([]);
    setSearch('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Properties</DialogTitle>
          <DialogDescription>
            Select properties to add to this acquisition.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No available properties found.
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleProperty(property.id)}
                >
                  <Checkbox
                    checked={selectedIds.includes(property.id)}
                    onCheckedChange={() => toggleProperty(property.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{property.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.city}, {property.state} • {property.market}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(property.estimatedMarketValue)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(property.currentRent)}/mo
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={selectedIds.length === 0}>
            Add {selectedIds.length} {selectedIds.length === 1 ? 'Property' : 'Properties'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
