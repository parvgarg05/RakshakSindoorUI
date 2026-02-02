import { X, AlertTriangle, Shield, MapPin, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface Notification {
  id: string;
  type: 'threat' | 'evacuation' | 'sos' | 'general';
  title: string;
  message: string;
  timestamp: string;
  region?: string;
  isPinned?: boolean;
}

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
  userRole: 'government' | 'civilian';
  onAcknowledge?: (id: string) => void;
  onPin?: (id: string) => void;
}

const typeIcons = {
  threat: AlertTriangle,
  evacuation: MapPin,
  sos: Shield,
  general: Info,
};

const typeColors = {
  threat: 'destructive',
  evacuation: 'default',
  sos: 'destructive',
  general: 'secondary',
} as const;

export default function NotificationCenter({
  open,
  onOpenChange,
  notifications,
  userRole,
  onAcknowledge,
  onPin,
}: NotificationCenterProps) {
  const sortedNotifications = [...notifications].sort((a, b) => {
    const priority = { threat: 4, sos: 3, evacuation: 2, general: 1 };
    return priority[b.type] - priority[a.type];
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md" data-testid="sheet-notification-center">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            {userRole === 'government' ? 'Manage and prioritize alerts' : 'View important alerts'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-3 pr-4">
            {sortedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Info className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              sortedNotifications.map((notification) => {
              const Icon = typeIcons[notification.type];
              return (
                <div
                  key={notification.id}
                  className="p-4 rounded-lg border bg-card hover-elevate"
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={typeColors[notification.type]}>
                          {notification.type.toUpperCase()}
                        </Badge>
                        {notification.region && (
                          <span className="text-xs text-muted-foreground">
                            {notification.region}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground mt-2 block">
                        {notification.timestamp}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {userRole === 'government' && onPin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onPin(notification.id)}
                          data-testid={`button-pin-${notification.id}`}
                          className="text-xs"
                        >
                          Pin
                        </Button>
                      )}
                      {onAcknowledge && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAcknowledge(notification.id)}
                          data-testid={`button-ack-${notification.id}`}
                          className="hover:bg-destructive/10 hover:text-destructive"
                          title="Dismiss notification"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
