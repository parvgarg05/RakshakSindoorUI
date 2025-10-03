import EvacuationPanel from '../EvacuationPanel';

export default function EvacuationPanelExample() {
  return (
    <div className="p-4 max-w-md">
      <EvacuationPanel
        nearestZone={{
          name: 'Safe Zone Alpha - Community Center',
          distance: '1.2 km',
          eta: '15 minutes walking',
        }}
        medicalHub={{
          name: 'District Hospital - Emergency Wing',
          distance: '800 m',
        }}
        onFollowSoldier={() => console.log('Follow soldier clicked')}
        onViewRoute={() => console.log('View route clicked')}
      />
    </div>
  );
}
