import { useEffect } from 'react';

export function useReveal() {
  useEffect(() => {
    const rev = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            rev.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => rev.observe(el));

    return () => {
      rev.disconnect();
    };
  }, []);
}
