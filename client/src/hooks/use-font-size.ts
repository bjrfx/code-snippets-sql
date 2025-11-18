import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { userAPI } from '@/lib/api';

export function useFontSize() {
  const { user } = useAuth();
  const [fontSize, setFontSizeState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('fontSize') || '14', 10);
    }
    return 14;
  });

  // Apply font size to document
  const applyFontSize = (size: number) => {
    const root = window.document.documentElement;
    root.style.setProperty('--font-size', `${size}px`);
  };

  // Load font size from API on auth change
  useEffect(() => {
    const loadUserFontSize = async () => {
      if (user) {
        try {
          const userData = await userAPI.getById(user.id);
          if (userData?.settings?.fontSize) {
            setFontSizeState(userData.settings.fontSize);
            applyFontSize(userData.settings.fontSize);
          }
        } catch (error) {
          console.error('Failed to load font size:', error);
        }
      }
    };
    loadUserFontSize();
  }, [user]);

  // Apply font size whenever it changes
  useEffect(() => {
    applyFontSize(fontSize);
  }, [fontSize]);

  const setFontSize = async (newFontSize: number) => {
    setFontSizeState(newFontSize);
    localStorage.setItem('fontSize', newFontSize.toString());
    applyFontSize(newFontSize);

    if (user) {
      try {
        await userAPI.update(user.id, {
          settings: {
            ...user.settings,
            fontSize: newFontSize
          }
        });
      } catch (error) {
        console.error('Failed to save font size:', error);
      }
    }
  };

  return { fontSize, setFontSize };
}