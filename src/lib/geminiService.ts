import type { BriefInput } from '../types';

export interface SampleTemplate {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  ideaText: string;
  projectTypes: string[];
  businessIndustry: string;
  suggestedFeatures: string[];
  stylePreference: string;
  targetAudience: string;
  budget: string;
  timeline: string;
  requiredRoles: string[];
}

export const SAMPLE_PROJECT_TEMPLATES: SampleTemplate[] = [
  {
    id: 'tmpl-restaurant',
    title: 'Restaurant & Online Food Ordering Website',
    category: 'Food & Hospitality',
    icon: '🍕',
    description: 'Modern food website with interactive menu, online cart ordering, table booking & location map.',
    ideaText: 'I want to create a modern website for my fast-food & dine-in restaurant where customers can browse our digital food menu, order food online for delivery or pickup, reserve tables, and view our location & store hours.',
    projectTypes: ['Restaurant / Food Website', 'Website', 'E-commerce Store'],
    businessIndustry: 'Restaurant',
    suggestedFeatures: ['Home page', 'Menu management', 'Online food ordering', 'Shopping cart', 'Online payments', 'Booking system', 'Maps / location', 'Admin dashboard'],
    stylePreference: 'Dark & Modern Cyberpunk',
    targetAudience: 'Local restaurant customers, food lovers & online delivery users',
    budget: '₹25,000 – ₹50,000 ($300 - $600)',
    timeline: '2 - 3 Weeks',
    requiredRoles: ['Full Stack Developer', 'UI/UX Designer', 'WordPress / Web Developer'],
  },
  {
    id: 'tmpl-ecommerce',
    title: 'Online Clothing & Fashion Store',
    category: 'E-commerce & Retail',
    icon: '🛍️',
    description: 'Full-featured online store with product catalog, cart checkout, payment gateway & order tracking.',
    ideaText: 'I want an online apparel store where customers can browse clothing collections, select sizes and colors, add products to cart, make secure online payments via card or UPI, and track their order status.',
    projectTypes: ['E-commerce Store', 'Shopify Store', 'Website'],
    businessIndustry: 'E-commerce',
    suggestedFeatures: ['Home page', 'Product catalog', 'Shopping cart', 'Online payments', 'User accounts', 'Order management', 'Search & Filters', 'Customer Reviews'],
    stylePreference: 'Minimal & Luxury',
    targetAudience: 'Fashion shoppers, Gen Z & young professionals',
    budget: '₹50,000 – ₹1,00,000 ($600 - $1,200)',
    timeline: '3 - 4 Weeks',
    requiredRoles: ['Shopify Developer', 'Web Developer', 'UI/UX Designer'],
  },
  {
    id: 'tmpl-portfolio',
    title: 'Photography & Creative Studio Portfolio',
    category: 'Personal Brand & Creative',
    icon: '📸',
    description: 'High-impact gallery portfolio with package pricing, client testimonials & inquiry contact form.',
    ideaText: 'I need a portfolio website for my wedding & commercial photography studio featuring full-screen image galleries, service pricing packages, client reviews, and a booking inquiry form.',
    projectTypes: ['Portfolio', 'Website', 'Landing Page'],
    businessIndustry: 'Personal Brand',
    suggestedFeatures: ['Home page', 'About page', 'Gallery', 'Package pricing', 'Testimonials', 'Contact form', 'Instagram Integration'],
    stylePreference: 'Minimal & Elegant',
    targetAudience: 'Wedding planners, couples, & corporate brand clients',
    budget: 'Under ₹25,000 ($300)',
    timeline: '1 - 2 Weeks',
    requiredRoles: ['Frontend Developer', 'UI/UX Designer'],
  },
  {
    id: 'tmpl-saas',
    title: 'SaaS Generative AI Dashboard & API Hub',
    category: 'Technology & AI',
    icon: '🤖',
    description: 'High-density web dashboard with LLM canvas, subscription management & real-time telemetry.',
    ideaText: 'I want to build a B2B SaaS web application where users can log in, choose an AI model workflow, generate content on a visual node canvas, and manage API keys and monthly billing subscriptions.',
    projectTypes: ['SaaS Product', 'Web Application', 'AI / ML Application'],
    businessIndustry: 'SaaS',
    suggestedFeatures: ['User accounts', 'Admin dashboard', 'Online payments', 'Analytics telemetry', 'API key manager', 'Live chat', 'Notifications'],
    stylePreference: 'Dark Cyberpunk Glass',
    targetAudience: 'Tech founders, developers, & enterprise SaaS teams',
    budget: '₹1,00,000+ ($1,500+)',
    timeline: '1 - 2 Months',
    requiredRoles: ['Full Stack Developer', 'AI/ML Developer', 'UI/UX Designer'],
  },
  {
    id: 'tmpl-fitness',
    title: 'Mobile Fitness & Biometric Workout App',
    category: 'Mobile iOS & Android',
    icon: '📱',
    description: 'Native mobile app tracking workout routines, calorie telemetry, sleep graphs & push notifications.',
    ideaText: 'I need an iOS and Android mobile app for gym members to log daily workouts, track heart rate & calorie burn, receive daily push reminders, and follow trainer video walkthroughs.',
    projectTypes: ['Mobile Application', 'Software / Tool'],
    businessIndustry: 'Fitness',
    suggestedFeatures: ['User accounts', 'Workout tracking', 'Push Notifications', 'Video streaming', 'Biometric telemetry', 'Social sharing'],
    stylePreference: 'Vibrant & Modern',
    targetAudience: 'Gym enthusiasts, athletes, & health-conscious users',
    budget: '₹50,000 – ₹1,00,000 ($600 - $1,200)',
    timeline: '1 Month',
    requiredRoles: ['Mobile Developer', 'UI/UX Designer'],
  },
];

