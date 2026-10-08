import TechText from './TechText';
import Typewriter from './Typewriter';
import ProfileCard from './ProfileCard';
import LogoLoop from './LogoLoop';

export default function Hero({ theme }) {
  return (
    <section id="home">
      <div className="hero">
        {/* LEFT : tech-text title + typewriter */}
        <div className="reveal">
          <span className="hi">Hi there, I'm</span>
          <TechText theme={theme} />
          <Typewriter />
          <p className="desc">
            Focused on growing as a developer and building useful and modern applications.
          </p>
          <div className="btn-row">
            <a href="#projects" className="btn btn-primary">
              View Projects →
            </a>
            <a href="#contact" className="btn btn-ghost">
              Contact Me
            </a>
          </div>
        </div>

        {/* RIGHT : interactive Profile Card */}
        <div className="avatar-wrap reveal">
          <ProfileCard />
        </div>
      </div>

      {/* LOGO LOOP (bare icons, bottom of Home) */}
      <LogoLoop />
    </section>
  );
}
