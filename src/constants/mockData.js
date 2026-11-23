// DoneStack Initial Sample Data & Constants

export const MOTIVATIONAL_QUOTES = [
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    category: "Action"
  },
  {
    quote: "Focus is a muscle. Ticksy is your gym.",
    author: "Productivity Manifesto",
    category: "Focus"
  },
  {
    quote: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
    category: "Growth"
  },
  {
    quote: "You don't need more time, you just need to decide.",
    author: "Seth Godin",
    category: "Decisiveness"
  },
  {
    quote: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
    category: "Momentum"
  },
  {
    quote: "Either you run the day, or the day runs you.",
    author: "Jim Rohn",
    category: "Mastery"
  }
];

export const DEFAULT_USER_PROJECT = {
  id: 'proj-general',
  name: 'General Tasks',
  description: 'Default project for everyday tasks, habits, and priorities',
  color: '#6366f1', // Indigo
  icon: 'folder',
  isDefault: true
};

export const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Product Launch 2.0',
    description: 'Q4 flagship release and marketing rollout',
    color: '#6366f1', // Indigo
    icon: 'rocket'
  },
  {
    id: 'proj-2',
    name: 'Design System & UI',
    description: 'Component library, design tokens, and accessibility',
    color: '#06b6d4', // Cyan
    icon: 'palette'
  },
  {
    id: 'proj-3',
    name: 'Personal Growth',
    description: 'Daily habits, reading, fitness, and deep work',
    color: '#10b981', // Emerald
    icon: 'heart'
  },
  {
    id: 'proj-4',
    name: 'Architecture & DevOps',
    description: 'Supabase RLS, Vercel deployments, CI/CD',
    color: '#f59e0b', // Amber
    icon: 'layers'
  }
];

// Helper to format local date string for today and upcoming days
const getOffsetDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_TODOS = [
  {
    id: 'todo-1',
    title: 'Deploy Ticksy frontend to Vercel',
    description: 'Connect GitHub repository to Vercel, configure production environment variables for Supabase, and trigger first production build.',
    completed: false,
    priority: 'urgent',
    due_date: getOffsetDate(0), // Today
    due_time: '14:00',
    project_id: 'proj-4',
    tags: ['Deployment', 'Vercel', 'DevOps']
  },
  {
    id: 'todo-2',
    title: 'Configure Supabase authentication & RLS policies',
    description: 'Run the supabase_schema.sql script in Supabase SQL editor to create todos and projects tables with row-level security enabled.',
    completed: true,
    priority: 'high',
    due_date: getOffsetDate(0), // Today
    due_time: '10:30',
    project_id: 'proj-4',
    tags: ['Supabase', 'Security', 'Database']
  },
  {
    id: 'todo-3',
    title: 'Polish interactive calendar view and date filters',
    description: 'Ensure clicking any date on the calendar dynamically renders tasks due on that day with quick task creation.',
    completed: false,
    priority: 'high',
    due_date: getOffsetDate(1), // Tomorrow
    due_time: '16:00',
    project_id: 'proj-2',
    tags: ['UI', 'Calendar', 'Interactivity']
  },
  {
    id: 'todo-4',
    title: 'Design high-converting Landing Page hero section',
    description: 'Add animated motivational quote ticker, glassmorphic preview cards, and smooth benefit cards.',
    completed: true,
    priority: 'medium',
    due_date: getOffsetDate(-1), // Yesterday
    due_time: '11:00',
    project_id: 'proj-1',
    tags: ['Design', 'Landing', 'Hero']
  },
  {
    id: 'todo-5',
    title: 'Read 30 pages of "Atomic Habits"',
    description: 'Focus on habit stacking and environmental cues for sustained high focus.',
    completed: false,
    priority: 'low',
    due_date: getOffsetDate(2), // 2 days ahead
    due_time: '20:00',
    project_id: 'proj-3',
    tags: ['Habits', 'Wellness']
  },
  {
    id: 'todo-6',
    title: 'Write comprehensive README with Supabase & Vercel deployment guide',
    description: 'Provide clear step-by-step documentation for cloning, setting up Supabase credentials, and deploying to Vercel.',
    completed: false,
    priority: 'medium',
    due_date: getOffsetDate(3),
    due_time: '12:00',
    project_id: 'proj-1',
    tags: ['Docs', 'OpenSource']
  }
];

export const PRIORITY_CONFIG = {
  urgent: {
    label: 'Urgent',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)'
  },
  high: {
    label: 'High',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.3)'
  },
  medium: {
    label: 'Medium',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.15)',
    border: 'rgba(99, 102, 241, 0.3)'
  },
  low: {
    label: 'Low',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.3)'
  }
};
