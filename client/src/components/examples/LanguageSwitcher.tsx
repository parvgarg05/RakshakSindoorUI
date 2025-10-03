import LanguageSwitcher from '../LanguageSwitcher';
import { AppProvider } from '@/contexts/AppContext';

export default function LanguageSwitcherExample() {
  return (
    <AppProvider>
      <div className="p-4">
        <LanguageSwitcher />
      </div>
    </AppProvider>
  );
}
