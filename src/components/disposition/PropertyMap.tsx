import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DispositionProperty } from '@/types/disposition';
import { formatCurrency } from '@/utils/calculations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Map as MapIcon, ExternalLink } from 'lucide-react';

interface PropertyMapProps {
  properties: DispositionProperty[];
  onPropertyClick?: (propertyId: string) => void;
}

const MAPBOX_TOKEN_KEY = 'mapbox_access_token';

export function PropertyMap({ properties, onPropertyClick }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [accessToken, setAccessToken] = useState<string>(() => {
    return localStorage.getItem(MAPBOX_TOKEN_KEY) || '';
  });
  const [tokenInput, setTokenInput] = useState('');
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, tokenInput.trim());
      setAccessToken(tokenInput.trim());
      setIsTokenValid(null); // Reset validation state
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem(MAPBOX_TOKEN_KEY);
    setAccessToken('');
    setTokenInput('');
    setIsTokenValid(null);
  };

  useEffect(() => {
    if (!mapContainer.current || !accessToken) return;

    // Set the access token
    mapboxgl.accessToken = accessToken;

    // Filter properties with valid coordinates
    const propertiesWithCoords = properties.filter(
      (p) => p.property.latitude && p.property.longitude
    );

    // Calculate center from properties or default to US center
    let center: [number, number] = [-98.5795, 39.8283]; // US center
    let zoom = 3;

    if (propertiesWithCoords.length > 0) {
      const lats = propertiesWithCoords.map((p) => p.property.latitude!);
      const lngs = propertiesWithCoords.map((p) => p.property.longitude!);
      center = [
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
        (Math.min(...lats) + Math.max(...lats)) / 2,
      ];
      zoom = propertiesWithCoords.length === 1 ? 12 : 5;
    }

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center,
        zoom,
        pitch: 0,
      });

      map.current.on('load', () => {
        setIsTokenValid(true);
      });

      map.current.on('error', (e) => {
        const error = e.error as { status?: number } | undefined;
        if (error?.status === 401) {
          setIsTokenValid(false);
        }
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: false,
        }),
        'top-right'
      );

      // Add markers for each property
      propertiesWithCoords.forEach((dp) => {
        const el = document.createElement('div');
        el.className = 'property-marker';
        el.style.cssText = `
          width: 32px;
          height: 32px;
          background: hsl(209, 100%, 27%);
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s ease;
          transform-origin: center center;
        `;
        el.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        `;

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
        });
        el.addEventListener('click', () => {
          onPropertyClick?.(dp.propertyId);
        });

        // Create popup content
        const popupContent = `
          <div style="color: #1a1a2e; font-family: system-ui, sans-serif; min-width: 200px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${dp.property.address}</div>
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${dp.property.city}, ${dp.property.state} ${dp.property.zipCode}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
              <div>
                <div style="color: #888;">Beds/Baths</div>
                <div style="font-weight: 500;">${dp.property.beds}bd / ${dp.property.baths}ba</div>
              </div>
              <div>
                <div style="color: #888;">Sq Ft</div>
                <div style="font-weight: 500;">${dp.property.sqft.toLocaleString()}</div>
              </div>
              ${dp.outputs.projectedSalePrice ? `
                <div style="grid-column: span 2;">
                  <div style="color: #888;">Projected Sale</div>
                  <div style="font-weight: 600; color: #00478A;">${formatCurrency(dp.outputs.projectedSalePrice)}</div>
                </div>
              ` : ''}
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          maxWidth: '280px',
        }).setHTML(popupContent);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([dp.property.longitude!, dp.property.latitude!])
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });

      // Fit bounds if multiple properties
      if (propertiesWithCoords.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        propertiesWithCoords.forEach((dp) => {
          bounds.extend([dp.property.longitude!, dp.property.latitude!]);
        });
        map.current.fitBounds(bounds, { padding: 60, maxZoom: 12 });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsTokenValid(false);
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [properties, onPropertyClick, accessToken]);

  // Show token input if no token is set or token is invalid
  if (!accessToken || isTokenValid === false) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MapIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Mapbox Access Token Required</h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
            To display the map, please enter your Mapbox public access token. 
            You can find this in your{' '}
            <a 
              href="https://account.mapbox.com/access-tokens/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Mapbox account
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
          {isTokenValid === false && (
            <p className="text-sm text-destructive mb-4">
              The token you provided appears to be invalid. Please check and try again.
            </p>
          )}
          <div className="flex gap-2 w-full max-w-md">
            <Input
              type="text"
              placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveToken} disabled={!tokenInput.trim()}>
              Save Token
            </Button>
          </div>
          {accessToken && isTokenValid === false && (
            <Button variant="ghost" size="sm" onClick={handleClearToken} className="mt-2">
              Clear saved token
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-border">
      <div ref={mapContainer} className="absolute inset-0" />
      {properties.filter((p) => p.property.latitude && p.property.longitude).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
          <p className="text-muted-foreground">No properties with coordinates to display</p>
        </div>
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleClearToken}
        className="absolute bottom-2 right-2 text-xs opacity-50 hover:opacity-100"
      >
        Change token
      </Button>
    </div>
  );
}
