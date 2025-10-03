import SoldierDashboard from '../soldier-dashboard';
import { AppProvider } from '@/contexts/AppContext';

export default function SoldierDashboardExample() {
  return (
    <AppProvider>
      <SoldierDashboard onLogout={() => console.log('Logout')} />
    </AppProvider>
  );
}
