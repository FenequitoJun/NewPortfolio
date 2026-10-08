import { useState, useEffect } from 'react';
import { NAV_LINKS } from '../data/site';

export default function Navbar({ light, onToggleTheme, activeId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <a href="#home" className="logo" onClick={closeMenu}>
        Jun<b>.dev</b>
      </a>
      <ul className={`nav-links ${isOpen ? 'open' : ''}`} id="navLinks">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={activeId === link.href.slice(1) ? 'active' : ''}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          </li>
        ))}
        <li className="mobile-only">
          <a
            href="#contact"
            className={activeId === 'contact' ? 'active' : ''}
            onClick={closeMenu}
          >
            Contact
          </a>
        </li>
      </ul>
      <div className="nav-right">
        <a href="#contact" className="nav-cta" onClick={closeMenu}>
          Let's Talk
        </a>

        {/* 🌗 LIGHT / DARK TOGGLE */}
        <button
          className="theme-toggle"
          id="themeToggle"
          aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
          title="Toggle theme"
          onClick={onToggleTheme}
        >
          <svg className="icon-moon" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <svg className="icon-sun" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="4.2" y1="4.2" x2="6.3" y2="6.3" />
            <line x1="17.7" y1="17.7" x2="19.8" y2="19.8" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
            <line x1="4.2" y1="19.8" x2="6.3" y2="17.7" />
            <line x1="17.7" y1="6.3" x2="19.8" y2="4.2" />
          </svg>
        </button>

        <button
          className="burger"
          id="burger"
          aria-label="Menu"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
