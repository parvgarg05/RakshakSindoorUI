import CivilianDashboard from '../civilian-dashboard';
import { AppProvider } from '@/contexts/AppContext';

export default function CivilianDashboardExample() {
  return (
    <AppProvider>
      <CivilianDashboard onLogout={() => console.log('Logout')} />
    </AppProvider>
  );
}
