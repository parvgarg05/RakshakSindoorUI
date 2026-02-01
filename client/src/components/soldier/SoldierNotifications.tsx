// import { Bell } from 'lucide-react';

// export default function SoldierNotifications() {
//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <div className="flex items-center gap-3 mb-6">
//         <Bell className="h-8 w-8 text-primary" />
//         <h1 className="text-3xl font-tactical font-bold">Notifications</h1>
//       </div>
//       <p className="text-muted-foreground">Manage notification priorities</p>
//     </div>
//   );
// }
import { useState } from "react";
import { Bell, AlertTriangle, Info, CheckCircle, Clock, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 1. Hardcoded Data (So the list is never empty)
const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    type: 'threat',
    title: 'Critical Threat Alert',
    message: 'Unauthorized movement detected in Sector 7 via drone surveillance.',
    timestamp: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Low Bandwidth Warning',
    message: 'System connectivity is fluctuating. Offline mode active.',
    timestamp: '10 min ago',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Medical Supply Update',
    message: 'Resupply convoy has reached Base Camp Alpha.',
    timestamp: '1 hour ago',
    read: true,
  },
];

export default function SoldierNotifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Update badge count in localStorage whenever notifications change
  const updateBadgeCount = (newNotifications: typeof INITIAL_NOTIFICATIONS) => {
    const unreadCount = newNotifications.filter(n => !n.read).length;
    localStorage.setItem('soldier_notification_count', unreadCount.toString());
    window.dispatchEvent(new CustomEvent('notification:updated'));
  };

  // Simple function to simulate marking a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      updateBadgeCount(updated);
      return updated;
    });
  };

  const markAllRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      updateBadgeCount(updated);
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem('soldier_notification_count', '0');
    window.dispatchEvent(new CustomEvent('notification:updated'));
  };

  return (
    <div className="h-full w-full p-6 bg-gray-50 overflow-y-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
             <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
             <p className="text-gray-500">Manage system alerts and priorities</p>
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

      {/* Notification List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`transition-all duration-200 border ${
              notification.read 
                ? 'bg-white/60 opacity-70' 
                : 'bg-white border-l-4 border-l-blue-500 shadow-md transform hover:-translate-y-0.5'
            }`}
          >
            <CardContent className="p-4 flex gap-4 items-start">
              {/* Icon Logic based on type */}
              <div className={`mt-1 p-2 rounded-full shrink-0 ${
                notification.type === 'threat' ? 'bg-red-100 text-red-600' :
                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {notification.type === 'threat' ? <AlertTriangle className="h-5 w-5" /> :
                 notification.type === 'warning' ? <Bell className="h-5 w-5" /> :
                 notification.read ? <CheckCircle className="h-5 w-5" /> :
                 <Info className="h-5 w-5" />}
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

                {/* Mark as Read Button (Only shows if unread) */}
                {!notification.read && (
                  <div className="mt-3">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}