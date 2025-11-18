import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { userAPI } from '@/lib/api';
import { allThemes, getThemeById, ThemeOption } from '@/lib/themes';

type Theme = string; // Theme ID from themes.ts

export function useTheme() {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'default';
    }
    return 'default';
  });

  // Apply theme to document
  const applyTheme = (themeId: Theme) => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    allThemes.forEach(t => root.classList.remove(t.id));
    
    // Handle system theme preference
    const themeToApply = themeId === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default'
      : themeId;
    
    // Add the theme class
    root.classList.add(themeToApply);
    
    // Apply CSS variables
    const selectedTheme = getThemeById(themeToApply);
    if (selectedTheme) {
      // Apply gradient background if it's a gradient theme
      if (selectedTheme.type === 'gradient') {
        root.style.setProperty('--gradient-background', selectedTheme.theme.preview.background);
      }
      
      // Apply all theme variables
      Object.entries(selectedTheme.theme.variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  };

  // Load theme from API on auth change
  useEffect(() => {
    const loadUserTheme = async () => {
      if (user) {
        try {
          const userData = await userAPI.getById(user.id);
          if (userData?.settings?.theme) {
            setThemeState(userData.settings.theme);
            applyTheme(userData.settings.theme);
          }
        } catch (error) {
          console.error('Failed to load theme:', error);
        }
      }
    };
    loadUserTheme();
  }, [user]);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);

    if (user) {
      try {
        await userAPI.update(user.id, {
          settings: {
            ...user.settings,
            theme: newTheme
          }
        });
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    }
  };

  return { theme, setTheme };
}