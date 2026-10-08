import { TIMELINE } from '../data/site';

export default function Experience() {
  return (
    <section id="experience">
      <h2 className="sec-title">Experience &amp; Learning</h2>
      <p className="sec-sub">Milestones on the road so far.</p>

      <div className="timeline">
        {TIMELINE.map((item, index) => (
          <div key={index} className="titem glass reveal">
            <span className="tyear">{item.year}</span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
