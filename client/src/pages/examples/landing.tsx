import LandingPage from '../landing';
import { AppProvider } from '@/contexts/AppContext';

export default function LandingPageExample() {
  return (
    <AppProvider>
      <LandingPage onSelectPortal={(role) => console.log('Selected portal:', role)} />
    </AppProvider>
  );
}
