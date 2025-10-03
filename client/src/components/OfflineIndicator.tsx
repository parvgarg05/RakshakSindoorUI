import { CloudOff, WifiOff } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';

export default function OfflineIndicator() {
  const { isOffline, language } = useApp();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-chart-3 text-white px-4 py-2 flex items-center justify-center gap-2 z-50" data-testid="banner-offline">
      <WifiOff className="h-4 w-4" />
      <span className="font-medium">
        {getTranslation(language, 'offlineMode')}
      </span>
      <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
        {getTranslation(language, 'lastSynced')}: 2min ago
      </Badge>
    </div>
  );
}
