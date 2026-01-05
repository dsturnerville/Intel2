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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddPropertyManualDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acquisitionId: string;
  onSuccess: () => void;
}

export function AddPropertyManualDialog({
  open,
  onOpenChange,
  acquisitionId,
  onSuccess,
}: AddPropertyManualDialogProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    yearBuilt: '',
    askingPrice: '',
    currentRent: '',
    occupancy: 'Vacant' as 'Vacant' | 'Occupied',
    type: 'SFR' as 'SFR' | 'BTR' | 'MF',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      bedrooms: '',
      bathrooms: '',
      squareFeet: '',
      yearBuilt: '',
      askingPrice: '',
      currentRent: '',
      occupancy: 'Vacant',
      type: 'SFR',
    });
  };

  const handleSubmit = async () => {
    if (!formData.address1 || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please fill in required address fields');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.from('acquisition_properties').insert({
        acquisition_id: acquisitionId,
        address1: formData.address1,
        address2: formData.address2 || null,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        square_feet: formData.squareFeet ? parseInt(formData.squareFeet) : null,
        year_built: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
        asking_price: formData.askingPrice ? parseFloat(formData.askingPrice) : null,
        current_rent: formData.currentRent ? parseFloat(formData.currentRent) : null,
        occupancy: formData.occupancy,
        type: formData.type,
        included: true,
        use_acquisition_defaults: true,
      }).select('id').single();

      if (error) throw error;

      // Geocode the newly added property
      if (data?.id) {
        supabase.functions.invoke('geocode-properties', {
          body: { propertyIds: [data.id] }
        }).then(({ error: geocodeError }) => {
          if (geocodeError) {
            console.error('Geocoding error:', geocodeError);
          }
        });
      }

      toast.success('Property added successfully');
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding property:', error);
      toast.error(error.message || 'Failed to add property');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Property</DialogTitle>
          <DialogDescription>
            Manually enter property details to add to this acquisition.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address1">Address *</Label>
            <Input
              id="address1"
              placeholder="123 Main St"
              value={formData.address1}
              onChange={(e) => handleChange('address1', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address2">Address 2</Label>
            <Input
              id="address2"
              placeholder="Apt, Suite, Unit (optional)"
              value={formData.address2}
              onChange={(e) => handleChange('address2', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="TX"
                maxLength={2}
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip *</Label>
              <Input
                id="zipCode"
                placeholder="12345"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SFR">SFR</SelectItem>
                  <SelectItem value="BTR">BTR</SelectItem>
                  <SelectItem value="MF">MF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupancy">Occupancy</Label>
              <Select value={formData.occupancy} onValueChange={(v) => handleChange('occupancy', v)}>
                <SelectTrigger id="occupancy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vacant">Vacant</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Beds</Label>
              <Input
                id="bedrooms"
                type="number"
                placeholder="3"
                value={formData.bedrooms}
                onChange={(e) => handleChange('bedrooms', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Baths</Label>
              <Input
                id="bathrooms"
                type="number"
                step="0.5"
                placeholder="2"
                value={formData.bathrooms}
                onChange={(e) => handleChange('bathrooms', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="squareFeet">Sq Ft</Label>
              <Input
                id="squareFeet"
                type="number"
                placeholder="1500"
                value={formData.squareFeet}
                onChange={(e) => handleChange('squareFeet', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year</Label>
              <Input
                id="yearBuilt"
                type="number"
                placeholder="2000"
                value={formData.yearBuilt}
                onChange={(e) => handleChange('yearBuilt', e.target.value)}
              />
            </div>
          </div>

          {/* Financial */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="askingPrice">Asking Price</Label>
              <Input
                id="askingPrice"
                type="number"
                placeholder="250000"
                value={formData.askingPrice}
                onChange={(e) => handleChange('askingPrice', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentRent">Current Rent</Label>
              <Input
                id="currentRent"
                type="number"
                placeholder="1500"
                value={formData.currentRent}
                onChange={(e) => handleChange('currentRent', e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Property
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
