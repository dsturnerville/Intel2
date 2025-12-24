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
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { StatusBadge } from '@/components/disposition/StatusBadge';
import { useDispositionsWithAggregates, useMarkets } from '@/hooks/useDispositions';
import { formatCurrency } from '@/utils/calculations';
import { DispositionStatus, DispositionType, DispositionFilters } from '@/types/disposition';
import {
  Search,
  Plus,
  MoreHorizontal,
  Copy,
  Archive,
  RotateCcw,
  Building2,
  TrendingUp,
  ChevronRight,
  Filter,
  X,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  Check,
} from 'lucide-react';

const DISPOSITION_STATUSES: DispositionStatus[] = ['Draft', 'Under Review', 'Approved to List', 'Archived'];
const DISPOSITION_TYPES: DispositionType[] = ['Single Property', 'Portfolio'];

export default function Dispositions() {
  const [filters, setFilters] = useState<DispositionFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const { dispositionsWithAggregates, loading, error } = useDispositionsWithAggregates();
  const { markets } = useMarkets();

  // Apply filters and search
  const filteredDispositions = useMemo(() => {
    return dispositionsWithAggregates.filter(({ disposition }) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !disposition.name.toLowerCase().includes(query) &&
          !disposition.markets.some((m) => m.toLowerCase().includes(query))
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(disposition.status)) return false;
      }

      // Type filter
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(disposition.type)) return false;
      }

      // Market filter
      if (filters.markets && filters.markets.length > 0) {
        if (!disposition.markets.some((m) => filters.markets!.includes(m))) return false;
      }

      return true;
    });
  }, [searchQuery, filters, dispositionsWithAggregates]);

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters =
    searchQuery ||
    (filters.status && filters.status.length > 0) ||
    (filters.type && filters.type.length > 0) ||
    (filters.markets && filters.markets.length > 0);

  const activeFilterCount = 
    (filters.status?.length || 0) + 
    (filters.type?.length || 0) + 
    (filters.markets?.length || 0);

  const toggleStatus = (status: DispositionStatus) => {
    setFilters((f) => ({
      ...f,
      status: f.status?.includes(status)
        ? f.status.filter((s) => s !== status)
        : [...(f.status || []), status],
    }));
  };

  const toggleType = (type: DispositionType) => {
    setFilters((f) => ({
      ...f,
      type: f.type?.includes(type)
        ? f.type.filter((t) => t !== type)
        : [...(f.type || []), type],
    }));
  };

  const toggleMarket = (market: string) => {
    setFilters((f) => ({
      ...f,
      markets: f.markets?.includes(market)
        ? f.markets.filter((m) => m !== market)
        : [...(f.markets || []), market],
    }));
  };

  const getStatusFilterLabel = () => {
    if (!filters.status || filters.status.length === 0) return 'All Statuses';
    if (filters.status.length === 1) return filters.status[0];
    return `${filters.status.length} statuses`;
  };

  const getTypeFilterLabel = () => {
    if (!filters.type || filters.type.length === 0) return 'All Types';
    if (filters.type.length === 1) return filters.type[0];
    return `${filters.type.length} types`;
  };

  const getMarketFilterLabel = () => {
    if (!filters.markets || filters.markets.length === 0) return 'All Markets';
    if (filters.markets.length === 1) return filters.markets[0];
    return `${filters.markets.length} markets`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading dispositions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading dispositions</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 md:top-0 z-10 h-16 md:h-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full px-4 md:px-6">
          <div className="flex h-full items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Dispositions</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                Underwrite and manage property sales
              </p>
            </div>
            <Link to="/dispositions/new">
              <Button className="gap-2" size="sm">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Disposition</span>
                <span className="sm:hidden">New</span>
              </Button>
            </Link>
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
              className="pl-10 bg-input border-border"
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
                <DialogTitle>Filter Dispositions</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="space-y-2">
                    {DISPOSITION_STATUSES.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-status-${status}`}
                          checked={filters.status?.includes(status) || false}
                          onCheckedChange={() => toggleStatus(status)}
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
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="space-y-2">
                    {DISPOSITION_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-type-${type}`}
                          checked={filters.type?.includes(type) || false}
                          onCheckedChange={() => toggleType(type)}
                        />
                        <label
                          htmlFor={`mobile-type-${type}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Markets</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {markets.map((market) => (
                      <div key={market} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-market-${market}`}
                          checked={filters.markets?.includes(market) || false}
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
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setFilters({});
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
              <Button variant="outline" className="w-[160px] justify-between bg-input border-border hidden md:flex">
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
                  onClick={() => setFilters((f) => ({ ...f, status: undefined }))}
                >
                  Clear selection
                </Button>
              </div>
              <div className="p-2 space-y-1">
                {DISPOSITION_STATUSES.map((status) => (
                  <div
                    key={status}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => toggleStatus(status)}
                  >
                    <div className="h-4 w-4 border border-primary rounded-sm flex items-center justify-center">
                      {filters.status?.includes(status) && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <span className="text-sm">{status}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-between bg-input border-border hidden md:flex">
                <span className="truncate">{getTypeFilterLabel()}</span>
                <ChevronDown className="h-4 w-4 ml-2 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0" align="start">
              <div className="p-2 border-b border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setFilters((f) => ({ ...f, type: undefined }))}
                >
                  Clear selection
                </Button>
              </div>
              <div className="p-2 space-y-1">
                {DISPOSITION_TYPES.map((type) => (
                  <div
                    key={type}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => toggleType(type)}
                  >
                    <div className="h-4 w-4 border border-primary rounded-sm flex items-center justify-center">
                      {filters.type?.includes(type) && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <span className="text-sm">{type}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-between bg-input border-border hidden md:flex">
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
                  onClick={() => setFilters((f) => ({ ...f, markets: undefined }))}
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
                      {filters.markets?.includes(market) && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <span className="text-sm">{market}</span>
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
            {filteredDispositions.length} of {dispositionsWithAggregates.length} dispositions
          </span>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-table-header hover:bg-table-header">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Disposition
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center hidden md:table-cell">
                  Properties
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right hidden lg:table-cell">
                  Projected Sale
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right hidden lg:table-cell">
                  Net Proceeds
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right hidden md:table-cell">
                  Gain/Loss
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Updated
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDispositions.map(({ disposition, aggregates, propertyCount }) => {
                const isGain = aggregates.totalGainLossVsBasis >= 0;

                return (
                  <TableRow
                    key={disposition.id}
                    className="group hover:bg-table-hover transition-colors"
                  >
                    <TableCell>
                      <Link
                        to={`/dispositions/${disposition.id}`}
                        className="flex items-center gap-3 group/link"
                      >
                        <div className="p-2 bg-muted rounded-md group-hover/link:bg-primary/20 transition-colors">
                          <Building2 className="h-4 w-4 text-muted-foreground group-hover/link:text-primary transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm group-hover/link:text-primary transition-colors truncate">
                            {disposition.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {disposition.markets.join(', ') || 'No markets'}
                          </p>
                          {/* Mobile-only info */}
                          <div className="flex items-center gap-2 mt-1 sm:hidden">
                            <StatusBadge status={disposition.status} />
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{disposition.type}</span>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <span className="font-mono text-sm">{propertyCount}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <StatusBadge status={disposition.status} />
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
                      <span className="font-mono text-sm">
                        {formatCurrency(aggregates.totalProjectedSalePrice)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
                      <span className="font-mono text-sm">
                        {formatCurrency(aggregates.totalNetSaleProceeds)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp
                          className={`h-3 w-3 ${isGain ? 'text-emerald-400' : 'text-rose-400 rotate-180'}`}
                        />
                        <span
                          className={`font-mono text-sm ${
                            isGain ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isGain ? '+' : ''}
                          {formatCurrency(aggregates.totalGainLossVsBasis)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {new Date(disposition.updatedAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link to={`/dispositions/${disposition.id}`} className="flex items-center gap-2">
                              <ChevronRight className="h-4 w-4" />
                              Open
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {disposition.status === 'Archived' ? (
                            <DropdownMenuItem className="gap-2">
                              <RotateCcw className="h-4 w-4" />
                              Restore
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="gap-2 text-muted-foreground">
                              <Archive className="h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredDispositions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {dispositionsWithAggregates.length === 0 
                ? 'No dispositions yet. Create your first disposition to get started.'
                : 'No dispositions found'}
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