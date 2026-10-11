import { useState, useEffect, useRef } from 'react';

const W = 560;
const H = 320;
const DUR = 30;

export default function ReflexDuel() {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState('30.0');
  const [best, setBest] = useState(() => {
    try {
      return +(localStorage.getItem('jun_duel_best') || 0);
    } catch {
      return 0;
    }
  });

  const canvasRef = useRef(null);
  const gameRef = useRef({
    running: false,
    ended: false,
    elapsed: 0,
    spawnT: 0,
    score: 0,
    combo: 1,
    hits: 0,
    misses: 0,
    reds: 0,
    targets: [],
    parts: [],
    shake: 0,
    raf: null,
    lastT: 0,
  });

  const isLight = () => document.body.classList.contains('light');

  const getColors = () =>
    isLight()
      ? {
          blue: '#0077e6',
          red: '#d13438',
          grid: 'rgba(15,21,36,.06)',
          text: '#57617a',
          hi: '#0f1524',
          bg: 'rgba(242,245,251,.9)',
        }
      : {
          blue: '#4cc9ff',
          red: '#ff5f57',
          grid: 'rgba(255,255,255,.04)',
          text: '#9aa3b5',
          hi: '#e8eaf0',
          bg: 'rgba(0,0,0,.45)',
        };

  const getRank = (s) => {
    if (s >= 3500) return ['FIBER OPTIC ⚡', 'server-grade reflexes'];
    if (s >= 2200) return ['CABLE 🟦', 'solid connection'];
    if (s >= 1200) return ['DSL 📶', 'getting there…'];
    return ['DIAL-UP 🐌', 'the 90s miss you'];
  };

  const spawn = () => {
    const g = gameRef.current;
    const m = 46;
    const type = Math.random() < 0.72 ? 'blue' : 'red';
    const r = type === 'blue' ? 16 : 15;
    g.targets.push({
      x: m + Math.random() * (W - m * 2),
      y: m + Math.random() * (H - m * 2),
      r,
      type,
      age: 0,
      ttl: Math.max(650, 1250 - g.elapsed * 20),
      seed: Math.random() * Math.PI * 2,
    });
  };

  const burst = (x, y, col) => {
    const g = gameRef.current;
    const count = typeof window !== 'undefined' && window.innerWidth < 640 ? 6 : 12;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 160;
      g.parts.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 1,
        col,
      });
    }
  };

  const syncHud = () => {
    const g = gameRef.current;
    setScore(g.score);
    setCombo(g.combo);
    setTimeLeft(Math.max(0, DUR - g.elapsed).toFixed(1));
  };

  const draw = () => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const g = gameRef.current;
    const C = getColors();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (g.shake > 0) {
      ctx.translate((Math.random() - 0.5) * g.shake * 12, (Math.random() - 0.5) * g.shake * 12);
    }

    ctx.fillStyle = C.bg;
    ctx.fillRect(-20, -20, W + 40, H + 40);

    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    for (let i = 1; i < 14; i++) {
      ctx.beginPath();
      ctx.moveTo(i * (W / 14), 0);
      ctx.lineTo(i * (W / 14), H);
      ctx.stroke();
    }
    for (let j = 1; j < 8; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * (H / 8));
      ctx.lineTo(W, j * (H / 8));
      ctx.stroke();
    }

    for (const tg of g.targets) {
      const frac = 1 - tg.age / tg.ttl;
      const pulse = 1 + Math.sin(tg.seed + tg.age * 10) * 0.06;

      if (tg.type === 'blue') {
        ctx.shadowColor = C.blue;
        ctx.shadowBlur = 14;
        ctx.fillStyle = C.blue;
        ctx.beginPath();
        ctx.arc(tg.x, tg.y, tg.r * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = isLight() ? '#f2f5fb' : '#0a0d14';
        ctx.fillRect(tg.x - 5, tg.y - 3, 10, 6);

        ctx.strokeStyle = C.blue;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(tg.x, tg.y, tg.r + 7 * frac + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
        ctx.stroke();
      } else {
        ctx.shadowColor = C.red;
        ctx.shadowBlur = 12;
        ctx.fillStyle = C.red;
        ctx.beginPath();
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2 + tg.seed;
          const rr = tg.r * (k % 2 === 0 ? 1 : 0.72) * pulse;
          const px = tg.x + Math.cos(a) * rr;
          const py = tg.y + Math.sin(a) * rr;
          k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = isLight() ? '#f2f5fb' : '#0a0d14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tg.x - 5, tg.y - 5);
        ctx.lineTo(tg.x + 5, tg.y + 5);
        ctx.moveTo(tg.x + 5, tg.y - 5);
        ctx.lineTo(tg.x - 5, tg.y + 5);
        ctx.stroke();
      }
    }

    for (const p of g.parts) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.col;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;

    if (g.ended) {
      ctx.fillStyle = 'rgba(4,6,10,.72)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      const [rTitle, rSub] = getRank(g.score);

      ctx.fillStyle = isLight() ? '#0f1524' : '#e8eaf0';
      ctx.font = "700 26px 'Space Grotesk',sans-serif";
      ctx.fillText(rTitle, W / 2, H / 2 - 34);

      ctx.fillStyle = C.blue;
      ctx.font = "600 16px 'JetBrains Mono',monospace";
      ctx.fillText('SCORE ' + g.score, W / 2, H / 2 - 4);

      ctx.fillStyle = C.text;
      ctx.font = "12px 'JetBrains Mono',monospace";
      const total = g.hits + g.misses + g.reds;
      const acc = total > 0 ? Math.round((g.hits / total) * 100) : 0;
      ctx.fillText(`${rSub} · accuracy ${acc}%`, W / 2, H / 2 + 20);

      const curBest = +(localStorage.getItem('jun_duel_best') || 0);
      ctx.fillText('best: ' + curBest, W / 2, H / 2 + 40);

      ctx.fillStyle = '#3ddc84';
      ctx.fillText('click to duel again', W / 2, H / 2 + 66);
    }
  };

  const loop = (now) => {
    const g = gameRef.current;
    g.raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - g.lastT) / 1000);
    g.lastT = now;

    if (!g.running) {
      if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 1.6);
      g.parts.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 2.2;
      });
      g.parts = g.parts.filter((p) => p.life > 0);
      draw();
      return;
    }

    g.elapsed += dt;
    syncHud();
    g.spawnT += dt;

    const interval = Math.max(0.42, 0.85 - g.elapsed * 0.012);
    if (g.spawnT >= interval) {
      g.spawnT = 0;
      spawn();
    }

    const before = g.targets.length;
    g.targets = g.targets.filter((tg) => {
      tg.age += dt;
      if (tg.age >= tg.ttl) {
        if (tg.type === 'blue') {
          g.combo = 1;
          g.misses++;
          g.shake = Math.max(g.shake, 0.3);
        }
        return false;
      }
      return true;
    });

    if (g.targets.length < before && !g.ended) {
      syncHud();
    }

    g.parts.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 2.2;
    });
    g.parts = g.parts.filter((p) => p.life > 0);

    if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 1.6);

    if (g.elapsed >= DUR && !g.ended) {
      g.running = false;
      g.ended = true;
      setBest((prevBest) => {
        const nextBest = Math.max(prevBest, g.score);
        try {
          localStorage.setItem('jun_duel_best', nextBest);
        } catch {}
        return nextBest;
      });
    }

    draw();
  };

  const resetGame = () => {
    const g = gameRef.current;
    g.elapsed = 0;
    g.spawnT = 0;
    g.score = 0;
    g.combo = 1;
    g.hits = 0;
    g.misses = 0;
    g.reds = 0;
    g.targets = [];
    g.parts = [];
    g.shake = 0;
    g.running = true;
    g.ended = false;
    syncHud();
  };

  const startGame = () => {
    resetGame();
  };

  const openGame = () => {
    setOpen(true);
    const cvs = canvasRef.current;
    if (cvs) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = Math.round(W * dpr);
      cvs.height = Math.round(H * dpr);
    }
    startGame();
    const g = gameRef.current;
    if (!g.raf) {
      g.lastT = performance.now();
      g.raf = requestAnimationFrame(loop);
    }
  };

  const closeGame = () => {
    setOpen(false);
    const g = gameRef.current;
    if (g.raf) {
      cancelAnimationFrame(g.raf);
      g.raf = null;
    }
  };

  const handlePointerDown = (e) => {
    const g = gameRef.current;
    if (g.ended) {
      startGame();
      return;
    }
    if (!g.running) return;

    const cvs = canvasRef.current;
    if (!cvs) return;
    const r = cvs.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (W / r.width);
    const my = (e.clientY - r.top) * (H / r.height);

    let hit = null;
    let bd = Infinity;
    for (const tg of g.targets) {
      const d = Math.hypot(mx - tg.x, my - tg.y);
      if (d < tg.r + 8 && d < bd) {
        bd = d;
        hit = tg;
      }
    }

    if (!hit) return;
    const C = getColors();

    if (hit.type === 'blue') {
      g.score += 100 * g.combo;
      g.hits++;
      g.combo = Math.min(5, g.combo + 1);
      burst(hit.x, hit.y, C.blue);
    } else {
      g.score = Math.max(0, g.score - 150);
      g.reds++;
      g.combo = 1;
      g.shake = 1;
      burst(hit.x, hit.y, C.red);
    }

    g.targets = g.targets.filter((t) => t !== hit);
    syncHud();
  };

  useEffect(() => {
    window.addEventListener('jun:launch-duel', openGame);
    return () => {
      window.removeEventListener('jun:launch-duel', openGame);
      const g = gameRef.current;
      if (g.raf) {
        cancelAnimationFrame(g.raf);
        g.raf = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      const g = gameRef.current;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeGame();
      } else if (e.key === 'Enter' && g.ended) {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <div
      className={`snake-backdrop ${open ? 'open' : ''}`}
      id="duelBackdrop"
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target.id === 'duelBackdrop') closeGame();
      }}
    >
      <div className="snake-panel glass" role="dialog" aria-modal="true" aria-label="Reflex Duel game">
        <div className="snake-head">
          <h3>REFLEX DUEL · BEAT THE SERVER</h3>
          <button className="cs-close" id="duelClose" aria-label="Close game" onClick={closeGame}>
            ✕
          </button>
        </div>
        <div className="snake-score">
          <span>
            score: <b id="duelScore" style={{ color: 'var(--a1)' }}>{score}</b>
          </span>
          <span>
            combo:{' '}
            <b
              id="duelCombo"
              style={{
                color: combo >= 3 ? '#3ddc84' : combo >= 2 ? 'var(--a1)' : 'var(--muted)',
              }}
            >
              x{combo}
            </b>
          </span>
          <span>
            time: <b id="duelTime" style={{ color: 'var(--a1)' }}>{timeLeft}s</b>
          </span>
        </div>
        <div className="snake-stage">
          <canvas
            ref={canvasRef}
            id="duelCanvas"
            className="wide"
            width="560"
            height="320"
            onPointerDown={handlePointerDown}
          ></canvas>
        </div>
        <div className="snake-foot">🟦 click packets before they vanish · 🔴 avoid malware · combo up to x5</div>
      </div>
    </div>
  );
}
