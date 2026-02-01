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

type View = 'landing' | 'government-login' | 'civilian-login' | 'government-signup' | 'civilian-signup' | 'government-dashboard' | 'civilian-dashboard';

function AppContent() {
  const { user, logout } = useApp();
  const [view, setView] = useState<View>('landing');

  useEffect(() => {
    if (user) {
      setView(user.role === 'government' ? 'government-dashboard' : 'civilian-dashboard');
    } else if (view !== 'landing' && view !== 'government-login' && view !== 'civilian-login' && view !== 'government-signup' && view !== 'civilian-signup') {
      setView('landing');
    }
  }, [user]);

  const handleSelectPortal = (role: 'government' | 'civilian') => {
    setView(role === 'government' ? 'government-login' : 'civilian-login');
  };

  const handleLogout = () => {
    logout();
    setView('landing');
  };

  const handleLoginSuccess = () => {
    if (user) {
      setView(user.role === 'government' ? 'government-dashboard' : 'civilian-dashboard');
    }
  };

  return (
    <>
      {view === 'landing' && (
        <LandingPage onSelectPortal={handleSelectPortal} />
      )}
      {view === 'government-login' && (
        <LoginPage
          role="government"
          onBack={() => setView('landing')}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setView('government-signup')}
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
      {view === 'government-signup' && (
        <SignupPage
          role="government"
          onBack={() => setView('landing')}
          onSignupSuccess={handleLoginSuccess}
          onSwitchToLogin={() => setView('government-login')}
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
      {view === 'government-dashboard' && (
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
