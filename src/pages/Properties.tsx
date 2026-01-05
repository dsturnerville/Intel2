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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
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
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  Check,
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
  market_id: string | null;
  year_built: number | null;
  occupancy_status: 'Occupied' | 'Vacant' | 'Notice Given';
  current_rent: number | null;
  acquisition_price: number | null;
  estimated_market_value: number | null;
  images: Json;
  created_at: string;
  updated_at: string;
  markets?: {
    id: string;
    market_name: string;
    market_code: string | null;
  } | null;
}

const parseImages = (images: Json): PropertyImage[] => {
  if (!images || !Array.isArray(images)) return [];
  return images.filter((img): img is { title: string; url: string } => 
    typeof img === 'object' && img !== null && 'url' in img && typeof (img as any).url === 'string'
  );
};

type OccupancyStatus = 'Occupied' | 'Vacant' | 'Notice Given';

interface PropertyFilters {
  markets: string[];
  occupancyStatuses: OccupancyStatus[];
}

const OCCUPANCY_STATUSES: OccupancyStatus[] = ['Occupied', 'Vacant', 'Notice Given'];

export default function Properties() {
  const [filters, setFilters] = useState<PropertyFilters>({ markets: [], occupancyStatuses: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          markets (
            id,
            market_name,
            market_code
          )
        `)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as PropertyRow[];
    },
  });

  // Get unique markets from the markets relation or fallback to market text field
  const markets = useMemo(() => {
    const marketNames = properties.map(p => p.markets?.market_name || p.market).filter(Boolean);
    const uniqueMarkets = [...new Set(marketNames)];
    return uniqueMarkets.sort();
  }, [properties]);

  // Apply filters and search
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const marketName = property.markets?.market_name || property.market;
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !property.address.toLowerCase().includes(query) &&
          !property.city.toLowerCase().includes(query) &&
          !marketName.toLowerCase().includes(query) &&
          !property.zip_code.includes(query)
        ) {
          return false;
        }
      }

      // Market filter (multi-select)
      if (filters.markets.length > 0 && !filters.markets.includes(marketName)) {
        return false;
      }

      // Occupancy filter (multi-select)
      if (filters.occupancyStatuses.length > 0 && !filters.occupancyStatuses.includes(property.occupancy_status)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters, properties]);

  const clearFilters = () => {
    setFilters({ markets: [], occupancyStatuses: [] });
    setSearchQuery('');
  };

  const hasActiveFilters = searchQuery || filters.markets.length > 0 || filters.occupancyStatuses.length > 0;
  const activeFilterCount = filters.markets.length + filters.occupancyStatuses.length;

  const toggleMarket = (market: string) => {
    setFilters((f) => ({
      ...f,
      markets: f.markets.includes(market)
        ? f.markets.filter((m) => m !== market)
        : [...f.markets, market],
    }));
  };

  const toggleOccupancyStatus = (status: OccupancyStatus) => {
    setFilters((f) => ({
      ...f,
      occupancyStatuses: f.occupancyStatuses.includes(status)
        ? f.occupancyStatuses.filter((s) => s !== status)
        : [...f.occupancyStatuses, status],
    }));
  };

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

  const getMarketFilterLabel = () => {
    if (filters.markets.length === 0) return 'All Markets';
    if (filters.markets.length === 1) return filters.markets[0];
    return `${filters.markets.length} markets`;
  };

  const getStatusFilterLabel = () => {
    if (filters.occupancyStatuses.length === 0) return 'All Statuses';
    if (filters.occupancyStatuses.length === 1) return filters.occupancyStatuses[0];
    return `${filters.occupancyStatuses.length} statuses`;
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
      <header className="sticky top-0 md:top-0 z-10 h-16 md:h-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full px-4 md:px-6">
          <div className="flex h-full items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Properties</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                View and manage portfolio properties
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-transparent border-border"
            />
          </div>

          {/* Mobile Filter Button */}
          <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden relative">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filter Properties</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Markets</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {markets.map((market) => (
                      <div key={market} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-market-${market}`}
                          checked={filters.markets.includes(market)}
                          onCheckedChange={() => toggleMarket(market)}
                        />
                        <label
                          htmlFor={`mobile-market-${market}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {market}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Occupancy Status</Label>
                  <div className="space-y-2">
                    {OCCUPANCY_STATUSES.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-status-${status}`}
                          checked={filters.occupancyStatuses.includes(status)}
                          onCheckedChange={() => toggleOccupancyStatus(status)}
                        />
                        <label
                          htmlFor={`mobile-status-${status}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setFilters({ markets: [], occupancyStatuses: [] });
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setFilterModalOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Desktop Multi-Select Filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-between bg-transparent border-border hidden md:flex">
                <span className="truncate">{getMarketFilterLabel()}</span>
                <ChevronDown className="h-4 w-4 ml-2 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <div className="p-2 border-b border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setFilters((f) => ({ ...f, markets: [] }))}
                >
                  Clear selection
                </Button>
              </div>
              <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                {markets.map((market) => (
                  <div
                    key={market}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => toggleMarket(market)}
                  >
                    <div className="h-4 w-4 border border-primary rounded-sm flex items-center justify-center">
                      {filters.markets.includes(market) && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <span className="text-sm">{market}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-between bg-transparent border-border hidden md:flex">
                <span className="truncate">{getStatusFilterLabel()}</span>
                <ChevronDown className="h-4 w-4 ml-2 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0" align="start">
              <div className="p-2 border-b border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setFilters((f) => ({ ...f, occupancyStatuses: [] }))}
                >
                  Clear selection
                </Button>
              </div>
              <div className="p-2 space-y-1">
                {OCCUPANCY_STATUSES.map((status) => (
                  <div
                    key={status}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => toggleOccupancyStatus(status)}
                  >
                    <div className="h-4 w-4 border border-primary rounded-sm flex items-center justify-center">
                      {filters.occupancyStatuses.includes(status) && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <span className="text-sm">{status}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2 text-muted-foreground hidden md:flex"
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
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Market
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right hidden lg:table-cell">
                  Rent
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right hidden lg:table-cell">
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
                        <div className="min-w-0">
                          <p className="font-medium text-sm group-hover/link:text-primary transition-colors truncate">
                            {property.address}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{property.city}, {property.state} {property.zip_code}</span>
                          </p>
                          {/* Mobile-only status badge */}
                          <div className="mt-1 md:hidden">
                            <Badge variant={getOccupancyBadgeVariant(property.occupancy_status) as any} className="text-xs">
                              {property.occupancy_status}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {property.markets ? (
                        <Link 
                          to="/markets" 
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {property.markets.market_name}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">{property.market}</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={getOccupancyBadgeVariant(property.occupancy_status) as any}>
                        {property.occupancy_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
                      <span className="font-mono text-sm">
                        {property.current_rent ? formatCurrency(property.current_rent) : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
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
                          className="h-8 w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="h-4 w-4 text-destructive" />
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