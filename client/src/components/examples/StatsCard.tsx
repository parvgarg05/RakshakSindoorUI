import StatsCard from '../StatsCard';
import { Shield, Users, AlertTriangle, MapPin } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <StatsCard title="Active Alerts" value={3} icon={Shield} severity="threat" />
      <StatsCard title="Communities" value={12} icon={Users} severity="info" />
      <StatsCard title="SOS Hotspots" value={5} icon={AlertTriangle} severity="warning" />
      <StatsCard title="Safe Zones" value={8} icon={MapPin} severity="safe" />
    </div>
  );
}
