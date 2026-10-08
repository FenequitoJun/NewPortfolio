import { useEffect, useRef } from 'react';
import { useTheme } from './hooks/useTheme';
import { useScrollSpy } from './hooks/useScrollSpy';
import { useReveal } from './hooks/useReveal';
import { SPY_IDS } from './data/site';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  const [light, toggleTheme] = useTheme();
  const activeId = useScrollSpy(SPY_IDS);
  useReveal();

  const progressRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement;
      const maxScroll = h.scrollHeight - h.clientHeight;
      const progress = maxScroll > 0 ? (h.scrollTop / maxScroll) * 100 : 0;
      if (progressRef.current) {
        progressRef.current.style.width = `${progress}%`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <div id="progress" ref={progressRef}></div>
      <div className="orb orb1"></div>
      <div className="orb orb2"></div>

      <Navbar light={light} onToggleTheme={toggleTheme} activeId={activeId} />

      <main>
        <Hero theme={light ? 'light' : 'dark'} />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
