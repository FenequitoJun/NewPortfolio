import { useEffect, useRef } from 'react';

export default function CaseStudyModal({ project, open, onClose }) {
  const closeBtnRef = useRef(null);
  const prevFocusedRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    prevFocusedRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    // Move focus to close button after render
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      if (prevFocusedRef.current && typeof prevFocusedRef.current.focus === 'function') {
        prevFocusedRef.current.focus();
      }
    };
  }, [open, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`cs-backdrop ${open ? 'open' : ''}`}
      id="csBackdrop"
      aria-hidden={!open}
      onClick={handleBackdropClick}
    >
      <div className="cs-modal glass" role="dialog" aria-modal="true" aria-labelledby="csTitle">
        <div className="cs-head">
          <div>
            <div className="cs-kicker">case study</div>
            <h2 className="sec-title" id="csTitle" style={{ fontSize: '1.5rem', margin: 0 }}>
              {project?.title || 'Project'}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            className="cs-close"
            id="csClose"
            aria-label="Close case study"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="cs-sec">
          <h4>the problem</h4>
          <p id="csProblem">{project?.case?.problem}</p>
        </div>
        <div className="cs-sec">
          <h4>my approach</h4>
          <p id="csApproach">{project?.case?.approach}</p>
        </div>
        <div className="cs-sec">
          <h4>what i learned</h4>
          <p id="csLearned">{project?.case?.learned}</p>
        </div>
        <div className="cs-tags" id="csTags">
          {project?.tags?.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="cs-links" id="csLinks">
          {project?.links?.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
