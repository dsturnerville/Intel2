import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { generateMockComps, haversineDistance, RentalComp } from '@/data/mockRentalComps';
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

export default function RentalComps() {
  const { id } = useParams<{ id: string }>();
  const [radius, setRadius] = useState('1');
  const [bedsFilter, setBedsFilter] = useState('any');
  const [statusFilter, setStatusFilter] = useState('any');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const { data: unit, isLoading } = useQuery({
    queryKey: ['unit', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Generate mock comps based on unit
  const allComps = useMemo(() => {
    if (!unit?.latitude || !unit?.longitude) return [];
    return generateMockComps(
      Number(unit.latitude),
      Number(unit.longitude),
      unit.current_rent ? Number(unit.current_rent) : null,
      unit.city,
      unit.state,
      unit.zip_code,
      unit.id
    );
  }, [unit]);

  // Apply filters
  const filteredComps = useMemo(() => {
    if (!unit?.latitude || !unit?.longitude) return [];
    const radiusMiles = parseFloat(radius);

    return allComps.filter((comp) => {
      // Radius filter using haversine
      const dist = haversineDistance(
        Number(unit.latitude), Number(unit.longitude),
        comp.latitude, comp.longitude
      );
      if (dist > radiusMiles) return false;

      // Beds filter
      if (bedsFilter !== 'any' && comp.bedrooms !== parseInt(bedsFilter)) return false;

      // Status filter
      if (statusFilter !== 'any' && comp.status !== statusFilter) return false;

      return true;
    });
  }, [allComps, radius, bedsFilter, statusFilter, unit]);

  // Auto-select all when filters change
  useMemo(() => {
    setSelectedIds(new Set(filteredComps.map((c) => c.id)));
  }, [filteredComps]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedComps = filteredComps.filter((c) => selectedIds.has(c.id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Unit not found</p>
          <Link to="/units"><Button variant="link">Back to Units</Button></Link>
        </div>
      </div>
    );
  }

  const hasCoords = unit.latitude && unit.longitude;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-3 border-b border-border bg-background shrink-0">
        <Link to={`/units/${id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold tracking-tight truncate">
            Rental Comps — {unit.address}
          </h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {unit.city}, {unit.state} {unit.zip_code}
            {unit.current_rent && (
              <span className="ml-2">· Current Rent: {formatCurrency(Number(unit.current_rent))}/mo</span>
            )}
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 py-2.5 border-b border-border bg-card shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Radius:</span>
          <Select value={radius} onValueChange={setRadius}>
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RADIUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Beds:</span>
          <Select value={bedsFilter} onValueChange={setBedsFilter}>
            <SelectTrigger className="h-8 w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Leased">Leased</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main content: list + map */}
      {hasCoords ? (
        <div className="flex-1 flex min-h-0">
          {/* List */}
          <div className="w-[400px] border-r border-border flex flex-col min-h-0">
            <RentalCompsList
              comps={filteredComps}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={() => setSelectedIds(new Set(filteredComps.map((c) => c.id)))}
              onDeselectAll={() => setSelectedIds(new Set())}
              highlightedId={highlightedId}
              onHover={setHighlightedId}
            />
          </div>
          {/* Map */}
          <div className="flex-1 min-h-0">
            <RentalCompsMap
              subjectLat={Number(unit.latitude)}
              subjectLng={Number(unit.longitude)}
              subjectAddress={unit.address}
              comps={filteredComps}
              selectedIds={selectedIds}
              highlightedId={highlightedId}
              onCompClick={handleToggleSelect}
              onCompHover={setHighlightedId}
              radiusMiles={parseFloat(radius)}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          This unit has no coordinates. Geocode it first to view rental comps.
        </div>
      )}

      {/* Summary bar */}
      <RentalCompsSummary selectedComps={selectedComps} />
    </div>
  );
}
