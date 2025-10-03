import { Heart } from 'lucide-react';

export default function CivilianMedical() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-8 w-8 text-chart-2" />
        <h1 className="text-3xl font-bold">Medical Hubs</h1>
      </div>
      <p className="text-muted-foreground">Nearby medical facilities</p>
    </div>
  );
}
