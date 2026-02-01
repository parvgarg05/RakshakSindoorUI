import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Language } from '@/lib/i18n';
import { settingsStore, userStore } from '@/lib/storage';

interface User {
  id: string;
  username: string;
  displayName?: string;
  role: 'government' | 'civilian';
  language: Language;
}

interface AppContextType {
  user: User | null;
  language: Language;
  isOffline: boolean;
  setUser: (user: User | null) => void;
  setLanguage: (lang: Language) => void;
  setIsOffline: (offline: boolean) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [language, setLanguageState] = useState<Language>('en');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const savedUser = await userStore.getItem<User>('currentUser');
      const savedLang = await settingsStore.getItem<Language>('language');
      
      if (savedUser) setUserState(savedUser);
      if (savedLang) setLanguageState(savedLang);
    };
    
    loadSettings();
  }, []);

  const setUser = async (user: User | null) => {
    setUserState(user);
    if (user) {
      await userStore.setItem('currentUser', user);
    } else {
      await userStore.removeItem('currentUser');
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await settingsStore.setItem('language', lang);
    if (user) {
      const updatedUser = { ...user, language: lang };
      setUser(updatedUser);
    }
  };

  const logout = async () => {
    await userStore.removeItem('currentUser');
    setUserState(null);
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      language, 
      isOffline, 
      setUser, 
      setLanguage, 
      setIsOffline,
      logout 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
