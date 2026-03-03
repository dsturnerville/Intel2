import { useState } from 'react';
import { RentalComp } from '@/data/mockRentalComps';
import { formatCurrency } from '@/utils/calculations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CompPhotoViewerProps {
  comp: RentalComp;
  onClose: () => void;
}

export function CompPhotoViewer({ comp, onClose }: CompPhotoViewerProps) {
  const [index, setIndex] = useState(0);
  const photos = comp.photos;

  if (photos.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  return (
    <div className="absolute bottom-4 right-4 z-50 w-80 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
      {/* Photo area */}
      <div className="relative aspect-[4/3] bg-muted">
        <img
          src={photos[index]}
          alt={`${comp.address} photo ${index + 1}`}
          className="w-full h-full object-cover"
        />
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 bg-background/80 hover:bg-background"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        {/* Nav arrows */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-background/80 hover:bg-background"
              onClick={prev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-background/80 hover:bg-background"
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {/* Counter */}
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-medium bg-background/80 px-2 py-0.5 rounded-full text-foreground">
              {index + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {/* Info */}
      <div className="px-3 py-2.5 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold truncate">{comp.address}</p>
          <span className="text-sm font-bold text-primary whitespace-nowrap">
            {formatCurrency(comp.rent)}/mo
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{comp.bedrooms}bd/{comp.bathrooms}ba</span>
          <span>·</span>
          <span>{comp.sqft.toLocaleString()} sqft</span>
          <span>·</span>
          <span>{comp.distance} mi</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={comp.status === 'Active' ? 'success' as any : comp.status === 'Pending' ? 'amber' as any : 'gray' as any} className="text-[10px] h-5">
            {comp.status}
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            {comp.daysOnMarket}d on market · {comp.source}
          </span>
        </div>
      </div>
    </div>
  );
}
