import type { Designer, PortfolioItem, ActiveProject, ChatMessage, JobListing, Proposal, WalletTransaction, Dispute } from '../types';

export const MOCK_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'p1',
    title: 'NeuraAI Studio — Next-Gen AI Workflow Platform',
    category: 'SaaS',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    description: 'Dark-mode glassmorphic interface for generative AI canvas editing and real-time model telemetry.',
    likes: 1240,
    views: 18400,
    tags: ['React', 'Framer Motion', 'Glassmorphism', 'AI UI'],
    colorPalette: ['#0f172a', '#6366f1', '#06b6d4', '#ec4899'],
    clientName: 'Neura Labs Inc.',
    metrics: '+340% User Engagement, $4.2M Seed Round',
    liveUrl: 'https://neura-ai-demo.example.com'
  },
  {
    id: 'p2',
    title: 'Veloce Mobility — Electric Supercar Companion App',
    category: 'Mobile App',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    description: 'Futuristic iOS telemetry, telemetry HUD, remote climate, and telemetry battery route planner.',
    likes: 980,
    views: 14200,
    tags: ['iOS 18', 'SwiftUI', '3D HUD', 'Automotive'],
    colorPalette: ['#030712', '#10b981', '#3b82f6', '#f59e0b'],
    clientName: 'Veloce Motors',
    metrics: '#1 Trending App on App Store Design Category',
    liveUrl: 'https://veloce-demo.example.com'
  },
  {
    id: 'p3',
    title: 'Krypton Pay — Cross-Border DeFi Vault & Wallet',
    category: 'Fintech',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    description: 'Cyberpunk inspired multi-chain yield optimizer, instant swap interface, and smart contract audit viewer.',
    likes: 1650,
    views: 22100,
    tags: ['Web3', 'Cyberpunk', 'Fintech', 'Tailwind'],
    colorPalette: ['#09090b', '#a855f7', '#06b6d4', '#10b981'],
    clientName: 'Krypton Labs',
    metrics: '$180M TVL Locked in First 30 Days',
    liveUrl: 'https://krypton-pay.example.com'
  },
  {
    id: 'p4',
    title: 'Aura Health — Mindful Biometric OS & Watch App',
    category: 'AI Studio',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    description: 'Minimalist ambient health dashboard tracking HRV, circadian sleep curves, and focus state score.',
    likes: 870,
    views: 11900,
    tags: ['Healthtech', 'Apple Watch', 'Minimal', 'Typography'],
    colorPalette: ['#0c0a09', '#f97316', '#fbbf24', '#38bdf8'],
    clientName: 'Aura Systems',
    metrics: 'Acquired by HealthCo for $14M',
    liveUrl: 'https://aura-health.example.com'
  },
  {
    id: 'p5',
    title: 'Orbit Commerce — 3D Spatial E-Commerce Store',
    category: 'E-commerce',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
    description: 'Immersive WebGL storefront with interactive 3D product view, AR try-on, and 1-click Apple Pay.',
    likes: 2150,
    views: 31000,
    tags: ['Three.js', 'R3F', 'E-Commerce', 'WebGL'],
    colorPalette: ['#020617', '#e11d48', '#8b5cf6', '#38bdf8'],
    clientName: 'Orbit Brand',
    metrics: '+88% Checkout Conversion Rate',
    liveUrl: 'https://orbit-shop.example.com'
  },
  {
    id: 'p6',
    title: 'HyperDesign System v4.0 — Multi-Brand UI Kit',
    category: 'Design System',
    image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80',
    description: 'Comprehensive Figma & React tokenized component system with 400+ accessible components.',
    likes: 1430,
    views: 19500,
    tags: ['Figma Tokens', 'React', 'Storybook', 'Accessibility'],
    colorPalette: ['#0f172a', '#4f46e5', '#0ea5e9', '#f43f5e'],
    clientName: 'Enterprise SaaS Collective',
    metrics: 'Adopted by 50+ Product Teams Worldwide',
    liveUrl: 'https://hyperdesign-docs.example.com'
  }
];

