import { Users, Map, MessageSquare, MapPin, Heart, Bell, Settings, LogOut, Radio, Shield } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

interface CivilianSidebarProps {
  onLogout: () => void;
}

export default function CivilianSidebar({ onLogout }: CivilianSidebarProps) {
  const [location] = useLocation();
  const { user } = useApp();

  const mainItems = [
    { title: 'Map View', url: '/civilian', icon: Map },
    { title: 'Important Channel', url: '/civilian/channel', icon: Radio },
    { title: 'Messages', url: '/civilian/messages', icon: MessageSquare },
  ];

  const safetyItems = [
    { title: 'SOS & Hotspots', url: '/civilian/sos', icon: MapPin },
    { title: 'Evacuation Zones', url: '/civilian/evacuation', icon: Shield },
    { title: 'Medical Hubs', url: '/civilian/medical', icon: Heart },
  ];

  const systemItems = [
    { title: 'Notifications', url: '/civilian/notifications', icon: Bell },
    { title: 'Settings', url: '/civilian/settings', icon: Settings },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg truncate">Civilian Portal</h2>
            <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Safety Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {safetyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={onLogout}
          data-testid="button-sidebar-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
