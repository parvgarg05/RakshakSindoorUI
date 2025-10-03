import { Users, MapPin, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CommunityCardProps {
  name: string;
  location: string;
  memberCount: number;
  distance?: string;
  onJoin?: () => void;
  onViewPosts?: () => void;
}

export default function CommunityCard({ 
  name, 
  location, 
  memberCount, 
  distance, 
  onJoin, 
  onViewPosts 
}: CommunityCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-community-${name.toLowerCase().replace(/\s/g, '-')}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
              {distance && <Badge variant="secondary">{distance}</Badge>}
            </div>
          </div>
          <Badge className="gap-1">
            <Users className="h-3 w-3" />
            {memberCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={onJoin} data-testid="button-join-community">
          Join
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={onViewPosts} data-testid="button-view-posts">
          <MessageCircle className="h-4 w-4 mr-1" />
          Posts
        </Button>
      </CardContent>
    </Card>
  );
}
