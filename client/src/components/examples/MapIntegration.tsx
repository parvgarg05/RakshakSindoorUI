/**
 * Integration Example: MapView in Soldier Dashboard
 * This shows how to use the MapView component with OpenStreetMap
 */

import { useState, useEffect } from 'react';
import MapView, { type MapMarker } from '@/components/ui/MapView';
import { searchLocation, calculateDistance, findNearest, type Coordinates } from '@/lib/maps';

// Example integration in soldier-dashboard.tsx
export function SoldierMapExample() {
  // State for map center and markers
  const [mapCenter, setMapCenter] = useState<[number, number]>([34.0837, 74.7973]); // Srinagar
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Mock data - in production, fetch from API
  useEffect(() => {
    // Example: Load SOS signals, safe zones, evacuation points
    const mockMarkers: MapMarker[] = [
      {
        id: '1',
        position: [34.0837, 74.7973],
        type: 'safe',
        title: 'Safe Zone Alpha',
        description: 'Community shelter - Capacity 500',
      },
      {
        id: '2',
        position: [34.1000, 74.8100],
        type: 'sos',
        title: 'Active SOS Signal',
        description: 'Civilian needs immediate assistance',
      },
      {
        id: '3',
        position: [34.0700, 74.7800],
        type: 'medical',
        title: 'Medical Hub',
        description: 'Field hospital with 50 beds',
      },
      {
        id: '4',
        position: [34.0900, 74.8000],
        type: 'evacuation',
        title: 'Evacuation Point',
        description: 'Transport available',
      },
    ];

    setMarkers(mockMarkers);
  }, []);

  // Handle location search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const results = await searchLocation(searchQuery, {
      limit: 5,
      countrycodes: 'in',
    });

    if (results.length > 0) {
      const firstResult = results[0];
      const newCenter: [number, number] = [
        parseFloat(firstResult.lat),
        parseFloat(firstResult.lon),
      ];
      setMapCenter(newCenter);
      setSelectedLocation(firstResult.display_name);
    }
  };

  // Handle marker click
  const handleMarkerClick = (marker: MapMarker) => {
    console.log('Marker clicked:', marker);
    // Open details panel, show route, etc.
    alert(`${marker.title}\n${marker.description}`);
  };

  // Handle location selection (for placing new markers)
  const handleLocationSelect = (lat: number, lng: number) => {
    console.log('Location selected:', lat, lng);
    setSelectedLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  // Find nearest safe zone to user location
  const findNearestSafeZone = () => {
    const safeZones = markers.filter((m) => m.type === 'safe');
    if (safeZones.length === 0) return;

    const userLocation: Coordinates = {
      latitude: mapCenter[0],
      longitude: mapCenter[1],
    };

    const nearest = findNearest(userLocation, safeZones);
    if (nearest) {
      alert(
        `Nearest safe zone: ${nearest.location.title}\nDistance: ${nearest.distanceFormatted}`
      );
      setMapCenter(nearest.location.position);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Search and Controls */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
        <button
          onClick={findNearestSafeZone}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Nearest Safe Zone
        </button>
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="p-3 bg-blue-50 rounded-lg text-sm">
          <strong>Selected:</strong> {selectedLocation}
        </div>
      )}

      {/* Map Component */}
      <MapView
        center={mapCenter}
        zoom={13}
        markers={markers}
        onMarkerClick={handleMarkerClick}
        onLocationSelect={handleLocationSelect}
        enableLocationPicker={true}
        showUserLocation={true}
        height="600px"
        className="rounded-xl"
      />

      {/* Marker Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {markers.filter((m) => m.type === 'sos').length}
          </div>
          <div className="text-sm text-gray-600">Active SOS</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {markers.filter((m) => m.type === 'safe').length}
          </div>
          <div className="text-sm text-gray-600">Safe Zones</div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {markers.filter((m) => m.type === 'medical').length}
          </div>
          <div className="text-sm text-gray-600">Medical Hubs</div>
        </div>
        <div className="p-4 bg-amber-50 rounded-lg">
          <div className="text-2xl font-bold text-amber-600">
            {markers.filter((m) => m.type === 'evacuation').length}
          </div>
          <div className="text-sm text-gray-600">Evacuation Points</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple integration in existing dashboard:
 * 
 * 1. Import the MapView component:
 *    import MapView from '@/components/ui/MapView';
 * 
 * 2. Import map utilities:
 *    import { searchLocation, calculateDistance } from '@/lib/maps';
 * 
 * 3. Add to your route (in soldier-dashboard.tsx):
 *    <Route path="/soldier/map">
 *      <SoldierMapView />
 *    </Route>
 * 
 * 4. Use the MapView component:
 *    <MapView
 *      center={[34.0837, 74.7973]}
 *      zoom={13}
 *      markers={yourMarkers}
 *      onMarkerClick={(marker) => console.log(marker)}
 *      height="500px"
 *    />
 */

export default SoldierMapExample;
