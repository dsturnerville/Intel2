import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DispositionProperty } from '@/types/disposition';
import { formatCurrency } from '@/utils/calculations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Map as MapIcon, ExternalLink, Satellite, Maximize, Minimize } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

interface PropertyMapProps {
  properties: DispositionProperty[];
  onPropertyClick?: (propertyId: string) => void;
}

const MAPBOX_TOKEN_KEY = 'mapbox_access_token';

export function PropertyMap({ properties, onPropertyClick }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [accessToken, setAccessToken] = useState<string>(() => {
    return localStorage.getItem(MAPBOX_TOKEN_KEY) || '';
  });
  const [tokenInput, setTokenInput] = useState('');
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen toggle
  const toggleFullscreen = async () => {
    if (!mapWrapperRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await mapWrapperRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  // Listen for fullscreen changes (e.g., user presses Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Resize map when fullscreen changes
      setTimeout(() => map.current?.resize(), 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Get the appropriate map style based on satellite toggle
  const getMapStyle = () => {
    if (isSatellite) {
      return 'mapbox://styles/mapbox/satellite-streets-v12';
    }
    // Use Mapbox Standard style with 3D and automatic day/night
    return 'mapbox://styles/mapbox/standard';
  };

  // Update map style when satellite toggle changes
  useEffect(() => {
    if (map.current && isTokenValid) {
      map.current.setStyle(getMapStyle());
    }
  }, [isSatellite]);

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
        style: getMapStyle(),
        center,
        zoom,
        pitch: 45,
        bearing: -10,
        preserveDrawingBuffer: true, // Required for PDF capture
      });

      map.current.on('load', () => {
        setIsTokenValid(true);
      });

      // Add 3D terrain after style loads
      map.current.on('style.load', () => {
        if (!map.current) return;
        
        // Add terrain source
        if (!map.current.getSource('mapbox-dem')) {
          map.current.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14,
          });
        }

        // Enable 3D terrain
        map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

        // Add sky atmosphere for realism
        if (!map.current.getLayer('sky')) {
          map.current.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 90.0],
              'sky-atmosphere-sun-intensity': 15,
            },
          });
        }
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
          visualizePitch: true,
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
        const gainLossAmount = dp.outputs.gainLossVsBasis;
        const isGain = gainLossAmount && gainLossAmount >= 0;
        const gainLossColor = isGain ? '#16a34a' : '#dc2626';
        const trendingIcon = isGain 
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${gainLossColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle; margin-right: 2px;"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${gainLossColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle; margin-right: 2px;"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>`;
        const firstImage = dp.property.images?.[0];
        const hasImage = !!firstImage?.url;
        const imageUrl = hasImage ? firstImage.url : '/images/default-home.png';
        const imageAlt = firstImage?.title || 'Property';
        
        const occupancyStatus = dp.property.occupancyStatus || 'Vacant';
        const occupancyColors: Record<string, { bg: string; border: string; text: string }> = {
          'Occupied': { bg: 'rgba(22, 163, 74, 0.25)', border: 'rgba(22, 163, 74, 0.6)', text: '#1a1a2e' },
          'Vacant': { bg: 'rgba(220, 38, 38, 0.25)', border: 'rgba(220, 38, 38, 0.6)', text: '#1a1a2e' },
          'Notice Given': { bg: 'rgba(245, 158, 11, 0.25)', border: 'rgba(245, 158, 11, 0.6)', text: '#1a1a2e' }
        };
        const occupancyStyle = occupancyColors[occupancyStatus] || occupancyColors['Vacant'];
        
        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; width: 200px;">
            <div style="margin: -10px -10px 8px -10px; border-radius: 8px 8px 0 0; overflow: hidden; background: #ffffff; position: relative;">
              <img 
                src="${imageUrl}" 
                alt="${imageAlt}" 
                style="width: 100%; height: 100px; object-fit: ${hasImage ? 'cover' : 'contain'}; display: block;"
              />
              <div style="position: absolute; bottom: 6px; left: 6px; background: ${occupancyStyle.bg}; color: ${occupancyStyle.text}; font-size: 7px; font-weight: 600; padding: 1.5px 6px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.25px; border: 1px solid ${occupancyStyle.border}; backdrop-filter: blur(4px);">
                ${occupancyStatus}
              </div>
            </div>
            <div style="font-size: 16px; font-weight: 600; color: #1a1a2e; margin-bottom: 2px;">
              ${dp.outputs.projectedSalePrice ? formatCurrency(dp.outputs.projectedSalePrice) : 'TBD'}
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
              ${dp.outputs.netSaleProceeds ? `Net: ${formatCurrency(dp.outputs.netSaleProceeds)}` : 'Net: TBD'}
              ${gainLossAmount !== null ? `<span style="margin-left: 8px; font-weight: 500; color: ${gainLossColor};">${trendingIcon}${formatCurrency(Math.abs(gainLossAmount))}</span>` : ''}
            </div>
            <div style="font-size: 11px; color: #999; line-height: 1.4;">
              <div>${dp.property.address}</div>
              <div>${dp.property.city}, ${dp.property.state} ${dp.property.zipCode}</div>
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          maxWidth: '220px',
          className: 'custom-popup',
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
    <div 
      ref={mapWrapperRef}
      className={`relative w-full rounded-lg overflow-hidden border border-border bg-background ${
        isFullscreen ? 'h-screen' : 'h-[500px]'
      }`}
    >
      <div ref={mapContainer} className="absolute inset-0" />
      {properties.filter((p) => p.property.latitude && p.property.longitude).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
          <p className="text-muted-foreground">No properties with coordinates to display</p>
        </div>
      )}
      
      {/* Map style controls */}
      <div className="absolute top-2 left-2 flex gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-md border border-border">
        <Toggle 
          pressed={isSatellite} 
          onPressedChange={setIsSatellite}
          size="sm"
          aria-label="Toggle satellite view"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <Satellite className="h-4 w-4" />
        </Toggle>
        <Toggle 
          pressed={isFullscreen} 
          onPressedChange={toggleFullscreen}
          size="sm"
          aria-label="Toggle fullscreen"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Toggle>
      </div>

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleClearToken}
        className="absolute bottom-2 right-2 text-xs opacity-50 hover:opacity-100 bg-background/50"
      >
        Change token
      </Button>
    </div>
  );
}