export const MOCK_DESIGNERS: Designer[] = [
  {
    id: 'des-1',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    title: 'Staff Product Designer & 3D Interactive Specialist',
    bio: 'Ex-Linear & Stripe lead designer with 9+ years experience crafting iconic dark-mode Web & Mobile interfaces. Specialized in 3D WebGL interactions and high-conversion SaaS products.',
    location: 'San Francisco, CA (PST)',
    hourlyRate: 140,
    rating: 4.99,
    reviewCount: 54,
    experienceYears: 9,
    specialties: ['SaaS UI/UX', '3D WebGL', 'Design Systems', 'Framer'],
    availability: 'Available Now',
    badge: 'Top 1%',
    stats: {
      completedProjects: 68,
      jobSuccessRate: 100,
      repeatClients: 92,
      responseTime: '< 30 mins'
    },
    socials: {
      dribbble: 'dribbble.com/elenarostova',
      twitter: 'x.com/elena_design',
      website: 'elenarostova.design'
    },
    portfolioItems: [MOCK_PORTFOLIO_ITEMS[0], MOCK_PORTFOLIO_ITEMS[4], MOCK_PORTFOLIO_ITEMS[5]],
    reviews: [
      {
        id: 'r1',
        clientName: 'Marcus Vance',
        clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        company: 'CEO @ Neura Labs',
        rating: 5,
        date: '2 weeks ago',
        text: 'Elena redesigned our entire SaaS interface in under 3 weeks. Her attention to motion details and 3D micro-interactions blew our investors away. Worth every single penny!',
        projectTitle: 'NeuraAI Studio Platform Redesign'
      },
      {
        id: 'r2',
        clientName: 'Sarah Lin',
        clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        company: 'VP Product @ Orbit',
        rating: 5,
        date: '1 month ago',
        text: 'Working with Elena felt like having an elite design team in-house. Super fast, flawless Figma tokens, and delivered ahead of schedule.',
        projectTitle: 'Orbit 3D E-Commerce Design'
      }
    ],
    packages: [
      {
        id: 'pkg-1',
        name: 'Landing Page & Brand Sprint',
        price: 3800,
        duration: '5 Days',
        description: 'Complete high-converting dark-mode landing page design + interactive 3D hero mockup + Framer build.',
        features: [
          'Full Figma file with auto-layout',
          'Interactive Framer / React component export',
          '3D Spline / R3F hero asset',
          'Mobile & Tablet responsive layouts',
          '2 Rounds of revisions'
        ],
        popular: true
      },
      {
        id: 'pkg-2',
        name: 'Full Product MVP Design',
        price: 8500,
        duration: '2-3 Weeks',
        description: 'End-to-end web & mobile product design from user flows to production design system.',
        features: [
          'Up to 15 core web/mobile screens',
          'Complete Figma Design System tokens',
          'Interactive prototype in Figma',
          'Developer handoff & spec sheet',
          'Weekly sync & async video updates'
        ]
      },
      {
        id: 'pkg-3',
        name: 'Monthly Design Co-Pilot',
        price: 12000,
        duration: '1 Month Retainer',
        description: 'Dedicated senior design lead for ongoing feature drops, marketing assets, and design system iteration.',
        features: [
          'Priority 24/7 Slack channel access',
          'Unlimited design requests queued',
          'Daily async Loom updates',
          'Weekly design syncs',
          'Direct developer pairing'
        ]
      }
    ]
  },
  {
    id: 'des-2',
    name: 'Julian Vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    title: 'Principal Mobile UI Architect & iOS Specialist',
    bio: 'Former Apple Design Award winner crafting sleek automotive HUDs, mobile fintech apps, and iOS 18 spatial experiences.',
    location: 'Berlin, Germany (CET)',
    hourlyRate: 160,
    rating: 4.98,
    reviewCount: 42,
    experienceYears: 11,
    specialties: ['iOS Mobile App', 'Fintech UI', 'Automotive HUD', 'SwiftUI'],
    availability: 'Available Now',
    badge: 'Pro Elite',
    stats: {
      completedProjects: 52,
      jobSuccessRate: 99,
      repeatClients: 88,
      responseTime: '< 1 hour'
    },
    socials: {
      dribbble: 'dribbble.com/julianvance',
      twitter: 'x.com/julian_ios'
    },
    portfolioItems: [MOCK_PORTFOLIO_ITEMS[1], MOCK_PORTFOLIO_ITEMS[2]],
    reviews: [
      {
        id: 'r3',
        clientName: 'Alexander Kraft',
        clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
        company: 'CTO @ Veloce',
        rating: 5,
        date: '3 weeks ago',
        text: 'Julian crafted an unbelievable mobile HUD for our electric vehicles. Incredible UX accuracy and micro-animations.',
        projectTitle: 'Veloce Telemetry App'
      }
    ],
    packages: [
      {
        id: 'pkg-21',
        name: 'Mobile App Core Sprint',
        price: 4500,
        duration: '7 Days',
        description: 'Complete 8-screen mobile application prototype for iOS & Android.',
        features: ['iOS 18 Human Interface Guidelines compliant', 'Figma interactive prototype', 'Component library'],
        popular: true
      }
    ]
  },
  {
    id: 'des-3',
    name: 'Maya Tanaka',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    title: 'Cyberpunk & Web3 Visual Director',
    bio: 'Blending dark neon cyber aesthetics with intuitive Web3 UX. Helping crypto protocols and high-frequency trading platforms scale.',
    location: 'Tokyo, Japan (JST)',
    hourlyRate: 125,
    rating: 4.96,
    reviewCount: 38,
    experienceYears: 7,
    specialties: ['Web3 / DeFi', 'Cyberpunk UI', 'Dashboard UI', 'Branding'],
    availability: 'In 1 Week',
    badge: 'Rising Star',
    stats: {
      completedProjects: 45,
      jobSuccessRate: 98,
      repeatClients: 85,
      responseTime: '< 2 hours'
    },
    portfolioItems: [MOCK_PORTFOLIO_ITEMS[2], MOCK_PORTFOLIO_ITEMS[0]],
    reviews: [],
    packages: [
      {
        id: 'pkg-31',
        name: 'DeFi / Web3 Protocol Design',
        price: 5200,
        duration: '10 Days',
        description: 'High-density trading dashboard, wallet connection flows, and yield vault visualizer.',
        features: ['Dark cyberpunk UI system', 'Glassmorphism token set', 'Mobile responsive layouts'],
        popular: true
      }
    ]
  },
  {
    id: 'des-4',
    name: 'Liam O\'Connor',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    title: 'Design System Architect & Minimalist UI Specialist',
    bio: 'Obsessed with typography grid systems, Swiss design principles, and scalable design token architecture.',
    location: 'London, UK (GMT)',
    hourlyRate: 150,
    rating: 5.0,
    reviewCount: 61,
    experienceYears: 10,
    specialties: ['Design Systems', 'Swiss Minimalist UI', 'Healthtech', 'Figma Tokens'],
    availability: 'Available Now',
    badge: 'Master Craftsman',
    stats: {
      completedProjects: 82,
      jobSuccessRate: 100,
      repeatClients: 95,
      responseTime: '< 15 mins'
    },
    portfolioItems: [MOCK_PORTFOLIO_ITEMS[3], MOCK_PORTFOLIO_ITEMS[5]],
    reviews: [],
    packages: [
      {
        id: 'pkg-41',
        name: 'Enterprise Design Token System',
        price: 6000,
        duration: '2 Weeks',
        description: 'Complete cross-platform Figma design system with automated token export for React & React Native.',
        features: ['400+ Components', 'Dark & Light Mode variables', 'Documentation site layout'],
        popular: true
      }
    ]
  }
];

