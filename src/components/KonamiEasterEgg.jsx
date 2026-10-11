import { useEffect, useRef } from 'react';

export default function KonamiEasterEgg() {
  const rainCanvasRef = useRef(null);
  const animIdRef = useRef(0);

  useEffect(() => {
    // Optionally clean the old persistent keys once:
    try {
      localStorage.removeItem('jun_snake_unlocked');
      localStorage.removeItem('jun_duel_unlocked');
    } catch (e) {}

    const SEQ = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    let pos = 0;

    const unlockEggs = () => {
      try {
        localStorage.removeItem('jun_snake_unlocked');
        localStorage.removeItem('jun_duel_unlocked');
      } catch (e) {}

      // Session-only: resets on refresh
      window.junEggsUnlocked = true;
      window.dispatchEvent(new CustomEvent('jun:unlock-eggs'));

      const trigger = document.getElementById('termTrigger');
      const terminal = document.getElementById('terminal');
      if (terminal && !terminal.classList.contains('open') && trigger) {
        trigger.click();
      }

      setTimeout(() => {
        const body = document.getElementById('termBody');
        if (!body) return;
        if (!body.textContent.includes('hidden commands unlocked')) {
          const d = document.createElement('div');
          d.className = 't-ok';
          d.textContent = '🔓 hidden commands unlocked: snake 🐍 · duel 🎯 — type "help"';
          body.appendChild(d);
          body.scrollTop = body.scrollHeight;
        }
      }, 400);
    };

    const runMatrix = () => {
      unlockEggs();

      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
        animIdRef.current = 0;
      }

      if (rainCanvasRef.current) {
        rainCanvasRef.current.remove();
        rainCanvasRef.current = null;
      }

      const mc = document.createElement('canvas');
      mc.className = 'matrix-rain show';
      document.body.appendChild(mc);
      rainCanvasRef.current = mc;

      const g = mc.getContext('2d');
      if (!g) return;

      // Fixed DPR of 1 (never devicePixelRatio) — temporary 8s overlay
      const w = window.innerWidth;
      const h = window.innerHeight;
      mc.width = w;
      mc.height = h;
      mc.style.width = `${w}px`;
      mc.style.height = `${h}px`;

      const fs = 16;
      const cols = Math.ceil(w / fs);
      const drops = Array(cols).fill(0).map(() => Math.random() * -50);
      const chars = '0101010101アイウエオカキクケコ';
      let elapsed = 0;
      let lastT = performance.now();
      let frameIdx = 0;

      const frame = (now) => {
        const dt = Math.min(50, now - lastT);
        lastT = now;
        elapsed += dt;

        // Reduce trail fill alpha rect to every other frame for performance
        frameIdx++;
        if (frameIdx % 2 === 0) {
          g.fillStyle = 'rgba(4,6,10,0.16)';
          g.fillRect(0, 0, w, h);
        }

        g.font = '15px monospace';

        for (let i = 0; i < cols; i++) {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          g.fillStyle = Math.random() < 0.08 ? '#e8eaf0' : '#3ddc84';
          g.fillText(ch, i * fs, drops[i] * fs);
          if (drops[i] * fs > h && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }

        if (elapsed < 8000) {
          animIdRef.current = requestAnimationFrame(frame);
        } else {
          mc.style.opacity = '0';
          setTimeout(() => {
            mc.remove();
            if (rainCanvasRef.current === mc) {
              rainCanvasRef.current = null;
            }
          }, 450);
        }
      };

      animIdRef.current = requestAnimationFrame(frame);
    };

    const handleKeyDown = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (document.getElementById('snakeBackdrop')?.classList.contains('open')) return;
      if (document.getElementById('duelBackdrop')?.classList.contains('open')) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === SEQ[pos]) {
        if (e.key.startsWith('Arrow') && pos > 0) e.preventDefault();
        pos++;
        if (pos === SEQ.length) {
          pos = 0;
          runMatrix();
        }
      } else {
        pos = key === SEQ[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('jun:konami', runMatrix);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('jun:konami', runMatrix);
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
        animIdRef.current = 0;
      }
      if (rainCanvasRef.current) {
        rainCanvasRef.current.remove();
        rainCanvasRef.current = null;
      }
    };
  }, []);

  return null;
}
