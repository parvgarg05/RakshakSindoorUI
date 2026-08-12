import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { markerStore, messageStore } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface HotspotItem {
  id: string;
  location: string;
  status: 'active' | 'resolved';
  civilians: number;
  time: string;
}

export default function SoldierSOS() {
  const { toast } = useToast();
  const [hotspots, setHotspots] = useState<HotspotItem[]>([
    { id: '1', location: 'Sector 7, Grid A-5', status: 'active', civilians: 12, time: '5 min ago' },
    { id: '2', location: 'Dal Lake, North Shore', status: 'resolved', civilians: 3, time: '1 hour ago' },
  ]);
  const [label, setLabel] = useState('New SOS Hotspot');
  const [latitude, setLatitude] = useState<number>(34.0837);
  const [longitude, setLongitude] = useState<number>(74.7973);
  const [civilians, setCivilians] = useState<number>(5);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      () => {
        // keep defaults if permission denied
      }
    );
  }, []);

  const handleCreateSOS = async () => {
    if (!latitude || !longitude) {
      toast({
        title: 'Location required',
        description: 'Please provide a valid latitude and longitude.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const id = `sos-${Date.now()}`;
      const lat = latitude;
      const lon = longitude;
      const notifId = `notif_${Date.now()}`;
      
      const newMarker = {
        id,
        position: [lat, lon] as [number, number],
        type: 'sos' as const,
        label: label.trim() || 'New SOS Hotspot',
        timestamp: new Date().toISOString(),
      };

      // Create notification for civilians
      const notification = {
        id: notifId,
        type: 'threat',
        title: '🚨 SOS Alert: ' + (label.trim() || 'New SOS Hotspot'),
        message: `Location: Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}. ${civilians} civilians in distress. Please provide assistance or evacuate if necessary.`,
        timestamp: new Date().toISOString(),
        source: 'government',
        read: false,
      };

      // Store marker
      await markerStore.setItem(id, newMarker);
      
      // Store notification for civilians
      await messageStore.setItem(notifId, notification);
      
      // Update UI
      setHotspots((prev) => [
        {
          id,
          location: `Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`,
          status: 'active',
          civilians,
          time: 'just now',
        },
        ...prev,
      ]);

      // Dispatch events to notify all listening components
      window.dispatchEvent(new CustomEvent('sos:created', { detail: newMarker }));
      
      // Dispatch event to reload notifications in civilian dashboard
      console.log('Dispatching public-alerts:updated event');
      window.dispatchEvent(new CustomEvent('public-alerts:updated'));
      
      // Update civilian notification count
      const rawCount = localStorage.getItem('civilian_notification_count');
      const currentCount = rawCount ? parseInt(rawCount, 10) : 0;
      const newCount = currentCount + 1;
      localStorage.setItem('civilian_notification_count', newCount.toString());
      window.dispatchEvent(new CustomEvent('notification:updated'));

      toast({ 
        title: 'SOS created & notified', 
        description: 'Civilians have been notified of this SOS hotspot.' 
      });
    } catch (error) {
      console.error('Error creating SOS:', error);
      toast({
        title: 'Error',
        description: 'Failed to create SOS hotspot.',
        variant: 'destructive',
      });
    }
  };

  const handleResetAllSOS = async () => {
    try {
      await markerStore.clear();
      window.dispatchEvent(new CustomEvent('sos:cleared'));
      setHotspots([]);
      toast({ 
        title: 'All SOS cleared', 
        description: 'All SOS hotspots have been removed from the system.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to clear SOS markers.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-full bg-background text-foreground overflow-y-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-foreground">SOS & Hotspots</h1>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleResetAllSOS} 
              data-testid="button-reset-sos"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Reset All
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              onClick={handleCreateSOS} 
              data-testid="button-create-sos"
            >
              <Plus className="h-4 w-4" />
              New SOS Hotspot
            </Button>
          </div>
        </div>

        {/* Input Form Section */}
        <Card className="border border-border bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Create New SOS Hotspot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-foreground">Label/Description</label>
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., Bridge Collapse - Sector 7"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Civilians Count</label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={civilians}
                  onChange={(e) => setCivilians(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hotspots List Section */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-foreground">Active Hotspots ({hotspots.length})</h2>
        <div className="grid gap-4">
          {hotspots.length === 0 ? (
            <Card className="border border-border bg-card text-card-foreground">
              <CardContent className="py-8 text-center">
                <MapPin className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No active SOS hotspots. Create one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            hotspots.map((hotspot) => (
              <Card key={hotspot.id} className="border border-border bg-card text-card-foreground transition-shadow hover:shadow-md" data-testid={`sos-${hotspot.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-foreground">{hotspot.location}</CardTitle>
                    <Badge variant={hotspot.status === 'active' ? 'destructive' : 'secondary'}>
                      {hotspot.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground"><span className="font-medium">{hotspot.civilians}</span> civilians affected</p>
                      <span className="text-xs text-muted-foreground">{hotspot.time}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
