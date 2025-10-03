import { Settings } from 'lucide-react';

export default function SoldierSettings() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-tactical font-bold">Settings</h1>
      </div>
      <p className="text-muted-foreground">Configure soldier portal preferences</p>
    </div>
  );
}
