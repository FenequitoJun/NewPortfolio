import { useEffect, useRef } from 'react';

export default function TechText({
  theme,
  text = 'Jun Fenequito',
  fontFamily = '',
  fontWeight = 600,
  fontSize = 150,
  letterSpacing = -0.05,
  reach = 200,
  softness = 0.7,
  dashLength = 4,
  dashGap = 2,
  strokeWidth = 1.5,
  lineStyle = 'dashed',
  reveal = 'letter',
  specks = 15,
  selection = true,
  labels = true,
  draggable = true,
  sweep = true,
  speed = 1,
  className = '',
  ...rest
}) {
  const containerRef = useRef(null);
  const baseCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);

  const wakeRef = useRef(null);
  const settingsRef = useRef(null);
  const clearLayoutRef = useRef(null);

  const isLight = theme === 'light' || (typeof theme === 'boolean' && theme);

  // Sync prop changes into settingsRef without restarting the engine
  if (settingsRef.current) {
    settingsRef.current.text = text;
    settingsRef.current.fontFamily = fontFamily;
    settingsRef.current.fontWeight = fontWeight;
    settingsRef.current.fontSize = fontSize;
    settingsRef.current.letterSpacing = letterSpacing;
    settingsRef.current.reach = reach;
    settingsRef.current.softness = softness;
    settingsRef.current.dashLength = dashLength;
    settingsRef.current.dashGap = dashGap;
    settingsRef.current.strokeWidth = strokeWidth;
    settingsRef.current.lineStyle = lineStyle;
    settingsRef.current.reveal = reveal;
    settingsRef.current.specks = specks;
    settingsRef.current.selection = selection;
    settingsRef.current.labels = labels;
    settingsRef.current.draggable = draggable;
    settingsRef.current.sweep = sweep;
    settingsRef.current.speed = speed;
  }

  // Sync theme changes with settings
  useEffect(() => {
    if (settingsRef.current) {
      settingsRef.current.color = isLight ? '#0f1524' : '#ffffff';
      settingsRef.current.accentColor = isLight ? '#0077e6' : '#4cc9ff';
      if (clearLayoutRef.current) clearLayoutRef.current();
      if (wakeRef.current) wakeRef.current();
    }
  }, [isLight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ---- base canvas: in-flow, exactly as the original ---- */
    const canvas = document.createElement('canvas');
    baseCanvasRef.current = canvas;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    /* ---- overlay canvas: appended to <body> (NOT container) so
       position:fixed is true viewport-fixed even though an ancestor
       (.reveal) carries a transform ---- */
    const overlay = document.createElement('canvas');
    overlayCanvasRef.current = overlay;
    Object.assign(overlay.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '30',
    });
    document.body.appendChild(overlay);
    const octx = overlay.getContext('2d');

    const scratch = document.createElement('canvas');
    const scratchCtx = scratch.getContext('2d');
    if (!ctx || !octx || !scratchCtx) return;

    const LABEL_FONT = '10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    const FALLOFF_STEPS = 8;
    const SPRING = 320;
    const DAMPING = 22;

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const approach = (cur, target, dt, secs) => cur + (target - cur) * (1 - Math.exp(-dt / secs));

    const hexToRgb = (hex) => {
      let h = String(hex || '').replace('#', '');
      if (h.length === 3) h = h.replace(/./g, (c) => c + c);
      const n = parseInt(h.slice(0, 6), 16);
      return Number.isNaN(n) ? [255, 255, 255] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const rgba = (hex, a) => {
      const [r, g, b] = hexToRgb(hex);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };
    const noise = (...values) => {
      let h = 2166136261;
      for (const v of values) {
        h = Math.imul(h ^ (v | 0), 16777619);
        h ^= h >>> 13;
        h = Math.imul(h, 0x5bd1e995);
        h ^= h >>> 15;
      }
      return (h >>> 0) / 4294967296;
    };
    const signed = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0');

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const startLight = isLight || document.body.classList.contains('light');

    const S = {
      text,
      fontFamily,
      fontWeight,
      fontSize,
      letterSpacing,
      color: startLight ? '#0f1524' : '#ffffff',
      accentColor: startLight ? '#0077e6' : '#4cc9ff',
      reach,
      softness,
      dashLength,
      dashGap,
      strokeWidth,
      lineStyle,
      reveal,
      specks,
      selection,
      labels,
      draggable,
      sweep,
      speed,
    };
    settingsRef.current = S;

    /* width/height = the visual box (base canvas) — layout untouched */
    let width = 1,
      height = 1,
      dpr = 1,
      raf = 0,
      last = performance.now();
    /* anchor = viewport position of the base canvas top-left, read every frame */
    let anchorX = 0,
      anchorY = 0;
    let containerVisible = true,
      alive = true,
      layoutKey = '',
      requestedFont = '';
    let word = null,
      glyphs = [],
      presence = 0,
      clock = 0,
      pulse = 0,
      placed = false,
      dragging = -1,
      dragMoved = false;
    const pointer = { cx: 0, cy: 0, x: 0, y: 0, inside: false },
      grab = { x: 0, y: 0 },
      lens = { x: 0, y: 0 };
    const dragStart = { x: 0, y: 0 };
    const frame = { x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0, index: -1 };

    const updateAnchor = () => {
      const r = canvas.getBoundingClientRect(); /* viewport-correct even inside transforms */
      anchorX = r.left;
      anchorY = r.top;
    };

    clearLayoutRef.current = () => {
      layoutKey = '';
    };

    function refreshFonts() {
      layoutKey = '';
      wake();
    }

    const family = (s) => s.fontFamily || getComputedStyle(container).fontFamily || 'sans-serif';
    const fontFor = (s, size) => `${s.fontWeight} ${size}px ${family(s)}`;
    const setFont = (t, s, size) => {
      t.font = fontFor(s, size);
      if ('letterSpacing' in t) t.letterSpacing = `${s.letterSpacing * size}px`;
      t.textAlign = 'left';
      t.textBaseline = 'alphabetic';
    };

    const sprite = (s, view, glyph, stroke) => {
      const pad = Math.ceil(s.strokeWidth * 2 + 4);
      const left = glyph.box.x1 - pad;
      const top = glyph.box.y1 - pad;
      const w = glyph.box.x2 - glyph.box.x1 + pad * 2;
      const h = glyph.box.y2 - glyph.box.y1 + pad * 2;
      const image = document.createElement('canvas');
      image.width = Math.max(1, Math.ceil(w * dpr));
      image.height = Math.max(1, Math.ceil(h * dpr));
      const c = image.getContext('2d');
      if (!c) return { image, left, top };
      c.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
      setFont(c, s, view.size);
      if (stroke) {
        c.lineJoin = 'round';
        c.lineWidth = s.strokeWidth * 2;
        c.lineCap = 'butt';
        c.strokeStyle = s.color;
        if (s.lineStyle !== 'solid') c.setLineDash([Math.max(1, s.dashLength), Math.max(1, s.dashGap)]);
        c.strokeText(glyph.char, glyph.x, view.baseline);
        c.setLineDash([]);
        c.globalCompositeOperation = 'destination-out';
        c.fillStyle = '#000000';
        c.fillText(glyph.char, glyph.x, view.baseline);
        c.globalCompositeOperation = 'source-over';
      } else {
        c.fillStyle = s.color;
        c.fillText(glyph.char, glyph.x, view.baseline);
      }
      return { image, left, top };
    };

    const ensureLayout = (s) => {
      const key = [
        s.text,
        family(s),
        s.fontWeight,
        s.fontSize,
        s.letterSpacing,
        s.color,
        s.dashLength,
        s.dashGap,
        s.strokeWidth,
        s.lineStyle,
        width,
        height,
        dpr,
      ].join('|');
      if (key === layoutKey && word) return word;
      layoutKey = key;
      const wanted = fontFor(s, 64);
      if (document.fonts && wanted !== requestedFont) {
        requestedFont = wanted;
        document.fonts.load(wanted, s.text).then(refreshFonts, refreshFonts);
      }
      const probe = scratchCtx;
      setFont(probe, s, s.fontSize);
      let m = probe.measureText(s.text);
      const fit = Math.min(
        1,
        (width * 0.9) / Math.max(m.actualBoundingBoxLeft + m.actualBoundingBoxRight, 1),
        (height * 0.66) / Math.max(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, 1)
      );
      const size = s.fontSize * fit;
      setFont(probe, s, size);
      m = probe.measureText(s.text);
      const inkWidth = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const inkHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const x = (width - inkWidth) / 2 + m.actualBoundingBoxLeft;
      const baseline = (height - inkHeight) / 2 + m.actualBoundingBoxAscent;
      const next = {
        size,
        baseline,
        left: x - m.actualBoundingBoxLeft,
        right: x + m.actualBoundingBoxRight,
        top: baseline - m.actualBoundingBoxAscent,
        bottom: baseline + m.actualBoundingBoxDescent,
      };
      word = next;

      const chars = Array.from(s.text);
      const previous = glyphs;
      glyphs = [];
      let prefix = '';
      chars.forEach((char, i) => {
        prefix += char;
        const own = probe.measureText(char);
        const gx = x + probe.measureText(prefix).width - own.width;
        if (!char.trim()) return;
        const base = {
          char,
          x: gx,
          box: {
            x1: gx - own.actualBoundingBoxLeft,
            y1: baseline - own.actualBoundingBoxAscent,
            x2: gx + own.actualBoundingBoxRight,
            y2: baseline + own.actualBoundingBoxDescent,
          },
        };
        const kept = previous[glyphs.length];
        glyphs.push({
          ...base,
          offset: kept?.char === char ? kept.offset : { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
          outline: 0,
          index: i,
          fill: sprite(s, next, base, false),
          dashes: sprite(s, next, base, true),
        });
      });
      dragging = -1;
      frame.index = -1;
      return next;
    };

    /* hit-test anywhere — offset-aware on BOTH axes (re-grab displaced letters) */
    const glyphAt = (x, y) => {
      if (!word) return -1;
      let best = -1,
        bestDistance = Infinity;
      glyphs.forEach((glyph, i) => {
        const x1 = glyph.box.x1 + glyph.offset.x;
        const x2 = glyph.box.x2 + glyph.offset.x;
        const y1 = glyph.box.y1 + glyph.offset.y;
        const y2 = glyph.box.y2 + glyph.offset.y;
        const dx = x < x1 ? x1 - x : x > x2 ? x - x2 : 0;
        const dy = y < y1 ? y1 - y : y > y2 ? y - y2 : 0;
        const d = Math.hypot(dx, dy);
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      return bestDistance < 30 ? best : -1;
    };

    const falloff = (target, cx, cy, radius, strength, softness) => {
      const inner = Math.min(1, Math.max(0, 1 - softness));
      const gradient = target.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${strength})`);
      if (inner > 0.995) {
        gradient.addColorStop(0.995, `rgba(0, 0, 0, ${strength})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        return gradient;
      }
      for (let i = 0; i <= FALLOFF_STEPS; i++) {
        const t = i / FALLOFF_STEPS;
        const eased = t * t * (3 - 2 * t);
        gradient.addColorStop(inner + (1 - inner) * t, `rgba(0, 0, 0, ${strength * (1 - eased)})`);
      }
      return gradient;
    };

    const blit = (target, art, dx, dy, originX, originY) => {
      target.drawImage(
        art.image,
        Math.round((art.left + dx) * dpr - originX),
        Math.round((art.top + dy) * dpr - originY)
      );
    };

    /* lens reveal — base canvas only (local coords) */
    const drawReveal = (s) => {
      const radius = s.reach * dpr;
      const cx = lens.x * dpr,
        cy = lens.y * dpr;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = falloff(ctx, cx, cy, radius, presence, s.softness);
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.globalCompositeOperation = 'source-over';

      const x0 = Math.max(0, Math.floor(cx - radius));
      const y0 = Math.max(0, Math.floor(cy - radius));
      const x1 = Math.min(canvas.width, Math.ceil(cx + radius));
      const y1 = Math.min(canvas.height, Math.ceil(cy + radius));
      if (x1 <= x0 || y1 <= y0) return;
      const w = x1 - x0,
        h = y1 - y0;
      if (scratch.width < w || scratch.height < h) {
        scratch.width = Math.max(scratch.width, w);
        scratch.height = Math.max(scratch.height, h);
      }
      scratchCtx.setTransform(1, 0, 0, 1, 0, 0);
      scratchCtx.globalCompositeOperation = 'source-over';
      scratchCtx.clearRect(0, 0, w, h);
      for (const glyph of glyphs) blit(scratchCtx, glyph.dashes, glyph.offset.x, glyph.offset.y, 0, 0);
      scratchCtx.globalCompositeOperation = 'destination-in';
      scratchCtx.fillStyle = falloff(scratchCtx, cx - x0, cy - y0, radius, 1, s.softness);
      scratchCtx.fillRect(0, 0, w, h);
      scratchCtx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = presence;
      ctx.drawImage(scratch, 0, 0, w, h, x0, y0, w, h);
      ctx.globalAlpha = 1;
    };

    const crisp = (v) => (Math.round(v * dpr) + 0.5) / dpr;

    const perimeterPoint = (distance, w, h) => {
      let d = ((distance % (2 * (w + h))) + 2 * (w + h)) % (2 * (w + h));
      if (d < w) return [frame.x1 + d, frame.y1, 0, -1];
      d -= w;
      if (d < h) return [frame.x2, frame.y1 + d, 1, 0];
      d -= h;
      if (d < w) return [frame.x2 - d, frame.y2, 0, 1];
      d -= w;
      return [frame.x1, frame.y2 - d, -1, 0];
    };

    const drawSpecks = (g, s, a) => {
      const w = frame.x2 - frame.x1,
        h = frame.y2 - frame.y1;
      if (w < 2 || h < 2) return;
      const perimeter = 2 * (w + h);
      const seed = frame.index + 1;
      const grid = 3;

      for (let k = 0; k < s.specks; k++) {
        const period = 0.5 + noise(seed, k, 11) * 1.2;
        const t = pulse / period + noise(seed, k, 17);
        const cycle = Math.floor(t);
        const life = t - cycle;
        if (life > 0.7) continue;
        const [px, py, nx, ny] = perimeterPoint(noise(seed, k, cycle) * perimeter, w, h);
        const pick = noise(seed, k, cycle, 2);
        const size = pick < 0.46 ? 2 : pick < 0.7 ? 3 : pick < 0.84 ? 5 : pick < 0.94 ? 8 : 11;
        const large = size >= 8;
        const out = (large ? 9 : 4) + Math.floor(noise(seed, k, cycle, 1) * 5) * grid;
        const x = frame.x1 + Math.round((px + nx * out - frame.x1) / grid) * grid;
        const y = frame.y1 + Math.round((py + ny * out - frame.y1) / grid) * grid;
        const tone = noise(seed, k, cycle, 3);
        const blink = life < 0.06 || (life > 0.32 && life < 0.36) ? 0.35 : 1;
        const alpha = a * (large ? 0.3 + 0.4 * tone : 0.3 + 0.6 * tone) * blink;
        const left = Math.round(x - size / 2),
          top = Math.round(y - size / 2);
        if (tone < 0.26 || (large && tone < 0.78)) {
          g.strokeStyle = rgba(s.accentColor, alpha);
          g.strokeRect(left + 0.5, top + 0.5, size, size);
          if (large && tone > 0.5) {
            g.fillStyle = rgba(s.accentColor, alpha);
            g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
          }
        } else {
          g.fillStyle = rgba(s.accentColor, alpha);
          g.fillRect(left, top, size, size);
        }
      }

      for (let j = 0; j < 2; j++) {
        const head = (pulse * 0.42 * s.speed + j * 0.5) * perimeter;
        for (let i = 0; i < 4; i++) {
          const [x, y] = perimeterPoint(head - i * 6, w, h);
          const size = i === 0 ? 3 : 2;
          g.fillStyle = rgba(s.accentColor, a * [0.95, 0.55, 0.32, 0.16][i]);
          g.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
        }
      }
    };

    /* g = target context, ax/ay = that canvas's box origin in viewport px */
    const drawFrame = (g, ax, ay, s) => {
      const glyph = glyphs[frame.index];
      if (!glyph || frame.alpha < 0.01) return;
      const a = frame.alpha;
      const x1 = crisp(frame.x1),
        y1 = crisp(frame.y1);
      const x2 = crisp(frame.x2),
        y2 = crisp(frame.y2);
      g.setTransform(dpr, 0, 0, dpr, ax * dpr, ay * dpr);

      const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
      if (moved > 1) {
        const hx = (glyph.box.x1 + glyph.box.x2) / 2;
        const hy = (glyph.box.y1 + glyph.box.y2) / 2;
        g.beginPath();
        g.moveTo(hx, hy);
        g.lineTo(hx + glyph.offset.x, hy + glyph.offset.y);
        g.setLineDash([3, 4]);
        g.lineWidth = 1;
        g.strokeStyle = rgba(s.accentColor, 0.45 * a);
        g.stroke();
        g.setLineDash([]);
        g.beginPath();
        g.rect(Math.round(hx) - 2, Math.round(hy) - 2, 4, 4);
        g.fillStyle = rgba(s.accentColor, 0.7 * a);
        g.fill();
      }

      g.beginPath();
      g.rect(x1, y1, x2 - x1, y2 - y1);
      g.lineWidth = 1;
      g.strokeStyle = rgba(s.accentColor, 0.5 * a);
      g.stroke();

      g.beginPath();
      for (const [cx, cy] of [
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2],
      ]) {
        g.rect(Math.round(cx) - 2, Math.round(cy) - 2, 5, 5);
      }
      g.fillStyle = rgba(s.accentColor, 0.95 * a);
      g.fill();

      if (s.specks > 0) {
        g.lineWidth = 1;
        drawSpecks(g, s, a);
      }

      if (!s.labels) return;
      g.font = LABEL_FONT;
      g.textAlign = 'left';
      g.textBaseline = 'bottom';
      g.fillStyle = rgba(s.accentColor, 0.62 * a);
      const label =
        moved > 1
          ? `${signed(Math.round(glyph.offset.x))}, ${signed(Math.round(-glyph.offset.y))}`
          : `${glyph.char}  ${Math.round(glyph.box.x2 - glyph.box.x1)} × ${Math.round(glyph.box.y2 - glyph.box.y1)}`;
      g.fillText(label, Math.round(frame.x1), Math.round(frame.y1) - 7);
    };

    function tick(now) {
      raf = 0;
      const s = settingsRef.current || S;
      if (!s) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const view = ensureLayout(s);
      updateAnchor(); /* per-frame: scroll/transform-proof */

      /* pointer in box-local coords */
      pointer.x = pointer.cx - anchorX;
      pointer.y = pointer.cy - anchorY;
      pointer.inside =
        !!word &&
        pointer.y > view.top - 30 &&
        pointer.y < view.bottom + 30 &&
        pointer.x > view.left - 60 &&
        pointer.x < view.right + 60;

      const sweeping = s.sweep && !reducedMotion && containerVisible && !pointer.inside && dragging < 0;
      if (sweeping) clock += dt * s.speed;
      pulse += dt;
      let targetX = pointer.x,
        targetY = pointer.y;
      if (sweeping) {
        targetX = view.left + (view.right - view.left) * (0.5 - 0.5 * Math.cos(clock * 0.45));
        targetY = view.top + (view.bottom - view.top) * (0.45 + 0.1 * Math.sin(clock * 0.8));
      }
      const active = pointer.inside || sweeping || dragging >= 0;
      if (active && !placed) {
        lens.x = targetX;
        lens.y = targetY;
      }
      if (active) {
        const lag = pointer.inside ? 0.05 : 0.22;
        lens.x = approach(lens.x, targetX, dt, lag);
        lens.y = approach(lens.y, targetY, dt, lag);
      }
      placed = active;
      presence = approach(presence, s.reveal === 'area' && active && dragging < 0 ? 1 : 0, dt, 0.16);

      let moving = false;
      glyphs.forEach((glyph, i) => {
        if (i === dragging) {
          /* clamp to the VIEWPORT (in local coords) — drag anywhere on
             the page, never off it */
          const tx = pointer.x - grab.x;
          const ty = pointer.y - grab.y;
          const minX = -anchorX - glyph.box.x1 + 12;
          const maxX = window.innerWidth - anchorX - glyph.box.x2 - 12;
          const minY = -anchorY - glyph.box.y1 + 12;
          const maxY = window.innerHeight - anchorY - glyph.box.y2 - 12;
          glyph.offset.x = approach(glyph.offset.x, clamp(tx, Math.min(minX, maxX), Math.max(minX, maxX)), dt, 0.03);
          glyph.offset.y = approach(glyph.offset.y, clamp(ty, Math.min(minY, maxY), Math.max(minY, maxY)), dt, 0.03);
          glyph.velocity.x = 0;
          glyph.velocity.y = 0;
          moving = true;
          return;
        }
        const { offset, velocity } = glyph;
        if (Math.abs(offset.x) < 0.05 && Math.abs(offset.y) < 0.05 && Math.hypot(velocity.x, velocity.y) < 0.5) {
          offset.x = 0;
          offset.y = 0;
          velocity.x = 0;
          velocity.y = 0;
          return;
        }
        velocity.x += (-SPRING * offset.x - DAMPING * velocity.x) * dt;
        velocity.y += (-SPRING * offset.y - DAMPING * velocity.y) * dt;
        offset.x += velocity.x * dt;
        offset.y += velocity.y * dt;
        moving = true;
      });

      const focus = dragging >= 0 ? dragging : active ? glyphAt(lens.x, lens.y) : -1;
      if (focus >= 0 && s.selection) {
        const glyph = glyphs[focus];
        const bx1 = glyph.box.x1 + glyph.offset.x - 6;
        const by1 = glyph.box.y1 + glyph.offset.y - 6;
        const bx2 = glyph.box.x2 + glyph.offset.x + 6;
        const by2 = glyph.box.y2 + glyph.offset.y + 6;
        if (frame.index < 0 || frame.alpha < 0.02) {
          frame.x1 = bx1;
          frame.y1 = by1;
          frame.x2 = bx2;
          frame.y2 = by2;
        }
        const glide = focus === dragging ? 0.02 : 0.08;
        frame.x1 = approach(frame.x1, bx1, dt, glide);
        frame.y1 = approach(frame.y1, by1, dt, glide);
        frame.x2 = approach(frame.x2, bx2, dt, glide);
        frame.y2 = approach(frame.y2, by2, dt, glide);
        frame.index = focus;
      }
      frame.alpha = approach(frame.alpha, focus >= 0 && s.selection ? 1 : 0, dt, 0.1);

      glyphs.forEach((glyph, i) => {
        const target = s.reveal === 'letter' && i === focus && i !== dragging ? 1 : 0;
        glyph.outline = approach(glyph.outline, target, dt, 0.09);
        if (Math.abs(glyph.outline - target) > 0.002) moving = true;
        else glyph.outline = target;
      });

      if (s.draggable) container.style.cursor = dragging >= 0 ? 'grabbing' : focus >= 0 && pointer.inside ? 'grab' : '';

      /* ---- render pass 1: BASE canvas (all at-rest / in-box glyphs) ---- */
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* ---- render pass 2: OVERLAY (displaced glyphs, viewport coords) ---- */
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.globalCompositeOperation = 'source-over';
      octx.clearRect(0, 0, overlay.width, overlay.height);

      const ox = -anchorX * dpr,
        oy = -anchorY * dpr;
      let anyDisplaced = false;

      for (const glyph of glyphs) {
        const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
        if (moved > 0.5 && moved <= 1) {
          ctx.globalAlpha = Math.min(1, moved / 24) * 0.55;
          blit(ctx, glyph.dashes, glyph.offset.x, glyph.offset.y, 0, 0);
          ctx.globalAlpha = 1;
        }
      }
      for (const glyph of glyphs) {
        const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
        if (moved <= 1) continue;
        anyDisplaced = true;
        octx.globalAlpha = Math.min(1, moved / 24) * 0.55;
        blit(octx, glyph.dashes, glyph.offset.x, glyph.offset.y, ox, oy);
        octx.globalAlpha = 1;
      }
      for (const glyph of glyphs) {
        const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
        if (moved > 1) continue;
        if (glyph.outline < 0.999) {
          ctx.globalAlpha = 1 - glyph.outline;
          blit(ctx, glyph.fill, glyph.offset.x, glyph.offset.y, 0, 0);
        }
        if (glyph.outline > 0.001) {
          ctx.globalAlpha = glyph.outline;
          blit(ctx, glyph.dashes, glyph.offset.x, glyph.offset.y, 0, 0);
        }
        ctx.globalAlpha = 1;
      }
      for (const glyph of glyphs) {
        const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
        if (moved <= 1) continue;
        if (glyph.outline < 0.999) {
          octx.globalAlpha = 1 - glyph.outline;
          blit(octx, glyph.fill, glyph.offset.x, glyph.offset.y, ox, oy);
        }
        if (glyph.outline > 0.001) {
          octx.globalAlpha = glyph.outline;
          blit(octx, glyph.dashes, glyph.offset.x, glyph.offset.y, ox, oy);
        }
        octx.globalAlpha = 1;
      }
      if (presence > 0.001) drawReveal(s);

      /* selection frame follows its glyph's canvas */
      const fg = glyphs[frame.index];
      if (fg && Math.hypot(fg.offset.x, fg.offset.y) > 1) {
        drawFrame(octx, anchorX, anchorY, s);
      } else {
        drawFrame(ctx, 0, 0, s);
      }

      const settling =
        moving ||
        anyDisplaced ||
        Math.abs(presence - (s.reveal === 'area' && active && dragging < 0 ? 1 : 0)) > 0.002 ||
        (frame.alpha > 0.01 && frame.alpha < 0.99);
      if ((active || settling) && alive) raf = requestAnimationFrame(tick);
    }

    function wake() {
      if (raf || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
    wakeRef.current = wake;

    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      overlay.width = Math.round(window.innerWidth * dpr);
      overlay.height = Math.round(window.innerHeight * dpr);
      layoutKey = '';
      wake();
    };

    const locate = (e) => {
      pointer.cx = e.clientX;
      pointer.cy = e.clientY;
    };

    /* global listeners — drags continue anywhere on the page */
    const onPointerMove = (e) => {
      locate(e);
      if (dragging >= 0 && Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y) > 4) dragMoved = true;
      wake();
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onPointerDown = (e) => {
      locate(e);
      const s = settingsRef.current || S;
      if (!s.draggable) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      /* never steal presses from interactive elements */
      if (e.target && e.target.closest && e.target.closest('a,button,input,textarea,select,label')) return;
      updateAnchor();
      const lx = e.clientX - anchorX;
      const ly = e.clientY - anchorY;
      const index = glyphAt(lx, ly);
      if (index >= 0) {
        dragging = index;
        dragMoved = false;
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        grab.x = lx - glyphs[index].offset.x;
        grab.y = ly - glyphs[index].offset.y;
        container.setPointerCapture?.(e.pointerId);
        e.preventDefault();
      }
      wake();
    };
    window.addEventListener('pointerdown', onPointerDown, { passive: false });

    const endDrag = () => {
      if (dragging >= 0) {
        dragging = -1;
        wake();
      }
    };
    window.addEventListener('pointerup', endDrag, { passive: true });
    window.addEventListener('pointercancel', endDrag, { passive: true });

    /* a real drag swallows the click that would land underneath */
    const onClickCapture = (e) => {
      if (dragMoved) {
        dragMoved = false;
        e.stopPropagation();
        e.preventDefault();
      }
    };
    window.addEventListener('click', onClickCapture, true);

    /* anchor sync while scrolling — displaced letters ride the page */
    const onScroll = () => {
      updateAnchor();
      wake();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        containerVisible = entry.isIntersecting;
        wake();
      },
      { threshold: 0 }
    );
    io.observe(container);

    if (document.fonts) document.fonts.ready.then(refreshFonts, refreshFonts);

    resize();

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      wakeRef.current = null;
      settingsRef.current = null;
      clearLayoutRef.current = null;

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      window.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);

      ro.disconnect();
      io.disconnect();

      if (container && container.contains(canvas)) {
        container.removeChild(canvas);
      }
      baseCanvasRef.current = null;

      if (document.body && document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
      overlayCanvasRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`tech-text ${className}`.trim()}
      id="techText"
      role="img"
      aria-label={text}
      {...rest}
    />
  );
}
