import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { markerStore } from '@/lib/storage';
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

    const id = `sos-${Date.now()}`;
    const lat = latitude;
    const lon = longitude;
    const newMarker = {
      id,
      position: [lat, lon] as [number, number],
      type: 'sos' as const,
      label: label.trim() || 'New SOS Hotspot',
      timestamp: new Date().toISOString(),
    };

    await markerStore.setItem(id, newMarker);
    window.dispatchEvent(new CustomEvent('sos:created', { detail: newMarker }));

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

    toast({ title: 'SOS created', description: 'New SOS hotspot added to the map.' });
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-8 w-8 text-destructive" />
          <h1 className="text-3xl font-tactical font-bold">SOS & Hotspots</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetAllSOS} data-testid="button-reset-sos">
            <Trash2 className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          <Button variant="destructive" onClick={handleCreateSOS} data-testid="button-create-sos">
            <Plus className="h-4 w-4 mr-2" />
            New SOS
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Label</label>
          <input
            className="w-full mt-1 px-3 py-2 border rounded-md"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Bridge Collapse - Sector 7"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Latitude</label>
          <input
            type="number"
            step="0.0001"
            className="w-full mt-1 px-3 py-2 border rounded-md"
            value={latitude}
            onChange={(e) => setLatitude(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Longitude</label>
          <input
            type="number"
            step="0.0001"
            className="w-full mt-1 px-3 py-2 border rounded-md"
            value={longitude}
            onChange={(e) => setLongitude(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Civilians</label>
          <input
            type="number"
            min={1}
            className="w-full mt-1 px-3 py-2 border rounded-md"
            value={civilians}
            onChange={(e) => setCivilians(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="grid gap-4">
        {hotspots.map((hotspot) => (
          <Card key={hotspot.id} className="hover-elevate" data-testid={`sos-${hotspot.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{hotspot.location}</CardTitle>
                <Badge variant={hotspot.status === 'active' ? 'destructive' : 'secondary'}>
                  {hotspot.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{hotspot.civilians} civilians affected</p>
              <span className="text-xs text-muted-foreground">{hotspot.time}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
