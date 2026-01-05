import { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Opportunity } from '@/types/opportunity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Maximize2, 
  Minimize2, 
  Layers, 
  Map as MapIcon, 
  Key,
  X 
} from 'lucide-react';

interface AcquisitionPropertyMapProps {
  opportunities: Opportunity[];
  onPropertyClick?: (opportunityId: string) => void;
}

const MAPBOX_TOKEN_KEY = 'mapbox_access_token';

export function AcquisitionPropertyMap({ opportunities, onPropertyClick }: AcquisitionPropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [tokenError, setTokenError] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(MAPBOX_TOKEN_KEY);
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);

  const handleTokenSubmit = useCallback(() => {
    if (!tokenInput.trim()) {
      setTokenError('Please enter a Mapbox token');
      return;
    }
    
    // Validate token format (starts with pk.)
    if (!tokenInput.startsWith('pk.')) {
      setTokenError('Invalid token format. Mapbox public tokens start with "pk."');
      return;
    }
    
    localStorage.setItem(MAPBOX_TOKEN_KEY, tokenInput.trim());
    setMapboxToken(tokenInput.trim());
    setTokenError('');
    setShowTokenInput(false);
  }, [tokenInput]);

  const handleClearToken = useCallback(() => {
    localStorage.removeItem(MAPBOX_TOKEN_KEY);
    setMapboxToken('');
    setTokenInput('');
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    markersRef.current = [];
  }, []);

  // Filter opportunities with valid coordinates
  const propertiesWithCoords = opportunities.filter(opp => 
    opp.latitude !== undefined && 
    opp.longitude !== undefined &&
    opp.latitude !== null &&
    opp.longitude !== null
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    // Calculate center from properties or use US center
    let center: [number, number] = [-98.5795, 39.8283];
    let zoom = 3.5;
    
    if (propertiesWithCoords.length > 0) {
      const lngs = propertiesWithCoords.map(p => p.longitude!);
      const lats = propertiesWithCoords.map(p => p.latitude!);
      center = [
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
        (Math.min(...lats) + Math.max(...lats)) / 2
      ];
      zoom = 10;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: isSatellite 
          ? 'mapbox://styles/mapbox/satellite-streets-v12' 
          : 'mapbox://styles/mapbox/light-v11',
        center,
        zoom,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('error', (e) => {
        const errorEvent = e as mapboxgl.ErrorEvent & { error?: { status?: number } };
        if (errorEvent.error?.status === 401) {
          setTokenError('Invalid Mapbox token. Please check your token and try again.');
          handleClearToken();
        }
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenError('Failed to initialize map. Please check your token.');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, isSatellite, handleClearToken, propertiesWithCoords]);

  // Add markers for properties
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (propertiesWithCoords.length === 0) return;

    // Wait for map to load
    const addMarkers = () => {
      propertiesWithCoords.forEach(opp => {
        const el = document.createElement('div');
        el.className = 'w-6 h-6 bg-primary rounded-full border-2 border-background shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center';
        el.innerHTML = '<div class="w-2 h-2 bg-background rounded-full"></div>';

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <div class="font-medium text-sm">${opp.address1}</div>
            <div class="text-xs text-muted-foreground">${opp.city}, ${opp.state} ${opp.zipCode}</div>
            ${opp.offerPrice ? `<div class="text-sm font-medium mt-1">$${opp.offerPrice.toLocaleString()}</div>` : ''}
          </div>
        `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([opp.longitude!, opp.latitude!])
          .setPopup(popup)
          .addTo(map.current!);

        if (onPropertyClick) {
          el.addEventListener('click', () => onPropertyClick(opp.id));
        }

        markersRef.current.push(marker);
      });
    };

    if (map.current.loaded()) {
      addMarkers();
    } else {
      map.current.on('load', addMarkers);
    }
  }, [propertiesWithCoords, onPropertyClick]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const toggleSatellite = useCallback(() => {
    setIsSatellite(prev => !prev);
  }, []);

  // Token input screen
  if (!mapboxToken || showTokenInput) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5" />
            Mapbox Access Token Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To view the property map, please enter your Mapbox public access token. 
            You can find your token at{' '}
            <a 
              href="https://account.mapbox.com/access-tokens/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Public Access Token</Label>
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1Ijoi..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTokenSubmit()}
            />
            {tokenError && (
              <p className="text-sm text-destructive">{tokenError}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleTokenSubmit}>
              Save Token
            </Button>
            {showTokenInput && (
              <Button variant="outline" onClick={() => setShowTokenInput(false)}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No properties with coordinates message
  if (opportunities.length === 0) {
    return (
      <Card className="border-border border-dashed bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MapIcon className="h-10 w-10 text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground">
            No properties to display on map
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      className={`relative rounded-lg overflow-hidden border border-border ${
        isFullscreen 
          ? 'fixed inset-0 z-50 rounded-none' 
          : 'h-[500px]'
      }`}
    >
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleSatellite}
          className="h-8 w-8 bg-background/90 backdrop-blur"
          title={isSatellite ? 'Switch to street view' : 'Switch to satellite view'}
        >
          <Layers className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleFullscreen}
          className="h-8 w-8 bg-background/90 backdrop-blur"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setShowTokenInput(true)}
          className="h-8 w-8 bg-background/90 backdrop-blur"
          title="Change Mapbox token"
        >
          <Key className="h-4 w-4" />
        </Button>
      </div>

      {/* Property count indicator */}
      <div className="absolute bottom-3 left-3 z-10">
        <div className="bg-background/90 backdrop-blur rounded-md px-3 py-1.5 text-sm">
          <span className="font-medium">{propertiesWithCoords.length}</span>
          <span className="text-muted-foreground ml-1">
            of {opportunities.length} properties mapped
          </span>
          {propertiesWithCoords.length < opportunities.length && (
            <span className="text-muted-foreground ml-2">
              ({opportunities.length - propertiesWithCoords.length} missing coordinates)
            </span>
          )}
        </div>
      </div>

      {/* Close button in fullscreen */}
      {isFullscreen && (
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 z-10 h-8 w-8 bg-background/90 backdrop-blur"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
