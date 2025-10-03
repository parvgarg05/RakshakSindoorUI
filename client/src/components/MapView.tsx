import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    type: 'sos' | 'evacuation' | 'medical' | 'safe';
    label?: string;
  }>;
  height?: string;
}

const markerColors = {
  sos: '#E53E3E',
  evacuation: '#DD6B20',
  medical: '#38A169',
  safe: '#3182CE',
};

export default function MapView({ 
  center = [34.0837, 74.7973], 
  zoom = 12, 
  markers = [],
  height = '400px'
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markers.forEach(marker => {
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: ${markerColors[marker.type]}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
      });

      L.marker(marker.position, { icon: customIcon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(marker.label || marker.type);
    });
  }, [markers]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%' }} 
      className="rounded-md overflow-hidden border"
      data-testid="map-view"
    />
  );
}
