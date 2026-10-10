export const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
];

export const SPY_IDS = ['home', 'about', 'skills', 'projects', 'contact'];

export const CONTACT = {
  email: 'haxme26@gmail.com',
  phone: '09673567745',
  github: 'https://github.com/FenequitoJun',
  githubUser: 'FenequitoJun',
  linkedin: 'https://www.linkedin.com/in/jun-fenequito',
  linkedinUser: 'Jun Fenequito',
};

export const ABOUT_CARDS = [
  {
    span: 8,
    title: "Hello, I'm Jun",
    desc: 'I am learning and improving every day. I am interested in creating useful projects, well-designed and that offer a good user experience. Currently pursuing my BS in Information Technology, I love living at the intersection of clean front-end design and the systems that power it behind the scenes.',
    icon: 'user',
  },
  {
    span: 4,
    accent: true,
    title: 'Always Growing',
    desc: 'Every project is a chance to level up — from pixel-perfect UI to solid fundamentals.',
    icon: 'check',
  },
  {
    span: 4,
    title: 'Front-End Focus',
    desc: 'Component-driven, responsive layouts with attention to detail.',
    icon: 'code',
  },
  {
    span: 4,
    title: 'Network Curious',
    desc: 'Exploring how the web actually connects — routing, security, infrastructure.',
    icon: 'globe',
  },
  {
    span: 4,
    title: 'Team Player',
    desc: 'I enjoy collaborating, sharing knowledge, and building together.',
    icon: 'users',
  },
];

export const SKILL_GROUPS = [
  {
    span: 6,
    title: 'Frontend',
    desc: 'Building responsive, component-driven interfaces.',
    skills: ['React', 'Tailwind CSS', 'JavaScript'],
    note: '// JSX · hooks · responsive design',
    icon: 'code',
  },
  {
    span: 6,
    title: 'Backend',
    desc: 'APIs, databases, and IoT integrations.',
    skills: ['MongoDB', 'Supabase', 'Firebase', 'Blynk'],
    note: '// realtime data · auth · IoT dashboards',
    icon: 'database',
  },
  {
    span: 6,
    title: 'Tools',
    desc: 'From version control to deployment.',
    skills: ['Git', 'GitHub', 'Vite', 'Vercel'],
    note: '// commit → push → deploy 🚀',
    icon: 'tool',
  },
  {
    span: 6,
    accent: true,
    title: 'Currently Exploring',
    desc: 'Cybersecurity fundamentals & networking with Cisco Packet Tracer — now hands-on with Kali Linux.',
    skills: ['🔐 Security', '🌐 Networking', '🐧 Kali Linux'],
    icon: 'shield',
  },
];

