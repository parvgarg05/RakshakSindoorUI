import { Shield } from 'lucide-react';

export default function CivilianEvacuation() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Evacuation Zones</h1>
      </div>
      <p className="text-muted-foreground">Safe zones and evacuation routes</p>
    </div>
  );
}
