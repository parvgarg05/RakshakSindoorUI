import LoginPage from '../login';
import { AppProvider } from '@/contexts/AppContext';

export default function LoginPageExample() {
  return (
    <AppProvider>
      <LoginPage 
        role="soldier"
        onBack={() => console.log('Back')}
        onLoginSuccess={() => console.log('Login success')}
      />
    </AppProvider>
  );
}
