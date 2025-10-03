import { useState } from 'react';
import { Route, Switch } from 'wouter';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import SoldierSidebar from '@/components/SoldierSidebar';
import NotificationBadge from '@/components/NotificationBadge';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationCenter from '@/components/NotificationCenter';
import SoldierMapView from '@/components/soldier/SoldierMapView';
import SoldierAlerts from '@/components/soldier/SoldierAlerts';
import SoldierChannel from '@/components/soldier/SoldierChannel';
import SoldierMessages from '@/components/soldier/SoldierMessages';
import SoldierSOS from '@/components/soldier/SoldierSOS';
import SoldierEvacuation from '@/components/soldier/SoldierEvacuation';
import SoldierMedical from '@/components/soldier/SoldierMedical';
import SoldierCivilians from '@/components/soldier/SoldierCivilians';
import SoldierNotifications from '@/components/soldier/SoldierNotifications';
import SoldierControls from '@/components/soldier/SoldierControls';
import SoldierAudit from '@/components/soldier/SoldierAudit';
import SoldierSettings from '@/components/soldier/SoldierSettings';

interface SoldierDashboardProps {
  onLogout: () => void;
}

export default function SoldierDashboard({ onLogout }: SoldierDashboardProps) {
  const [showNotifications, setShowNotifications] = useState(false);

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

  const style = {
    '--sidebar-width': '16rem',
    '--sidebar-width-icon': '3rem',
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <SoldierSidebar onLogout={onLogout} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <NotificationBadge type="alert" count={3} onClick={() => setShowNotifications(true)} />
              <LanguageSwitcher />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/soldier" component={SoldierMapView} />
              <Route path="/soldier/map" component={SoldierMapView} />
              <Route path="/soldier/alerts" component={SoldierAlerts} />
              <Route path="/soldier/channel" component={SoldierChannel} />
              <Route path="/soldier/messages" component={SoldierMessages} />
              <Route path="/soldier/sos" component={SoldierSOS} />
              <Route path="/soldier/evacuation" component={SoldierEvacuation} />
              <Route path="/soldier/medical" component={SoldierMedical} />
              <Route path="/soldier/civilians" component={SoldierCivilians} />
              <Route path="/soldier/notifications" component={SoldierNotifications} />
              <Route path="/soldier/controls" component={SoldierControls} />
              <Route path="/soldier/audit" component={SoldierAudit} />
              <Route path="/soldier/settings" component={SoldierSettings} />
              <Route component={SoldierMapView} />
            </Switch>
          </main>
        </div>
      </div>

      <NotificationCenter
        open={showNotifications}
        onOpenChange={setShowNotifications}
        notifications={mockNotifications}
        userRole="soldier"
        onAcknowledge={(id) => console.log('Ack:', id)}
        onPin={(id) => console.log('Pin:', id)}
      />
    </SidebarProvider>
  );
}
