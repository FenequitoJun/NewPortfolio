import { useEffect, useRef, useState } from 'react';

export default function ProfileCard() {
  const wrapRef = useRef(null);
  const shellRef = useRef(null);
  const cardRef = useRef(null);

  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const shell = shellRef.current;
    const card = cardRef.current;
    if (!wrap || !shell) return;

    const ANIM = { INITIAL_DURATION: 1200, INITIAL_X_OFFSET: 70, INITIAL_Y_OFFSET: 60, ENTER_MS: 180 };
    const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
    const round = (v, p = 3) => parseFloat(v.toFixed(p));
    const adjust = (v, fMin, fMax, tMin, tMax) =>
      round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

    let rafId = null,
      checkRafId = null,
      running = false,
      lastTs = 0;
    let currentX = 0,
      currentY = 0,
      targetX = 0,
      targetY = 0;
    const TAU = 0.14,
      TAU_INITIAL = 0.6;
    let initialUntil = 0;
    let enterTimer = null;
    let hasGyroListener = false;

    function setVars(x, y) {
      const w = shell.clientWidth || 1,
        h = shell.clientHeight || 1;
      const px = clamp((100 / w) * x),
        py = clamp((100 / h) * y);
      const cx = px - 50,
        cy = py - 50;

      const cxCenter = w / 2,
        cyCenter = h / 2;
      const dx = x - cxCenter,
        dy = y - cyCenter;
      const kx = dx === 0 ? Infinity : cxCenter / Math.abs(dx);
      const ky = dy === 0 ? Infinity : cyCenter / Math.abs(dy);
      const near = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);

      const props = {
        '--pointer-x': px + '%',
        '--pointer-y': py + '%',
        '--background-x': adjust(px, 0, 100, 35, 65) + '%',
        '--background-y': adjust(py, 0, 100, 35, 65) + '%',
        '--pointer-from-center': clamp(Math.hypot(py - 50, px - 50) / 50, 0, 1),
        '--pointer-from-top': py / 100,
        '--pointer-from-left': px / 100,
        '--rotate-x': round(-(cx / 5)) + 'deg',
        '--rotate-y': round(cy / 4) + 'deg',
        '--pc-near': round(near, 3),
      };
      for (const k in props) wrap.style.setProperty(k, props[k]);
    }

    function step(ts) {
      if (!running) return;
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      const tau = ts < initialUntil ? TAU_INITIAL : TAU;
      const k = 1 - Math.exp(-dt / tau);
      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;
      setVars(currentX, currentY);
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTs = 0;
      }
    }

    function start() {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    }

    function setTarget(x, y) {
      targetX = x;
      targetY = y;
      start();
    }

    function toCenter() {
      setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
    }

    const onPointerEnter = (e) => {
      wrap.classList.add('active');
      shell.classList.add('active', 'entering');
      if (card) card.classList.add('active');
      clearTimeout(enterTimer);
      enterTimer = setTimeout(() => shell.classList.remove('entering'), ANIM.ENTER_MS);
      const r = shell.getBoundingClientRect();
      setTarget(e.clientX - r.left, e.clientY - r.top);
    };

    const onPointerMove = (e) => {
      const r = shell.getBoundingClientRect();
      setTarget(e.clientX - r.left, e.clientY - r.top);
    };

    const onPointerLeave = () => {
      toCenter();
      function check() {
        if (Math.hypot(targetX - currentX, targetY - currentY) < 0.6) {
          wrap.classList.remove('active');
          shell.classList.remove('active');
          if (card) card.classList.remove('active');
        } else {
          checkRafId = requestAnimationFrame(check);
        }
      }
      checkRafId = requestAnimationFrame(check);
    };

    function onOrient(e) {
      if (e.beta == null || e.gamma == null) return;
      const s = 5;
      setTarget(
        clamp(shell.clientWidth / 2 + e.gamma * s, 0, shell.clientWidth),
        clamp(shell.clientHeight / 2 + (e.beta - 20) * s, 0, shell.clientHeight)
      );
    }

    const onClick = () => {
      if (window.location.protocol !== 'https:') return;
      const dm = window.DeviceMotionEvent;
      if (dm && typeof dm.requestPermission === 'function') {
        dm.requestPermission()
          .then((st) => {
            if (st === 'granted') {
              window.addEventListener('deviceorientation', onOrient);
              hasGyroListener = true;
            }
          })
          .catch(() => {});
      } else {
        window.addEventListener('deviceorientation', onOrient);
        hasGyroListener = true;
      }
    };

    shell.addEventListener('pointerenter', onPointerEnter);
    shell.addEventListener('pointermove', onPointerMove);
    shell.addEventListener('pointerleave', onPointerLeave);
    shell.addEventListener('click', onClick);

    // entrance animation: start offset, then settle to center
    currentX = shell.clientWidth - ANIM.INITIAL_X_OFFSET;
    currentY = ANIM.INITIAL_Y_OFFSET;
    setVars(currentX, currentY);
    initialUntil = performance.now() + ANIM.INITIAL_DURATION;
    toCenter();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (checkRafId) cancelAnimationFrame(checkRafId);
      clearTimeout(enterTimer);
      shell.removeEventListener('pointerenter', onPointerEnter);
      shell.removeEventListener('pointermove', onPointerMove);
      shell.removeEventListener('pointerleave', onPointerLeave);
      shell.removeEventListener('click', onClick);
      if (hasGyroListener) {
        window.removeEventListener('deviceorientation', onOrient);
      }
    };
  }, []);

  const handleContactClick = () => {
    const contact = document.getElementById('contact');
    if (contact) {
      contact.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pc-card-wrapper" id="profileCard" ref={wrapRef}>
      <div className="pc-behind"></div>
      <div className="pc-card-shell" ref={shellRef}>
        <section className="pc-card" ref={cardRef}>
          <div className="pc-inside"></div>
          <div
            className="pc-initials"
            id="pcInitials"
            style={{ display: avatarLoaded && !avatarError ? 'none' : '' }}
          >
            JF
          </div>
          <div className="pc-shine"></div>
          <div className="pc-glare"></div>
          <div className="pc-content pc-avatar-content">
            <img
              className="avatar"
              id="pcAvatar"
              src="/profile.jpg"
              alt="Jun Fenequito avatar"
              loading="lazy"
              onLoad={() => setAvatarLoaded(true)}
              onError={() => {
                setAvatarError(true);
                setAvatarLoaded(false);
              }}
              style={{ display: avatarError ? 'none' : '' }}
            />
            <div className="pc-user-info">
              <div className="pc-user-details">
                <div className="pc-mini-avatar">
                  <img
                    src="/profile.jpg"
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="pc-user-text">
                  <div className="pc-handle">@FenequitoJun</div>
                  <div className="pc-status">Open to work</div>
                </div>
              </div>
              <button
                className="pc-contact-btn"
                id="pcContact"
                type="button"
                aria-label="Contact Jun"
                onClick={handleContactClick}
              >
                Contact
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
