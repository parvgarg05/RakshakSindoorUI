import { useState, useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from '@/contexts/AppContext';
import LandingPage from '@/pages/landing';
import LoginPage from '@/pages/login';
import SoldierDashboard from '@/pages/soldier-dashboard';
import CivilianDashboard from '@/pages/civilian-dashboard';

type View = 'landing' | 'soldier-login' | 'civilian-login' | 'soldier-dashboard' | 'civilian-dashboard';

function AppContent() {
  const { user, logout } = useApp();
  const [view, setView] = useState<View>('landing');

  useEffect(() => {
    if (user) {
      if (user.role === 'soldier') {
        setView('soldier-dashboard');
      } else {
        setView('civilian-dashboard');
      }
    } else {
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
        />
      )}
      {view === 'civilian-login' && (
        <LoginPage
          role="civilian"
          onBack={() => setView('landing')}
          onLoginSuccess={handleLoginSuccess}
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
