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