export const PROJECTS = [
  {
    title: 'TideTrace',
    span: 7,
    status: 'live',
    statusText: '● LIVE',
    shot: '/tide-trace.jpg',
    desc: 'An online ecosystem for ecological awareness, collective care, and community-powered ecosystem conservation.',
    tags: ['React', 'Vite', 'Node', 'Supabase', 'Maps'],
    links: [
      { label: 'Live Demo ↗', href: 'https://tide-trace.vercel.app/' },
      { label: 'Source Code ↗', href: 'https://github.com/FenequitoJun' },
    ],
    case: {
      problem: 'Coastal communities in the Visayas track clean-ups and reef sightings in scattered group chats — nothing is archived, verified, or measurable, so the real impact of small acts stays invisible.',
      approach: 'I designed and built a community-powered web app where anyone can log a "trace" — a sighting, clean-up, or story — verify others\' traces, and see monthly impact stats. I handled the full cycle: UX flows, front-end architecture, and deployment to Vercel.',
      learned: 'Designing for low-friction data entry, thinking about trust systems through community verification, and shipping a real product end-to-end instead of stopping at a demo.',
    },
  },
  {
    title: 'Full MERN Task',
    span: 5,
    status: 'live',
    statusText: '● LIVE',
    shot: '/mern-task.jpg',
    desc: 'A full-stack task manager built on the MERN stack — CRUD operations, persistent data, and a clean task workflow.',
    tags: ['MongoDB', 'Express', 'React', 'Node.js'],
    links: [
      { label: 'Live Demo ↗', href: 'https://awesometodotask.onrender.com/' },
      { label: 'Source Code ↗', href: 'https://github.com/FenequitoJun' },
    ],
    skeletonVariant: 'mern',
    case: {
      problem: 'I needed to understand the full request cycle — not just rendering UI, but how data actually travels from a form to a database and back.',
      approach: 'Built a task manager on the MERN stack: React front-end, Express REST API, MongoDB persistence. Implemented full CRUD with proper loading and error states and a clean component structure.',
      learned: 'How REST conventions map to UI actions, environment-based configuration, and how much easier state management gets when the API is designed around the UI\'s needs.',
    },
  },
  {
    title: 'Dagyang App',
    span: 5,
    status: 'proto',
    statusText: 'FIGMA WIREFRAME',
    shot: null,
    desc: 'An Itinerary plan for tourist users.',
    tags: ['Figma', 'Wireframe', 'UX/UI'],
    links: [
      {
        label: 'View on Figma ↗',
        href: 'https://www.figma.com/design/6VCuum000EhwclADlWQKkt/Dagyang-App--Wireframe-?node-id=0-1&t=KEMgk7RmZJZtIQiU-0',
      },
    ],
    figmaType: 'dagyang',
    case: {
      problem: 'Turning a rough idea for a community mobile app into a flow that actually makes sense — before writing a single line of code.',
      approach: 'Designed the full wireframe set in Figma — every screen, state, and transition — then connected them into a clickable prototype so the flow could be tested with real navigation instead of static screenshots.',
      learned: 'Prototyping early saves weeks later: most of my layout mistakes happened on the Figma canvas, where fixing them costs nothing.',
    },
  },
  {
    title: 'We Tell',
    span: 7,
    status: 'proto',
    statusText: 'FIGMA PROTOTYPE',
    shot: null,
    desc: 'Student Schedule Notification.',
    tags: ['Figma', 'Prototype', 'UX/UI'],
    links: [
      {
        label: 'View Prototype ↗',
        href: 'https://www.figma.com/proto/yLmCi5P8qbLvMfbeY1tgGu/Untitled?node-id=76-119&p=f&t=izxNq8FczjOvKJKw-0&scaling=scale-down&content-scaling=fixed&page-id=0%3A1',
      },
    ],
    figmaType: 'wetell',
    case: {
      problem: 'Exploring how a story-driven mobile experience should pace its content — where polish matters as much as structure.',
      approach: 'Built an interactive Figma prototype with scaled, fixed-size screens and clickable transitions, iterating on spacing and flow until the narrative felt natural to step through.',
      learned: 'Content-scaling decisions, prototype-level micro-interactions, and how to give a static design the feeling of motion before any code exists.',
    },
  },
  {
    title: 'My Old Portfolio (v1)',
    span: 12,
    status: 'live',
    statusText: '● LIVE',
    shot: '/old-portfolio.jpg',
    desc: 'The first version of my developer portfolio — where this journey started. A look back at how far the design and the code have come since.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Vercel'],
    links: [
      { label: 'Live Demo ↗', href: 'https://portfoliov1-umber.vercel.app/' },
      { label: 'Source Code ↗', href: 'https://github.com/FenequitoJun' },
    ],
    skeletonVariant: 'old',
    case: {
      problem: 'I had no web presence at all — and no idea how much I would improve in a single year.',
      approach: 'Built my first complete site from scratch: layout, sections, responsiveness, deployment. No frameworks, no templates — just fundamentals.',
      learned: 'Everything in v2 is measured against v1. Keeping it online shows exactly how far the design sense and the code have come — which is kind of the point.',
    },
  },
];

export const TIMELINE = [
  {
    year: '2025',
    title: 'Vanilla Coding',
    desc: 'Learning curve of HTML, CSS and JavaScript.',
  },
  {
    year: '2025',
    title: 'Learning JavaScript',
    desc: 'Introduction to web development and good practices. Creation of my first projects and JavaScript basics.',
  },
  {
    year: '2026',
    title: 'Front-End Development — Personal Portfolio',
    desc: 'Development of my web portfolio using React, CSS, JSX, and Vite.',
  },
  {
    year: '2026',
    title: 'Introduction to Cybersecurity',
    desc: 'Exploring security fundamentals, threat awareness, and safe development practices.',
  },
  {
    year: '2026',
    title: 'Networking Fundamentals',
    desc: 'Learning the fundamentals of networking using Cisco Packet Tracer.',
  },
];

export const ROLES = [
  'BS Information Technology',
  'Front End Developer',
  'Junior Web Developer',
  'Junior Network Engineer',
];