export const MOCK_ACTIVE_PROJECTS: ActiveProject[] = [
  {
    id: 'proj-101',
    title: 'NeuraAI Studio Platform Redesign',
    designerId: 'des-1',
    designerName: 'Elena Rostova',
    designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    designerTitle: 'Staff Product Designer',
    status: 'Active',
    progress: 75,
    totalBudget: 8500,
    paidAmount: 5500,
    startDate: 'Aug 01, 2026',
    deadline: 'Aug 24, 2026',
    nextDeliverable: 'Interactive 3D WebGL Canvas Component',
    milestones: [
      {
        id: 'm1',
        title: 'User Flows & Wireframes',
        description: 'Low-fi architecture and core telemetry canvas specs.',
        amount: 2500,
        dueDate: 'Aug 07',
        status: 'Completed'
      },
      {
        id: 'm2',
        title: 'Figma Hi-Fi Dark Glass System',
        description: '3D glass components, color tokens, and icon kit.',
        amount: 3000,
        dueDate: 'Aug 14',
        status: 'Completed'
      },
      {
        id: 'm3',
        title: 'Framer / R3F Prototype',
        description: 'Interactive WebGL device canvas & smooth transitions.',
        amount: 2000,
        dueDate: 'Aug 20',
        status: 'In Progress'
      },
      {
        id: 'm4',
        title: 'Developer Handoff & Docs',
        description: 'Final codebase polish, asset bundle, and video tour.',
        amount: 1000,
        dueDate: 'Aug 24',
        status: 'Upcoming'
      }
    ],
    deliverables: [
      {
        id: 'd1',
        name: 'NeuraAI_Figma_Master_v2.4.fig',
        type: 'Figma File',
        url: '#',
        updatedAt: '2 hours ago'
      },
      {
        id: 'd2',
        name: 'Live Framer 3D Prototype',
        type: 'Framer Link',
        url: '#',
        updatedAt: 'Yesterday'
      }
    ]
  }
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    senderId: 'des-1',
    senderName: 'Elena Rostova',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    text: "Hey! Just uploaded the updated 3D interactive canvas prototype for NeuraAI Milestone 3. Take a look at the subtle ambient glow when hovering over the model telemetry card!",
    timestamp: '10:42 AM',
    isClient: false,
    attachment: {
      name: 'NeuraAI_3D_Preview.mp4',
      type: 'Video Walkthrough',
      url: '#'
    }
  },
  {
    id: 'm2',
    senderId: 'client-1',
    senderName: 'You (Client)',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    text: "This looks stunning, Elena! The cyan-to-purple glass reflection on the 3D device screen is exactly what we needed. I've approved Milestone 2 payout of $3,000.",
    timestamp: '10:45 AM',
    isClient: true
  },
  {
    id: 'm3',
    senderId: 'des-1',
    senderName: 'Elena Rostova',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    text: "Thank you so much! Moving forward with the final developer handoff package now. I'll have the React Three Fiber components clean and modular for your frontend team.",
    timestamp: '10:48 AM',
    isClient: false
  }
];

