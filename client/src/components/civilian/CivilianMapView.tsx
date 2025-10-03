import MapView from '@/components/MapView';
import EvacuationPanel from '@/components/EvacuationPanel';
import { useToast } from '@/hooks/use-toast';

export default function CivilianMapView() {
  const { toast } = useToast();
  
  const mockMarkers = [
    { position: [34.0837, 74.7973] as [number, number], type: 'sos' as const, label: 'SOS Alert' },
    { position: [34.0937, 74.8073] as [number, number], type: 'safe' as const, label: 'Safe Zone Alpha' },
    { position: [34.0737, 74.7873] as [number, number], type: 'medical' as const, label: 'Medical Hub' },
  ];

  return (
    <div className="h-full flex">
      <main className="flex-1">
        <MapView markers={mockMarkers} height="100%" />
      </main>
      <aside className="w-96 border-l bg-card p-4 overflow-auto">
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
