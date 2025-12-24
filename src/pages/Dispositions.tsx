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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from 'lucide-react';

export default function Dispositions() {
  const [filters, setFilters] = useState<DispositionFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

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
      <header className="sticky top-0 z-10 h-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full px-6">
          <div className="flex h-full items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dispositions</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Underwrite and manage property sales
              </p>
            </div>
            <Link to="/dispositions/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Disposition
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dispositions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filters.status?.[0] || 'all'}
            onValueChange={(value) =>
              setFilters((f) => ({
                ...f,
                status: value === 'all' ? undefined : [value as DispositionStatus],
              }))
            }
          >
            <SelectTrigger className="w-[160px] bg-input border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Approved to List">Approved to List</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select
            value={filters.type?.[0] || 'all'}
            onValueChange={(value) =>
              setFilters((f) => ({
                ...f,
                type: value === 'all' ? undefined : [value as DispositionType],
              }))
            }
          >
            <SelectTrigger className="w-[160px] bg-input border-border">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Single Property">Single Property</SelectItem>
              <SelectItem value="Portfolio">Portfolio</SelectItem>
            </SelectContent>
          </Select>

          {/* Market Filter */}
          <Select
            value={filters.markets?.[0] || 'all'}
            onValueChange={(value) =>
              setFilters((f) => ({
                ...f,
                markets: value === 'all' ? undefined : [value],
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
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
                  Properties
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                  Projected Sale
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                  Net Proceeds
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                  Gain/Loss
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                        <div>
                          <p className="font-medium text-sm group-hover/link:text-primary transition-colors">
                            {disposition.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {disposition.markets.join(', ') || 'No markets'}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{disposition.type}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-sm">{propertyCount}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={disposition.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono text-sm">
                        {formatCurrency(aggregates.totalProjectedSalePrice)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono text-sm">
                        {formatCurrency(aggregates.totalNetSaleProceeds)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
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
                    <TableCell>
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
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
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
