import { MapPin } from 'lucide-react';

export default function CivilianSOS() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="h-8 w-8 text-destructive" />
        <h1 className="text-3xl font-bold">SOS & Hotspots</h1>
      </div>
      <p className="text-muted-foreground">Active SOS locations</p>
    </div>
  );
}
