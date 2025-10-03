import { useState } from 'react';
import { Route, Switch } from 'wouter';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import CivilianSidebar from '@/components/CivilianSidebar';
import NotificationBadge from '@/components/NotificationBadge';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationCenter from '@/components/NotificationCenter';
import CivilianMapView from '@/components/civilian/CivilianMapView';
import CivilianChannel from '@/components/civilian/CivilianChannel';
import CivilianCommunities from '@/components/civilian/CivilianCommunities';
import CivilianMessages from '@/components/civilian/CivilianMessages';
import CivilianSOS from '@/components/civilian/CivilianSOS';
import CivilianEvacuation from '@/components/civilian/CivilianEvacuation';
import CivilianMedical from '@/components/civilian/CivilianMedical';
import CivilianNotifications from '@/components/civilian/CivilianNotifications';
import CivilianSettings from '@/components/civilian/CivilianSettings';

interface CivilianDashboardProps {
  onLogout: () => void;
}

export default function CivilianDashboard({ onLogout }: CivilianDashboardProps) {
  const [showNotifications, setShowNotifications] = useState(false);

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

  const style = {
    '--sidebar-width': '16rem',
    '--sidebar-width-icon': '3rem',
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <CivilianSidebar onLogout={onLogout} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <NotificationBadge type="alert" count={2} onClick={() => setShowNotifications(true)} />
              <NotificationBadge type="chat" count={5} />
              <LanguageSwitcher />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/civilian" component={CivilianMapView} />
              <Route path="/civilian/map" component={CivilianMapView} />
              <Route path="/civilian/channel" component={CivilianChannel} />
              <Route path="/civilian/communities" component={CivilianCommunities} />
              <Route path="/civilian/messages" component={CivilianMessages} />
              <Route path="/civilian/sos" component={CivilianSOS} />
              <Route path="/civilian/evacuation" component={CivilianEvacuation} />
              <Route path="/civilian/medical" component={CivilianMedical} />
              <Route path="/civilian/notifications" component={CivilianNotifications} />
              <Route path="/civilian/settings" component={CivilianSettings} />
              <Route component={CivilianMapView} />
            </Switch>
          </main>
        </div>
      </div>

      <NotificationCenter
        open={showNotifications}
        onOpenChange={setShowNotifications}
        notifications={mockNotifications}
        userRole="civilian"
        onAcknowledge={(id) => console.log('Ack:', id)}
      />
    </SidebarProvider>
  );
}
