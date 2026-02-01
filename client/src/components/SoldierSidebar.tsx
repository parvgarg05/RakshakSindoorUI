import { Shield, Map, AlertTriangle, Radio, MessageSquare, Users, MapPin, Heart, Bell, Settings, LogOut, Lock, Activity, FileText, Zap } from 'lucide-react';
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

interface SoldierSidebarProps {
  onLogout: () => void;
}

export default function SoldierSidebar({ onLogout }: SoldierSidebarProps) {
  const [location] = useLocation();
  const { user } = useApp();

  const mainItems = [
    { title: 'Jurisdiction Map', url: '/soldier', icon: Map },
    { title: 'Public Alerts', url: '/soldier/alerts', icon: AlertTriangle },
    { title: 'Important Channel', url: '/soldier/channel', icon: Radio },
  ];

  const managementItems = [
    { title: 'SOS & Hotspots', url: '/soldier/sos', icon: MapPin },
    { title: 'Evacuation Zones', url: '/soldier/evacuation', icon: Shield },
    { title: 'Medical Hubs', url: '/soldier/medical', icon: Heart },
    { title: 'Connected Citizens', url: '/soldier/civilians', icon: Users },
  ];

  const controlItems = [
    { title: 'Notifications', url: '/soldier/notifications', icon: Bell },
    { title: 'Lock Controls', url: '/soldier/controls', icon: Lock },
    { title: 'Audit Log', url: '/soldier/audit', icon: Activity },
    { title: 'Settings', url: '/soldier/settings', icon: Settings },
  ];

  const aiItems = [
    { title: 'AI Damage Assessment', url: '/soldier/assess', icon: Zap },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div className="flex-1 min-w-0">
            <h2 className="font-tactical font-bold text-lg truncate">Government Portal</h2>
            <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Dashboard</SidebarGroupLabel>
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
          <SidebarGroupLabel>Communication</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === '/soldier/chat'}>
                  <Link href="/soldier/chat" data-testid="nav-citizen-chat">
                    <MessageSquare className="h-4 w-4" />
                    <span>Citizen Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === '/soldier/alert-manager'}>
                  <Link href="/soldier/alert-manager" data-testid="nav-alert-manager">
                    <FileText className="h-4 w-4" />
                    <span>Alert Manager</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiItems.map((item) => (
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
          <SidebarGroupLabel>Zone Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
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
          <SidebarGroupLabel>System Controls</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {controlItems.map((item) => (
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
