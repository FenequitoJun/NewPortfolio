import { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import BorderGlow from './BorderGlow';
import { CONTACT } from '../data/site';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

const isPlaceholder = (val) => {
  if (!val) return true;
  const v = val.trim().toLowerCase();
  return (
    v === '' ||
    v.includes('placeholder') ||
    v.includes('your_') ||
    v === 'your_service_id' ||
    v === 'your_template_id' ||
    v === 'your_public_key'
  );
};

const isConfigured = Boolean(
  SERVICE_ID &&
  TEMPLATE_ID &&
  PUBLIC_KEY &&
  !isPlaceholder(SERVICE_ID) &&
  !isPlaceholder(TEMPLATE_ID) &&
  !isPlaceholder(PUBLIC_KEY)
);

export default function Contact() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [mailtoFallbackUrl, setMailtoFallbackUrl] = useState('');
  const successTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot check: spam-bot trap
    const company = formData.get('company');
    if (company) {
      setStatus('success');
      form.reset();
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setStatus('idle');
      }, 6000);
      return;
    }

    const name = (formData.get('cf-name') || '').toString().trim();
    const email = (formData.get('cf-email') || '').toString().trim();
    const subject = (formData.get('cf-subject') || '').toString().trim();
    const message = (formData.get('cf-message') || '').toString().trim();

    const body = encodeURIComponent(`Hi Jun,\n\n${message}\n\n— ${name}\n${email}`);
    const mailtoLink = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${body}`;

    if (!isConfigured) {
      window.location.href = mailtoLink;
      setStatus('success');
      form.reset();
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setStatus('idle');
      }, 6000);
      return;
    }

    setStatus('sending');

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: name,
          reply_to: email,
          subject: subject,
          message: message,
        },
        PUBLIC_KEY
      );

      setStatus('success');
      form.reset();

      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setStatus('idle');
      }, 6000);
    } catch (err) {
      console.error('EmailJS send error:', err);
      setMailtoFallbackUrl(mailtoLink);
      setStatus('error');
    }
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
          <div className="field hp" aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
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
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Sending…' : 'Send Message ➜'}
          </button>
          <div className={`form-success ${status === 'success' ? 'show' : ''}`} id="formSuccess">
            {isConfigured
              ? '✅ Thanks! Your message has been sent successfully.'
              : '✅ Thanks! Your email app is opening with your message ready to send.'}
          </div>
          {status === 'error' && (
            <div className="form-error" id="formError">
              Failed to send message. You can{' '}
              <a
                href={mailtoFallbackUrl || `mailto:${CONTACT.email}`}
                style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}
              >
                send via email app instead
              </a>
              .
            </div>
          )}
        </BorderGlow>
      </div>
    </section>
  );
}
