import { useEffect, useState } from 'react';
import { MessageSquare, MapPin, AlertTriangle, Send, Users, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import EncryptedMessage from '@/components/EncryptedMessage';
import { encryptMessage } from '@/lib/encryption';
import { messageStore } from '@/lib/storage';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

interface CitizenAlert {
  id: string;
  text: string;
  sender: string;
  role: 'civilian';
  type: 'attack';
  timestamp: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  nearbyCount?: number;
}

interface GovResponse {
  id: string;
  alertId: string;
  text: string;
  sender: string;
  timestamp: string;
  originLat?: number;
  originLon?: number;
  locationName?: string;
}

interface CivilianReply {
  id: string;
  alertId: string;
  text: string;
  sender: string;
  timestamp: string;
  role: 'civilian';
}

// Calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function CitizenAlertManager() {
  const { language, user } = useApp();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<CitizenAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<CitizenAlert | null>(null);
  const [responses, setResponses] = useState<GovResponse[]>([]);
  const [civilianReplies, setCivilianReplies] = useState<CivilianReply[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this attack report? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete the alert
      await messageStore.removeItem(`govchat_${alertId}`);
      
      // Delete all responses to this alert
      await messageStore.iterate((value: any, key: string) => {
        if (key?.startsWith('govresponse_') && value.alertId === alertId) {
          messageStore.removeItem(key);
        }
      });

      // If this was the selected alert, clear selection
      if (selectedAlert?.id === alertId) {
        setSelectedAlert(null);
      }

      // Update alerts list
      setAlerts(alerts.filter(a => a.id !== alertId));
      
      window.dispatchEvent(new CustomEvent('govchat:updated'));
      
      toast({
        title: 'Alert Deleted',
        description: 'The attack report and all responses have been deleted.',
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete the alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Load all citizen attack reports
  useEffect(() => {
    const loadAlerts = async () => {
      const allAlerts: CitizenAlert[] = [];
      await messageStore.iterate((value: any, key: string) => {
        if (key?.startsWith('govchat_') && value.type === 'attack' && value.role === 'civilian') {
          allAlerts.push(value as CitizenAlert);
        }
      });
      setAlerts(allAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };

    loadAlerts();
    const handleUpdate = () => loadAlerts();
    window.addEventListener('govchat:updated', handleUpdate);
    const intervalId = window.setInterval(loadAlerts, 3000);

    return () => {
      window.removeEventListener('govchat:updated', handleUpdate);
      window.clearInterval(intervalId);
    };
  }, []);

  // Load responses for selected alert
  useEffect(() => {
    if (!selectedAlert) {
      setResponses([]);
      setCivilianReplies([]);
      return;
    }

    const loadResponses = async () => {
      const allResponses: GovResponse[] = [];
      const allReplies: CivilianReply[] = [];
      
      await messageStore.iterate((value: any, key: string) => {
        if (key?.startsWith('govresponse_') && value.alertId === selectedAlert.id) {
          allResponses.push(value as GovResponse);
        }
        if (key?.startsWith('civilian_reply_') && value.alertId === selectedAlert.id) {
          allReplies.push(value as CivilianReply);
        }
      });
      
      setResponses(allResponses.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      setCivilianReplies(allReplies.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    };

    loadResponses();
    const handleUpdate = () => loadResponses();
    window.addEventListener('govresponse:updated', handleUpdate);
    window.addEventListener('civilian-reply:updated', handleUpdate);
    const intervalId = window.setInterval(loadResponses, 3000);

    return () => {
      window.removeEventListener('govresponse:updated', handleUpdate);
      window.removeEventListener('civilian-reply:updated', handleUpdate);
      window.clearInterval(intervalId);
    };
  }, [selectedAlert]);

  // Broadcast government response to nearby citizens
  const broadcastResponseToNearby = async (alert: CitizenAlert, responseText: string) => {
    if (!alert.latitude || !alert.longitude) return;

    const notifId = `govresponse_notif_${Date.now()}`;
    const notifData = {
      id: notifId,
      title: `Government Response: ${alert.locationName}`,
      message: `Government has responded to the attack report in ${alert.locationName}: ${responseText}`,
      timestamp: new Date().toISOString(),
      type: 'info',
      source: 'government_response',
      originLat: alert.latitude,
      originLon: alert.longitude,
    };

    await messageStore.setItem(`notif_${notifId}`, notifData);
    window.dispatchEvent(new CustomEvent('public-alerts:updated'));
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponse.trim() || isSending || !selectedAlert) return;

    setIsSending(true);
    const id = Date.now().toString();

    const responseData: GovResponse = {
      id,
      alertId: selectedAlert.id,
      text: newResponse.trim(),
      sender: user?.displayName || 'Government Command',
      timestamp: new Date().toISOString(),
      originLat: selectedAlert.latitude,
      originLon: selectedAlert.longitude,
      locationName: selectedAlert.locationName,
    };

    await messageStore.setItem(`govresponse_${id}`, responseData);
    setResponses([...responses, responseData]);
    setNewResponse('');
    setIsSending(false);

    window.dispatchEvent(new CustomEvent('govresponse:updated'));

    // Broadcast to nearby citizens
    await broadcastResponseToNearby(selectedAlert, newResponse.trim());

    toast({
      title: 'Response Sent',
      description: `Your response has been sent to ${selectedAlert.sender} and nearby citizens (within 10 km).`,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 mb-6 flex-shrink-0">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <div>
          <h1 className="text-3xl font-bold">Citizen Alert Manager</h1>
          <p className="text-sm text-muted-foreground">Respond to citizen attack reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Left: Alert List */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center justify-between">
              <span>Citizen Attack Reports</span>
              <Badge variant="destructive">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-6">
            <div className="space-y-3">
              {alerts.length === 0 && (
                <p className="text-center text-muted-foreground py-10 italic">No attack reports yet</p>
              )}
              {alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedAlert?.id === alert.id ? 'border-primary border-2' : ''
                  }`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="destructive">ATTACK REPORT</Badge>
                        {alert.locationName && (
                          <Badge variant="outline" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            {alert.locationName}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAlert(alert.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-medium mb-1">From: {alert.sender}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{alert.text}</p>
                    {alert.nearbyCount !== undefined && alert.nearbyCount > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{alert.nearbyCount} citizens nearby</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Chat with Citizen + Nearby Broadcast */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedAlert ? (
                <span className="text-base">
                  Chat with {selectedAlert.sender}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Visible to nearby citizens)
                  </span>
                </span>
              ) : (
                <span>Select an alert to respond</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden p-6">
            {!selectedAlert ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p className="text-center">
                  Select a citizen attack report from the list to view details and respond
                </p>
              </div>
            ) : (
              <>
                {/* Response Thread - Show all messages in chronological order */}
                <div className="flex-1 overflow-auto mb-4 min-h-0">
                  <div className="space-y-3">
                    {responses.length === 0 && civilianReplies.length === 0 && (
                      <p className="text-center text-muted-foreground py-4 italic text-sm">
                        No responses yet. Your message will be visible to the reporter and all nearby citizens.
                      </p>
                    )}
                    {/* Merge and sort government responses and civilian replies */}
                    {[...responses.map(r => ({ ...r, type: 'gov' as const })),
                      ...civilianReplies.map(r => ({ ...r, type: 'civilian' as const }))]
                      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                      .map((message) => (
                        <div key={message.id}>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={message.type === 'gov' ? 'default' : 'outline'}>
                              {message.type === 'gov' ? 'GOVERNMENT' : 'CIVILIAN REPLY'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {message.sender} · {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <Card className={message.type === 'gov' ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}>
                            <CardContent className="pt-4">
                              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Response Input */}
                <form onSubmit={handleSendResponse} className="flex gap-2 flex-shrink-0">
                  <Input
                    placeholder="Type your response to this citizen and nearby residents..."
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    disabled={isSending}
                  />
                  <Button type="submit" disabled={isSending || !newResponse.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}