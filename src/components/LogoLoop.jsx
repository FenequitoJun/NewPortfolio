import { useEffect, useRef, useState } from 'react';
import {
  SiReact,
  SiTailwindcss,
  SiJavascript,
  SiMongodb,
  SiSupabase,
  SiFirebase,
  SiGit,
  SiGithub,
  SiVite,
  SiVercel,
  SiCisco,
} from 'react-icons/si';

const LOGOS = [
  {
    name: 'React',
    href: 'https://react.dev',
    color: '#61DAFB',
    icon: SiReact,
  },
  {
    name: 'Tailwind CSS',
    href: 'https://tailwindcss.com',
    color: '#38BDF8',
    icon: SiTailwindcss,
  },
  {
    name: 'JavaScript',
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    color: '#F7DF1E',
    icon: SiJavascript,
  },
  {
    name: 'MongoDB',
    href: 'https://www.mongodb.com',
    color: '#47A248',
    icon: SiMongodb,
  },
  {
    name: 'Supabase',
    href: 'https://supabase.com',
    color: '#3ECF8E',
    icon: SiSupabase,
  },
  {
    name: 'Firebase',
    href: 'https://firebase.google.com',
    color: '#FFCA28',
    icon: SiFirebase,
  },
  {
    name: 'Git',
    href: 'https://git-scm.com',
    color: '#F05032',
    icon: SiGit,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/FenequitoJun',
    color: 'currentColor',
    invert: true,
    icon: SiGithub,
  },
  {
    name: 'Vite',
    href: 'https://vitejs.dev',
    color: '#646CFF',
    icon: SiVite,
  },
  {
    name: 'Vercel',
    href: 'https://vercel.com',
    color: 'currentColor',
    invert: true,
    icon: SiVercel,
  },
  {
    name: 'Cisco',
    href: 'https://www.cisco.com',
    color: '#1BA0D7',
    icon: SiCisco,
  },
];

export default function LogoLoop() {
  const loopRef = useRef(null);
  const trackRef = useRef(null);
  const firstListRef = useRef(null);
  const [copyCount, setCopyCount] = useState(3);

  useEffect(() => {
    const loop = loopRef.current;
    const track = trackRef.current;
    const seq = firstListRef.current;
    if (!loop || !track || !seq) return;

    const CFG = {
      speed: 100,
      hoverSpeed: 0,
      tau: 0.25,
      minCopies: 2,
      headroom: 2,
    };

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let seqW = 0;
    let offset = 0;
    let vel = 0;
    let hovered = false;
    let inView = true;
    let raf = 0;
    let last = null;

    function measure() {
      if (!seq || !loop) return;
      // rect includes the list's trailing padding -> seamless wrap spacing
      seqW = Math.ceil(seq.getBoundingClientRect().width);
      if (seqW <= 0) return;
      const need = Math.max(CFG.minCopies, Math.ceil(loop.clientWidth / seqW) + CFG.headroom);
      setCopyCount((prev) => (need > prev ? need : prev));
      offset = ((offset % seqW) + seqW) % seqW;
      track.style.transform = `translate3d(${-offset}px,0,0)`;
    }

    function tick(ts) {
      if (last === null) last = ts;
      const dt = Math.max(0, ts - last) / 1000;
      last = ts;
      const target = hovered ? CFG.hoverSpeed : CFG.speed;
      vel += (target - vel) * (1 - Math.exp(-dt / CFG.tau));
      if (seqW > 0) {
        offset = (((offset + vel * dt) % seqW) + seqW) % seqW;
        track.style.transform = `translate3d(${-offset}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (!reduced && inView && raf === 0) {
        last = null;
        raf = requestAnimationFrame(tick);
      }
    }

    function stop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    const onMouseEnter = () => {
      hovered = true;
    };
    const onMouseLeave = () => {
      hovered = false;
    };

    loop.addEventListener('mouseenter', onMouseEnter);
    loop.addEventListener('mouseleave', onMouseLeave);

    const roLoop = new ResizeObserver(measure);
    roLoop.observe(loop);

    const roSeq = new ResizeObserver(measure);
    roSeq.observe(seq);

    measure();

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0 }
    );
    io.observe(loop);

    start();

    return () => {
      stop();
      loop.removeEventListener('mouseenter', onMouseEnter);
      loop.removeEventListener('mouseleave', onMouseLeave);
      roLoop.disconnect();
      roSeq.disconnect();
      io.disconnect();
    };
  }, []);

  const renderItems = (isClone) =>
    LOGOS.map((item) => {
      const Icon = item.icon;
      return (
        <li key={item.name} className="logoloop__item">
          <a
            className={`ll-item ${item.invert ? 'll-invert' : ''}`.trim()}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.name}
            title={item.name}
            tabIndex={isClone ? -1 : undefined}
          >
            <Icon size={34} color={item.color} style={{ pointerEvents: 'none' }} />
          </a>
        </li>
      );
    });

  return (
    <div className="logo-loop-wrap">
      <div
        className="logoloop logoloop--fade"
        id="logoLoop"
        role="region"
        aria-label="Technologies I work with"
        ref={loopRef}
      >
        <div className="logoloop__track" ref={trackRef}>
          <ul className="logoloop__list" ref={firstListRef}>
            {renderItems(false)}
          </ul>
          {Array.from({ length: Math.max(0, copyCount - 1) }).map((_, idx) => (
            <ul key={idx} className="logoloop__list" aria-hidden="true">
              {renderItems(true)}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
