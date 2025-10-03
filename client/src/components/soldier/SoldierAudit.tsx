import { Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SoldierAudit() {
  const auditLog = [
    { id: '1', action: 'Alert Sent', details: 'Evacuation alert to Sector 7', user: 'Soldier-001', time: '2 min ago' },
    { id: '2', action: 'SOS Created', details: 'SOS marker at Dal Lake', user: 'Soldier-002', time: '15 min ago' },
    { id: '3', action: 'Zone Updated', details: 'Evacuation Zone Alpha expanded', user: 'Soldier-001', time: '1 hour ago' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-tactical font-bold">Audit Log</h1>
      </div>
      <div className="space-y-3">
        {auditLog.map((log) => (
          <Card key={log.id} className="hover-elevate" data-testid={`audit-${log.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">{log.action}</Badge>
                  <p className="text-sm">{log.details}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{log.user}</span>
                    <span>•</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
