import { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import CivilianSidebar from '@/components/CivilianSidebar';
import NotificationBadge from '@/components/NotificationBadge';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationCenter from '@/components/NotificationCenter';
import CivilianMapView from '@/components/civilian/CivilianMapView';
import CivilianChannel from '@/components/civilian/CivilianChannel';
import CivilianCommunities from '@/components/civilian/CivilianCommunities';
import CivilianMessages from '@/components/civilian/CivilianMessages';
import CivilianDirectChat from '@/components/civilian/CivilianDirectChat';
import GovCitizenChat from '@/components/GovCitizenChat';
import CivilianSOS from '@/components/civilian/CivilianSOS';
import CivilianEvacuation from '@/components/civilian/CivilianEvacuation';
import CivilianMedical from '@/components/civilian/CivilianMedical';
import CivilianNotifications from '@/components/civilian/CivilianNotifications';
import CivilianSettings from '@/components/civilian/CivilianSettings';
import { messageStore } from '@/lib/storage';

interface CivilianDashboardProps {
  onLogout: () => void;
}

export default function CivilianDashboard({ onLogout }: CivilianDashboardProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [, navigate] = useLocation();
  const [notificationCount, setNotificationCount] = useState(2);
  const [centerNotifications, setCenterNotifications] = useState<
    {
      id: string;
      type: 'threat' | 'evacuation' | 'sos' | 'general';
      title: string;
      message: string;
      timestamp: string;
      region?: string;
    }[]
  >([]);

  useEffect(() => {
    // Initialize from localStorage
    const count = localStorage.getItem('civilian_notification_count');
    if (count) setNotificationCount(parseInt(count, 10));

    // Listen for notification updates
    const handleUpdate = () => {
      const count = localStorage.getItem('civilian_notification_count');
      setNotificationCount(count ? parseInt(count, 10) : 0);
    };

    window.addEventListener('notification:updated', handleUpdate);
    return () => window.removeEventListener('notification:updated', handleUpdate);
  }, []);

  const handleAcknowledge = async (id: string) => {
    setCenterNotifications(prev => prev.filter((n) => n.id !== id));
    await messageStore.removeItem(`notif_${id}`);
    const nextCount = Math.max(0, notificationCount - 1);
    localStorage.setItem('civilian_notification_count', nextCount.toString());
    window.dispatchEvent(new CustomEvent('notification:updated'));
  };

  useEffect(() => {
    const loadPublicAlerts = async () => {
      const alerts: {
        id: string;
        type: 'threat' | 'evacuation' | 'sos' | 'general';
        title: string;
        message: string;
        timestamp: string;
        region?: string;
      }[] = [];

      await messageStore.iterate((value: any, key: string) => {
        if (!key?.startsWith('notif_')) return;
        if (!value?.id || !value?.title || !value?.message) return;
        alerts.push({
          id: value.id,
          type: value.type === 'threat' ? 'threat' : 'general',
          title: value.title,
          message: value.message,
          timestamp: value.timestamp ? new Date(value.timestamp).toLocaleString() : 'Just now',
        });
      });

      alerts.sort((a, b) => {
        const aTime = Date.parse(a.timestamp);
        const bTime = Date.parse(b.timestamp);
        if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
        if (Number.isNaN(aTime)) return 1;
        if (Number.isNaN(bTime)) return -1;
        return bTime - aTime;
      });

      setCenterNotifications(alerts);
    };

    loadPublicAlerts();
    const handlePublicAlertsUpdated = () => loadPublicAlerts();
    window.addEventListener('public-alerts:updated', handlePublicAlertsUpdated);
    return () => window.removeEventListener('public-alerts:updated', handlePublicAlertsUpdated);
  }, []);

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
              <NotificationBadge type="alert" count={notificationCount} onClick={() => setShowNotifications(true)} />
              <NotificationBadge type="chat" count={5} onClick={() => navigate('/civilian/chat')} />
              <LanguageSwitcher />
            </div>
          </header>
          <main className="flex-1 min-h-0 min-w-0 overflow-auto h-full w-full flex relative">
            <Switch>
              <Route path="/civilian" component={CivilianMapView} />
              <Route path="/civilian/map" component={CivilianMapView} />
              <Route path="/civilian/channel" component={CivilianChannel} />
              <Route path="/civilian/chat">
                <GovCitizenChat role="civilian" />
              </Route>
              <Route path="/civilian/direct-chat" component={CivilianDirectChat} />
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
        notifications={centerNotifications}
        userRole="civilian"
        onAcknowledge={handleAcknowledge}
      />
    </SidebarProvider>
  );
}
