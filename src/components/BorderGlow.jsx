import { useRef } from 'react';

export default function BorderGlow({ as: Component = 'div', className = '', children, ...props }) {
  const cardRef = useRef(null);

  const handlePointerMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const cx = r.width / 2;
    const cy = r.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const kx = dx === 0 ? Infinity : cx / Math.abs(dx);
    const ky = dy === 0 ? Infinity : cy / Math.abs(dy);
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1) * 100;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    el.style.setProperty('--edge-proximity', edge.toFixed(3));
    el.style.setProperty('--cursor-angle', deg.toFixed(3) + 'deg');
  };

  const handlePointerLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--edge-proximity', '0');
  };

  return (
    <Component
      ref={cardRef}
      className={`border-glow-card ${className}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
      <span className="edge-light" aria-hidden="true" />
    </Component>
  );
}
