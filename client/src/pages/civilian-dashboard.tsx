import { useState } from 'react';
import { Users, MapPin, MessageSquare, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MapView from '@/components/MapView';
import CommunityCard from '@/components/CommunityCard';
import EvacuationPanel from '@/components/EvacuationPanel';
import NotificationBadge from '@/components/NotificationBadge';
import NotificationCenter from '@/components/NotificationCenter';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import EncryptedMessage from '@/components/EncryptedMessage';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { encryptMessage } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';

interface CivilianDashboardProps {
  onLogout: () => void;
}

export default function CivilianDashboard({ onLogout }: CivilianDashboardProps) {
  const { language, user } = useApp();
  const { toast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);

  const mockMarkers = [
    { position: [34.0837, 74.7973] as [number, number], type: 'sos' as const, label: 'SOS Alert' },
    { position: [34.0937, 74.8073] as [number, number], type: 'safe' as const, label: 'Safe Zone Alpha' },
    { position: [34.0737, 74.7873] as [number, number], type: 'medical' as const, label: 'Medical Hub' },
  ];

  const mockNotifications = [
    {
      id: '1',
      type: 'evacuation' as const,
      title: 'Evacuation Notice',
      message: 'Please proceed to nearest safe zone',
      timestamp: '5 min ago',
      region: 'Sector 7',
    },
  ];

  const mockMessages = [
    { text: "Evacuation required in your area. Move to Safe Zone Alpha.", sender: "Soldier-001", time: "5 min ago" },
    { text: "Medical supplies available at District Hospital.", sender: "Command", time: "1 hour ago" },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-background p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-semibold text-lg">Civilian Portal</h1>
            <p className="text-xs text-muted-foreground">@{user?.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBadge type="alert" count={2} onClick={() => setShowNotifications(true)} />
          <NotificationBadge type="chat" count={5} />
          <LanguageSwitcher />
          <Button variant="outline" size="sm" onClick={onLogout} data-testid="button-logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 p-4 overflow-auto">
          <Tabs defaultValue="map" className="h-full">
            <TabsList className="mb-4">
              <TabsTrigger value="map" data-testid="tab-map">
                <MapPin className="h-4 w-4 mr-2" />
                Map View
              </TabsTrigger>
              <TabsTrigger value="communities" data-testid="tab-communities">
                <Users className="h-4 w-4 mr-2" />
                Communities
              </TabsTrigger>
              <TabsTrigger value="messages" data-testid="tab-messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="h-[calc(100%-3rem)]">
              <MapView markers={mockMarkers} height="100%" />
            </TabsContent>

            <TabsContent value="communities" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Nearby Communities</h2>
                <Button data-testid="button-create-community">
                  <Users className="h-4 w-4 mr-2" />
                  {getTranslation(language, 'createCommunity')}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CommunityCard
                  name="Sector 7 Residents"
                  location="Old City, Srinagar"
                  memberCount={45}
                  distance="0.5 km"
                  onJoin={() => toast({ title: "Joined Community" })}
                  onViewPosts={() => console.log('View posts')}
                />
                <CommunityCard
                  name="Dal Lake Community"
                  location="Dal Lake Area"
                  memberCount={128}
                  distance="2.1 km"
                  onJoin={() => toast({ title: "Joined Community" })}
                  onViewPosts={() => console.log('View posts')}
                />
                <CommunityCard
                  name="Emergency Response Network"
                  location="District Center"
                  memberCount={89}
                  distance="1.8 km"
                  onJoin={() => toast({ title: "Joined Community" })}
                  onViewPosts={() => console.log('View posts')}
                />
              </div>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Soldier Communications</h2>
              </div>
              {mockMessages.map((msg, idx) => (
                <EncryptedMessage
                  key={idx}
                  encrypted={encryptMessage(msg.text)}
                  sender={msg.sender}
                  timestamp={msg.time}
                  currentLang={language}
                />
              ))}
            </TabsContent>
          </Tabs>
        </main>

        <aside className="w-96 border-l bg-card p-4 space-y-4 overflow-auto">
          <EvacuationPanel
            nearestZone={{
              name: 'Safe Zone Alpha - Community Center',
              distance: '1.2 km',
              eta: '15 minutes walking',
            }}
            medicalHub={{
              name: 'District Hospital',
              distance: '800 m',
            }}
            onFollowSoldier={() => toast({ title: "Following Soldier Route" })}
            onViewRoute={() => toast({ title: "Route Displayed on Map" })}
          />

          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-chart-2" />
              Safety Status
            </h3>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-chart-2 hover:bg-chart-2/90"
                data-testid="button-report-safe"
              >
                Report Safe
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                className="flex-1"
                data-testid="button-need-help"
              >
                Need Help
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <NotificationCenter
        open={showNotifications}
        onOpenChange={setShowNotifications}
        notifications={mockNotifications}
        userRole="civilian"
        onAcknowledge={(id) => console.log('Ack:', id)}
      />
    </div>
  );
}
