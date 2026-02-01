import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import { useApp } from '@/contexts/AppContext';
import { userStore } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface LoginPageProps {
  role: 'government' | 'civilian';
  onBack: () => void;
  onLoginSuccess: () => void;
  onSwitchToSignup?: () => void;
}

interface StoredUserData {
  username: string;
  password: string;
  displayName: string;
  role: 'government' | 'civilian';
}

export default function LoginPage({ role, onBack, onLoginSuccess, onSwitchToSignup }: LoginPageProps) {
  const { language, setUser } = useApp();
  const { toast } = useToast();

  const handleLogin = async (username: string, password: string, rememberMe: boolean) => {
    const allUsers = await userStore.getItem<StoredUserData[]>('allUsers') || [];
    
    const storedUser = allUsers.find(
      u => u.username === username && u.password === password && u.role === role
    );
    
    if (storedUser) {
      const user = {
        id: Math.random().toString(36).substr(2, 9),
        username: storedUser.username,
        displayName: storedUser.displayName,
        role: storedUser.role,
        language,
      };

      await setUser(user);
      
      if (rememberMe) {
        await userStore.setItem(`rememberMe_${username}`, user);
      }
      
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${storedUser.displayName}`,
      });
      
      onLoginSuccess();
      return;
    }

    const mockUsers: Record<string, { password: string; role: 'government' | 'civilian'; displayName: string }> = {
      'government1': { password: 'pass123', role: 'government', displayName: 'Demo Government' },
      'civilian1': { password: 'pass123', role: 'civilian', displayName: 'Demo Civilian' },
      'demo': { password: 'demo', role: role, displayName: 'Demo User' },
    };

    const mockUser = mockUsers[username];
    
    if (mockUser && mockUser.password === password && mockUser.role === role) {
      const user = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        displayName: mockUser.displayName,
        role: mockUser.role,
        language,
      };

      await setUser(user);
      
      if (rememberMe) {
        await userStore.setItem(`rememberMe_${username}`, user);
      }
      
      toast({
        title: 'Welcome!',
        description: `Logged in as ${mockUser.displayName}`,
      });
      
      onLoginSuccess();
    } else {
      toast({
        title: 'Invalid Credentials',
        description: 'Please check your username and password. Demo accounts: demo/demo',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <LoginForm
        role={role}
        language={language}
        onLogin={handleLogin}
        onBack={onBack}
        onSwitchToSignup={onSwitchToSignup}
      />
    </div>
  );
}
