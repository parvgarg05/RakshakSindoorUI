import { useState } from 'react';
import { Shield, Users, AlertTriangle, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StatsCard from '@/components/StatsCard';
import ActivityChart from '@/components/ActivityChart';
import EncryptedMessage from '@/components/EncryptedMessage';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBadge from '@/components/NotificationBadge';
import OfflineIndicator from '@/components/OfflineIndicator';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { encryptMessage } from '@/lib/encryption';

interface LandingPageProps {
  onSelectPortal: (role: 'government' | 'civilian') => void;
}

export default function LandingPage({ onSelectPortal }: LandingPageProps) {
  const { language, setIsOffline, isOffline } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const activityData = [
    { time: '00:00', value: 4 },
    { time: '04:00', value: 2 },
    { time: '08:00', value: 8 },
    { time: '12:00', value: 12 },
    { time: '16:00', value: 15 },
    { time: '20:00', value: 9 },
    { time: '24:00', value: 6 },
  ];

  const emergencyMessage = "ALERT: Evacuation required in Sector 7. Move to Safe Zone Alpha immediately.";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <OfflineIndicator />
      
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-tactical font-bold">
              {getTranslation(language, 'appName')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsOffline(!isOffline)}
              data-testid="button-toggle-offline"
            >
              {isOffline ? 'Go Online' : 'Go Offline'}
            </Button>
            <NotificationBadge type="alert" count={3} onClick={() => setShowNotifications(true)} />
            <NotificationBadge type="chat" count={5} />
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card 
              className="cursor-pointer border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-8 hover-elevate active-elevate-2"
              onClick={() => onSelectPortal('government')}
              data-testid="card-government-portal"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <Shield className="h-24 w-24 text-primary" />
                <h2 className="text-3xl font-tactical font-bold">
                  {getTranslation(language, 'governmentPortal')}
                </h2>
                <p className="text-muted-foreground">
                  Admin Dashboard & Emergency Management
                </p>
                <Button className="mt-4" data-testid="button-enter-government">
                  Enter Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card 
              className="cursor-pointer border-2 border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 p-8 hover-elevate active-elevate-2"
              onClick={() => onSelectPortal('civilian')}
              data-testid="card-civilian-portal"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <Users className="h-24 w-24 text-primary" />
                <h2 className="text-3xl font-tactical font-bold">
                  {getTranslation(language, 'civilianPortal')}
                </h2>
                <p className="text-muted-foreground">
                  Community Network & Safety Resources
                </p>
                <Button className="mt-4" data-testid="button-enter-civilian">
                  Enter Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="mb-4 text-2xl font-tactical font-bold">
            {getTranslation(language, 'emergencyChannel')}
          </h3>
          <EncryptedMessage 
            encrypted={encryptMessage(emergencyMessage)}
            sender="Command-001"
            timestamp="5 min ago"
            currentLang={language}
          />
        </section>

        <section className="mb-12">
          <h3 className="mb-6 text-2xl font-tactical font-bold">Live Statistics</h3>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              title={getTranslation(language, 'activeAlerts')}
              value={3}
              icon={Shield}
              severity="threat"
              testId="stat-active-alerts"
            />
            <StatsCard 
              title={getTranslation(language, 'activeCommunities')}
              value={12}
              icon={Users}
              severity="info"
              testId="stat-communities"
            />
            <StatsCard 
              title={getTranslation(language, 'sosHotspots')}
              value={5}
              icon={AlertTriangle}
              severity="warning"
              testId="stat-sos"
            />
            <StatsCard 
              title={getTranslation(language, 'evacuationZones')}
              value={8}
              icon={MapPin}
              severity="safe"
              testId="stat-evacuation"
            />
          </div>
          <ActivityChart data={activityData} title="24h Activity Overview" />
        </section>

        <footer className="mt-12 border-t pt-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              🔒 This is a demonstration frontend. Not for real-world secure communications.
            </p>
            <p>
              Rakshak ResQ © 2024 - Secure Emergency Communication Platform
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
