// 

//new one

import { useEffect, useState } from "react";
import { Bell, ShieldAlert, MapPin, HeartPulse, Clock, CheckCircle, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { messageStore } from "@/lib/storage";

// Calculate distance between two coordinates in km
const calculateDistanceUtil = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
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

// 1. Civilian-Specific Mock Data
type NotificationType = 'evac' | 'medical' | 'safe' | 'threat' | 'general';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  source?: 'public' | 'local';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'evac',
    title: 'Evacuation Order: Sector 7',
    message: 'Flooding risk has increased. Please proceed to the nearest safe zone immediately.',
    timestamp: '5 min ago',
    read: false,
    source: 'local',
  },
  {
    id: '2',
    type: 'medical',
    title: 'Medical Camp Open',
    message: 'A new relief camp with doctors is now active at Government High School.',
    timestamp: '30 min ago',
    read: false,
    source: 'local',
  },
  {
    id: '3',
    type: 'safe',
    title: 'Safe Zone Confirmed',
    message: 'Your current location has been marked as safe by Army personnel.',
    timestamp: '2 hours ago',
    read: true,
    source: 'local',
  },
];

export default function CivilianNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const getReadIds = () => {
    try {
      const raw = localStorage.getItem('civilian_notification_read');
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set<string>(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set<string>();
    }
  };

  const persistReadIds = (ids: Set<string>) => {
    localStorage.setItem('civilian_notification_read', JSON.stringify(Array.from(ids)));
  };

  // Update badge count in localStorage whenever notifications change
  const updateBadgeCount = (newNotifications: NotificationItem[]) => {
    const unreadCount = newNotifications.filter(n => !n.read).length;
    localStorage.setItem('civilian_notification_count', unreadCount.toString());
    window.dispatchEvent(new CustomEvent('notification:updated'));
  };

  const normalizePublicAlert = (value: any, readIds: Set<string>): NotificationItem | null => {
    if (!value || !value.id || !value.title || !value.message) return null;
    const type: NotificationType = value.type === 'threat' || value.type === 'general' ? value.type : 'general';
    const timestamp = value.timestamp ? new Date(value.timestamp).toLocaleString() : 'Just now';
    return {
      id: value.id,
      type,
      title: value.title,
      message: value.message,
      timestamp,
      read: readIds.has(value.id),
      source: 'public',
    };
  };

  useEffect(() => {
    const loadNotifications = async () => {
      const publicAlerts: NotificationItem[] = [];
      const readIds = getReadIds();
      await messageStore.iterate((value: any, key: string) => {
        if (!key?.startsWith('notif_')) return;

        // Filter alerts based on location radius for citizen reports
        let shouldInclude = true;
        if (value.source === 'citizen_report' && value.originLat && value.originLon && userLocation) {
          const distance = calculateDistanceUtil(userLocation.lat, userLocation.lon, value.originLat, value.originLon);
          shouldInclude = distance <= 10;
        }

        if (!shouldInclude) return;

        const normalized = normalizePublicAlert(value, readIds);
        if (normalized) publicAlerts.push(normalized);
      });

      const merged = [...INITIAL_NOTIFICATIONS, ...publicAlerts]
        .reduce((acc, current) => {
          if (!acc.some(item => item.id === current.id)) acc.push(current);
          return acc;
        }, [] as NotificationItem[])
        .sort((a, b) => {
          const aTime = Date.parse(a.timestamp);
          const bTime = Date.parse(b.timestamp);
          if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
          if (Number.isNaN(aTime)) return 1;
          if (Number.isNaN(bTime)) return -1;
          return bTime - aTime;
        });

      setNotifications(merged);
      updateBadgeCount(merged);
    };

    // Get user location for filtering
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => console.error('Geolocation error:', error)
      );
    }

    loadNotifications();

    const handlePublicAlertsUpdated = () => {
      loadNotifications();
    };

    window.addEventListener('public-alerts:updated', handlePublicAlertsUpdated);
    return () => window.removeEventListener('public-alerts:updated', handlePublicAlertsUpdated);
  }, [userLocation]);

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      const nextReadIds = getReadIds();
      nextReadIds.add(id);
      persistReadIds(nextReadIds);
      updateBadgeCount(updated);
      return updated;
    });
  };

  const markAllRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      const nextReadIds = getReadIds();
      updated.forEach(n => nextReadIds.add(n.id));
      persistReadIds(nextReadIds);
      updateBadgeCount(updated);
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem('civilian_notification_count', '0');
    localStorage.setItem('civilian_notification_read', '[]');
    window.dispatchEvent(new CustomEvent('notification:updated'));
  };

  return (
    <div className="h-full w-full p-6 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
             <h1 className="text-3xl font-bold text-gray-900">My Alerts</h1>
             <p className="text-gray-500">Emergency updates and safety instructions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllRead}>
            Mark all as read
          </Button>
          <Button variant="outline" onClick={clearAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {notifications.length === 0 ? (
           <div className="text-center py-10 text-gray-400">No new alerts. Stay safe!</div>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all duration-200 border ${
                notification.read 
                  ? 'bg-white/60 opacity-70' 
                  : 'bg-white border-l-4 border-l-red-500 shadow-md transform hover:-translate-y-0.5'
              }`}
            >
              <CardContent className="p-4 flex gap-4 items-start">
                
                {/* Civilian Icons (Evac, Medical, Safe) */}
                <div className={`mt-1 p-2 rounded-full shrink-0 ${
                  notification.type === 'evac' ? 'bg-red-100 text-red-600' :
                  notification.type === 'medical' ? 'bg-green-100 text-green-600' :
                  notification.type === 'threat' ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {notification.type === 'evac' ? <ShieldAlert className="h-5 w-5" /> :
                   notification.type === 'medical' ? <HeartPulse className="h-5 w-5" /> :
                   notification.type === 'threat' ? <AlertTriangle className="h-5 w-5" /> :
                   <MapPin className="h-5 w-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-semibold text-lg ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    <span className="flex items-center text-xs text-gray-500 whitespace-nowrap ml-2">
                      <Clock className="mr-1 h-3 w-3" />
                      {notification.timestamp}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {notification.message}
                  </p>

                  {!notification.read && (
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as read
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}