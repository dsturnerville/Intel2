import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DealType, DealStatus, getStatusesForDealType } from '@/types/deal';
import { useDealMutations } from '@/hooks/useDeals';
import { toast } from 'sonner';

interface CreateDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealType: DealType;
  parentId: string; // acquisitionId or dispositionId
  onDealCreated?: (dealId: string) => void;
}

export function CreateDealDialog({ 
  open, 
  onOpenChange, 
  dealType, 
  parentId,
  onDealCreated,
}: CreateDealDialogProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<DealStatus>('Pre-Listing');
  const [askingPrice, setAskingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const { createDeal } = useDealMutations();
  const availableStatuses = getStatusesForDealType(dealType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a deal name');
      return;
    }

    try {
      const deal = await createDeal.mutateAsync({
        name: name.trim(),
        dealType,
        status,
        acquisitionId: dealType === 'Acquisition' ? parentId : undefined,
        dispositionId: dealType === 'Disposition' ? parentId : undefined,
        askingPrice: askingPrice ? Number(askingPrice) : undefined,
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
        expectedCloseDate: expectedCloseDate || undefined,
        notes: notes.trim() || undefined,
      });
      
      toast.success('Deal created successfully');
      onDealCreated?.(deal.id);
      onOpenChange(false);
      
      // Reset form
      setName('');
      setStatus('Pre-Listing');
      setAskingPrice('');
      setPurchasePrice('');
      setExpectedCloseDate('');
      setNotes('');
    } catch (error) {
      console.error('Error creating deal:', error);
      toast.error('Failed to create deal');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New {dealType} Deal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Deal Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter deal name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Initial Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as DealStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="askingPrice">Asking Price</Label>
              <Input
                id="askingPrice"
                type="number"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
            <Input
              id="expectedCloseDate"
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDeal.isPending}>
              {createDeal.isPending ? 'Creating...' : 'Create Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
