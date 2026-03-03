import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, MapPin, Home, Ruler, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { generateMockComps, haversineDistance, RentalComp, calculateMedian } from '@/data/mockRentalComps';

const RADIUS_OPTIONS = [
  { value: '0.25', label: '0.25 mi' },
  { value: '0.5', label: '0.5 mi' },
  { value: '1', label: '1 mi' },
  { value: '2', label: '2 mi' },
  { value: '5', label: '5 mi' },
];

const statusColor: Record<string, string> = {
  Active: 'bg-[hsl(var(--badge-success-bg))] text-[hsl(var(--badge-success-text))] border-[hsl(var(--badge-success-border))]',
  Pending: 'bg-[hsl(var(--badge-amber-bg))] text-[hsl(var(--badge-amber-text))] border-[hsl(var(--badge-amber-border))]',
  Leased: 'bg-[hsl(var(--badge-gray-bg))] text-[hsl(var(--badge-gray-text))] border-[hsl(var(--badge-gray-border))]',
};

/**
 * Variation 3: Card Grid layout — comps shown as visual cards in a responsive grid.
 * No persistent map. Focus on scannable, visual comp cards.
 */
export default function RentalCompsV3() {
  const { id } = useParams<{ id: string }>();
  const [radius, setRadius] = useState('1');
  const [bedsFilter, setBedsFilter] = useState('any');
  const [statusFilter, setStatusFilter] = useState('any');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const handleToggle = (cid: string) => {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(cid) ? n.delete(cid) : n.add(cid); return n; });
  };

  const selectedComps = filteredComps.filter((c) => selectedIds.has(c.id));
  const rents = selectedComps.map((c) => c.rent);
  const median = calculateMedian(rents);
  const avg = rents.length ? rents.reduce((a, b) => a + b, 0) / rents.length : 0;

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!unit) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-destructive">Unit not found</p></div>;

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
        <span className="text-xs font-medium text-muted-foreground bg-accent px-2 py-1 rounded">V3 — Cards</span>
      </header>

      {/* Filters + Stats */}
      <div className="flex items-center gap-3 px-6 py-2.5 border-b border-border bg-card shrink-0 flex-wrap">
        <FilterSelect label="Radius" value={radius} onChange={setRadius} options={RADIUS_OPTIONS} width="w-24" />
        <FilterSelect label="Beds" value={bedsFilter} onChange={setBedsFilter} options={[{ value: 'any', label: 'Any' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]} width="w-20" />
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={[{ value: 'any', label: 'Any' }, { value: 'Active', label: 'Active' }, { value: 'Pending', label: 'Pending' }, { value: 'Leased', label: 'Leased' }]} width="w-24" />

        <div className="ml-auto flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">{filteredComps.length} comps</span>
          {selectedComps.length > 0 && (
            <>
              <div className="h-4 w-px bg-border" />
              <span>Median: <span className="font-semibold text-primary">{formatCurrency(median)}</span></span>
              <span>Avg: <span className="font-medium">{formatCurrency(Math.round(avg))}</span></span>
            </>
          )}
        </div>
      </div>

      {/* Card Grid */}
      <ScrollArea className="flex-1">
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredComps.map((comp) => (
            <CompCard key={comp.id} comp={comp} selected={selectedIds.has(comp.id)} onToggle={() => handleToggle(comp.id)} />
          ))}
          {filteredComps.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">No comps match filters</div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Rent */}
      {selectedComps.length > 0 && (
        <div className="border-t border-border bg-card px-6 py-3 flex items-center justify-between shrink-0">
          <span className="text-sm text-muted-foreground">{selectedComps.length} selected</span>
          <div className="text-sm">
            <span className="text-muted-foreground">Suggested Rent: </span>
            <span className="font-bold text-lg text-primary">{formatCurrency(median)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function CompCard({ comp, selected, onToggle }: { comp: RentalComp; selected: boolean; onToggle: () => void }) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:border-primary/40 ${selected ? 'border-primary/60 bg-primary/5' : ''}`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Checkbox checked={selected} onCheckedChange={onToggle} onClick={(e) => e.stopPropagation()} />
          <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${statusColor[comp.status] || ''}`}>
            {comp.status}
          </span>
        </div>
        <span className="text-lg font-bold text-primary font-mono">{formatCurrency(comp.rent)}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
      </div>

      <p className="text-sm font-medium truncate mb-1">{comp.address}</p>
      <p className="text-xs text-muted-foreground mb-3">{comp.city}, {comp.state} {comp.zipCode}</p>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Home className="h-3 w-3" />
          <span>{comp.bedrooms}bd/{comp.bathrooms}ba</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Ruler className="h-3 w-3" />
          <span>{comp.sqft.toLocaleString()} sf</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{comp.daysOnMarket}d</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>{comp.distance} mi away</span>
        <span>${(comp.rent / comp.sqft).toFixed(2)}/sf</span>
      </div>
    </Card>
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
