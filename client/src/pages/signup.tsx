import { useState } from 'react';
import SignupForm from '@/components/SignupForm';
import { useApp } from '@/contexts/AppContext';
import { userStore } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface SignupPageProps {
  role: 'government' | 'civilian';
  onBack: () => void;
  onSignupSuccess: () => void;
  onSwitchToLogin: () => void;
}

interface StoredUserData {
  username: string;
  password: string;
  displayName: string;
  role: 'government' | 'civilian';
}

export default function SignupPage({ role, onBack, onSignupSuccess, onSwitchToLogin }: SignupPageProps) {
  const { language, setUser } = useApp();
  const { toast } = useToast();

  const handleSignup = async (username: string, password: string, displayName: string, rememberMe: boolean) => {
    const existingUsers = await userStore.getItem<StoredUserData[]>('allUsers') || [];
    
    const userExists = existingUsers.some(u => u.username === username && u.role === role);
    if (userExists) {
      toast({
        title: 'Username Taken',
        description: 'This username is already registered. Please choose a different one.',
        variant: 'destructive',
      });
      return;
    }

    const newStoredUser: StoredUserData = {
      username,
      password,
      displayName,
      role,
    };

    const updatedUsers = [...existingUsers, newStoredUser];
    await userStore.setItem('allUsers', updatedUsers);

    const user = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      displayName,
      role,
      language,
    };

    await setUser(user);

    if (rememberMe) {
      await userStore.setItem(`rememberMe_${username}`, user);
    }

    toast({
      title: 'Account Created!',
      description: `Welcome to Rakshak Sindoor, ${displayName}!`,
    });

    onSignupSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <SignupForm
        role={role}
        language={language}
        onSignup={handleSignup}
        onBack={onBack}
        onSwitchToLogin={onSwitchToLogin}
      />
    </div>
  );
}
