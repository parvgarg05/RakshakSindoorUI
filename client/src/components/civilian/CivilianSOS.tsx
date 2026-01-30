import { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Clock } from 'lucide-react';
import { markerStore } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MapView from '@/components/MapView';

interface SOSMarker {
  id: string;
  position: [number, number];
  type: 'sos' | 'evacuation' | 'medical';
  label: string;
  timestamp: string;
}

export default function CivilianSOS() {
  const [markers, setMarkers] = useState<SOSMarker[]>([]);

  useEffect(() => {
    const loadMarkers = async () => {
      const allMarkers: SOSMarker[] = [];
      await markerStore.iterate((value: SOSMarker) => {
        if (value.type === 'sos') {
          allMarkers.push(value);
        }
      });
      setMarkers(allMarkers.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };
    loadMarkers();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background/95 backdrop-blur z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8 text-destructive" />
            <h1 className="text-3xl font-bold">SOS & Hotspots</h1>
          </div>
          <Badge variant="destructive" className="animate-pulse">
            {markers.length} ACTIVE HOTSPOTS
          </Badge>
        </div>
        <p className="text-muted-foreground">Real-time emergency locations marked by security forces.</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r bg-sidebar overflow-auto p-4 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Hotspot List</h2>
          {markers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4 italic">No active SOS hotspots nearby.</p>
          ) : (
            markers.map((marker) => (
              <Card key={marker.id} className="border-destructive/20 hover:border-destructive transition-colors cursor-pointer">
                <CardHeader className="p-3 pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="destructive" className="text-[10px] h-4 px-1">SOS</Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(marker.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <CardTitle className="text-sm">{marker.label}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <p className="text-[10px] text-muted-foreground mb-2">Location: {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}</p>
                  <div className="flex items-center gap-1 text-[10px] text-destructive font-bold">
                    <AlertTriangle className="h-3 w-3" />
                    IMMEDIATE ATTENTION REQUIRED
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </aside>

        <main className="flex-1 relative">
          <MapView markers={markers} height="100%" />
        </main>
      </div>
    </div>
  );
}
