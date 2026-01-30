import { useState } from 'react';
import { Send, Lock, AlertTriangle, MapPin, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import MapView from '@/components/MapView';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { encryptMessage } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';
import { messageStore, markerStore } from '@/lib/storage';

export default function SoldierMapView() {
  const { language } = useApp();
  const { toast } = useToast();
  const [message, setMessage] = useState('');

  const mockMarkers = [
    { position: [34.0837, 74.7973] as [number, number], type: 'sos' as const, label: 'SOS - Sector 7' },
    { position: [34.0937, 74.8073] as [number, number], type: 'evacuation' as const, label: 'Evac Zone Alpha' },
    { position: [34.0737, 74.7873] as [number, number], type: 'medical' as const, label: 'Medical Hub' },
  ];

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

  return (
    <div className="h-full flex">
      <aside className="w-80 border-r bg-sidebar p-4 space-y-4 overflow-auto">
        <Card data-testid="card-send-alert">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4" />
              {getTranslation(language, 'sendAlert')}
            </CardTitle>
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
            <CardTitle className="text-base">Map Actions</CardTitle>
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

      <main className="flex-1 relative">
        <MapView markers={mockMarkers} height="100%" />
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button size="icon" className="rounded-full h-14 w-14 shadow-lg" data-testid="fab-add-marker">
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </main>
    </div>
  );
}
