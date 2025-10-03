import { Bell } from 'lucide-react';

export default function CivilianNotifications() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Notifications</h1>
      </div>
      <p className="text-muted-foreground">Important notifications</p>
    </div>
  );
}
