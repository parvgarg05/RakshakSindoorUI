import { Bell, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NotificationBadgeProps {
  type: 'alert' | 'chat';
  count: number;
  onClick?: () => void;
}

export default function NotificationBadge({ type, count, onClick }: NotificationBadgeProps) {
  const Icon = type === 'alert' ? Bell : MessageSquare;
  const variant = type === 'alert' ? 'destructive' : 'default';

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="relative"
      onClick={onClick}
      data-testid={`button-notification-${type}`}
    >
      <Icon className="h-5 w-5" />
      {count > 0 && (
        <div
          className="absolute -top-2 -right-2 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold"
          data-testid={`badge-count-${type}`}
        >
          {count > 9 ? '9+' : count}
        </div>
      )}
    </Button>
  );
}
