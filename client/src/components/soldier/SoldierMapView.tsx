import { useState, useEffect, useRef } from 'react';
import { Send, Lock, AlertTriangle, MapPin, Heart, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import MapView, { type MapMarker } from '@/components/ui/MapView';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { encryptMessage } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';
import { messageStore, markerStore } from '@/lib/storage';

interface SoldierMapViewProps {
  onPanelToggle?: () => void;
  panelKey?: number;
}

export default function SoldierMapView({ onPanelToggle, panelKey = 0 }: SoldierMapViewProps) {
  const { language } = useApp();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isAlertClosed, setIsAlertClosed] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([
    { id: '2', position: [34.0937, 74.8073] as [number, number], type: 'evacuation' as const, title: 'Evac Zone Alpha', description: 'Evacuation point - Transport available' },
    { id: '3', position: [34.0737, 74.7873] as [number, number], type: 'medical' as const, title: 'Medical Hub', description: 'Field hospital with emergency care' },
  ]);

  useEffect(() => {
    if (mapContainerRef.current) {
      const resizeTimer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
      return () => clearTimeout(resizeTimer);
    }
  }, [isAlertClosed, panelKey]);

  useEffect(() => {
    const loadMarkers = async () => {
      const baseMarkers: MapMarker[] = [
        { id: '2', position: [34.0937, 74.8073] as [number, number], type: 'evacuation' as const, title: 'Evac Zone Alpha', description: 'Evacuation point - Transport available' },
        { id: '3', position: [34.0737, 74.7873] as [number, number], type: 'medical' as const, title: 'Medical Hub', description: 'Field hospital with emergency care' },
      ];
      
      const sosMarkers: MapMarker[] = [];
      await markerStore.iterate((value: any) => {
        if (value.type === 'sos') {
          sosMarkers.push({
            id: value.id,
            position: value.position,
            type: 'sos' as const,
            title: value.label || 'SOS Alert',
            description: 'Active distress signal',
          });
        }
      });
      
      setMarkers([...baseMarkers, ...sosMarkers]);
    };

    loadMarkers();

    const handleSosCreated = () => loadMarkers();
    const handleSosCleared = () => {
      setMarkers([
        { id: '2', position: [34.0937, 74.8073] as [number, number], type: 'evacuation' as const, title: 'Evac Zone Alpha', description: 'Evacuation point - Transport available' },
        { id: '3', position: [34.0737, 74.7873] as [number, number], type: 'medical' as const, title: 'Medical Hub', description: 'Field hospital with emergency care' },
      ]);
    };

    window.addEventListener('sos:created', handleSosCreated);
    window.addEventListener('sos:cleared', handleSosCleared);

    const intervalId = window.setInterval(loadMarkers, 3000);

    return () => {
      window.removeEventListener('sos:created', handleSosCreated);
      window.removeEventListener('sos:cleared', handleSosCleared);
      window.clearInterval(intervalId);
    };
  }, []);

  const handleSendAlert = async () => {
    if (!message.trim()) return;
    const encrypted = encryptMessage(message);
    const id = Date.now().toString();
    
    await messageStore.setItem(`alert_${id}`, {
      id,
      encrypted,
      timestamp: new Date().toISOString(),
      sender: 'Soldier Command',
      type: 'emergency'
    });

    toast({ title: "Alert Sent", description: "Emergency alert broadcasted to all civilians" });
    setMessage('');
  };

  const handleMarkSOS = async () => {
    const id = Date.now().toString();
    const newMarker = {
      id,
      position: [34.0837 + (Math.random() - 0.5) * 0.01, 74.7973 + (Math.random() - 0.5) * 0.01] as [number, number],
      type: 'sos' as const,
      label: `SOS Hotspot - Sector ${Math.floor(Math.random() * 10)}`,
      timestamp: new Date().toISOString()
    };
    
    await markerStore.setItem(`marker_${id}`, newMarker);
    toast({ title: "SOS Marked", description: "New SOS hotspot added to the tactical map" });
  };

  const handleClosePanel = () => {
    setIsAlertClosed(true);
    if (onPanelToggle) {
      onPanelToggle();
    }
  };

  const handleOpenPanel = () => {
    setIsAlertClosed(false);
    if (onPanelToggle) {
      onPanelToggle();
    }
  };

  return (
    <div className="h-full w-full flex overflow-hidden">
      {!isAlertClosed && (
        <aside className="w-80 border-r bg-sidebar p-4 space-y-4 overflow-auto transition-all duration-300 flex-shrink-0">
          <Card data-testid="card-send-alert">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4" />
                {getTranslation(language, 'sendAlert')}
              </CardTitle>
              <button
                onClick={handleClosePanel}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-close-alert"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Type emergency message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                data-testid="textarea-alert-message"
              />
              <Button className="w-full" onClick={handleSendAlert} data-testid="button-send-encrypted">
                <Lock className="h-4 w-4 mr-2" />
                Send Encrypted
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Map Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="destructive" className="w-full justify-start" onClick={handleMarkSOS} data-testid="button-mark-sos">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark SOS Hotspot
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-create-evac">
                <MapPin className="h-4 w-4 mr-2" />
                Draw Evac Zone
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-add-medical">
                <Heart className="h-4 w-4 mr-2" />
                Add Medical Hub
              </Button>
            </CardContent>
          </Card>
        </aside>
      )}

      <main 
        ref={mapContainerRef}
        className="flex-1 relative overflow-hidden w-full h-full"
      >
        <MapView 
          center={[34.0837, 74.7973]}
          zoom={13}
          markers={markers}
          onMarkerClick={(marker) => {
            toast({ 
              title: marker.title, 
              description: marker.description 
            });
          }}
          showUserLocation={true}
          height="100%" 
        />
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-50">
          {isAlertClosed && (
            <Button 
              size="icon" 
              className="rounded-full h-14 w-14 shadow-lg" 
              onClick={handleOpenPanel}
              data-testid="fab-open-panel"
              title="Open alert panel"
            >
              <Plus className="h-6 w-6" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
