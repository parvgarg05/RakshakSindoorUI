import { useState, useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from '@/contexts/AppContext';
import LandingPage from '@/pages/landing';
import LoginPage from '@/pages/login';
import SignupPage from '@/pages/signup';
import SoldierDashboard from '@/pages/soldier-dashboard';
import CivilianDashboard from '@/pages/civilian-dashboard';

type View = 'landing' | 'soldier-login' | 'civilian-login' | 'soldier-signup' | 'civilian-signup' | 'soldier-dashboard' | 'civilian-dashboard';

function AppContent() {
  const { user, logout } = useApp();
  const [view, setView] = useState<View>('landing');

  useEffect(() => {
    if (user) {
      setView(user.role === 'soldier' ? 'soldier-dashboard' : 'civilian-dashboard');
    } else if (view !== 'landing' && view !== 'soldier-login' && view !== 'civilian-login' && view !== 'soldier-signup' && view !== 'civilian-signup') {
      setView('landing');
    }
  }, [user]);

  const handleSelectPortal = (role: 'soldier' | 'civilian') => {
    setView(role === 'soldier' ? 'soldier-login' : 'civilian-login');
  };

  const handleLogout = () => {
    logout();
    setView('landing');
  };

  const handleLoginSuccess = () => {
    if (user) {
      setView(user.role === 'soldier' ? 'soldier-dashboard' : 'civilian-dashboard');
    }
  };

  return (
    <>
      {view === 'landing' && (
        <LandingPage onSelectPortal={handleSelectPortal} />
      )}
      {view === 'soldier-login' && (
        <LoginPage
          role="soldier"
          onBack={() => setView('landing')}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setView('soldier-signup')}
        />
      )}
      {view === 'civilian-login' && (
        <LoginPage
          role="civilian"
          onBack={() => setView('landing')}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setView('civilian-signup')}
        />
      )}
      {view === 'soldier-signup' && (
        <SignupPage
          role="soldier"
          onBack={() => setView('landing')}
          onSignupSuccess={handleLoginSuccess}
          onSwitchToLogin={() => setView('soldier-login')}
        />
      )}
      {view === 'civilian-signup' && (
        <SignupPage
          role="civilian"
          onBack={() => setView('landing')}
          onSignupSuccess={handleLoginSuccess}
          onSwitchToLogin={() => setView('civilian-login')}
        />
      )}
      {view === 'soldier-dashboard' && (
        <SoldierDashboard onLogout={handleLogout} />
      )}
      {view === 'civilian-dashboard' && (
        <CivilianDashboard onLogout={handleLogout} />
      )}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
