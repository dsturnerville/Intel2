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
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoiZHR1cm5lci1pbGVob21lcyIsImEiOiJjbG9odHNpNzAwMnV1MmxvN3hnNzhibW9zIn0.nRT3aVvfGU5kJlsSzHXivg';

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'TBD';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

export function AcquisitionPropertyMap({ opportunities, onPropertyClick }: AcquisitionPropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const isPersistentPopup = useRef<boolean>(false);
  
  const [accessToken, setAccessToken] = useState<string>(() => {
    return localStorage.getItem(MAPBOX_TOKEN_KEY) || DEFAULT_MAPBOX_TOKEN;
  });
  const [tokenInput, setTokenInput] = useState<string>('');
  const [tokenError, setTokenError] = useState<string>('');
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);

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

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
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
    return 'mapbox://styles/mapbox/standard';
  };

  // Update map style when satellite toggle changes
  useEffect(() => {
    if (map.current && isTokenValid) {
      map.current.setStyle(getMapStyle());
    }
  }, [isSatellite]);

  const handleTokenSubmit = useCallback(() => {
    if (!tokenInput.trim()) {
      setTokenError('Please enter a Mapbox token');
      return;
    }
    
    if (!tokenInput.startsWith('pk.')) {
      setTokenError('Invalid token format. Mapbox public tokens start with "pk."');
      return;
    }
    
    localStorage.setItem(MAPBOX_TOKEN_KEY, tokenInput.trim());
    setAccessToken(tokenInput.trim());
    setTokenError('');
    setShowTokenInput(false);
    setIsTokenValid(null);
  }, [tokenInput]);

  const handleClearToken = useCallback(() => {
    localStorage.removeItem(MAPBOX_TOKEN_KEY);
    setAccessToken('');
    setTokenInput('');
    setIsTokenValid(null);
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
  }, []);

  // Filter opportunities with valid coordinates
  const propertiesWithCoords = opportunities.filter(opp => 
    opp.latitude !== undefined && 
    opp.longitude !== undefined &&
    opp.latitude !== null &&
    opp.longitude !== null
  );

  // Create popup content for an opportunity
  const createPopupContent = (opp: Opportunity) => {
    const computedStyle = getComputedStyle(document.documentElement);
    
    const getBadgeColors = (status: string) => {
      if (status === 'Occupied') {
        return {
          bg: `hsl(${computedStyle.getPropertyValue('--badge-success-bg').trim() || '142 76% 36%'})`,
          border: `hsl(${computedStyle.getPropertyValue('--badge-success-border').trim() || '142 76% 36%'})`,
          text: `hsl(${computedStyle.getPropertyValue('--badge-success-text').trim() || '0 0% 100%'})`
        };
      } else {
        return {
          bg: `hsl(${computedStyle.getPropertyValue('--badge-gray-bg').trim() || '220 9% 46%'})`,
          border: `hsl(${computedStyle.getPropertyValue('--badge-gray-border').trim() || '220 9% 46%'})`,
          text: `hsl(${computedStyle.getPropertyValue('--badge-gray-text').trim() || '0 0% 100%'})`
        };
      }
    };

    const occupancyStatus = opp.occupancy || 'Vacant';
    const occupancyStyle = getBadgeColors(occupancyStatus);
    const imageUrl = '/images/property-popup-default.png';

    return `
      <div style="font-family: system-ui, -apple-system, sans-serif; width: 220px;">
        <div style="margin: -10px -10px 8px -10px; border-radius: 8px 8px 0 0; overflow: hidden; background: #f5f5f5; position: relative;">
          <img 
            src="${imageUrl}" 
            alt="Property" 
            style="width: 100%; height: 100px; object-fit: cover; display: block; background: #f5f5f5;"
          />
          <div style="position: absolute; bottom: 6px; left: 6px; background: ${occupancyStyle.bg}; color: ${occupancyStyle.text}; font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 9999px; border: 1px solid ${occupancyStyle.border}; backdrop-filter: blur(4px);">
            ${occupancyStatus}
          </div>
        </div>
        <div style="font-size: 16px; font-weight: 600; color: #1a1a2e; margin-bottom: 2px;">
          ${formatCurrency(opp.offerPrice)}
        </div>
        <div style="font-size: 12px; color: #666; margin-bottom: 6px;">
          NOI: ${formatCurrency(opp.projectedNoi)}
        </div>
        <div style="display: flex; gap: 8px; font-size: 11px; color: #666; margin-bottom: 6px; flex-wrap: wrap;">
          <span>${opp.bedrooms ?? '—'} Beds</span>
          <span>•</span>
          <span>${opp.bathrooms ?? '—'} Baths</span>
          <span>•</span>
          <span>${opp.squareFeet ? opp.squareFeet.toLocaleString() : '—'} SF</span>
        </div>
        <div style="font-size: 11px; color: #666; margin-bottom: 4px;">
          Year Built: ${opp.yearBuilt ?? '—'}
        </div>
        <div style="font-size: 11px; color: #999; line-height: 1.4;">
          <div>${opp.address1}</div>
          <div>${opp.city}, ${opp.state} ${opp.zipCode}</div>
        </div>
      </div>
    `;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !accessToken) return;

    mapboxgl.accessToken = accessToken;

    // Create a map from opportunityId to Opportunity for quick lookup
    const opportunityMap = new Map<string, Opportunity>();
    propertiesWithCoords.forEach(opp => {
      opportunityMap.set(opp.id, opp);
    });

    // Calculate center from properties or use US center
    let center: [number, number] = [-98.5795, 39.8283];
    let zoom = 3;
    
    if (propertiesWithCoords.length > 0) {
      const lngs = propertiesWithCoords.map(p => p.longitude!);
      const lats = propertiesWithCoords.map(p => p.latitude!);
      center = [
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
        (Math.min(...lats) + Math.max(...lats)) / 2
      ];
      zoom = propertiesWithCoords.length === 1 ? 12 : 5;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: getMapStyle(),
        center,
        zoom,
        pitch: 0,
        bearing: 0,
        projection: 'mercator',
        preserveDrawingBuffer: true,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setIsTokenValid(true);
      });

      map.current.on('error', (e) => {
        const errorEvent = e as mapboxgl.ErrorEvent & { error?: { status?: number } };
        if (errorEvent.error?.status === 401) {
          setTokenError('Invalid Mapbox token. Please check your token and try again.');
          handleClearToken();
        }
      });

      // Add clustering and layers after style loads
      map.current.on('style.load', () => {
        if (!map.current) return;

        // Enable automatic lighting for Mapbox Standard style
        try {
          const styleUrl = getMapStyle();
          if (styleUrl.includes('mapbox/standard')) {
            map.current.setConfigProperty('basemap', 'lightPreset', 'day');
          }
        } catch {
          // Ignore unsupported style configuration
        }

        // Create GeoJSON data for clustering
        const geojsonData: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: propertiesWithCoords.map(opp => ({
            type: 'Feature',
            properties: {
              opportunityId: opp.id,
              address: opp.address1,
              price: opp.offerPrice || 0,
            },
            geometry: {
              type: 'Point',
              coordinates: [opp.longitude!, opp.latitude!],
            },
          })),
        };

        // Add clustered source
        if (!map.current.getSource('properties')) {
          map.current.addSource('properties', {
            type: 'geojson',
            data: geojsonData,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          });
        }

        // Get CSS variable values for theming
        const computedStyle = getComputedStyle(document.documentElement);
        const primaryHsl = computedStyle.getPropertyValue('--primary').trim();
        const [h, s, l] = primaryHsl.split(' ').map(v => parseFloat(v));
        
        const primaryColor = `hsl(${h}, ${s}%, ${l}%)`;
        const primaryMedium = `hsl(${h}, ${s}%, ${Math.max(l - 10, 20)}%)`;
        const primaryDark = `hsl(${h}, ${s}%, ${Math.max(l - 20, 15)}%)`;

        // Glow effect layer for clusters
        if (!map.current.getLayer('clusters-glow')) {
          map.current.addLayer({
            id: 'clusters-glow',
            type: 'circle',
            source: 'properties',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': primaryColor,
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                28,
                5,
                35,
                10,
                42,
              ],
              'circle-blur': 0.7,
              'circle-opacity': 0.35,
            },
          });
        }

        // Cluster circles layer
        if (!map.current.getLayer('clusters')) {
          map.current.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'properties',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                primaryColor,
                5,
                primaryMedium,
                10,
                primaryDark,
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                5,
                25,
                10,
                30,
              ],
              'circle-stroke-width': 3,
              'circle-stroke-color': 'hsl(0, 0%, 100%)',
            },
          });
        }

        // Cluster count labels
        if (!map.current.getLayer('cluster-count')) {
          map.current.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'properties',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 14,
            },
            paint: {
              'text-color': '#ffffff',
            },
          });
        }

        // Glow effect layer for unclustered points
        if (!map.current.getLayer('unclustered-glow')) {
          map.current.addLayer({
            id: 'unclustered-glow',
            type: 'circle',
            source: 'properties',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': primaryColor,
              'circle-radius': 20,
              'circle-blur': 0.8,
              'circle-opacity': 0.4,
            },
          });
        }

        // Unclustered point layer
        if (!map.current.getLayer('unclustered-point')) {
          map.current.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'properties',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': primaryColor,
              'circle-radius': 12,
              'circle-stroke-width': 2,
              'circle-stroke-color': 'hsl(0, 0%, 100%)',
            },
          });
        }

        // Load custom home icon for property markers
        const homeIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
        const homeIconBlob = new Blob([homeIconSvg], { type: 'image/svg+xml' });
        const homeIconUrl = URL.createObjectURL(homeIconBlob);
        
        const homeImage = new Image(24, 24);
        homeImage.onload = () => {
          if (map.current && !map.current.hasImage('home-icon')) {
            map.current.addImage('home-icon', homeImage);
          }
          URL.revokeObjectURL(homeIconUrl);
        };
        homeImage.src = homeIconUrl;

        // House icon for unclustered points
        if (!map.current.getLayer('unclustered-icon')) {
          map.current.addLayer({
            id: 'unclustered-icon',
            type: 'symbol',
            source: 'properties',
            filter: ['!', ['has', 'point_count']],
            layout: {
              'icon-image': 'home-icon',
              'icon-size': 0.6,
              'icon-allow-overlap': true,
            },
          });
        }

        // Click on cluster to zoom in
        map.current.on('click', 'clusters', (e) => {
          const features = map.current!.queryRenderedFeatures(e.point, {
            layers: ['clusters'],
          });
          if (!features.length) return;
          
          const clusterId = features[0].properties?.cluster_id;
          const source = map.current!.getSource('properties') as mapboxgl.GeoJSONSource;
          
          source.getClusterExpansionZoom(clusterId, (err, expansionZoom) => {
            if (err) return;
            
            const geometry = features[0].geometry as GeoJSON.Point;
            map.current!.easeTo({
              center: geometry.coordinates as [number, number],
              zoom: expansionZoom,
            });
          });
        });

        // Click on unclustered point to show popup and zoom in
        map.current.on('click', 'unclustered-point', (e) => {
          if (!e.features?.length) return;
          
          const feature = e.features[0];
          const geometry = feature.geometry as GeoJSON.Point;
          const opportunityId = feature.properties?.opportunityId;
          const opp = opportunityMap.get(opportunityId);
          
          if (!opp) return;

          // Center and zoom
          map.current!.easeTo({
            center: geometry.coordinates as [number, number],
            zoom: 14,
            duration: 500,
          });

          // Remove existing popup
          if (popupRef.current) {
            popupRef.current.remove();
          }

          isPersistentPopup.current = true;
          popupRef.current = new mapboxgl.Popup({
            offset: 15,
            closeButton: true,
            closeOnClick: false,
            maxWidth: '240px',
            className: 'custom-popup',
          })
            .setLngLat(geometry.coordinates as [number, number])
            .setHTML(createPopupContent(opp))
            .addTo(map.current!);

          popupRef.current.on('close', () => {
            isPersistentPopup.current = false;
          });

          if (onPropertyClick) {
            onPropertyClick(opp.id);
          }
        });

        // Hover effects
        map.current.on('mouseenter', 'unclustered-point', (e) => {
          if (!map.current || isPersistentPopup.current) return;
          map.current.getCanvas().style.cursor = 'pointer';
          
          if (!e.features?.length) return;
          
          const feature = e.features[0];
          const geometry = feature.geometry as GeoJSON.Point;
          const opportunityId = feature.properties?.opportunityId;
          const opp = opportunityMap.get(opportunityId);
          
          if (!opp) return;

          if (popupRef.current) {
            popupRef.current.remove();
          }

          popupRef.current = new mapboxgl.Popup({
            offset: 15,
            closeButton: false,
            closeOnClick: false,
            maxWidth: '240px',
            className: 'custom-popup',
          })
            .setLngLat(geometry.coordinates as [number, number])
            .setHTML(createPopupContent(opp))
            .addTo(map.current);
        });

        map.current.on('mouseleave', 'unclustered-point', () => {
          if (!map.current || isPersistentPopup.current) return;
          map.current.getCanvas().style.cursor = '';
          
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }
        });

        map.current.on('mouseenter', 'clusters', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        
        map.current.on('mouseleave', 'clusters', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenError('Failed to initialize map. Please check your token.');
    }

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [accessToken, handleClearToken, propertiesWithCoords, onPropertyClick]);

  // Token input screen
  if (!accessToken || showTokenInput) {
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

  // No properties message
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
      ref={mapWrapperRef}
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
          onClick={() => setIsSatellite(prev => !prev)}
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
