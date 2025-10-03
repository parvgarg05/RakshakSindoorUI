import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommunityCard from '@/components/CommunityCard';
import { useToast } from '@/hooks/use-toast';

export default function CivilianCommunities() {
  const { toast } = useToast();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Communities</h1>
        </div>
        <Button data-testid="button-create-community">
          <Plus className="h-4 w-4 mr-2" />
          Create Community
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CommunityCard
          name="Sector 7 Residents"
          location="Old City, Srinagar"
          memberCount={45}
          distance="0.5 km"
          onJoin={() => toast({ title: "Joined Community" })}
          onViewPosts={() => console.log('View posts')}
        />
        <CommunityCard
          name="Dal Lake Community"
          location="Dal Lake Area"
          memberCount={128}
          distance="2.1 km"
          onJoin={() => toast({ title: "Joined Community" })}
          onViewPosts={() => console.log('View posts')}
        />
        <CommunityCard
          name="Emergency Response Network"
          location="District Center"
          memberCount={89}
          distance="1.8 km"
          onJoin={() => toast({ title: "Joined Community" })}
          onViewPosts={() => console.log('View posts')}
        />
      </div>
    </div>
  );
}
