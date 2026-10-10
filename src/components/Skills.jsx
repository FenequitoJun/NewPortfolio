import { useEffect, useRef } from 'react';
import BorderGlow from './BorderGlow';
import { SKILL_GROUPS } from '../data/site';

const SKILL_ICONS = {
  code: (
    <svg viewBox="0 0 24 24">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  database: (
    <svg viewBox="0 0 24 24">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  tool: (
    <svg viewBox="0 0 24 24">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

const NODES = [
  { n: 'HTML/CSS', x: 0.08, y: 0.32 },
  { n: 'JavaScript', x: 0.26, y: 0.58 },
  { n: 'React', x: 0.45, y: 0.34 },
  { n: 'Tailwind', x: 0.4, y: 0.76 },
  { n: 'MongoDB', x: 0.63, y: 0.62 },
  { n: 'Supabase', x: 0.78, y: 0.44 },
  { n: 'Firebase', x: 0.9, y: 0.66 },
  { n: 'Blynk', x: 0.88, y: 0.22 },
  { n: 'Git', x: 0.18, y: 0.2 },
  { n: 'GitHub', x: 0.32, y: 0.17 },
  { n: 'Vite', x: 0.62, y: 0.12 },
  { n: 'Vercel', x: 0.76, y: 0.08 },
  { n: 'Security', x: 0.58, y: 0.88 },
  { n: 'Networking', x: 0.75, y: 0.9 },
  { n: 'Kali Linux', x: 0.92, y: 0.92 },
].map((n, i) => ({ ...n, id: i, phase: i * 1.7 }));

const IDX = Object.fromEntries(NODES.map((n) => [n.n, n.id]));

const EDGES = [
  ['HTML/CSS', 'JavaScript'],
  ['JavaScript', 'React'],
  ['React', 'Tailwind'],
  ['React', 'Vite'],
  ['Vite', 'Vercel'],
  ['JavaScript', 'Git'],
  ['Git', 'GitHub'],
  ['MongoDB', 'Supabase'],
  ['MongoDB', 'Firebase'],
  ['Firebase', 'Blynk'],
  ['React', 'MongoDB'],
  ['Security', 'Networking'],
  ['Networking', 'Kali Linux'],
].map(([a, b]) => [IDX[a], IDX[b]]);

function SkillConstellation() {
  const canvasRef = useRef(null);
  const hintRef = useRef(null);
  const toastRef = useRef(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const wrap = cvs.parentElement;
    if (!wrap) return;
    const c = cvs.getContext('2d');
    if (!c) return;

    let W = 1,
      H = 1,
      dpr = 1,
      raf = 0,
      t = 0,
      lastTs = 0,
      hover = -1,
      inView = false;
    let srcSel = -1;
    let pdu = null;
    let flash = null;
    let toastTimer = null;
    let colors = { node: '#4cc9ff', line: '76,201,255', text: '#9aa3b5', hi: '#e8eaf0' };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function readTheme() {
      const light = document.body.classList.contains('light');
      colors = light
        ? { node: '#0077e6', line: '0,119,230', text: '#57617a', hi: '#0f1524' }
        : { node: '#4cc9ff', line: '76,201,255', text: '#9aa3b5', hi: '#e8eaf0' };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth;
      H = cvs.clientHeight || 340;
      cvs.width = Math.round(W * dpr);
      cvs.height = Math.round(H * dpr);
    }

    const pos = (n) => ({
      x: n.x * W + Math.sin(t * 0.6 + n.phase) * 5,
      y: n.y * H + Math.cos(t * 0.5 + n.phase * 1.3) * 5,
    });

    function findPath(from, to) {
      const adj = new Map();
      EDGES.forEach(([a, b]) => {
        if (!adj.has(a)) adj.set(a, []);
        if (!adj.has(b)) adj.set(b, []);
        adj.get(a).push(b);
        adj.get(b).push(a);
      });
      const q = [[from]];
      const seen = new Set([from]);
      while (q.length) {
        const path = q.shift();
        const end = path[path.length - 1];
        if (end === to) return path;
        for (const nb of adj.get(end) || []) {
          if (!seen.has(nb)) {
            seen.add(nb);
            q.push(path.concat(nb));
          }
        }
      }
      return null;
    }

    const hint = (txt) => {
      if (hintRef.current) hintRef.current.textContent = '// ' + txt;
    };

    function toast(type, title, meta) {
      if (!toastRef.current) return;
      toastRef.current.className = `pdu-toast ${type} show`;
      const strong = toastRef.current.querySelector('strong');
      const small = toastRef.current.querySelector('small');
      if (strong) strong.textContent = title;
      if (small) small.textContent = meta;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        if (toastRef.current) toastRef.current.classList.remove('show');
      }, 3400);
    }

    function pduPos() {
      const a = NODES[pdu.path[pdu.seg]],
        b = NODES[pdu.path[pdu.seg + 1]];
      const pa = pos(a),
        pb = pos(b);
      return {
        x: pa.x + (pb.x - pa.x) * pdu.t,
        y: pa.y + (pb.y - pa.y) * pdu.t,
        ang: Math.atan2(pb.y - pa.y, pb.x - pa.x),
      };
    }

    function updatePdu(dt) {
      if (!pdu) return;
      pdu.t += dt / 0.55;
      while (pdu.t >= 1) {
        pdu.t -= 1;
        pdu.seg++;
        if (pdu.seg >= pdu.path.length - 1) {
          flash = { id: pdu.path[pdu.path.length - 1], t: 0 };
          const names = pdu.path.map((i) => NODES[i].n);
          const hops = pdu.path.length - 1;
          toast(
            'ok',
            '✔ PDU successfully delivered',
            `From: ${names[0]} → To: ${names[names.length - 1]} · hops: ${hops} · sim time: ${(hops * 0.55).toFixed(2)}s`
          );
          pdu = null;
          hint('packet delivered — click two nodes to send another');
          return;
        }
      }
      const p = pduPos();
      pdu.trail.push({ x: p.x, y: p.y, life: 1 });
      pdu.trail.forEach((tr) => (tr.life -= dt * 2.4));
      pdu.trail = pdu.trail.filter((tr) => tr.life > 0);
    }

    function drawPacket(x, y, ang) {
      c.save();
      c.translate(x, y);
      c.rotate(ang);
      c.shadowColor = `rgba(${colors.line},.9)`;
      c.shadowBlur = 12;
      c.fillStyle = '#f4faff';
      c.strokeStyle = colors.node;
      c.lineWidth = 1.3;
      c.beginPath();
      c.rect(-8, -5.5, 16, 11);
      c.fill();
      c.stroke();
      c.shadowBlur = 0;
      c.beginPath();
      c.moveTo(-8, -5.5);
      c.lineTo(0, 2.5);
      c.lineTo(8, -5.5);
      c.stroke();
      c.restore();
    }

    function draw() {
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      const P = NODES.map(pos);

      EDGES.forEach(([a, b]) => {
        const lit = hover >= 0 && (hover === a || hover === b);
        const active =
          pdu &&
          ((pdu.path[pdu.seg] === a && pdu.path[pdu.seg + 1] === b) ||
            (pdu.path[pdu.seg] === b && pdu.path[pdu.seg + 1] === a));
        c.strokeStyle = active
          ? `rgba(${colors.line},.95)`
          : lit
          ? `rgba(${colors.line},.85)`
          : hover >= 0
          ? `rgba(${colors.line},.07)`
          : `rgba(${colors.line},.22)`;
        c.lineWidth = active || lit ? 1.8 : 1;
        c.beginPath();
        c.moveTo(P[a].x, P[a].y);
        c.lineTo(P[b].x, P[b].y);
        c.stroke();
      });

      if (pdu) {
        pdu.trail.forEach((tr) => {
          c.beginPath();
          c.arc(tr.x, tr.y, 2.4 * tr.life, 0, Math.PI * 2);
          c.fillStyle = `rgba(${colors.line},${tr.life * 0.5})`;
          c.fill();
        });
      }

      if (srcSel >= 0) {
        const p = P[srcSel];
        c.beginPath();
        c.arc(p.x, p.y, 11, 0, Math.PI * 2);
        c.setLineDash([4, 4]);
        c.lineDashOffset = -t * 20;
        c.strokeStyle = colors.node;
        c.lineWidth = 1.4;
        c.stroke();
        c.setLineDash([]);
      }

      NODES.forEach((n, i) => {
        const lit = hover === i;
        const linked =
          hover >= 0 && EDGES.some(([a, b]) => (a === hover && b === i) || (b === hover && a === i));
        const isSrc = srcSel === i;
        const dim = hover >= 0 && !lit && !linked;
        const r = lit || isSrc ? 7 : 5;
        c.beginPath();
        c.arc(P[i].x, P[i].y, r, 0, Math.PI * 2);
        c.fillStyle = dim ? `rgba(${colors.line},.25)` : colors.node;
        c.shadowColor = `rgba(${colors.line},.8)`;
        c.shadowBlur = lit || isSrc ? 16 : 6;
        c.fill();
        c.shadowBlur = 0;
        c.font = `${lit ? 600 : 400} 10px 'JetBrains Mono',monospace`;
        c.textAlign = 'center';
        c.fillStyle = lit ? colors.hi : dim ? `rgba(154,163,181,.35)` : colors.text;
        c.fillText(n.n, P[i].x, P[i].y + r + 14);
      });

      if (flash) {
        const p = P[flash.id];
        c.beginPath();
        c.arc(p.x, p.y, 8 + flash.t * 26, 0, Math.PI * 2);
        c.strokeStyle = `rgba(61,220,132,${(1 - flash.t) * 0.9})`;
        c.lineWidth = 2;
        c.stroke();
      }

      if (pdu) {
        const p = pduPos();
        drawPacket(p.x, p.y, p.ang);
      }
    }

    function loop(ts) {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      t += dt;
      if (flash) {
        flash.t += dt / 0.7;
        if (flash.t >= 1) flash = null;
      }
      updatePdu(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (!raf && inView && !reduced) {
        lastTs = 0;
        raf = requestAnimationFrame(loop);
      }
    }

    function stop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function wake() {
      start();
    }

    readTheme();
    resize();
    if (reduced) {
      t = 0;
      draw();
    }

    const onPointerMove = (e) => {
      const r = cvs.getBoundingClientRect();
      const mx = e.clientX - r.left,
        my = e.clientY - r.top;
      hover = -1;
      let best = 34;
      NODES.forEach((n, i) => {
        const p = pos(n);
        const d = Math.hypot(mx - p.x, my - p.y);
        if (d < best) {
          best = d;
          hover = i;
        }
      });
      cvs.style.cursor = hover >= 0 ? 'pointer' : 'default';
      if (!raf && reduced) draw();
    };

    const onPointerLeave = () => {
      hover = -1;
      if (!raf && reduced) draw();
    };

    const onClick = (e) => {
      const r = cvs.getBoundingClientRect();
      const mx = e.clientX - r.left,
        my = e.clientY - r.top;
      let idx = -1,
        best = 26;
      NODES.forEach((n, i) => {
        const p = pos(n);
        const d = Math.hypot(mx - p.x, my - p.y);
        if (d < best) {
          best = d;
          idx = i;
        }
      });

      if (idx < 0) {
        if (srcSel >= 0) {
          srcSel = -1;
          hint('selection cleared — click a node to pick a source');
        }
        if (!raf && reduced) draw();
        return;
      }
      if (pdu) {
        toast('err', 'Packet in transit', 'wait for the current PDU to be delivered');
        return;
      }

      if (srcSel < 0) {
        srcSel = idx;
        hint(`source: ${NODES[idx].n} — now click a destination node`);
        if (!raf && reduced) draw();
        return;
      }
      if (srcSel === idx) {
        srcSel = -1;
        hint('selection cleared — click a node to pick a source');
        if (!raf && reduced) draw();
        return;
      }

      const path = findPath(srcSel, idx);
      if (!path) {
        toast('err', '✖ Destination unreachable', `no route from ${NODES[srcSel].n} to ${NODES[idx].n}`);
        srcSel = -1;
        hint('unreachable — click a node to pick a new source');
        if (!raf && reduced) draw();
        return;
      }

      if (reduced) {
        const names = path.map((i) => NODES[i].n);
        const hops = path.length - 1;
        toast(
          'ok',
          '✔ PDU successfully delivered',
          `From: ${names[0]} → To: ${names[names.length - 1]} · hops: ${hops}`
        );
        srcSel = -1;
        hint('packet delivered — click two nodes to send another');
        draw();
        return;
      }

      pdu = { path, seg: 0, t: 0, trail: [] };
      srcSel = -1;
      hint('packet in transit…');
      wake();
    };

    cvs.addEventListener('pointermove', onPointerMove);
    cvs.addEventListener('pointerleave', onPointerLeave);
    cvs.addEventListener('click', onClick);

    const resizeObs = new ResizeObserver(() => {
      resize();
      if (!raf && reduced) draw();
    });
    resizeObs.observe(wrap);

    const intObs = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        inView ? start() : stop();
        if (!inView && reduced) draw();
      },
      { threshold: 0 }
    );
    intObs.observe(wrap);

    const mutObs = new MutationObserver(() => {
      readTheme();
      if (!raf && reduced) draw();
    });
    mutObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      stop();
      clearTimeout(toastTimer);
      resizeObs.disconnect();
      intObs.disconnect();
      mutObs.disconnect();
      cvs.removeEventListener('pointermove', onPointerMove);
      cvs.removeEventListener('pointerleave', onPointerLeave);
      cvs.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div className="card glass span-12 constellation reveal" id="constellation">
      <div className="const-head">
        <h3>Skill Constellation</h3>
        <p ref={hintRef}>// hover to explore · click two nodes to send a packet</p>
      </div>
      <canvas ref={canvasRef} id="skillCanvas"></canvas>
      <div ref={toastRef} className="pdu-toast" aria-live="polite">
        <span className="pt-icon"></span>
        <span className="pt-text">
          <strong></strong>
          <small></small>
        </span>
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills">
      <h2 className="sec-title">Technical Skills</h2>
      <p className="sec-sub">The technologies I use to bring ideas from concept to deployment.</p>

      <div className="bento">
        <SkillConstellation />
        {SKILL_GROUPS.map((group) => (
          <BorderGlow
            key={group.title}
            className={`card glass span-${group.span} reveal${group.accent ? ' accent' : ''}`}
          >
            <div className="icon">{SKILL_ICONS[group.icon]}</div>
            <h3>{group.title}</h3>
            <p>{group.desc}</p>
            <div className="skills-row">
              {group.skills.map((skill) => (
                <span key={skill} className="skill">
                  {skill}
                </span>
              ))}
            </div>
            {group.note && <div className="skill-note">{group.note}</div>}
          </BorderGlow>
        ))}
      </div>
    </section>
  );
}
