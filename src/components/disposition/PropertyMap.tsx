import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTheme } from 'next-themes';
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
  const { resolvedTheme } = useTheme();
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

    // Determine map style based on theme
    const mapStyle = resolvedTheme === 'dark' 
      ? 'mapbox://styles/mapbox/dark-v11' 
      : 'mapbox://styles/mapbox/light-v11';

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
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
          cursor: pointer;
        `;

        // IMPORTANT: Mapbox positions markers using CSS transforms.
        // If we set `transform` on the marker element itself, it overrides Mapbox's transform and the marker jumps.
        // So we animate an inner element instead.
        const inner = document.createElement('div');
        inner.style.cssText = `
          width: 32px;
          height: 32px;
          background: hsl(var(--primary));
          border: 2px solid hsl(var(--primary-foreground));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px hsl(0 0% 0% / 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          transform-origin: center center;
        `;

        inner.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary-foreground))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        `;

        el.appendChild(inner);

        // Create popup content with disposition details
        const gainLossPercent = dp.outputs.gainLossPercent;
        const gainLossColor = gainLossPercent && gainLossPercent >= 0 ? '#16a34a' : '#dc2626';
        const gainLossSign = gainLossPercent && gainLossPercent >= 0 ? '+' : '';
        
        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px;">
            <div style="font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 2px;">
              ${dp.outputs.projectedSalePrice ? formatCurrency(dp.outputs.projectedSalePrice) : 'TBD'}
            </div>
            <div style="font-size: 13px; color: #666; margin-bottom: 12px;">
              ${dp.outputs.netSaleProceeds ? `Net: ${formatCurrency(dp.outputs.netSaleProceeds)}` : 'Projected Sale Price'}
            </div>
            <div style="display: flex; gap: 16px; font-size: 12px; margin-bottom: 12px;">
              ${gainLossPercent !== null ? `
                <div>
                  <span style="color: #888;">Gain/Loss</span>
                  <span style="margin-left: 6px; font-weight: 600; color: ${gainLossColor};">${gainLossSign}${gainLossPercent?.toFixed(1)}%</span>
                </div>
              ` : ''}
              ${dp.inputs.capRate ? `
                <div>
                  <span style="color: #888;">Cap Rate</span>
                  <span style="margin-left: 6px; font-weight: 600; color: #1a1a2e;">${(dp.inputs.capRate * 100).toFixed(1)}%</span>
                </div>
              ` : ''}
            </div>
            <div style="font-size: 13px; color: #7c3aed; font-weight: 500;">
              ${dp.property.address}, ${dp.property.city}, ${dp.property.state} ${dp.property.zipCode}
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          maxWidth: '280px',
        }).setHTML(popupContent);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([dp.property.longitude!, dp.property.latitude!])
          .setPopup(popup)
          .addTo(map.current!);

        let isPinned = false;

        el.addEventListener('mouseenter', () => {
          inner.style.transform = 'scale(1.2)';
          inner.style.boxShadow = '0 6px 18px hsl(0 0% 0% / 0.45)';
          if (!isPinned && !popup.isOpen()) {
            marker.togglePopup();
          }
        });

        el.addEventListener('mouseleave', () => {
          inner.style.transform = 'scale(1)';
          inner.style.boxShadow = '0 2px 8px hsl(0 0% 0% / 0.35)';
          if (!isPinned && popup.isOpen()) {
            marker.togglePopup();
          }
        });

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          isPinned = true;
          if (!popup.isOpen()) {
            marker.togglePopup();
          }
          onPropertyClick?.(dp.propertyId);
        });

        popup.on('close', () => {
          isPinned = false;
        });

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
  }, [properties, onPropertyClick, accessToken, resolvedTheme]);

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
