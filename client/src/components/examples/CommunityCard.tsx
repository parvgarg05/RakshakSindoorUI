import CommunityCard from '../CommunityCard';

export default function CommunityCardExample() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CommunityCard 
        name="Sector 7 Residents"
        location="Old City, Srinagar"
        memberCount={45}
        distance="0.5 km"
        onJoin={() => console.log('Join clicked')}
        onViewPosts={() => console.log('View posts clicked')}
      />
      <CommunityCard 
        name="Dal Lake Community"
        location="Dal Lake Area"
        memberCount={128}
        distance="2.1 km"
        onJoin={() => console.log('Join clicked')}
        onViewPosts={() => console.log('View posts clicked')}
      />
    </div>
  );
}
