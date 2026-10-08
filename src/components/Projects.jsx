import BorderGlow from './BorderGlow';
import { PROJECTS } from '../data/site';

function ProjectThumb({ project }) {
  if (project.shot) {
    return (
      <div className="proj-thumb">
        <img
          className="shot"
          src={project.shot}
          alt={`${project.title} live preview`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="tb">
          <i></i>
          <i></i>
          <i></i>
        </div>
        <div className="tbody">
          {project.skeletonVariant === 'mern' ? (
            <>
              <div className="sk sk4" style={{ alignSelf: 'flex-start' }}></div>
              <div className="sk sk5"></div>
              <div className="sk sk6"></div>
            </>
          ) : project.skeletonVariant === 'old' ? (
            <>
              <div className="sk sk1" style={{ width: '35%' }}></div>
              <div className="sk sk5"></div>
              <div className="sk sk2"></div>
              <div className="sk sk3" style={{ width: '52%' }}></div>
            </>
          ) : (
            <>
              <div className="sk sk1"></div>
              <div className="sk sk2"></div>
              <div className="sk sk3"></div>
              <div className="sk sk4"></div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (project.figmaType === 'dagyang') {
    return (
      <div className="fig-thumb">
        <div className="fig-canvas">
          <div className="fc-top">
            <i className="fc-dot a"></i>
            <i className="fc-dot b"></i>
            <i className="fc-dot"></i>
          </div>
          <div className="fc-line l1"></div>
          <div className="fc-line l2"></div>
          <div className="fc-line l3"></div>
          <div className="fc-blocks">
            <i></i>
            <i></i>
            <i></i>
          </div>
        </div>
        <span className="fig-cursor fc1" data-name="Jun"></span>
        <span className="fig-cursor fc2" data-name="Designer"></span>
      </div>
    );
  }

  if (project.figmaType === 'wetell') {
    return (
      <div className="fig-thumb">
        <div className="fig-canvas">
          <div className="fc-top">
            <i className="fc-dot b"></i>
            <i className="fc-dot a"></i>
            <i className="fc-dot"></i>
          </div>
          <div className="fc-line l1" style={{ width: '48%' }}></div>
          <div className="fc-line l2" style={{ width: '80%' }}></div>
          <div className="fc-line l3" style={{ width: '64%' }}></div>
          <div className="fc-blocks">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
        </div>
        <span className="fig-cursor fc1" data-name="Jun" style={{ animationDelay: '1.2s' }}></span>
        <span
          className="fig-cursor fc2"
          data-name="Reviewer"
          style={{ animationDelay: '.6s', color: '#f472b6' }}
        ></span>
      </div>
    );
  }

  return null;
}

export default function Projects() {
  return (
    <section id="projects">
      <h2 className="sec-title">Projects</h2>
      <p className="sec-sub">Design prototypes and web apps I've built — more coming soon.</p>

      <div className="bento">
        {PROJECTS.map((project) => (
          <BorderGlow key={project.title} className={`card glass span-${project.span} reveal`}>
            <ProjectThumb project={project} />
            <div className="proj-head">
              <h3>{project.title}</h3>
              <span className={`proj-status ${project.status}`}>{project.statusText}</span>
            </div>
            <p>{project.desc}</p>
            {project.tags.map((tag) => (
              <span key={tag} className="mini">
                {tag}
              </span>
            ))}
            <div className="proj-links">
              {project.links.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          </BorderGlow>
        ))}
      </div>
    </section>
  );
}
