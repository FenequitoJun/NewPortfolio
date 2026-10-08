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

export default function Skills() {
  return (
    <section id="skills">
      <h2 className="sec-title">Technical Skills</h2>
      <p className="sec-sub">The technologies I use to bring ideas from concept to deployment.</p>

      <div className="bento">
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
