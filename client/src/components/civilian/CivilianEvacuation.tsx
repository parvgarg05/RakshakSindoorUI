import { useState, useEffect } from 'react';
import { Shield, MapPin, Users, Navigation, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useZones } from '@/hooks/useZones';
import { useToast } from '@/hooks/use-toast';
import { calculateDistance } from '@/lib/maps';

export default function CivilianEvacuation() {
  const { zones, loading, findNearestZone } = useZones();
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'safe' | 'medical' | 'evacuation'>('all');
  const [nearestZone, setNearestZone] = useState<any>(null);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          // Default to Srinagar if location access denied
          setUserLocation({
            lat: 34.0837,
            lon: 74.7973,
          });
        }
      );
    }
  }, []);

  // Find nearest zone when location changes
  useEffect(() => {
    if (userLocation) {
      const findNearest = async () => {
        const nearest = await findNearestZone(
          userLocation.lat,
          userLocation.lon,
          selectedType === 'all' ? undefined : selectedType
        );
        setNearestZone(nearest);
      };
      findNearest();
    }
  }, [userLocation, selectedType, findNearestZone]);

  const filteredZones = zones.filter((zone) => selectedType === 'all' || zone.type === selectedType);

  const calculateDistanceToZone = (zone: any) => {
    if (!userLocation) return null;
    const distance = calculateDistance(
      { latitude: userLocation.lat, longitude: userLocation.lon },
      { latitude: zone.location.latitude, longitude: zone.location.longitude }
    );
    return distance;
  };

  const getOccupancyStatus = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage > 90) return 'full';
    if (percentage > 60) return 'warning';
    return 'available';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'full':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'available':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return '🏥';
      case 'evacuation':
        return '🚨';
      default:
        return '🛡️';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'medical':
        return 'Medical Hub';
      case 'evacuation':
        return 'Evacuation Point';
      default:
        return 'Safe Zone';
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Evacuation Zones</h1>
        </div>

        {/* Nearest Zone Alert */}
        {nearestZone && (
          <Card className="bg-blue-50 border-blue-200 mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              Nearest Safe Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-lg font-semibold">{nearestZone.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Distance</p>
                <p className="text-lg font-semibold">
                  {calculateDistanceToZone(nearestZone)?.toFixed(1)} km
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge
                  className={getStatusBadgeColor(
                    getOccupancyStatus(nearestZone.currentOccupancy, nearestZone.capacity)
                  )}
                >
                  {getOccupancyStatus(nearestZone.currentOccupancy, nearestZone.capacity)}
                </Badge>
              </div>
            </div>
            <Button variant="default" className="w-full" data-testid="button-navigate-to-zone">
              <Navigation className="h-4 w-4 mr-2" />
              Navigate to This Zone
            </Button>
          </CardContent>
        </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'safe', 'medical', 'evacuation'].map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(type as any)}
            data-testid={`button-filter-${type}`}
          >
            {type === 'all' ? 'All Zones' : type === 'safe' ? 'Safe Zones' : type === 'medical' ? 'Medical Hubs' : 'Evacuation Points'}
          </Button>
        ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Zones Grid */}
        {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Loading zones...</p>
        </div>
      ) : filteredZones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No {selectedType === 'all' ? 'evacuation' : selectedType} zones available in your area.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredZones
            .sort((a, b) => {
              const distA = calculateDistanceToZone(a) || Infinity;
              const distB = calculateDistanceToZone(b) || Infinity;
              return distA - distB;
            })
            .map((zone) => {
              const distance = calculateDistanceToZone(zone);
              const occupancyStatus = getOccupancyStatus(
                zone.currentOccupancy,
                zone.capacity
              );
              const occupancyPercent = Math.round(
                (zone.currentOccupancy / zone.capacity) * 100
              );

              return (
                <Card
                  key={zone.id}
                  className="hover:shadow-md transition-shadow"
                  data-testid={`card-zone-${zone.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getTypeIcon(zone.type)}</span>
                          <Badge variant="outline">{getTypeLabel(zone.type)}</Badge>
                        </div>
                        <CardTitle className="text-lg">{zone.name}</CardTitle>
                      </div>
                      <Badge className={getStatusBadgeColor(occupancyStatus)}>
                        {occupancyStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {zone.description && (
                      <p className="text-sm text-muted-foreground">{zone.description}</p>
                    )}

                    <div className="space-y-3">
                      {distance && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{distance.toFixed(1)} km away</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {zone.currentOccupancy} / {zone.capacity} people
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          occupancyPercent > 80 ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${occupancyPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {occupancyPercent}% Capacity
                    </p>

                    <Button
                      variant="default"
                      className="w-full"
                      data-testid={`button-goto-zone-${zone.id}`}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Navigate Here
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
        </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4">
          Safe zones and evacuation routes help you find secure locations in emergency situations.
        </p>
      </div>
    </div>
  );
}
