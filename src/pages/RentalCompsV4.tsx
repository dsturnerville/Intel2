import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Loader2, MapPin, ArrowUpDown, CheckSquare, Square, ChevronUp, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { generateMockComps, haversineDistance, RentalComp, calculateMedian } from '@/data/mockRentalComps';
import { RentalCompsMap } from '@/components/rental-comps/RentalCompsMap';

const RADIUS_OPTIONS = [
  { value: '0.25', label: '0.25 mi' },
  { value: '0.5', label: '0.5 mi' },
  { value: '1', label: '1 mi' },
  { value: '2', label: '2 mi' },
  { value: '5', label: '5 mi' },
];

type SortKey = 'rent' | 'distance' | 'sqft' | 'daysOnMarket' | 'rentPerSf';
type SortDir = 'asc' | 'desc';

/**
 * Variation 4: Dense data table with sortable columns, collapsible map panel on top.
 * Power-user / analyst-oriented layout.
 */
export default function RentalCompsV4() {
  const { id } = useParams<{ id: string }>();
  const [radius, setRadius] = useState('1');
  const [bedsFilter, setBedsFilter] = useState('any');
  const [statusFilter, setStatusFilter] = useState('any');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('distance');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [mapExpanded, setMapExpanded] = useState(true);

  const { data: unit, isLoading } = useQuery({
    queryKey: ['unit', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('units').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const allComps = useMemo(() => {
    if (!unit?.latitude || !unit?.longitude) return [];
    return generateMockComps(Number(unit.latitude), Number(unit.longitude), unit.current_rent ? Number(unit.current_rent) : null, unit.city, unit.state, unit.zip_code, unit.id);
  }, [unit]);

  const filteredComps = useMemo(() => {
    if (!unit?.latitude || !unit?.longitude) return [];
    const r = parseFloat(radius);
    return allComps.filter((c) => {
      if (haversineDistance(Number(unit.latitude), Number(unit.longitude), c.latitude, c.longitude) > r) return false;
      if (bedsFilter !== 'any' && c.bedrooms !== parseInt(bedsFilter)) return false;
      if (statusFilter !== 'any' && c.status !== statusFilter) return false;
      return true;
    });
  }, [allComps, radius, bedsFilter, statusFilter, unit]);

  const sortedComps = useMemo(() => {
    const arr = [...filteredComps];
    arr.sort((a, b) => {
      let av: number, bv: number;
      switch (sortKey) {
        case 'rent': av = a.rent; bv = b.rent; break;
        case 'distance': av = a.distance; bv = b.distance; break;
        case 'sqft': av = a.sqft; bv = b.sqft; break;
        case 'daysOnMarket': av = a.daysOnMarket; bv = b.daysOnMarket; break;
        case 'rentPerSf': av = a.rent / a.sqft; bv = b.rent / b.sqft; break;
        default: av = 0; bv = 0;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return arr;
  }, [filteredComps, sortKey, sortDir]);

  useMemo(() => { setSelectedIds(new Set(filteredComps.map((c) => c.id))); }, [filteredComps]);

  const handleToggle = (cid: string) => {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(cid) ? n.delete(cid) : n.add(cid); return n; });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const selectedComps = filteredComps.filter((c) => selectedIds.has(c.id));
  const rents = selectedComps.map((c) => c.rent);
  const median = calculateMedian(rents);
  const avg = rents.length ? rents.reduce((a, b) => a + b, 0) / rents.length : 0;
  const min = rents.length ? Math.min(...rents) : 0;
  const max = rents.length ? Math.max(...rents) : 0;
  const allSelected = filteredComps.length > 0 && selectedIds.size === filteredComps.length;
  const hasCoords = unit?.latitude && unit?.longitude;

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!unit) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-destructive">Unit not found</p></div>;

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-3 border-b border-border bg-background shrink-0">
        <Link to={`/units/${id}`}><Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold tracking-tight truncate">Rental Comps — {unit.address}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />{unit.city}, {unit.state} {unit.zip_code}
          </p>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-accent px-2 py-1 rounded">V4 — Table</span>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 py-2.5 border-b border-border bg-card shrink-0 flex-wrap">
        <FilterSelect label="Radius" value={radius} onChange={setRadius} options={RADIUS_OPTIONS} width="w-24" />
        <FilterSelect label="Beds" value={bedsFilter} onChange={setBedsFilter} options={[{ value: 'any', label: 'Any' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]} width="w-20" />
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={[{ value: 'any', label: 'Any' }, { value: 'Active', label: 'Active' }, { value: 'Pending', label: 'Pending' }, { value: 'Leased', label: 'Leased' }]} width="w-24" />
        {hasCoords && (
          <Button variant="ghost" size="sm" className="ml-auto text-xs h-7 gap-1" onClick={() => setMapExpanded(!mapExpanded)}>
            {mapExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {mapExpanded ? 'Hide Map' : 'Show Map'}
          </Button>
        )}
      </div>

      {/* Collapsible Map */}
      {hasCoords && mapExpanded && (
        <div className="h-[250px] shrink-0 border-b border-border">
          <RentalCompsMap subjectLat={Number(unit.latitude)} subjectLng={Number(unit.longitude)} subjectAddress={unit.address} comps={filteredComps} selectedIds={selectedIds} highlightedId={highlightedId} onCompClick={handleToggle} onCompHover={setHighlightedId} radiusMiles={parseFloat(radius)} />
        </div>
      )}

      {/* Data Table */}
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-[hsl(var(--table-header))]">
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={() => allSelected ? setSelectedIds(new Set()) : setSelectedIds(new Set(filteredComps.map(c => c.id)))} />
              </TableHead>
              <TableHead className="text-xs">Address</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs cursor-pointer select-none" onClick={() => handleSort('rent')}>
                <div className="flex items-center gap-1">Rent <SortIcon k="rent" /></div>
              </TableHead>
              <TableHead className="text-xs">Beds/Baths</TableHead>
              <TableHead className="text-xs cursor-pointer select-none" onClick={() => handleSort('sqft')}>
                <div className="flex items-center gap-1">Sqft <SortIcon k="sqft" /></div>
              </TableHead>
              <TableHead className="text-xs cursor-pointer select-none" onClick={() => handleSort('rentPerSf')}>
                <div className="flex items-center gap-1">$/SF <SortIcon k="rentPerSf" /></div>
              </TableHead>
              <TableHead className="text-xs cursor-pointer select-none" onClick={() => handleSort('distance')}>
                <div className="flex items-center gap-1">Dist <SortIcon k="distance" /></div>
              </TableHead>
              <TableHead className="text-xs cursor-pointer select-none" onClick={() => handleSort('daysOnMarket')}>
                <div className="flex items-center gap-1">DOM <SortIcon k="daysOnMarket" /></div>
              </TableHead>
              <TableHead className="text-xs">Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedComps.map((comp) => (
              <TableRow
                key={comp.id}
                className={`cursor-pointer transition-colors ${highlightedId === comp.id ? 'bg-accent' : ''}`}
                onMouseEnter={() => setHighlightedId(comp.id)}
                onMouseLeave={() => setHighlightedId(null)}
                onClick={() => handleToggle(comp.id)}
              >
                <TableCell><Checkbox checked={selectedIds.has(comp.id)} onCheckedChange={() => handleToggle(comp.id)} onClick={(e) => e.stopPropagation()} /></TableCell>
                <TableCell className="text-xs font-medium max-w-[200px] truncate">{comp.address}</TableCell>
                <TableCell><Badge variant={comp.status === 'Active' ? 'success' : comp.status === 'Pending' ? 'amber' : 'gray'} className="text-[10px] h-5">{comp.status}</Badge></TableCell>
                <TableCell className="text-xs font-semibold font-mono text-primary">{formatCurrency(comp.rent)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{comp.bedrooms}/{comp.bathrooms}</TableCell>
                <TableCell className="text-xs font-mono">{comp.sqft.toLocaleString()}</TableCell>
                <TableCell className="text-xs font-mono">${(comp.rent / comp.sqft).toFixed(2)}</TableCell>
                <TableCell className="text-xs font-mono">{comp.distance} mi</TableCell>
                <TableCell className="text-xs font-mono">{comp.daysOnMarket}d</TableCell>
                <TableCell className="text-xs text-muted-foreground">{comp.source}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Summary */}
      <div className="border-t border-border bg-card px-6 py-3 flex items-center justify-between gap-6 shrink-0 flex-wrap text-sm">
        <div className="flex items-center gap-6">
          <span><span className="text-muted-foreground">Selected:</span> <span className="font-medium">{selectedComps.length}</span></span>
          {selectedComps.length > 0 && (
            <>
              <span><span className="text-muted-foreground">Median:</span> <span className="font-semibold text-primary">{formatCurrency(median)}</span></span>
              <span><span className="text-muted-foreground">Avg:</span> <span className="font-medium">{formatCurrency(Math.round(avg))}</span></span>
              <span><span className="text-muted-foreground">Range:</span> <span className="font-medium">{formatCurrency(min)} – {formatCurrency(max)}</span></span>
            </>
          )}
        </div>
        {selectedComps.length > 0 && (
          <div>
            <span className="text-muted-foreground">Suggested Rent: </span>
            <span className="font-bold text-lg text-primary">{formatCurrency(median)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, width }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; width: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`h-8 ${width} text-xs`}><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
