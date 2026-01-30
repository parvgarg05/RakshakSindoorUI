import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Search, Bell, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { markerStore, messageStore } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const KASHMIR_LOCATIONS = [
  { name: 'Srinagar', coords: [34.0837, 74.7973] },
  { name: 'Anantnag', coords: [33.7311, 75.1487] },
  { name: 'Baramulla', coords: [34.2021, 74.3508] },
  { name: 'Jammu', coords: [32.7266, 74.8570] },
  { name: 'Pulwama', coords: [33.8763, 74.8967] },
  { name: 'Kupwara', coords: [34.5262, 74.2546] },
  { name: 'Budgam', coords: [33.9926, 74.7735] },
  { name: 'Shopian', coords: [33.7196, 74.8315] },
  { name: 'Kulgam', coords: [33.6401, 75.0163] },
  { name: 'Bandipora', coords: [34.4229, 74.6366] },
];

export default function SoldierAlerts() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);

  useEffect(() => {
    const loadAlerts = async () => {
      const all: any[] = [];
      await markerStore.iterate((value: any, key) => {
        if (key.startsWith('alert_marker_')) all.push(value);
      });
      setActiveAlerts(all);
    };
    loadAlerts();
  }, []);

  const handleMarkAlert = async (location: typeof KASHMIR_LOCATIONS[0]) => {
    const id = Date.now().toString();
    const alertData = {
      id,
      name: location.name,
      coords: location.coords,
      timestamp: new Date().toISOString(),
      severity: 'high'
    };

    await markerStore.setItem(`alert_marker_${id}`, alertData);
    
    // Also send as a global notification for civilians
    await messageStore.setItem(`notif_${id}`, {
      id,
      title: `SECURITY ALERT: ${location.name}`,
      message: `Emergency alert issued for ${location.name} region. Stay indoors.`,
      timestamp: new Date().toISOString(),
      type: 'threat'
    });

    setActiveAlerts([alertData, ...activeAlerts]);
    toast({ 
      title: "Alert Published", 
      description: `Emergency alert marked for ${location.name}. Civilians notified.` 
    });
  };

  const filteredLocations = KASHMIR_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h1 className="text-3xl font-tactical font-bold">Active Alerts & Region Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Kashmir Region Map
            </CardTitle>
            <CardDescription>Select a location to issue an alert</CardDescription>
            <div className="relative pt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search districts..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-2 pt-0">
            {filteredLocations.map((loc) => (
              <div key={loc.name} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                <div className="flex flex-col">
                  <span className="font-medium">{loc.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Sector Control: Active</span>
                </div>
                <Button size="sm" variant="destructive" onClick={() => handleMarkAlert(loc)}>
                  <Bell className="h-3 w-3 mr-1" />
                  Issue Alert
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Active Alert Feed
            </CardTitle>
            <CardDescription>Currently active security alerts</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-3 pt-0">
            {activeAlerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 italic">No active region alerts.</p>
            ) : (
              activeAlerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-md border-l-4 border-l-destructive bg-destructive/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-destructive">{alert.name}</span>
                    <Badge variant="destructive">HIGH THREAT</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Alert issued by Command at {new Date(alert.timestamp).toLocaleTimeString()}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
