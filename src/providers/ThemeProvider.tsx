import { createContext, useContext, useEffect, useState } from 'react';
import { ThemePref, DensityPref } from '@/types';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';

interface ThemeContextType {
  theme: ThemePref;
  setTheme: (theme: ThemePref) => void;
  density: DensityPref;
  setDensity: (density: DensityPref) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => null,
  density: 'comfortable',
  setDensity: () => null,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { appUser } = useAuth();
  
  const [theme, setThemeState] = useState<ThemePref>(
    () => (localStorage.getItem('vite-ui-theme') as ThemePref) || 'system'
  );
  
  const [density, setDensityState] = useState<DensityPref>(
    () => (localStorage.getItem('vite-ui-density') as DensityPref) || 'comfortable'
  );

  useEffect(() => {
    if (appUser) {
      setThemeState(appUser.theme_pref);
      setDensityState(appUser.density_pref);
      localStorage.setItem('vite-ui-theme', appUser.theme_pref);
      localStorage.setItem('vite-ui-density', appUser.density_pref);
    }
  }, [appUser]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const setTheme = async (newTheme: ThemePref) => {
    setThemeState(newTheme);
    localStorage.setItem('vite-ui-theme', newTheme);
    if (appUser) {
      await supabase.from('app_users').update({ theme_pref: newTheme }).eq('id', appUser.id);
    }
  };

  const setDensity = async (newDensity: DensityPref) => {
    setDensityState(newDensity);
    localStorage.setItem('vite-ui-density', newDensity);
    if (appUser) {
      await supabase.from('app_users').update({ density_pref: newDensity }).eq('id', appUser.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, density, setDensity }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
