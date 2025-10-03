import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import { useApp } from '@/contexts/AppContext';
import { userStore } from '@/lib/storage';

interface LoginPageProps {
  role: 'soldier' | 'civilian';
  onBack: () => void;
  onLoginSuccess: () => void;
}

export default function LoginPage({ role, onBack, onLoginSuccess }: LoginPageProps) {
  const { language, setUser } = useApp();

  const handleLogin = async (username: string, password: string, rememberMe: boolean) => {
    const mockUsers: Record<string, { password: string; role: 'soldier' | 'civilian' }> = {
      'soldier1': { password: 'pass123', role: 'soldier' },
      'civilian1': { password: 'pass123', role: 'civilian' },
      'demo': { password: 'demo', role: role },
    };

    const mockUser = mockUsers[username];
    
    if (mockUser && mockUser.password === password && mockUser.role === role) {
      const user = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        role: mockUser.role,
        language,
      };

      await setUser(user);
      
      if (rememberMe) {
        await userStore.setItem(`rememberMe_${username}`, user);
      }
      
      onLoginSuccess();
    } else {
      alert('Invalid credentials. Try: demo/demo');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <LoginForm
        role={role}
        language={language}
        onLogin={handleLogin}
        onBack={onBack}
      />
    </div>
  );
}
