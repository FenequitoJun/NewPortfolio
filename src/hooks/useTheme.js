import { useState, useEffect } from 'react';

export function useTheme() {
  const [light, setLight] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'light';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.body.classList.toggle('light', light);
    try {
      localStorage.setItem('theme', light ? 'light' : 'dark');
    } catch {}
  }, [light]);

  const toggle = () => setLight((prev) => !prev);

  return [light, toggle];
}
