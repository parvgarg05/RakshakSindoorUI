import { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import SoldierSidebar from '@/components/SoldierSidebar';
import NotificationBadge from '@/components/NotificationBadge';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationCenter from '@/components/NotificationCenter';
import SoldierMapView from '@/components/soldier/SoldierMapView';
import SoldierAlerts from '@/components/soldier/SoldierAlerts';
import SoldierChannel from '@/components/soldier/SoldierChannel';
import SoldierMessages from '@/components/soldier/SoldierMessages';
import GovCitizenChat from '@/components/GovCitizenChat';
import SoldierSOS from '@/components/soldier/SoldierSOS';
import SoldierEvacuation from '@/components/soldier/SoldierEvacuation';
import SoldierMedical from '@/components/soldier/SoldierMedical';
import SoldierCivilians from '@/components/soldier/SoldierCivilians';
import SoldierNotifications from '@/components/soldier/SoldierNotifications';
import SoldierControls from '@/components/soldier/SoldierControls';
import SoldierAudit from '@/components/soldier/SoldierAudit';
import SoldierSettings from '@/components/soldier/SoldierSettings';
import CitizenAlertManager from '@/components/soldier/CitizenAlertManager';
import DamageAssessor from '@/components/soldier/DamageAssessor';

interface SoldierDashboardProps {
  onLogout: () => void;
}

export default function SoldierDashboard({ onLogout }: SoldierDashboardProps) {
  const [, navigate] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [panelKey, setPanelKey] = useState(0);
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    // Initialize from localStorage
    const count = localStorage.getItem('soldier_notification_count');
    if (count) setNotificationCount(parseInt(count, 10));

    // Listen for notification updates
    const handleUpdate = () => {
      const count = localStorage.getItem('soldier_notification_count');
      setNotificationCount(count ? parseInt(count, 10) : 0);
    };

    window.addEventListener('notification:updated', handleUpdate);
    return () => window.removeEventListener('notification:updated', handleUpdate);
  }, []);

  const handlePanelToggle = () => {
    setPanelKey(prev => prev + 1);
  };

  // Wrapper component for map view - defined inside to access closure variables
  const SoldierMapViewWrapper = () => (
    <SoldierMapView onPanelToggle={handlePanelToggle} panelKey={panelKey} />
  );

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
      {/* CHANGE 1: Force full screen height and prevent body scroll */}
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <SoldierSidebar onLogout={onLogout} />
        
        {/* CHANGE 2: Flex column that takes all remaining width/height */}
        <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between px-4 border-b bg-background/95 backdrop-blur z-20">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <NotificationBadge type="alert" count={notificationCount} onClick={() => setShowNotifications(true)} />
              <NotificationBadge type="chat" count={5} onClick={() => navigate('/soldier/chat')} />
              <LanguageSwitcher />
            </div>
          </header>

          {/* CHANGE 3: Main area must be relative and full height for Map to work */}
          <main className="flex-1 relative h-full w-full overflow-hidden z-0 flex">
            {/* Wrapper div to ensure routes take up 100% height */}
            <div className="w-full h-full flex overflow-y-auto">
                <Switch>
                <Route path="/soldier" component={SoldierMapViewWrapper} />
                <Route path="/soldier/map" component={SoldierMapViewWrapper} />
                <Route path="/soldier/alerts" component={SoldierAlerts} />
                <Route path="/soldier/channel" component={SoldierChannel} />
                <Route path="/soldier/chat">
                  <GovCitizenChat role="government" />
                </Route>
                <Route path="/soldier/messages" component={SoldierMessages} />
                <Route path="/soldier/sos" component={SoldierSOS} />
                <Route path="/soldier/alert-manager" component={CitizenAlertManager} />
                <Route path="/soldier/evacuation" component={SoldierEvacuation} />
                <Route path="/soldier/medical" component={SoldierMedical} />
                <Route path="/soldier/civilians" component={SoldierCivilians} />
                <Route path="/soldier/notifications" component={SoldierNotifications} />
                <Route path="/soldier/controls" component={SoldierControls} />
                <Route path="/soldier/audit" component={SoldierAudit} />
                <Route path="/soldier/settings" component={SoldierSettings} />
                <Route path="/soldier/assess" component={DamageAssessor} />
                <Route component={SoldierMapViewWrapper} />
                </Switch>
            </div>
          </main>
        </div>
      </div>

      <NotificationCenter
        open={showNotifications}
        onOpenChange={setShowNotifications}
        notifications={mockNotifications}
        userRole="government"
        onAcknowledge={(id) => console.log('Ack:', id)}
        onPin={(id) => console.log('Pin:', id)}
      />
    </SidebarProvider>
  );
}