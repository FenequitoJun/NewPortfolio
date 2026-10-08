import { useState, useRef, useEffect } from 'react';
import BorderGlow from './BorderGlow';
import { CONTACT } from '../data/site';

export default function Contact() {
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = form.elements['cf-name']?.value.trim() || '';
    const email = form.elements['cf-email']?.value.trim() || '';
    const subject = form.elements['cf-subject']?.value.trim() || '';
    const message = form.elements['cf-message']?.value.trim() || '';

    const body = encodeURIComponent(`Hi Jun,\n\n${message}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${body}`;

    setShowSuccess(true);
    form.reset();

    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => {
      setShowSuccess(false);
    }, 6000);
  };

  return (
    <section id="contact">
      <h2 className="sec-title">
        Are you looking for a <span className="grad-text">web developer</span>?
      </h2>
      <p className="sec-sub">
        I am looking for my first job as a junior web developer. I like to learn, work in a team, and improve on every project. If you are interested in someone with attitude and eagerness to grow, let's talk.
      </p>

      <div className="contact-grid">
        {/* LEFT : contact info */}
        <div className="contact-info">
          <BorderGlow
            as="a"
            className="card glass info-card reveal"
            href={`mailto:${CONTACT.email}`}
          >
            <div className="icon">📧</div>
            <div>
              <h3>Email</h3>
              <p>{CONTACT.email}</p>
            </div>
          </BorderGlow>

          <BorderGlow
            as="a"
            className="card glass info-card reveal"
            href={`tel:${CONTACT.phone}`}
          >
            <div className="icon">📱</div>
            <div>
              <h3>Telephone</h3>
              <p>{CONTACT.phone}</p>
            </div>
          </BorderGlow>

          <BorderGlow
            as="a"
            className="card glass info-card reveal"
            href={CONTACT.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="icon">💼</div>
            <div>
              <h3>GitHub</h3>
              <p>{CONTACT.githubUser}</p>
            </div>
          </BorderGlow>

          <BorderGlow
            as="a"
            className="card glass info-card reveal"
            href={CONTACT.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="icon">🔗</div>
            <div>
              <h3>LinkedIn</h3>
              <p>{CONTACT.linkedinUser}</p>
            </div>
          </BorderGlow>

          <div className="avail glass reveal">
            <i></i> Available for work as a junior
          </div>
        </div>

        {/* RIGHT : message form */}
        <BorderGlow
          as="form"
          className="card glass cform reveal"
          id="contactForm"
          onSubmit={handleSubmit}
        >
          <h3>Send me a message</h3>
          <p className="form-sub">Fill out the form and I'll get back to you as soon as I can.</p>
          <div className="form-row">
            <div className="field">
              <label htmlFor="cf-name">Name</label>
              <input id="cf-name" name="cf-name" type="text" placeholder="Your name" required />
            </div>
            <div className="field">
              <label htmlFor="cf-email">Email</label>
              <input id="cf-email" name="cf-email" type="email" placeholder="tu@email.com" required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="cf-subject">Matter</label>
            <input
              id="cf-subject"
              name="cf-subject"
              type="text"
              placeholder="What do you want to talk about?"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="cf-message">Message</label>
            <textarea
              id="cf-message"
              name="cf-message"
              rows={5}
              placeholder="Tell me about your project..."
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Send Message ➜
          </button>
          <div className={`form-success ${showSuccess ? 'show' : ''}`} id="formSuccess">
            ✅ Thanks! Your email app is opening with your message ready to send.
          </div>
        </BorderGlow>
      </div>
    </section>
  );
}