export const MOCK_JOBS: JobListing[] = [];
export const MOCK_PROPOSALS: Proposal[] = [];
export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [];

export const MOCK_DISPUTES: Dispute[] = [
  {
    id: 'disp-1',
    projectId: 'proj-1',
    projectTitle: 'E-commerce Spatial Storefront',
    raisedBy: 'Orbit Client',
    against: 'Freelancer B',
    reason: 'Milestone Deadline Overdue',
    description: '3D spatial product models were delayed by 10 days without prior notice.',
    status: 'Under Arbitrage',
    amountInDispute: 2500,
    createdAt: 'Aug 09, 2026'
  }
];

export const MOCK_ADMIN_STATS = {
  totalUsers: 14250,
  freelancersCount: 9820,
  clientsCount: 4430,
  activeProjects: 1248,
  completedProjects: 8940,
  totalGMV: 4850000,
  platformRevenue: 242500,
  openDisputesCount: 3
};

export const MOCK_ANALYTICS = {
  freelancer: {
    totalEarnings: 84500,
    completedProjects: 28,
    jobSuccessRate: 98,
    profileViewsThisMonth: 1840,
    proposalConversionRate: 34,
    monthlyEarningsHistory: [
      { month: 'Mar', amount: 9200 },
      { month: 'Apr', amount: 11400 },
      { month: 'May', amount: 13800 },
      { month: 'Jun', amount: 14500 },
      { month: 'Jul', amount: 17200 },
      { month: 'Aug', amount: 18400 }
    ]
  },
  client: {
    totalSpend: 48000,
    projectsPosted: 12,
    freelancersHired: 9,
    projectCompletionRate: 95,
    monthlySpendHistory: [
      { month: 'Mar', amount: 5000 },
      { month: 'Apr', amount: 7500 },
      { month: 'May', amount: 8200 },
      { month: 'Jun', amount: 9000 },
      { month: 'Jul', amount: 11500 },
      { month: 'Aug', amount: 6800 }
    ]
  }
};

