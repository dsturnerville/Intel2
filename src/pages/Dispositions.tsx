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
import {
  mockDispositions,
  getDispositionProperties,
  getAllMarkets,
} from '@/data/mockData';
import { calculateDispositionAggregates, formatCurrency } from '@/utils/calculations';
import { Disposition, DispositionStatus, DispositionType, DispositionFilters } from '@/types/disposition';
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
} from 'lucide-react';

export default function Dispositions() {
  const [filters, setFilters] = useState<DispositionFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const markets = getAllMarkets();

  // Apply filters and search
  const filteredDispositions = useMemo(() => {
    return mockDispositions.filter((disp) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !disp.name.toLowerCase().includes(query) &&
          !disp.markets.some((m) => m.toLowerCase().includes(query))
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(disp.status)) return false;
      }

      // Type filter
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(disp.type)) return false;
      }

      // Market filter
      if (filters.markets && filters.markets.length > 0) {
        if (!disp.markets.some((m) => filters.markets!.includes(m))) return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  // Calculate aggregates for each disposition
  const dispositionsWithAggregates = useMemo(() => {
    return filteredDispositions.map((disp) => {
      const properties = getDispositionProperties(disp.id);
      const aggregates = calculateDispositionAggregates(properties);
      return { disposition: disp, aggregates, propertyCount: properties.length };
    });
  }, [filteredDispositions]);

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters =
    searchQuery ||
    (filters.status && filters.status.length > 0) ||
    (filters.type && filters.type.length > 0) ||
    (filters.markets && filters.markets.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <div className="flex items-center justify-between">
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

      <main className="container py-6 space-y-6">
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
            {filteredDispositions.length} of {mockDispositions.length} dispositions
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
              {dispositionsWithAggregates.map(({ disposition, aggregates, propertyCount }) => {
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
                            {disposition.markets.join(', ')}
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

        {filteredDispositions.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No dispositions found</p>
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
