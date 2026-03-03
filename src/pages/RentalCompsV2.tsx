import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, MapPin, List, Map, Columns } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { generateMockComps, haversineDistance } from '@/data/mockRentalComps';
import { RentalCompsList } from '@/components/rental-comps/RentalCompsList';
import { RentalCompsMap } from '@/components/rental-comps/RentalCompsMap';
import { RentalCompsSummary } from '@/components/rental-comps/RentalCompsSummary';

const RADIUS_OPTIONS = [
  { value: '0.25', label: '0.25 mi' },
  { value: '0.5', label: '0.5 mi' },
  { value: '1', label: '1 mi' },
  { value: '2', label: '2 mi' },
  { value: '5', label: '5 mi' },
];

/**
 * Variation 2: Tabbed layout — switch between List, Map, or Split view.
 * Stacked header with large map in "Map" mode, full list in "List" mode.
 */
export default function RentalCompsV2() {
  const { id } = useParams<{ id: string }>();
  const [radius, setRadius] = useState('1');
  const [bedsFilter, setBedsFilter] = useState('any');
  const [statusFilter, setStatusFilter] = useState('any');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState('split');

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

  useMemo(() => { setSelectedIds(new Set(filteredComps.map((c) => c.id))); }, [filteredComps]);

  const handleToggleSelect = (cid: string) => {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(cid) ? n.delete(cid) : n.add(cid); return n; });
  };

  const selectedComps = filteredComps.filter((c) => selectedIds.has(c.id));

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!unit) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-destructive">Unit not found</p></div>;

  const hasCoords = unit.latitude && unit.longitude;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-3 border-b border-border bg-background shrink-0">
        <Link to={`/units/${id}`}><Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold tracking-tight truncate">Rental Comps — {unit.address}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />{unit.city}, {unit.state} {unit.zip_code}
            {unit.current_rent && <span className="ml-2">· Current Rent: {formatCurrency(Number(unit.current_rent))}/mo</span>}
          </p>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-accent px-2 py-1 rounded">V2 — Tabbed</span>
      </header>

      {/* Filters + View Toggle */}
      <div className="flex items-center gap-3 px-6 py-2.5 border-b border-border bg-card shrink-0 flex-wrap">
        <FilterSelect label="Radius" value={radius} onChange={setRadius} options={RADIUS_OPTIONS} width="w-24" />
        <FilterSelect label="Beds" value={bedsFilter} onChange={setBedsFilter} options={[{ value: 'any', label: 'Any' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]} width="w-20" />
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={[{ value: 'any', label: 'Any' }, { value: 'Active', label: 'Active' }, { value: 'Pending', label: 'Pending' }, { value: 'Leased', label: 'Leased' }]} width="w-24" />
        <div className="ml-auto">
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList className="h-8">
              <TabsTrigger value="list" className="text-xs px-2 h-6 gap-1"><List className="h-3 w-3" />List</TabsTrigger>
              <TabsTrigger value="map" className="text-xs px-2 h-6 gap-1"><Map className="h-3 w-3" />Map</TabsTrigger>
              <TabsTrigger value="split" className="text-xs px-2 h-6 gap-1"><Columns className="h-3 w-3" />Split</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      {hasCoords ? (
        <div className="flex-1 min-h-0 flex">
          {(viewMode === 'list' || viewMode === 'split') && (
            <div className={`${viewMode === 'split' ? 'w-[400px]' : 'flex-1'} border-r border-border flex flex-col min-h-0`}>
              <RentalCompsList comps={filteredComps} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} onSelectAll={() => setSelectedIds(new Set(filteredComps.map((c) => c.id)))} onDeselectAll={() => setSelectedIds(new Set())} highlightedId={highlightedId} onHover={setHighlightedId} />
            </div>
          )}
          {(viewMode === 'map' || viewMode === 'split') && (
            <div className="flex-1 min-h-0">
              <RentalCompsMap subjectLat={Number(unit.latitude)} subjectLng={Number(unit.longitude)} subjectAddress={unit.address} comps={filteredComps} selectedIds={selectedIds} highlightedId={highlightedId} onCompClick={handleToggleSelect} onCompHover={setHighlightedId} radiusMiles={parseFloat(radius)} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">No coordinates. Geocode first.</div>
      )}

      <RentalCompsSummary selectedComps={selectedComps} />
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
