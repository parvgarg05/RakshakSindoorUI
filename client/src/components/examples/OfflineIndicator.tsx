import OfflineIndicator from '../OfflineIndicator';
import { AppProvider } from '@/contexts/AppContext';

export default function OfflineIndicatorExample() {
  return (
    <AppProvider>
      <OfflineIndicator />
    </AppProvider>
  );
}
