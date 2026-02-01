import { useEffect, useState } from 'react';
import { Heart, MapPin, Users, AlertCircle, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useZones } from '@/hooks/useZones';
import { calculateDistance } from '@/lib/maps';

export default function CivilianMedical() {
  const { zones, loading } = useZones();
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

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
          setUserLocation({
            lat: 34.0837,
            lon: 74.7973,
          });
        }
      );
    }
  }, []);

  const medicalZones = zones.filter((zone) => zone.type === 'medical');

  const calculateDistanceToZone = (zone: (typeof medicalZones)[number]) => {
    if (!userLocation) return null;
    return calculateDistance(
      { latitude: userLocation.lat, longitude: userLocation.lon },
      { latitude: zone.location.latitude, longitude: zone.location.longitude }
    );
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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-chart-2" />
          <h1 className="text-3xl font-bold">Medical Hubs</h1>
        </div>
        <p className="text-muted-foreground">Nearby medical facilities and emergency care centers</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">Loading medical hubs...</p>
          </div>
        ) : medicalZones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No medical hubs available in your area.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicalZones
              .sort((a, b) => {
                const distA = calculateDistanceToZone(a) ?? Infinity;
                const distB = calculateDistanceToZone(b) ?? Infinity;
                return distA - distB;
              })
              .map((zone) => {
                const distance = calculateDistanceToZone(zone);
                const occupancyStatus = getOccupancyStatus(zone.currentOccupancy, zone.capacity);
                const occupancyPercent = Math.round(
                  (zone.currentOccupancy / zone.capacity) * 100
                );

                return (
                  <Card key={zone.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline">Medical Hub</Badge>
                          <CardTitle className="text-lg mt-2">{zone.name}</CardTitle>
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
                        {distance !== null && (
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

                      <Button variant="default" className="w-full">
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigate Here
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
