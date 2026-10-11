import { useState, useEffect, useRef } from 'react';

export default function Terminal({ onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState([]);
  const [inputVal, setInputVal] = useState('');

  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]);
  const hIdxRef = useRef(-1);
  const timeoutsRef = useRef([]);

  const addTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timeoutsRef.current.push(id);
    return id;
  };

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  const openTerminal = () => {
    setOpen(true);
    setLines((prev) => {
      if (!prev.length) {
        return [
          { text: 'Welcome to jun.sh v2.0', cls: 't-acc', id: 1 },
          { text: 'Type "help" to see available commands.', cls: 't-out', id: 2 },
        ];
      }
      return prev;
    });
    addTimeout(() => {
      inputRef.current?.focus();
    }, 250);
  };

  const closeTerminal = () => {
    setOpen(false);
    inputRef.current?.blur();
  };

  const toggleTerminal = () => {
    if (open) {
      closeTerminal();
    } else {
      openTerminal();
    }
  };

  useEffect(() => {
    const handleUnlock = () => {
      setOpen(true);
      setLines((prev) => {
        const welcome = prev.length
          ? prev
          : [
              { text: 'Welcome to jun.sh v2.0', cls: 't-acc', id: 1 },
              { text: 'Type "help" to see available commands.', cls: 't-out', id: 2 },
            ];
        return [
          ...welcome,
          {
            text: '🔓 hidden commands unlocked: snake 🐍 · duel 🎯 — type "help"',
            cls: 't-ok',
            id: Date.now() + Math.random(),
          },
        ];
      });
      addTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    };

    window.addEventListener('jun:unlock-eggs', handleUnlock);
    return () => window.removeEventListener('jun:unlock-eggs', handleUnlock);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      if (document.getElementById('snakeBackdrop')?.classList.contains('open')) return;
      if (document.getElementById('duelBackdrop')?.classList.contains('open')) return;
      if (e.key === '`' || e.key === '~') {
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        toggleTerminal();
      } else if (e.key === 'Escape' && open) {
        closeTerminal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  const scrollSec = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCommand = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    historyRef.current.unshift(trimmed);
    hIdxRef.current = -1;

    const cmd = trimmed.toLowerCase();
    const cmdEcho = { text: trimmed, cls: 't-cmd', id: Date.now() + Math.random() };

    if (cmd === 'clear') {
      setLines([]);
      return;
    }

    const newOutputs = [];
    let counter = 1;
    const print = (text, cls = 't-out') => {
      newOutputs.push({ text, cls, id: Date.now() + counter++ });
    };

    const commands = {
      help() {
        print('available commands:', 't-acc');
        print('  about        who is jun?');
        print('  skills       list the stack');
        print('  projects     list projects');
        print('  contact      jump to the contact section');
        print('  theme        toggle light / dark mode');
        print('  whoami       identity check');
        print('  ls           list files (sure)');
        print('  clear        clear the terminal');
        print('  sudo hire-jun  try it 😏');
        print('  konami       🎮 enter the konami code', 't-acc');
        if (window.junEggsUnlocked) {
          print('  snake          🐍 launch packet snake', 't-ok');
          print('  duel           🎯 beat the server', 't-ok');
        }
      },
      whoami() {
        print('jun fenequito — junior web developer, BS Information Technology.', 't-ok');
        print('front end by day, networks and security by curiosity.', 't-out');
      },
      about() {
        print('learning and improving every day. building useful,', 't-out');
        print('well-designed projects with a good user experience.', 't-out');
        print('type "contact" if you want to talk.', 't-acc');
      },
      skills() {
        print('frontend : React · Tailwind CSS · JavaScript', 't-out');
        print('backend  : MongoDB · Supabase · Firebase · Blynk', 't-out');
        print('tools    : Git · GitHub · Vite · Vercel', 't-out');
        print('now      : Cybersecurity · Networking · Kali Linux', 't-acc');
      },
      projects() {
        print('01 TideTrace        — live', 't-out');
        print('02 Full MERN Task   — live', 't-out');
        print('03 Dagyang App      — figma wireframe', 't-out');
        print('04 We Tell          — figma prototype', 't-out');
        print('05 Portfolio v1     — live', 't-out');
        print('scroll down to see them all ↓', 't-acc');
      },
      contact() {
        print('opening contact section…', 't-ok');
        addTimeout(() => scrollSec('contact'), 300);
      },
      theme() {
        if (typeof onToggleTheme === 'function') {
          onToggleTheme();
        } else {
          document.getElementById('themeToggle')?.click();
        }
        print('theme toggled.', 't-ok');
      },
      ls() {
        print('about/   projects/   skills/   contact.md   secrets/  ', 't-out');
        print('(secrets is empty. nice try.)', 't-out');
      },
      clear() {
        setLines([]);
      },
      'sudo hire-jun'() {
        print('access granted. initializing recruitment protocol…', 't-ok');
        print('📧 haxme26@gmail.com — opening contact section…', 't-acc');
        addTimeout(() => scrollSec('contact'), 500);
      },
      'sudo hire'() {
        commands['sudo hire-jun']();
      },
      konami() {
        print('↑↑↓↓←→←→BA accepted. old school. 🎮', 't-ok');
        addTimeout(() => {
          window.dispatchEvent(new CustomEvent('jun:konami'));
        }, 400);
      },
      snake() {
        if (!window.junEggsUnlocked) {
          print('command not found: snake', 't-err');
          return;
        }
        print('launching packet snake… 🐍', 't-ok');
        addTimeout(() => {
          window.dispatchEvent(new CustomEvent('jun:launch-snake'));
        }, 350);
      },
      duel() {
        if (!window.junEggsUnlocked) {
          print('command not found: duel', 't-err');
          return;
        }
        print('beat the server… 🎯', 't-ok');
        addTimeout(() => {
          window.dispatchEvent(new CustomEvent('jun:launch-duel'));
        }, 350);
      },
    };

    if (commands[cmd]) {
      commands[cmd]();
    } else {
      print(`command not found: ${trimmed} — type "help"`, 't-err');
    }

    setLines((prev) => [...prev, cmdEcho, ...newOutputs]);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      const val = inputVal;
      setInputVal('');
      handleCommand(val);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hIdxRef.current < historyRef.current.length - 1) {
        hIdxRef.current++;
        setInputVal(historyRef.current[hIdxRef.current]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIdxRef.current > 0) {
        hIdxRef.current--;
        setInputVal(historyRef.current[hIdxRef.current]);
      } else {
        hIdxRef.current = -1;
        setInputVal('');
      }
    }
  };

  return (
    <>
      <button
        className="term-trigger"
        id="termTrigger"
        aria-label="Open terminal"
        onClick={toggleTerminal}
      >
        ›_
      </button>

      <div className={`terminal ${open ? 'open' : ''}`} id="terminal" aria-hidden={!open}>
        <div className="term-head">
          <i></i>
          <i></i>
          <i></i>
          <span>jun@portfolio — bash</span>
          <button id="termClose" aria-label="Close terminal" onClick={closeTerminal}>
            ✕
          </button>
        </div>

        <div className="term-body" id="termBody" ref={bodyRef}>
          {lines.map((item) => (
            <div key={item.id} className={item.cls}>
              {item.text}
            </div>
          ))}
        </div>

        <div className="term-input">
          <span className="p">jun@portfolio:~$</span>
          <input
            ref={inputRef}
            id="termInput"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
            spellCheck="false"
            aria-label="Terminal input"
          />
        </div>
      </div>
    </>
  );
}
