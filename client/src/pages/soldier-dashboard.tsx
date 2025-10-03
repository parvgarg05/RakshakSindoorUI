import { useState } from 'react';
import { Shield, Send, MapPin, Lock, Bell, LogOut, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import MapView from '@/components/MapView';
import NotificationBadge from '@/components/NotificationBadge';
import NotificationCenter from '@/components/NotificationCenter';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { encryptMessage } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';

interface SoldierDashboardProps {
  onLogout: () => void;
}

export default function SoldierDashboard({ onLogout }: SoldierDashboardProps) {
  const { language, user } = useApp();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const mockMarkers = [
    { position: [34.0837, 74.7973] as [number, number], type: 'sos' as const, label: 'SOS - Sector 7' },
    { position: [34.0937, 74.8073] as [number, number], type: 'evacuation' as const, label: 'Evac Zone Alpha' },
    { position: [34.0737, 74.7873] as [number, number], type: 'medical' as const, label: 'Medical Hub' },
  ];

  const mockNotifications = [
    {
      id: '1',
      type: 'threat' as const,
      title: 'Critical Threat Alert',
      message: 'Immediate action required in Sector 7',
      timestamp: '2 min ago',
      region: 'Sector 7',
    },
  ];

  const handleSendAlert = () => {
    if (!message.trim()) return;
    
    const encrypted = encryptMessage(message);
    console.log('Sending encrypted alert:', encrypted);
    
    toast({
      title: "Alert Sent",
      description: "Emergency alert broadcasted to all civilians",
    });
    
    setMessage('');
  };

  return (
    <div className="h-screen flex flex-col bg-background dark">
      <header className="border-b bg-sidebar p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-tactical font-bold text-lg">Soldier Command</h1>
            <p className="text-xs text-muted-foreground">@{user?.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBadge type="alert" count={3} onClick={() => setShowNotifications(true)} />
          <LanguageSwitcher />
          <Button variant="outline" size="sm" onClick={onLogout} data-testid="button-logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
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
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={handleSendAlert}
                  data-testid="button-send-encrypted"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Send Encrypted
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                data-testid="button-mark-sos"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark SOS Hotspot
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-create-evac"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Create Evac Zone
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-broadcast"
              >
                <Bell className="h-4 w-4 mr-2" />
                Broadcast Alert
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">ALERT</Badge>
                <span className="text-xs text-muted-foreground">5 min ago</span>
              </div>
              <p className="text-xs">Evacuation alert sent to Sector 7</p>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="default">SOS</Badge>
                <span className="text-xs text-muted-foreground">15 min ago</span>
              </div>
              <p className="text-xs">SOS marker placed at Dal Lake</p>
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 p-4">
          <MapView markers={mockMarkers} height="100%" />
        </main>

        <aside className="w-80 border-l bg-sidebar p-4 space-y-4 overflow-auto">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Active Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="destructive">THREAT</Badge>
                  <span className="text-xs">Sector 7</span>
                </div>
                <p className="text-sm font-medium">Evacuation in Progress</p>
                <p className="text-xs text-muted-foreground mt-1">45 civilians evacuating</p>
              </div>

              <div className="p-3 rounded-md bg-chart-3/10 border border-chart-3/20">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-chart-3 text-white">SOS</Badge>
                  <span className="text-xs">Dal Lake</span>
                </div>
                <p className="text-sm font-medium">Medical Assistance</p>
                <p className="text-xs text-muted-foreground mt-1">Team dispatched</p>
              </div>

              <div className="p-3 rounded-md bg-chart-2/10 border border-chart-2/20">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-chart-2 text-white">SAFE</Badge>
                  <span className="text-xs">Zone Alpha</span>
                </div>
                <p className="text-sm font-medium">120 civilians secured</p>
                <p className="text-xs text-muted-foreground mt-1">Capacity: 80%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Connected Civilians
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">247</div>
              <p className="text-xs text-muted-foreground mt-1">Active in network</p>
            </CardContent>
          </Card>
        </aside>
      </div>

      <NotificationCenter
        open={showNotifications}
        onOpenChange={setShowNotifications}
        notifications={mockNotifications}
        userRole="soldier"
        onAcknowledge={(id) => console.log('Ack:', id)}
        onPin={(id) => console.log('Pin:', id)}
      />
    </div>
  );
}
