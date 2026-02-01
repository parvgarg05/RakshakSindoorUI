import { useState, useEffect } from 'react';
import MapView, { type MapMarker } from '@/components/ui/MapView';
import EvacuationPanel from '@/components/EvacuationPanel';
import { useToast } from '@/hooks/use-toast';
import { markerStore } from '@/lib/storage';

export default function CivilianMapView() {
  const { toast } = useToast();
  const [markers, setMarkers] = useState<MapMarker[]>([
    { id: '2', position: [34.0937, 74.8073] as [number, number], type: 'safe' as const, title: 'Safe Zone Alpha', description: 'Community shelter' },
    { id: '3', position: [34.0737, 74.7873] as [number, number], type: 'medical' as const, title: 'Medical Hub', description: 'Emergency care' },
  ]);

  useEffect(() => {
    const loadMarkers = async () => {
      const baseMarkers: MapMarker[] = [
        { id: '2', position: [34.0937, 74.8073] as [number, number], type: 'safe' as const, title: 'Safe Zone Alpha', description: 'Community shelter' },
        { id: '3', position: [34.0737, 74.7873] as [number, number], type: 'medical' as const, title: 'Medical Hub', description: 'Emergency care' },
      ];
      
      const sosMarkers: MapMarker[] = [];
      await markerStore.iterate((value: any) => {
        if (value.type === 'sos') {
          sosMarkers.push({
            id: value.id,
            position: value.position,
            type: 'sos' as const,
            title: value.label || 'SOS Alert',
          });
        }
      });
      
      setMarkers([...baseMarkers, ...sosMarkers]);
    };

    loadMarkers();

    const handleSosCreated = () => loadMarkers();
    const handleSosCleared = () => {
      setMarkers([
        { id: '2', position: [34.0937, 74.8073] as [number, number], type: 'safe' as const, title: 'Safe Zone Alpha', description: 'Community shelter' },
        { id: '3', position: [34.0737, 74.7873] as [number, number], type: 'medical' as const, title: 'Medical Hub', description: 'Emergency care' },
      ]);
    };

    window.addEventListener('sos:created', handleSosCreated);
    window.addEventListener('sos:cleared', handleSosCleared);

    const intervalId = window.setInterval(loadMarkers, 3000);

    return () => {
      window.removeEventListener('sos:created', handleSosCreated);
      window.removeEventListener('sos:cleared', handleSosCleared);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="h-full w-full flex overflow-hidden">
      <main className="flex-1 min-h-0 min-w-0">
        <MapView 
          center={[34.0837, 74.7973]}
          zoom={13}
          markers={markers}
          onMarkerClick={(marker) => {
            toast({ title: marker.title, description: marker.description });
          }}
          height="100%"
          className="h-full"
        />
      </main>
      <aside className="w-96 border-l bg-card p-4 overflow-auto min-h-0">
        <EvacuationPanel
          nearestZone={{
            name: 'Safe Zone Alpha - Community Center',
            distance: '1.2 km',
            eta: '15 minutes walking',
          }}
          medicalHub={{
            name: 'District Hospital',
            distance: '800 m',
          }}
          onFollowSoldier={() => toast({ title: "Following Soldier Route" })}
          onViewRoute={() => toast({ title: "Route Displayed on Map" })}
        />
      </aside>
    </div>
  );
}