/**
 * Generate 3 smart clarification questions tailored to the project idea.
 */
export async function generateClarificationQuestions(ideaText: string, projectType: string, industry: string): Promise<string[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert technical product manager for a freelancing platform. A client provided this project idea: "${ideaText}", Type: "${projectType}", Industry: "${industry}". Generate 3 concise, highly useful clarifying questions (e.g. asking about online payments, user login, table booking, or delivery integrations) to clarify their requirements. Return ONLY a JSON array of 3 strings.`
            }]
          }]
        })
      });

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleanedText = text.replace(/```json|```/g, '').trim();
        const questions = JSON.parse(cleanedText);
        if (Array.isArray(questions) && questions.length > 0) {
          return questions.slice(0, 4);
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, using intelligent fallback rule engine.', e);
    }
  }

  // Fallback Rule Engine if API Key is not configured or fails
  const lower = (ideaText + ' ' + projectType + ' ' + industry).toLowerCase();
  if (lower.includes('restaurant') || lower.includes('food') || lower.includes('dine')) {
    return [
      'Do you need online food ordering with cart & instant payments?',
      'Would you like an interactive table reservation / booking calendar?',
      'Do you need an admin panel to update daily menu items and pricing?'
    ];
  }

  if (lower.includes('store') || lower.includes('shop') || lower.includes('e-commerce') || lower.includes('clothing')) {
    return [
      'Do you need multi-currency payment gateway support (Credit Card, UPI, PayPal)?',
      'Should customers be able to create accounts and track shipping orders?',
      'Do you require inventory management and stock alerts for items?'
    ];
  }

  if (lower.includes('hotel') || lower.includes('booking') || lower.includes('travel')) {
    return [
      'Do guests need to check room availability and book dates online?',
      'Do you want automatic email / WhatsApp confirmation receipts sent to guests?',
      'Do you require a gallery tour of rooms & amenity packages?'
    ];
  }

  if (lower.includes('app') || lower.includes('mobile') || lower.includes('saas')) {
    return [
      'Do you need user authentication (Google Sign-In, Email, Magic Link)?',
      'Will you require monthly subscription billing (Stripe / Razorpay)?',
      'Do you need an analytics dashboard to track active user metrics?'
    ];
  }

  return [
    'Do customers or users need to register for accounts on the platform?',
    'Do you require an online payment gateway integration?',
    'Do you need an admin control dashboard to manage content and users?'
  ];
}

/**
 * Structure raw brief data into a clean AI interpretation summary.
 */
export function structureProjectBrief(input: BriefInput) {
  const primaryType = input.projectTypes[0] || 'Custom Project';
  const industry = input.businessIndustry || 'General Business';
  
  const extractedFeatures = [
    ...input.selectedFeatures,
    ...(input.customFeatures ? [input.customFeatures] : [])
  ];

  const objective = input.rawIdea.trim()
    ? `Develop a high-performance ${primaryType} tailored for the ${industry} sector, fulfilling client goals for ${input.targetAudience || 'target audience'}.`
    : `Build a custom ${primaryType} tailored for ${industry}.`;

  const suggestedRoles = input.requiredRoles.length > 0
    ? input.requiredRoles
    : ['Full Stack Developer', 'UI/UX Designer'];

  return {
    objective,
    keyFeatures: extractedFeatures.length > 0 ? extractedFeatures : ['Modern Responsive Interface', 'Contact & Inquiry System'],
    suggestedRoles,
    designDirection: input.stylePreference + (input.customStyleDetails ? ` (${input.customStyleDetails})` : ''),
    targetAudience: input.targetAudience || 'General Public & Clients',
    aiClarifications: input.clarificationAnswers
      ? Object.entries(input.clarificationAnswers).map(([question, answer]) => ({ question, answer }))
      : []
  };
}
