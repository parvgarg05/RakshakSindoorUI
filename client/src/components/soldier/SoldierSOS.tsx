import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SoldierSOS() {
  const hotspots = [
    { id: '1', location: 'Sector 7, Grid A-5', status: 'active', civilians: 12, time: '5 min ago' },
    { id: '2', location: 'Dal Lake, North Shore', status: 'resolved', civilians: 3, time: '1 hour ago' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-8 w-8 text-destructive" />
          <h1 className="text-3xl font-tactical font-bold">SOS & Hotspots</h1>
        </div>
        <Button variant="destructive" data-testid="button-create-sos">
          <Plus className="h-4 w-4 mr-2" />
          New SOS
        </Button>
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
