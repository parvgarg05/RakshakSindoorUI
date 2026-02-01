/**
 * MapView Component
 * Leaflet-based map component using free OpenStreetMap tiles
 * No API key required
 */

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue in React/Webpack/Vite
// Use CDN URLs as fallback for reliability
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface MapMarker {
  id: string;
  position: [number, number]; // [lat, lng]
  type: "sos" | "safe" | "medical" | "evacuation" | "default";
  title?: string;
  description?: string;
  data?: any;
}

export interface MapViewProps {
  center: [number, number]; // [lat, lng]
  zoom?: number;
  markers?: MapMarker[];
  onLocationSelect?: (lat: number, lng: number) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  height?: string;
  className?: string;
  enableLocationPicker?: boolean;
  showUserLocation?: boolean;
}

const MarkerColors = {
  sos: "#ef4444", // Red
  safe: "#22c55e", // Green
  medical: "#3b82f6", // Blue
  evacuation: "#f59e0b", // Amber
  default: "#6366f1", // Indigo
};

export function MapView({
  center,
  zoom = 13,
  markers = [],
  onLocationSelect,
  onMarkerClick,
  height = "500px",
  className = "",
  enableLocationPicker = false,
  showUserLocation = true,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Create map instance
    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    // Add OpenStreetMap tile layer (no API key required)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 3,
    }).addTo(map);

    // Create layer group for markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Handle location picker
    if (enableLocationPicker && onLocationSelect) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
        
        // Add temporary marker at clicked location
        L.circleMarker(e.latlng, {
          radius: 8,
          fillColor: "#8b5cf6",
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .addTo(map)
          .bindPopup("Selected Location")
          .openPopup();
      });
    }

    mapRef.current = map;

    // Handle window resize to invalidate map size
    const handleWindowResize = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener("resize", handleWindowResize);

    // Get user location if enabled
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(userPos);

          // Add user location marker
          if (mapRef.current) {
            L.circleMarker(userPos, {
              radius: 10,
              fillColor: "#3b82f6",
              color: "#ffffff",
              weight: 3,
              opacity: 1,
              fillOpacity: 0.8,
            })
              .addTo(mapRef.current)
              .bindPopup("Your Location");
          }
        },
        (error) => {
          console.warn("Geolocation error:", error);
        }
      );
    }

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [enableLocationPicker, onLocationSelect, showUserLocation]); // Run when dependencies change

  // Update map center when center prop changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    markers.forEach((marker) => {
      if (!markersLayerRef.current) return;

      const markerColor = MarkerColors[marker.type] || MarkerColors.default;

      // Create circle marker for better performance
      const circleMarker = L.circleMarker(marker.position, {
        radius: 8,
        fillColor: markerColor,
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });

      // Add popup content
      if (marker.title || marker.description) {
        const popupContent = `
          <div class="p-2">
            ${marker.title ? `<h3 class="font-semibold text-sm mb-1">${marker.title}</h3>` : ""}
            ${marker.description ? `<p class="text-xs text-gray-600">${marker.description}</p>` : ""}
          </div>
        `;
        circleMarker.bindPopup(popupContent);
      }

      // Handle marker click
      if (onMarkerClick) {
        circleMarker.on("click", () => {
          onMarkerClick(marker);
        });
      }

      circleMarker.addTo(markersLayerRef.current);
    });
  }, [markers, onMarkerClick]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div
        ref={containerRef}
        style={{ 
          height: height || "100%", 
          width: "100%",
          minHeight: "400px"
        }}
        className="w-full overflow-hidden z-0"
      />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Zoom to user location button */}
        {userLocation && (
          <button
            onClick={() => {
              if (mapRef.current && userLocation) {
                mapRef.current.setView(userLocation, 15);
              }
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-lg transition-colors"
            title="Go to my location"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Map Legend */}
      {markers.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
          <h4 className="text-xs font-semibold mb-2 text-gray-700">Legend</h4>
          <div className="flex flex-col gap-1">
            {Object.entries(
              markers.reduce((acc, m) => {
                acc[m.type] = (acc[m.type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: MarkerColors[type as keyof typeof MarkerColors] }}
                />
                <span className="capitalize text-gray-600">
                  {type} ({count})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location picker hint */}
      {enableLocationPicker && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg px-3 py-2">
          <p className="text-xs text-gray-600">Click on map to select location</p>
        </div>
      )}
    </div>
  );
}

export default MapView;
