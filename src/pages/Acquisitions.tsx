import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { AcquisitionStatusBadge } from '@/components/acquisition/AcquisitionStatusBadge';
import { useAcquisitionsWithAggregates } from '@/hooks/useAcquisitions';
import { useMarkets } from '@/hooks/useDispositions';
import { formatCurrency, formatPercent } from '@/utils/acquisitionCalculations';
import { AcquisitionStatus, AcquisitionType, AcquisitionFilters } from '@/types/acquisition';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Archive,
  RotateCcw,
  Loader2,
  X,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';

const STATUSES: AcquisitionStatus[] = ['Draft', 'In Review', 'Approved', 'Under Contract', 'Closed', 'Archived'];
const TYPES: AcquisitionType[] = ['Single Property', 'Portfolio', 'Bulk Purchase'];

export default function Acquisitions() {
  const navigate = useNavigate();
  const { acquisitionsWithAggregates, loading, error } = useAcquisitionsWithAggregates();
  const { markets } = useMarkets();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<AcquisitionFilters>({
    status: [],
    type: [],
    markets: [],
  });

  const filteredAcquisitions = useMemo(() => {
    return acquisitionsWithAggregates.filter((item) => {
      const { acquisition } = item;

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          acquisition.name.toLowerCase().includes(searchLower) ||
          acquisition.markets.some((m) => m.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(acquisition.status)) {
        return false;
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(acquisition.type)) {
        return false;
      }

      // Markets filter
      if (filters.markets.length > 0) {
        const hasMarket = filters.markets.some((m) => acquisition.markets.includes(m));
        if (!hasMarket) return false;
      }

      return true;
    });
  }, [acquisitionsWithAggregates, search, filters]);

  const hasActiveFilters = filters.status.length > 0 || filters.type.length > 0 || filters.markets.length > 0;
  const activeFilterCount = filters.status.length + filters.type.length + filters.markets.length;

  const clearFilters = () => {
    setFilters({ status: [], type: [], markets: [] });
  };

  const toggleStatus = (status: AcquisitionStatus) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  const toggleType = (type: AcquisitionType) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter((t) => t !== type)
        : [...prev.type, type],
    }));
  };

  const toggleMarket = (market: string) => {
    setFilters((prev) => ({
      ...prev,
      markets: prev.markets.includes(market)
        ? prev.markets.filter((m) => m !== market)
        : [...prev.markets, market],
    }));
  };

  const getStatusFilterLabel = () => {
    if (filters.status.length === 0) return 'Status';
    if (filters.status.length === 1) return filters.status[0];
    return `${filters.status.length} statuses`;
  };

  const getTypeFilterLabel = () => {
    if (filters.type.length === 0) return 'Type';
    if (filters.type.length === 1) return filters.type[0];
    return `${filters.type.length} types`;
  };

  const getMarketFilterLabel = () => {
    if (filters.markets.length === 0) return 'Market';
    if (filters.markets.length === 1) return filters.markets[0];
    return `${filters.markets.length} markets`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Acquisitions</h1>
          <p className="text-muted-foreground">
            Manage acquisition opportunities and underwriting
          </p>
        </div>
        <Button asChild>
          <Link to="/acquisitions/new">
            <Plus className="h-4 w-4 mr-2" />
            New Acquisition
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search acquisitions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[120px]">
              {getStatusFilterLabel()}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            {STATUSES.map((status) => (
              <div
                key={status}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                onClick={() => toggleStatus(status)}
              >
                <Checkbox checked={filters.status.includes(status)} />
                <span className="text-sm">{status}</span>
              </div>
            ))}
          </PopoverContent>
        </Popover>

        {/* Type Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[120px]">
              {getTypeFilterLabel()}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            {TYPES.map((type) => (
              <div
                key={type}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                onClick={() => toggleType(type)}
              >
                <Checkbox checked={filters.type.includes(type)} />
                <span className="text-sm">{type}</span>
              </div>
            ))}
          </PopoverContent>
        </Popover>

        {/* Market Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[120px]">
              {getMarketFilterLabel()}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 max-h-64 overflow-y-auto">
            {markets.map((market) => (
              <div
                key={market}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                onClick={() => toggleMarket(market)}
              >
                <Checkbox checked={filters.markets.includes(market)} />
                <span className="text-sm">{market}</span>
              </div>
            ))}
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Table */}
      {filteredAcquisitions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          {acquisitionsWithAggregates.length === 0 ? (
            <>
              <p className="text-muted-foreground mb-4">No acquisitions yet.</p>
              <Button asChild>
                <Link to="/acquisitions/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Acquisition
                </Link>
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">No acquisitions match your filters.</p>
          )}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Properties</TableHead>
                <TableHead className="text-right">Total Offer</TableHead>
                <TableHead className="text-right">Projected NOI</TableHead>
                <TableHead className="text-right">Avg Cap Rate</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAcquisitions.map(({ acquisition, aggregates, propertyCount }) => (
                <TableRow
                  key={acquisition.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/acquisitions/${acquisition.id}`)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{acquisition.name}</p>
                      {acquisition.markets.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {acquisition.markets.slice(0, 2).join(', ')}
                          {acquisition.markets.length > 2 && ` +${acquisition.markets.length - 2}`}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{acquisition.type}</TableCell>
                  <TableCell>
                    <AcquisitionStatusBadge status={acquisition.status} />
                  </TableCell>
                  <TableCell className="text-right">{propertyCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(aggregates.totalOfferPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(aggregates.totalProjectedNOI)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercent(aggregates.avgProjectedCapRate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(acquisition.updatedAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/acquisitions/${acquisition.id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {acquisition.status === 'Archived' ? (
                            <>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restore
                            </>
                          ) : (
                            <>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
