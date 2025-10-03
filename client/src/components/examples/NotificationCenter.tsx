import { useState } from 'react';
import NotificationCenter from '../NotificationCenter';
import { Button } from '@/components/ui/button';

export default function NotificationCenterExample() {
  const [open, setOpen] = useState(false);

  const mockNotifications = [
    {
      id: '1',
      type: 'threat' as const,
      title: 'Critical Threat Alert',
      message: 'Immediate evacuation required in Sector 7. All civilians move to Safe Zone Alpha.',
      timestamp: '2 min ago',
      region: 'Sector 7',
      isPinned: true,
    },
    {
      id: '2',
      type: 'evacuation' as const,
      title: 'Evacuation Notice',
      message: 'Planned evacuation drill tomorrow at 10:00 AM.',
      timestamp: '1 hour ago',
      region: 'All Sectors',
    },
    {
      id: '3',
      type: 'sos' as const,
      title: 'SOS Signal Received',
      message: 'Civilian requires assistance near Dal Lake.',
      timestamp: '30 min ago',
      region: 'Dal Lake',
    },
  ];

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Notifications</Button>
      <NotificationCenter
        open={open}
        onOpenChange={setOpen}
        notifications={mockNotifications}
        userRole="soldier"
        onAcknowledge={(id) => console.log('Acknowledge:', id)}
        onPin={(id) => console.log('Pin:', id)}
      />
    </div>
  );
}
