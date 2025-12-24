import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/calculations';
import {
  Search,
  Home,
  Filter,
  X,
  Loader2,
  MapPin,
  Bed,
  Bath,
  Square,
  ChevronRight,
} from 'lucide-react';

import { Json } from '@/integrations/supabase/types';

interface PropertyImage {
  title: string;
  url: string;
}

interface PropertyRow {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  market: string;
  beds: number;
  baths: number;
  sqft: number;
  year_built: number | null;
  occupancy_status: 'Occupied' | 'Vacant' | 'Notice Given';
  current_rent: number | null;
  acquisition_price: number | null;
  estimated_market_value: number | null;
  images: Json;
  created_at: string;
  updated_at: string;
}

const parseImages = (images: Json): PropertyImage[] => {
  if (!images || !Array.isArray(images)) return [];
  return images.filter((img): img is { title: string; url: string } => 
    typeof img === 'object' && img !== null && 'url' in img && typeof (img as any).url === 'string'
  );
};

interface PropertyFilters {
  market?: string;
  occupancyStatus?: 'Occupied' | 'Vacant' | 'Notice Given';
}

export default function Properties() {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as PropertyRow[];
    },
  });

  // Get unique markets
  const markets = useMemo(() => {
    const uniqueMarkets = [...new Set(properties.map(p => p.market))];
    return uniqueMarkets.sort();
  }, [properties]);

  // Apply filters and search
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !property.address.toLowerCase().includes(query) &&
          !property.city.toLowerCase().includes(query) &&
          !property.market.toLowerCase().includes(query) &&
          !property.zip_code.includes(query)
        ) {
          return false;
        }
      }

      // Market filter
      if (filters.market && property.market !== filters.market) {
        return false;
      }

      // Occupancy filter
      if (filters.occupancyStatus && property.occupancy_status !== filters.occupancyStatus) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters, properties]);

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters = searchQuery || filters.market || filters.occupancyStatus;

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
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading properties</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 h-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-full">
          <div className="flex h-full items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage portfolio properties
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by address, city, or market..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>

          {/* Market Filter */}
          <Select
            value={filters.market || 'all'}
            onValueChange={(value) =>
              setFilters((f) => ({
                ...f,
                market: value === 'all' ? undefined : value,
              }))
            }
          >
            <SelectTrigger className="w-[180px] bg-input border-border">
              <SelectValue placeholder="Market" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Markets</SelectItem>
              {markets.map((market) => (
                <SelectItem key={market} value={market}>
                  {market}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Occupancy Filter */}
          <Select
            value={filters.occupancyStatus || 'all'}
            onValueChange={(value) =>
              setFilters((f) => ({
                ...f,
                occupancyStatus: value === 'all' ? undefined : value as 'Occupied' | 'Vacant' | 'Notice Given',
              }))
            }
          >
            <SelectTrigger className="w-[160px] bg-input border-border">
              <SelectValue placeholder="Occupancy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Occupied">Occupied</SelectItem>
              <SelectItem value="Vacant">Vacant</SelectItem>
              <SelectItem value="Notice Given">Notice Given</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2 text-muted-foreground"
            >
              <X className="h-3 w-3" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>
            {filteredProperties.length} of {properties.length} properties
          </span>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-table-header hover:bg-table-header">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Property
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Market
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
                  Beds/Baths
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
                  Sqft
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                  Rent
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                  Est. Value
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((property) => {
                const images = parseImages(property.images);
                const firstImage = images[0];
                const imageUrl = firstImage?.url || '/images/property-default.jpg';

                return (
                  <TableRow
                    key={property.id}
                    className="group hover:bg-table-hover transition-colors"
                  >
                    <TableCell>
                      <Link
                        to={`/properties/${property.id}`}
                        className="flex items-center gap-3 group/link"
                      >
                        <div className="h-12 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt={property.address}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm group-hover/link:text-primary transition-colors">
                            {property.address}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {property.city}, {property.state} {property.zip_code}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{property.market}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          {property.beds}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-3 w-3" />
                          {property.baths}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <Square className="h-3 w-3" />
                        {property.sqft.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getOccupancyBadgeVariant(property.occupancy_status) as any}>
                        {property.occupancy_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono text-sm">
                        {property.current_rent ? formatCurrency(property.current_rent) : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono text-sm">
                        {property.estimated_market_value 
                          ? formatCurrency(property.estimated_market_value) 
                          : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link to={`/properties/${property.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredProperties.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {properties.length === 0
                ? 'No properties in the portfolio yet.'
                : 'No properties found matching your filters.'}
            </p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
