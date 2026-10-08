import { useState, useEffect } from 'react';

export function useScrollSpy(ids) {
  const [activeId, setActiveId] = useState('home');

  useEffect(() => {
    if (!ids || ids.length === 0) return;

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });

    return () => {
      spy.disconnect();
    };
  }, [ids]);

  return activeId;
}
