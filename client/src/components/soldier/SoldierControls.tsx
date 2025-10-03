import { Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function SoldierControls() {
  const { toast } = useToast();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-tactical font-bold">Lock Controls</h1>
      </div>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Override</CardTitle>
            <CardDescription>Lock civilian notification acknowledgments</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Label htmlFor="lock-notif">Lock Notifications</Label>
            <Switch id="lock-notif" data-testid="switch-lock-notifications" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Force Refresh Civilian Views</CardTitle>
            <CardDescription>Push updates to all connected civilian devices</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => toast({ title: "Refresh Signal Sent", description: "All civilian views updated" })}
              data-testid="button-force-refresh"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Refresh All
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
