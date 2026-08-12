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

export type ThemeMode = 'light' | 'dark';

interface AppContextType {
  user: User | null;
  language: Language;
  theme: ThemeMode;
  isOffline: boolean;
  setUser: (user: User | null) => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  setIsOffline: (offline: boolean) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const savedUser = await userStore.getItem<User>('currentUser');
      const savedLang = await settingsStore.getItem<Language>('language');
      const savedTheme = await settingsStore.getItem<ThemeMode>('theme');

      if (savedUser) setUserState(savedUser);
      if (savedLang) setLanguageState(savedLang);
      if (savedTheme) {
        setThemeState(savedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeState(prefersDark ? 'dark' : 'light');
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    settingsStore.setItem('theme', theme);
  }, [theme]);

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

  const setTheme = async (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    await settingsStore.setItem('theme', nextTheme);
  };

  const logout = async () => {
    await userStore.removeItem('currentUser');
    setUserState(null);
  };

  return (
    <AppContext.Provider value={{
      user,
      language,
      theme,
      isOffline,
      setUser,
      setLanguage,
      setTheme,
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
