import { useState, useEffect } from 'react';
import { ROLES } from '../data/site';

export function useTypewriter(roles = ROLES) {
  const [text, setText] = useState('');

  useEffect(() => {
    let ri = 0;
    let ci = 0;
    let deleting = false;
    let timerId = null;

    function type() {
      const word = roles[ri];
      setText(word.slice(0, ci));
      if (!deleting) {
        if (ci < word.length) {
          ci++;
          timerId = setTimeout(type, 70);
        } else {
          deleting = true;
          timerId = setTimeout(type, 1700);
        }
      } else {
        if (ci > 0) {
          ci--;
          timerId = setTimeout(type, 38);
        } else {
          deleting = false;
          ri = (ri + 1) % roles.length;
          timerId = setTimeout(type, 350);
        }
      }
    }

    type();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [roles]);

  return text;
}
