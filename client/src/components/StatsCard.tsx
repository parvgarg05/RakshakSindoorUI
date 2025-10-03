import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  severity?: 'threat' | 'warning' | 'safe' | 'info';
  testId?: string;
}

const severityColors = {
  threat: 'text-destructive',
  warning: 'text-chart-3',
  safe: 'text-chart-2',
  info: 'text-primary',
};

export default function StatsCard({ title, value, icon: Icon, severity = 'info', testId }: StatsCardProps) {
  return (
    <Card className="hover-elevate" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${severityColors[severity]}`} data-testid={`${testId}-value`}>
              {value}
            </p>
          </div>
          <Icon className={`h-10 w-10 ${severityColors[severity]} opacity-60`} />
        </div>
      </CardContent>
    </Card>
  );
}
