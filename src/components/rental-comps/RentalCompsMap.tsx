import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RentalComp } from '@/data/mockRentalComps';
import { formatCurrency } from '@/utils/calculations';
import { CompPhotoViewer } from './CompPhotoViewer';

const MAPBOX_TOKEN_KEY = 'mapbox_access_token';
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoiZHR1cm5lci1pbGVob21lcyIsImEiOiJjbG9odHNpNzAwMnV1MmxvN3hnNzhibW9zIn0.nRT3aVvfGU5kJlsSzHXivg';

interface RentalCompsMapProps {
  subjectLat: number;
  subjectLng: number;
  subjectAddress: string;
  comps: RentalComp[];
  selectedIds: Set<string>;
  highlightedId: string | null;
  onCompClick: (id: string) => void;
  onCompHover: (id: string | null) => void;
  radiusMiles: number;
}

function generateCircleCoords(lat: number, lng: number, radiusMiles: number, points = 64): [number, number][] {
  const coords: [number, number][] = [];
  const km = radiusMiles * 1.60934;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dLat = (km / 111.32) * Math.cos(angle);
    const dLng = (km / (111.32 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    coords.push([lng + dLng, lat + dLat]);
  }
  return coords;
}

export function RentalCompsMap({
  subjectLat,
  subjectLng,
  subjectAddress,
  comps,
  selectedIds,
  highlightedId,
  onCompClick,
  onCompHover,
  radiusMiles,
}: RentalCompsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const subjectMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [viewerCompId, setViewerCompId] = useState<string | null>(null);

  const accessToken = localStorage.getItem(MAPBOX_TOKEN_KEY) || DEFAULT_MAPBOX_TOKEN;

  // Init map
  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [subjectLng, subjectLat],
      zoom: 13,
      projection: 'mercator',
    });

    map.current.on('load', () => {
      setLoaded(true);
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
      setLoaded(false);
    };
  }, [subjectLat, subjectLng, accessToken]);

  // Radius circle
  useEffect(() => {
    if (!map.current || !loaded) return;

    const circleCoords = generateCircleCoords(subjectLat, subjectLng, radiusMiles);
    const circleData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [circleCoords] },
      }],
    };

    const source = map.current.getSource('radius-circle') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(circleData);
    } else {
      map.current.addSource('radius-circle', { type: 'geojson', data: circleData });
      map.current.addLayer({
        id: 'radius-circle-fill',
        type: 'fill',
        source: 'radius-circle',
        paint: { 'fill-color': 'hsl(207, 100%, 27%)', 'fill-opacity': 0.08 },
      });
      map.current.addLayer({
        id: 'radius-circle-line',
        type: 'line',
        source: 'radius-circle',
        paint: { 'line-color': 'hsl(207, 100%, 27%)', 'line-width': 2, 'line-opacity': 0.4, 'line-dasharray': [4, 2] },
      });
    }
  }, [loaded, radiusMiles, subjectLat, subjectLng]);

  // Subject marker
  useEffect(() => {
    if (!map.current || !loaded) return;

    if (subjectMarkerRef.current) subjectMarkerRef.current.remove();

    const el = document.createElement('div');
    el.style.cssText = `
      width: 20px; height: 20px; border-radius: 50%;
      background: hsl(207, 100%, 27%);
      border: 3px solid white;
      box-shadow: 0 0 12px rgba(0,100,200,0.5);
    `;

    const popup = new mapboxgl.Popup({ offset: 12, closeButton: false })
      .setHTML(`<div style="font-family:system-ui;font-size:12px;font-weight:600;color:#1a1a2e;">Subject Unit<br/><span style="font-weight:400;color:#666;">${subjectAddress}</span></div>`);

    subjectMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([subjectLng, subjectLat])
      .setPopup(popup)
      .addTo(map.current);

    return () => { subjectMarkerRef.current?.remove(); };
  }, [loaded, subjectLat, subjectLng, subjectAddress]);

  // Comp markers
  useEffect(() => {
    if (!map.current || !loaded) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    comps.forEach((comp) => {
      const isSelected = selectedIds.has(comp.id);
      const el = document.createElement('div');
      el.style.cssText = `
        width: 12px; height: 12px; border-radius: 50%; cursor: pointer;
        background: ${isSelected ? 'hsl(160, 84%, 39%)' : 'hsl(38, 92%, 50%)'};
        border: 2px solid white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        transition: transform 0.15s;
      `;

      el.addEventListener('mouseenter', () => {
        onCompHover(comp.id);

        popupRef.current?.remove();
        popupRef.current = new mapboxgl.Popup({ offset: 10, closeButton: false, maxWidth: '220px' })
          .setLngLat([comp.longitude, comp.latitude])
          .setHTML(`
            <div style="font-family:system-ui;font-size:12px;">
              ${comp.photos.length > 0 ? `<img src="${comp.photos[0]}" alt="${comp.address}" style="width:100%;height:100px;object-fit:cover;border-radius:4px;margin-bottom:6px;" />` : ''}
              <div style="font-weight:600;color:#1a1a2e;">${formatCurrency(comp.rent)}/mo</div>
              <div style="color:#666;">${comp.bedrooms}bd/${comp.bathrooms}ba · ${comp.sqft.toLocaleString()} sqft</div>
              <div style="color:#999;font-size:11px;">${comp.address}</div>
            </div>
          `)
          .addTo(map.current!);
      });

      el.addEventListener('mouseleave', () => {
        onCompHover(null);
        popupRef.current?.remove();
      });

      el.addEventListener('click', () => {
        onCompClick(comp.id);
        setViewerCompId(comp.id);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([comp.longitude, comp.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [loaded, comps, selectedIds]);

  // Highlight effect
  useEffect(() => {
    if (!map.current || !loaded) return;

    comps.forEach((comp, i) => {
      const marker = markersRef.current[i];
      if (!marker) return;
      const container = marker.getElement();
      const inner = container.firstElementChild as HTMLElement | null;
      if (!inner) return;
      if (comp.id === highlightedId) {
        inner.style.transform = 'scale(1.5)';
        container.style.zIndex = '10';
      } else {
        inner.style.transform = 'scale(1)';
        container.style.zIndex = '1';
      }
    });
  }, [highlightedId, loaded, comps]);

  const viewerComp = useMemo(() => comps.find(c => c.id === viewerCompId) || null, [comps, viewerCompId]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-md" />
      {viewerComp && viewerComp.photos.length > 0 && (
        <CompPhotoViewer comp={viewerComp} onClose={() => setViewerCompId(null)} />
      )}
    </div>
  );
}
