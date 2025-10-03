import MapView from '../MapView';

export default function MapViewExample() {
  const demoMarkers = [
    { position: [34.0837, 74.7973] as [number, number], type: 'sos' as const, label: 'SOS Alert - Sector 7' },
    { position: [34.0937, 74.8073] as [number, number], type: 'evacuation' as const, label: 'Evacuation Zone Alpha' },
    { position: [34.0737, 74.7873] as [number, number], type: 'medical' as const, label: 'Medical Hub - District Hospital' },
    { position: [34.0637, 74.8173] as [number, number], type: 'safe' as const, label: 'Safe Zone Bravo' },
  ];

  return (
    <div className="p-4">
      <MapView markers={demoMarkers} height="500px" />
    </div>
  );
}
