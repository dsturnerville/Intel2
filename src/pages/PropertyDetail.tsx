import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/calculations';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  DollarSign,
  Home,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface PropertyImage {
  title: string;
  url: string;
}

const parseImages = (images: Json): PropertyImage[] => {
  if (!images || !Array.isArray(images)) return [];
  return images.filter((img): img is { title: string; url: string } => 
    typeof img === 'object' && img !== null && 'url' in img && typeof (img as any).url === 'string'
  );
};

interface PropertyDetail {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  market: string;
  year_built: number | null;
  lot_size: number | null;
  occupancy_status: 'Occupied' | 'Vacant' | 'Notice Given';
  current_rent: number | null;
  lease_end_date: string | null;
  acquisition_date: string | null;
  acquisition_price: number | null;
  acquisition_basis: number | null;
  estimated_market_value: number | null;
  last_appraisal_value: number | null;
  last_appraisal_date: string | null;
  latitude: number | null;
  longitude: number | null;
  images: Json;
  created_at: string;
  updated_at: string;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as PropertyDetail;
    },
    enabled: !!id,
  });

  const getOccupancyBadgeVariant = (status: string) => {
    switch (status) {
      case 'Occupied':
        return 'success';
      case 'Notice Given':
        return 'amber';
      default:
        return 'gray';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Property not found</p>
          <Link to="/properties">
            <Button variant="link">Back to Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = parseImages(property.images);
  const firstImage = images[0];
  const imageUrl = firstImage?.url || '/images/property-default.jpg';
  const appreciation = property.estimated_market_value && property.acquisition_price
    ? ((property.estimated_market_value - property.acquisition_price) / property.acquisition_price) * 100
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 h-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full px-6">
          <div className="flex h-full items-center gap-4">
            <Link to="/properties">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold tracking-tight">{property.address}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {property.city}, {property.state} {property.zip_code}
              </p>
            </div>
            <Badge variant={getOccupancyBadgeVariant(property.occupancy_status) as any}>
              {property.occupancy_status}
            </Badge>
          </div>
        </div>
      </header>

      <main className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Image */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-muted">
                <img
                  src={imageUrl}
                  alt={property.address}
                  className="h-full w-full object-cover"
                />
              </div>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Home className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year Built</p>
                      <p className="font-medium">{property.year_built || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Market</p>
                      <p className="font-medium">{property.market}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Lot Size</p>
                    <p className="font-medium">
                      {property.lot_size ? `${property.lot_size.toLocaleString()} sqft` : '—'}
                    </p>
                  </div>
                </div>

                {property.lease_end_date && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Lease End Date</p>
                      <p className="font-medium">
                        {new Date(property.lease_end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5" />
                  Financials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Rent</p>
                  <p className="text-xl font-semibold">
                    {property.current_rent ? formatCurrency(property.current_rent) : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground">Estimated Market Value</p>
                  <p className="text-xl font-semibold">
                    {property.estimated_market_value
                      ? formatCurrency(property.estimated_market_value)
                      : '—'}
                  </p>
                </div>

                {appreciation !== null && (
                  <div className="flex items-center gap-2">
                    <TrendingUp
                      className={`h-4 w-4 ${appreciation >= 0 ? 'text-emerald-500' : 'text-rose-500 rotate-180'}`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        appreciation >= 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {appreciation >= 0 ? '+' : ''}
                      {appreciation.toFixed(1)}% since acquisition
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Acquisition Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  Acquisition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Acquisition Date</p>
                  <p className="font-medium">
                    {property.acquisition_date
                      ? new Date(property.acquisition_date).toLocaleDateString()
                      : '—'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Acquisition Price</p>
                  <p className="font-medium">
                    {property.acquisition_price
                      ? formatCurrency(property.acquisition_price)
                      : '—'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Cost Basis</p>
                  <p className="font-medium">
                    {property.acquisition_basis
                      ? formatCurrency(property.acquisition_basis)
                      : '—'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Appraisal Info */}
            {(property.last_appraisal_value || property.last_appraisal_date) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Last Appraisal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.last_appraisal_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {new Date(property.last_appraisal_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {property.last_appraisal_value && (
                    <div>
                      <p className="text-sm text-muted-foreground">Value</p>
                      <p className="font-medium">
                        {formatCurrency(property.last_appraisal_value)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
