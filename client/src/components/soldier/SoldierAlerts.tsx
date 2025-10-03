import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SoldierAlerts() {
  const alerts = [
    { id: '1', severity: 'threat', region: 'Sector 7', message: 'Immediate evacuation required', time: '2 min ago' },
    { id: '2', severity: 'warning', region: 'Dal Lake', message: 'Heavy civilian traffic detected', time: '15 min ago' },
    { id: '3', severity: 'info', region: 'City Center', message: 'Routine patrol completed', time: '1 hour ago' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h1 className="text-3xl font-tactical font-bold">Active Alerts</h1>
      </div>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="hover-elevate" data-testid={`alert-${alert.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant={alert.severity === 'threat' ? 'destructive' : 'default'}>
                  {alert.severity.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">{alert.region}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">{alert.message}</p>
              <span className="text-xs text-muted-foreground">{alert.time}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
