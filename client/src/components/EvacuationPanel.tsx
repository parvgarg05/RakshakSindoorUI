import { MapPin, Navigation, Heart, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EvacuationPanelProps {
  nearestZone: {
    name: string;
    distance: string;
    eta: string;
  };
  medicalHub: {
    name: string;
    distance: string;
  };
  onFollowSoldier?: () => void;
  onViewRoute?: () => void;
}

export default function EvacuationPanel({
  nearestZone,
  medicalHub,
  onFollowSoldier,
  onViewRoute,
}: EvacuationPanelProps) {
  return (
    <Card data-testid="card-evacuation-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Evacuation Guidance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Nearest Safe Zone</span>
            <Badge variant="default">{nearestZone.distance}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{nearestZone.name}</p>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>ETA: {nearestZone.eta}</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-chart-2" />
              Medical Hub
            </span>
            <Badge variant="secondary">{medicalHub.distance}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{medicalHub.name}</p>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={onViewRoute} data-testid="button-view-route">
            <Navigation className="h-4 w-4 mr-2" />
            View Route
          </Button>
          <Button variant="outline" className="flex-1" onClick={onFollowSoldier} data-testid="button-follow-soldier">
            Follow Soldier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
