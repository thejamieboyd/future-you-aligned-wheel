import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Info, 
  Target, 
  Sparkles, 
  Briefcase, 
  FileText, 
  Check, 
  CheckCircle, 
  Mail, 
  Printer, 
  AlertTriangle, 
  TrendingUp, 
  HelpCircle, 
  Lightbulb, 
  Compass, 
  BookmarkCheck,
  User,
  ExternalLink,
  X
} from 'lucide-react';
import { CategoryData, ReflectionData } from './types';

// Default presets for the sectors
const DEFAULT_LIFE_SECTORS = [
  'Physical Health',
  'Mental & Emotional Health',
  'Finance & Wealth',
  'Business & Career',
  'Romance & Partnership',
  'Family & Friends',
  'Personal Growth & Learning',
  'Fun, Recreation & Play',
  'Physical Environment (Home)'
];

const DEFAULT_BUSINESS_SECTORS = [
  'Vision, Strategy & Plan',
  'Marketing & Brand Visibility',
  'Sales & Client Acquisition',
  'Product / Service Quality',
  'Operations & Systems',
  'Financial Health & Cashflow',
  'Team & Company Culture',
  'Customer Success & Support',
  'Founder Personal Alignment'
];

type StepId = 
  | 'welcome' 
  | 'category-select' 
  | 'satisfaction' 
  | 'importance' 
  | 'visualization' 
  | 'analysis' 
  | 'reflection' 
  | 'final-report';

interface StepItem {
  id: StepId;
  label: string;
  shortLabel: string;
  description: string;
}

const STEPS: StepItem[] = [
  { id: 'welcome', label: 'Welcome', shortLabel: 'Start', description: 'Introduction to Alignment' },
  { id: 'category-select', label: 'Choose Wheel', shortLabel: 'Setup', description: 'Select & Customize Sectors' },
  { id: 'satisfaction', label: 'Rate Satisfaction', shortLabel: 'Satisfaction', description: 'How do you feel today? (1-10)' },
  { id: 'importance', label: 'Define Importance', shortLabel: 'Importance', description: 'What matters in the next 90 days? (1-10)' },
  { id: 'visualization', label: 'Visual Wheel', shortLabel: 'Visual', description: 'Satisfaction vs Importance' },
  { id: 'analysis', label: 'Gap Analysis', shortLabel: 'Gaps', description: 'Identify Friction Areas' },
  { id: 'reflection', label: 'Reflections', shortLabel: 'Journal', description: 'Decode Your Story' },
  { id: 'final-report', label: 'Final Report', shortLabel: 'Export', description: 'Your Action Plan & Newsletter' }
];

const SliderScale = () => (
  <div className="flex justify-between px-1 mt-2 select-none pointer-events-none">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
      <span key={num} className="text-[10px] text-slate-400 font-semibold w-4 text-center">
        {num}
      </span>
    ))}
  </div>
);

// High-fidelity Radar Chart Component using SVGs for maximum print consistency
const RadarChartSVG = ({ data, size = 420 }: { data: CategoryData[], size?: number }) => {
  const center = size / 2;
  const radius = (size / 2) * 0.72;
  const totalAxes = data.length || 1;

  const getPoint = (index: number, value: number, max = 10) => {
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
    const r = (radius * (value || 0.1)) / max;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Draw circular grid lines instead of standard polygons for an extremely clean modern aesthetic
  const grids = [2, 4, 6, 8, 10].map(val => {
    const r = (radius * val) / 10;
    return (
      <g key={`grid-group-${val}`}>
        <circle 
          cx={center} 
          cy={center} 
          r={r} 
          fill="none" 
          stroke="#C8DFF0" 
          strokeWidth="1" 
          strokeDasharray={val === 10 ? 'none' : '4 4'}
        />
        {val % 4 === 0 && (
          <text 
            x={center + 4} 
            y={center - r + 3} 
            fill="#5C6670" 
            fontSize="8px" 
            fontWeight="bold"
            className="font-mono select-none"
          >
            {val}
          </text>
        )}
      </g>
    );
  });

  const axes = data.map((d, i) => {
    const pEnd = getPoint(i, 10);
    // Position labels slightly further out for readability
    const pLabel = getPoint(i, 11.4);
    const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
    const isLeft = Math.cos(angle) < -0.1;
    const isRight = Math.cos(angle) > 0.1;
    const isTop = Math.sin(angle) < -0.8;
    const isBottom = Math.sin(angle) > 0.8;

    let anchor = 'middle';
    if (isLeft) anchor = 'end';
    if (isRight) anchor = 'start';

    let baseline = 'middle';
    if (isTop) baseline = 'auto';
    if (isBottom) baseline = 'hanging';

    return (
      <g key={`axis-${i}`}>
        <line x1={center} y1={center} x2={pEnd.x} y2={pEnd.y} stroke="#C8DFF0" strokeWidth="1" />
        <text
          x={pLabel.x}
          y={pLabel.y}
          textAnchor={anchor}
          dominantBaseline={baseline}
          fill="#1A1A1A"
          fontSize="11px"
          fontWeight="600"
          className="font-sans select-none tracking-tight max-w-[80px]"
        >
          {d.name}
        </text>
      </g>
    );
  });

  const createPolygonPath = (key: 'importance' | 'satisfaction') => {
    return data.map((d, i) => {
      const p = getPoint(i, d[key] || 1);
      return `${p.x},${p.y}`;
    }).join(' ');
  };

  const satisfactionPoints = createPolygonPath('satisfaction');
  const importancePoints = createPolygonPath('importance');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {/* Background Grids */}
      {grids}
      {/* Outer Circle Label */}
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#4A90C4" strokeWidth="1.5" opacity="0.3" />
      
      {/* Axes */}
      {axes}
      
      {/* Importance Shape (Accent Light - Subtle Stroke & Semi-Transparent Fill) */}
      {importancePoints && (
        <g>
          <polygon
            points={importancePoints}
            fill="#F0F6FA"
            fillOpacity="0.5"
            stroke="#4A90C4"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            style={{ transition: 'all 0.5s ease-in-out' }}
          />
          {data.map((d, i) => {
            const p = getPoint(i, d.importance || 1);
            return (
              <circle 
                key={`imp-dot-${i}`} 
                cx={p.x} 
                cy={p.y} 
                r="4.5" 
                fill="#fff" 
                stroke="#4A90C4" 
                strokeWidth="2.5" 
                style={{ transition: 'all 0.5s ease-in-out' }}
              />
            );
          })}
        </g>
      )}

      {/* Satisfaction Shape (Accent - Solid Fill with Stroke) */}
      {satisfactionPoints && (
        <g>
          <polygon
            points={satisfactionPoints}
            fill="#4A90C4"
            fillOpacity="0.25"
            stroke="#4A90C4"
            strokeWidth="3"
            style={{ transition: 'all 0.5s ease-in-out' }}
          />
          {data.map((d, i) => {
            const p = getPoint(i, d.satisfaction || 1);
            return (
              <circle 
                key={`sat-dot-${i}`} 
                cx={p.x} 
                cy={p.y} 
                r="4.5" 
                fill="#fff" 
                stroke="#4A90C4" 
                strokeWidth="2.5" 
                style={{ transition: 'all 0.5s ease-in-out' }}
              />
            );
          })}
        </g>
      )}
    </svg>
  );
};

const SECTOR_METADATA: Record<string, { definition: string; examples: string[] }> = {
  'Physical Health': {
    definition: 'The vitality, strength, and overall operational capacity of your physical body.',
    examples: ['Sleeping 7-8 hours daily with high quality', 'Clean nutrition & conscious hydration', 'Weekly physical exercise & movement', 'Routine medical/dental preventive checkups', 'High physical energy & endurance levels throughout the day']
  },
  'Mental & Emotional Health': {
    definition: 'Your psychological resilience, inner peace, cognitive clarity, and emotional maturity.',
    examples: ['Daily stress management practices', 'Mindfulness, therapy, or active journaling', 'Setting healthy emotional boundaries', 'Constructive, kind internal self-talk', 'Overall sense of mental calm and presence']
  },
  'Finance & Wealth': {
    definition: 'The stability, tracking, growth, and security of your personal financial resources.',
    examples: ['Tracking monthly income, spending, and budgets', 'Consistent savings and investment rate', 'Elimination of high-interest consumer debt', 'Sustaining an active emergency fund (3-6 months)', 'Feelings of long-term financial security and freedom']
  },
  'Business & Career': {
    definition: 'Your professional contribution, career momentum, work alignment, and job fulfillment.',
    examples: ['Consistent skill development and mastery', 'Daily sense of passion and contribution at work', 'Healthy, positive relationships with colleagues or clients', 'Career progression or business growth targets', 'Protecting work-life boundaries to prevent chronic stress']
  },
  'Romance & Partnership': {
    definition: 'The emotional depth, trust, communication, and intimacy with a romantic partner (or active readiness for one).',
    examples: ['Dedicated quality time or date nights without screens', 'Open, non-defensive conflict resolution', 'Shared, aligned future goals and vision', 'Nurturing mutual respect and daily encouragement', 'Deep feeling of emotional and physical safety']
  },
  'Family & Friends': {
    definition: 'The connection, safety, presence, and stability of your core social and familial relationships.',
    examples: ['Regular quality time with kids, parents, or siblings', 'Consistent, meaningful connection with close friends', 'Open, honest communications', 'Sustaining reciprocal trust and support', 'Being present for loved ones in challenging times']
  },
  'Personal Growth & Learning': {
    definition: 'The active expansion of your intellectual horizon, emotional intelligence, skillsets, and habits.',
    examples: ['Reading books or keeping up with literature', 'Taking courses, workshops, or training programs', 'Establishing supportive daily or weekly rituals', 'Learning a language, instrument, or artistic skill', 'Working with a coach or professional mentor']
  },
  'Fun, Recreation & Play': {
    definition: 'Leisure, playfulness, and hobbies that are purely non-productive, serving to completely restore your energy.',
    examples: ['Engaging in creative hobbies or sports', 'Planning travel or spontaneous outings', 'Socializing with no professional agenda', 'Allowing time for pure laughter and novelty', 'Disengaging entirely from work tasks']
  },
  'Physical Environment (Home)': {
    definition: 'The quality, organization, comfort, and peace of the spaces you live, rest, and work in.',
    examples: ['Maintaining clean, uncluttered, and organized rooms', 'Ergonomically arranged desk and work layout', 'Adequate natural light, ventilation, and quiet', 'A soothing home setup tailored for deep rest', 'Safety, access, and comfort of the physical neighborhood']
  },
  // Business Presets
  'Vision, Strategy & Plan': {
    definition: 'Clarity on long-term enterprise goals, immediate objectives, and the execution roadmap.',
    examples: ['Defined company mission, vision, and values', 'Robust 1-year and 3-year strategic roadmaps', 'Measurable 90-day objectives and key results (OKRs)', 'Keeping the team aligned on weekly metrics', 'Regularly analyzing market trends and pivots']
  },
  'Marketing & Brand Visibility': {
    definition: 'The channels and content through which you build trust, authority, and awareness in the market.',
    examples: ['Consistent, high-quality content output', 'Active, engaging social media profile presence', 'Growing high-converting email subscriber lists', 'Search Engine Optimization (SEO) rankings', 'PR features, podcast guesting, or paid advertising campaigns']
  },
  'Sales & Client Acquisition': {
    definition: 'The systematic pipeline that converts interested prospects into committed, paying customers.',
    examples: ['Consistent response times and follow-ups with leads', 'Sales call closing-rate optimizations', 'Pricing strategy and premium value packaging', 'Frictionless checkout or contract signatures', 'Reliable, predictable monthly revenue pipelines']
  },
  'Product / Service Quality': {
    definition: 'The measurable performance, customer satisfaction, and impact of your core offerings.',
    examples: ['High client satisfaction, rating, or retention scores', 'Low product defect, bug, or service error counts', 'Efficacy and usefulness of features', 'Clean onboarding tutorials and client progress indicators', 'SOPs for premium quality control']
  },
  'Operations & Systems': {
    definition: 'The digital tools, documented processes, and automation workflows that run the business efficiently.',
    examples: ['Written Standard Operating Procedures (SOPs) for key roles', 'Collaborative project boards (Notion, Asana, Jira)', 'Automated workflows (Zapier, system APIs)', 'Structured, organized digital filing and assets', 'Clean administrative routines (payroll, billing)']
  },
  'Financial Health & Cashflow': {
    definition: 'Business profitability, runway, accounting hygiene, and financial risk mitigation.',
    examples: ['Target gross and net profit margin percentages', 'Maintaining a 3-to-6 month cash runway reserve', 'Precise monthly bookkeeper reviews and reconciliations', 'Automated tax and savings allocation accounts', 'Tracking accounts receivable collection times']
  },
  'Team & Company Culture': {
    definition: 'Recruiting talent, setting expectations, psychological safety, and team-wide motivation.',
    examples: ['Clear role metrics and transparent accountability', 'Supportive, regular 1-on-1 team development meetings', 'Employee satisfaction and positive tenure retention', 'Respectful, collaborative communication guidelines', 'Shared rewards and team celebration rituals']
  },
  'Customer Success & Support': {
    definition: 'The experience, responsiveness, and ongoing success of active clients post-checkout.',
    examples: ['Fast customer support response times (SLA)', 'Clear, engaging onboarding materials', 'Compiling client case studies and testimonials', 'Nurturing relationships for customer referral rates', 'Administering customer feedback surveys']
  },
  'Founder Personal Alignment': {
    definition: 'The mental endurance, physical wellness, and workload delegation of the founder.',
    examples: ['Enforcing strict work-life separation hours', 'Scheduling regular offline vacations and weekends', 'Delegating non-genius tasks (e.g., admin chores)', 'Spending more than 70% of time in your "zone of genius"', 'Optimizing health to support high-stakes decision making']
  }
};

const getSectorMetadata = (name: string) => {
  const normalized = name.trim().toLowerCase();
  
  // Try exact match first
  for (const [key, val] of Object.entries(SECTOR_METADATA)) {
    if (key.toLowerCase() === normalized) {
      return { name: key, ...val };
    }
  }
  
  // Try partial match
  for (const [key, val] of Object.entries(SECTOR_METADATA)) {
    if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
      return { name: key, ...val };
    }
  }
  
  // Fallback for custom entries
  return {
    name: name,
    definition: 'A custom, personalized alignment sector added to support your seasonal audit.',
    examples: [
      'Define clear weekly metrics of what success looks like in this area',
      'Identify the top 1-2 friction points dragging this sector down',
      'Choose a realistic, daily micro-habit to establish new momentum',
      'Acknowledge how much mental and emotional focus this requires in this season'
    ]
  };
};

export default function App() {
  const [wheelType, setWheelType] = useState<'life' | 'business' | 'blank'>('life');
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [reflections, setReflections] = useState<ReflectionData>({
    friction: '',
    anchors: '',
    neglect: '',
    shift: '',
    tradeoff: ''
  });
  
  // Navigation states
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  
  // MailerLite Newsletter states
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscriberName, setSubscriberName] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoCategoryName, setInfoCategoryName] = useState<string | null>(null);

  // Hydrate categories based on wheel type selection
  useEffect(() => {
    let names: string[] = [];
    if (wheelType === 'life') {
      names = DEFAULT_LIFE_SECTORS;
    } else if (wheelType === 'business') {
      names = DEFAULT_BUSINESS_SECTORS;
    } else {
      names = [];
    }
    
    const initial = names.map((name, index) => ({
      id: (index + 1).toString(),
      name,
      satisfaction: 5,
      importance: 5
    }));
    
    setCategories(initial);
  }, [wheelType]);

  // Load subscriptions from localstorage if any
  useEffect(() => {
    const isSubscribed = localStorage.getItem('aligned_wheel_newsletter_subscribed');
    if (isSubscribed === 'true') {
      setSubscribeStatus('success');
    }
    
    // Remove the initial app loader once mounted
    const loader = document.getElementById('app-init-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  // Update a slider value
  const handleUpdate = (id: string, field: 'name' | 'satisfaction' | 'importance', value: any) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addCategory = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setCategories([...categories, { id, name: 'New Sector', satisfaction: 5, importance: 5 }]);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  // Move between pages
  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Sorting and analytics
  const gaps = useMemo(() => {
    return categories
      .map(c => ({
        id: c.id,
        name: c.name,
        satisfaction: c.satisfaction,
        importance: c.importance,
        gap: c.importance - c.satisfaction
      }))
      .filter(g => g.gap > 0)
      .sort((a, b) => b.gap - a.gap);
  }, [categories]);

  const topGaps = useMemo(() => {
    return gaps.slice(0, 3);
  }, [gaps]);

  // Dynamic status indicators
  const getSatisfactionTag = (val: number) => {
    if (val <= 3) return { text: 'High Friction / Drained', color: 'bg-red-50 text-red-600 border-red-100' };
    if (val <= 6) return { text: 'Steady / Maintenance Mode', color: 'bg-amber-50 text-amber-600 border-amber-100' };
    if (val <= 8) return { text: 'Strong Flow / Solid', color: 'bg-sky-50 text-sky-600 border-sky-100' };
    return { text: 'Absolute Mastery / Thriving', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  };

  const getImportanceTag = (val: number) => {
    if (val <= 3) return { text: 'Low Seasonal Focus', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    if (val <= 6) return { text: 'Moderate Priority', color: 'bg-blue-50 text-blue-600 border-blue-100' };
    if (val <= 8) return { text: 'High Focus Area', color: 'bg-orange-50/70 text-orange-600 border-orange-100/50' };
    return { text: 'Critical 90-Day Lever!', color: 'bg-orange-100 text-orange-800 border-orange-200 font-extrabold' };
  };

  const priorityCount90Days = useMemo(() => {
    return categories.filter(c => c.importance >= 8).length;
  }, [categories]);

  // Handle newsletter sign-up with simulated MailerLite API/form post
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail || !subscriberEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    
    setSubscribeStatus('loading');
    setErrorMessage('');
    
    // Simulating MailerLite lead capture API call
    setTimeout(() => {
      localStorage.setItem('aligned_wheel_newsletter_subscribed', 'true');
      setSubscribeStatus('success');
    }, 1500);
  };

  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col text-[15px] text-[#1A1A1A] antialiased">
      {/* Global Banner and Nav - Hidden on print */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 no-print">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#4A90C4] text-white p-2.5 rounded-2xl flex items-center justify-center">
              <Target size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-[#1A1A1A] tracking-tight font-['Inter'] font-semibold text-lg leading-tight">
                The Aligned Wheel
              </h1>
              <p className="text-slate-400 text-[9px] tracking-widest font-bold uppercase font-sans">
                Future You Method • Gap Analysis
              </p>
            </div>
          </div>
          
          {/* Main Controls */}
          <div className="flex items-center gap-3">
            {currentStepIndex > 0 && (
              <button 
                onClick={() => setCurrentStepIndex(0)}
                className="text-xs font-semibold text-slate-500 hover:text-[#4A90C4] flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-[4px] transition-all"
              >
                Restart Guide
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Navigational Stepper Bar - Horizontal on Desktop, Compact Swipeable on Mobile */}
        <div className="border-t border-slate-100 bg-slate-50/50">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-3">
            <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
              {STEPS.map((step, idx) => {
                const isCurrent = currentStepIndex === idx;
                const isPassed = currentStepIndex > idx;
                const isClickable = idx <= currentStepIndex;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (isClickable) {
                        setCurrentStepIndex(idx);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }
                    }}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] transition-all text-xs font-medium whitespace-nowrap shrink-0 ${
                      isCurrent 
                        ? 'bg-[#4A90C4] text-white cursor-pointer' 
                        : isPassed 
                        ? 'text-[#4A90C4] bg-[#4A90C4]/5 hover:bg-[#4A90C4]/10 cursor-pointer' 
                        : 'text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent 
                        ? 'bg-white text-[#4A90C4]' 
                        : isPassed 
                        ? 'bg-[#4A90C4] text-white' 
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isPassed ? <Check size={10} strokeWidth={3} /> : idx + 1}
                    </span>
                    <span className="hidden sm:inline font-sans">{step.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Step Header Instructions */}
        <div className="mb-8 text-center max-w-3xl mx-auto no-print">
          {currentStepIndex > 0 && (
            <div className="animate-in fade-in duration-300">
              <span className="text-[10px] uppercase font-bold text-[#4A90C4] tracking-widest font-sans">
                Step {currentStepIndex + 1} of {STEPS.length}: {currentStep.label}
              </span>
              <h2 className="text-2xl sm:text-3xl font-['Inter'] font-semibold text-slate-800 tracking-tight mt-1 mb-2">
                {currentStep.description}
              </h2>
            </div>
          )}
        </div>

        {/* STAGES CONTAINER */}
        <div className="w-full">
          
          {/* 1. WELCOME SCREEN */}
          {currentStep.id === 'welcome' && (
            <div className="max-w-3xl mx-auto py-4 md:py-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="bg-white rounded-[40px] border border-slate-200/80 p-8 sm:p-14 space-y-10 relative overflow-hidden">
                
                {/* Visual decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#4A90C4]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <header className="border-b border-slate-100 pb-8 relative">
                  <h1 className="font-['Inter'] text-slate-900 tracking-tight mb-4 text-4xl sm:text-5xl lg:text-6xl font-light">
                    The <span className="font-semibold text-[#4A90C4]">Aligned Wheel</span>
                  </h1>
                  <p className="text-lg text-slate-500 font-light italic font-serif">
                    A conscious alternative to the traditional "Wheel of Life"
                  </p>
                </header>

                <div className="space-y-6 text-slate-600 leading-relaxed text-base">
                  <p>
                    The traditional Wheel of Life is a powerful, time-tested tool that helps you see where you need to work. The Aligned Wheel is designed to build on that by helping you find the gap—so you can see where the real work needs to be done.
                  </p>
                  
                  <div className="pl-6 border-l-3 border-[#4A90C4] py-2 bg-[#F0F6FA]/30 rounded-r-2xl pr-4">
                    <p className="text-slate-800 font-medium font-['Inter']">
                      But here’s the reality of high achievement:
                    </p>
                    <p className="text-slate-700 mt-2 text-sm italic">
                      "You cannot be a ten in everything at once. Attempting to force absolute balance across all spheres simultaneously is a direct path to stagnation. True momentum is born from intentional seasonal focus."
                    </p>
                  </div>

                  <p>
                    <strong>The Aligned Wheel</strong> is not a performance report card. It is a <strong>Gap Analysis</strong> tool created for "The Future You" workshops. It maps your current <strong>Satisfaction</strong> directly against <strong>Importance</strong>.
                  </p>

                  <p>
                    Instead of feeling guilty about a low score, you will ask: <span className="text-slate-900 font-semibold italic">"Does this specific area matter most to my future self in the next 90 days?"</span>
                  </p>

                  <p className="text-sm text-slate-500">
                    This wizard will guide you step-by-step through selecting your framework, auditing your scores independently to keep your insights unbiased, and exporting a fully printed custom action plan.
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
                    <Compass className="text-slate-400 animate-spin" style={{ animationDuration: '10s' }} size={16} />
                    <span>Takes approx. 5–10 minutes</span>
                  </div>
                  <button onClick={handleNext} className="btn-primary w-full sm:w-auto">
                    Begin Your Audit <ChevronRight size={18} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. CATEGORY FRAMEWORK SELECTION */}
          {currentStep.id === 'category-select' && (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-8">
              
              {/* Selector Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Life Wheel option */}
                <button 
                  onClick={() => setWheelType('life')}
                  className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${
                    wheelType === 'life' 
                      ? 'border-[#4A90C4] bg-[#4A90C4]/5 ring-1 ring-[#4A90C4]/30' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${wheelType === 'life' ? 'bg-[#4A90C4] text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <User size={22} />
                    </div>
                    {wheelType === 'life' && (
                      <span className="bg-[#4A90C4] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-[4px]">
                        Selected
                      </span>
                    )}
                  </div>
                  <h3 className="font-['Inter'] font-semibold text-lg text-slate-800 mb-1">
                    Life Audit Wheel
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Maps the 9 essential life sectors including health, family, finances, romantic partnerships, and environment. Perfect for personal alignment.
                  </p>
                </button>

                {/* Business Wheel option */}
                <button 
                  onClick={() => setWheelType('business')}
                  className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${
                    wheelType === 'business' 
                      ? 'border-[#4A90C4] bg-[#4A90C4]/5 ring-1 ring-[#4A90C4]/30' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${wheelType === 'business' ? 'bg-[#4A90C4] text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Briefcase size={22} />
                    </div>
                    {wheelType === 'business' && (
                      <span className="bg-[#4A90C4] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-[4px]">
                        Selected
                      </span>
                    )}
                  </div>
                  <h3 className="font-['Inter'] font-semibold text-lg text-slate-800 mb-1">
                    Business Alignment
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Designed for founders, leaders, and operators. Focuses on strategy, sales, systems, team leadership, finance, and personal well-being.
                  </p>
                </button>

                {/* Blank Wheel option */}
                <button 
                  onClick={() => setWheelType('blank')}
                  className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${
                    wheelType === 'blank' 
                      ? 'border-[#4A90C4] bg-[#4A90C4]/5 ring-1 ring-[#4A90C4]/30' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${wheelType === 'blank' ? 'bg-[#4A90C4] text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Plus size={22} />
                    </div>
                    {wheelType === 'blank' && (
                      <span className="bg-[#4A90C4] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-[4px]">
                        Selected
                      </span>
                    )}
                  </div>
                  <h3 className="font-['Inter'] font-semibold text-lg text-slate-800 mb-1">
                    Custom Wheel
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Start with a completely blank slate. Perfect if you have specific custom projects, team roles, or specific seasonal themes you want to analyze.
                  </p>
                </button>
              </div>

              {/* Category list editor */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                <div>
                  <h3 className="text-slate-800 font-semibold font-['Inter'] text-lg">
                    Customize Your Sectors
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Rename, remove, or append custom categories to align precisely with your current season. 
                    We recommend <strong>5 to 10 active sectors</strong> for optimal radar rendering. Currently: <strong className="text-slate-700">{categories.length} active</strong>.
                  </p>
                </div>

                {categories.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 text-slate-400">
                    <HelpCircle className="mx-auto mb-2 opacity-50" size={32} />
                    <p className="text-sm font-medium">Your wheel is currently empty.</p>
                    <p className="text-xs mt-1">Click the button below to add your first custom sector name.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map((cat, idx) => (
                      <div 
                        key={cat.id} 
                        className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 hover:border-slate-300/80 px-4 py-3 rounded-2xl transition-all group"
                      >
                        <span className="text-xs font-bold text-slate-400 font-mono w-4">
                          {idx + 1}
                        </span>
                        <input
                           type="text"
                           value={cat.name}
                           onChange={(e) => handleUpdate(cat.id, 'name', e.target.value)}
                           className="flex-grow bg-transparent text-sm font-semibold text-slate-700 border-b border-transparent focus:border-[#4A90C4] focus:outline-none focus:text-slate-900 pb-0.5 transition-colors min-w-0"
                           placeholder="Category Name"
                        />
                        <button
                          onClick={() => setInfoCategoryName(cat.name)}
                          className="text-slate-400 hover:text-[#4A90C4] p-1.5 rounded-lg hover:bg-[#F0F6FA]/50 transition-all shrink-0"
                          title="View category details & examples"
                        >
                          <Info size={14} />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                          title="Remove sector"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button 
                    onClick={handleBack} 
                    className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-4 py-2 rounded-xl self-start sm:self-auto"
                  >
                    <ArrowLeft size={16} /> Back to Welcome
                  </button>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                    <button 
                      onClick={addCategory}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-[#4A90C4] text-slate-500 hover:text-[#4A90C4] font-semibold text-sm px-6 py-2.5 rounded-2xl transition-all"
                    >
                      <Plus size={16} /> Add Custom Sector
                    </button>

                    <button 
                      onClick={handleNext}
                      disabled={categories.length < 3}
                      className={`btn-primary w-full sm:w-auto ${categories.length < 3 ? 'opacity-50 cursor-not-allowed bg-slate-300' : ''}`}
                    >
                      Save & Next Step <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. SATISFACTION RATING PAGE */}
          {currentStep.id === 'satisfaction' && (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-8">
              
              <div className="bg-[#F0F6FA] border border-[#C8DFF0] rounded-3xl p-6 flex flex-col sm:flex-row items-start gap-4">
                <div className="p-3 bg-[#4A90C4] text-white rounded-2xl shrink-0">
                  <Compass size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#4A90C4] font-['Inter'] text-base">
                    Auditing Satisfaction (Current Reality)
                  </h4>
                  <p className="text-xs text-[#1A1A1A] mt-1 leading-relaxed">
                    Ask yourself: <strong>"How aligned and fulfilled does this sector feel right now?"</strong> <br />
                    1 is complete friction, anxiety, or neglect. 10 is clear alignment, deep flow, and high health. 
                    Be honest with yourself. There are no right answers.
                  </p>
                </div>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                  <p className="text-slate-500">No sectors added yet. Please go back and add sectors.</p>
                  <button onClick={() => setCurrentStepIndex(1)} className="btn-primary mt-4">
                    Go to Setup
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categories.map((cat) => {
                    const tag = getSatisfactionTag(cat.satisfaction);
                    return (
                      <div 
                        key={cat.id} 
                        className="bg-white border border-slate-200 rounded-[32px] p-6 transition-all space-y-4"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-base font-semibold text-slate-800 font-['Inter'] truncate">
                              {cat.name}
                            </span>
                            <button
                              onClick={() => setInfoCategoryName(cat.name)}
                              className="text-slate-400 hover:text-[#3A7AB0] hover:bg-[#F0F6FA] p-1 rounded-lg transition-all shrink-0"
                              title="View definition & examples"
                            >
                              <Info size={13} />
                            </button>
                          </div>
                          <span className="bg-[#F0F6FA] text-[#4A90C4] text-sm font-black px-3.5 py-1 rounded-[4px] font-mono shrink-0">
                            {cat.satisfaction} / 10
                          </span>
                        </div>

                        <div className="space-y-1">
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={cat.satisfaction}
                            onChange={(e) => handleUpdate(cat.id, 'satisfaction', parseInt(e.target.value))}
                            className="w-full h-2.5 rounded-lg bg-[#F0F6FA] accent-[#4A90C4] cursor-pointer"
                          />
                          <SliderScale />
                        </div>

                        {/* Dynamic Feedback Tag */}
                        <div className={`text-[11px] font-semibold uppercase tracking-wider py-1.5 px-3 rounded-xl border ${tag.color} inline-block`}>
                          {tag.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 flex justify-between gap-4">
                <button onClick={handleBack} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-4 py-2 rounded-xl">
                  <ArrowLeft size={16} /> Edit Sectors
                </button>
                <button onClick={handleNext} className="btn-primary">
                  Rate Importance <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* 4. IMPORTANCE RATING PAGE */}
          {currentStep.id === 'importance' && (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-8">
              
              <div className="bg-[#F0F6FA] border border-[#C8DFF0] rounded-3xl p-6 flex flex-col sm:flex-row items-start gap-4">
                <div className="p-3 bg-[#4A90C4] text-white rounded-2xl shrink-0">
                  <Lightbulb size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#4A90C4] font-['Inter'] text-base">
                    Auditing Seasonal Importance (Next 90 Days Focus)
                  </h4>
                  <p className="text-xs text-[#1A1A1A] mt-1 leading-relaxed">
                    Ask yourself: <strong>"How critical is focus on this area for my upcoming season (90 days)?"</strong> <br />
                    1 is low relevance or something that can safely sit in maintenance mode. 10 is an absolute critical focus area that demands active attention. 
                    <strong className="block mt-1">Pro Tip: Be selective. If every sector is a 10, nothing is. Aim for only 3–4 high-focus sectors (8-10).</strong>
                  </p>
                </div>
              </div>

              {/* Urgency selection stats */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Your Priority Counter:</span>
                <span className={`px-3 py-1 rounded-[4px] font-bold ${
                  priorityCount90Days <= 4 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : priorityCount90Days <= 6 
                    ? 'bg-amber-50 text-amber-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {priorityCount90Days} of {categories.length} marked High Focus (8-10)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat) => {
                  const tag = getImportanceTag(cat.importance);
                  return (
                    <div 
                      key={cat.id} 
                      className="bg-white border border-slate-200 rounded-[32px] p-6 transition-all space-y-4"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-base font-semibold text-slate-800 font-['Inter'] truncate">
                            {cat.name}
                          </span>
                          <button
                            onClick={() => setInfoCategoryName(cat.name)}
                            className="text-slate-400 hover:text-[#3A7AB0] hover:bg-[#F0F6FA] p-1 rounded-lg transition-all shrink-0"
                            title="View definition & examples"
                          >
                            <Info size={13} />
                          </button>
                        </div>
                        <span className="bg-[#F0F6FA] text-[#4A90C4] text-sm font-black px-3.5 py-1 rounded-[4px] font-mono shrink-0">
                          {cat.importance} / 10
                        </span>
                      </div>

                      <div className="space-y-1">
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={cat.importance}
                          onChange={(e) => handleUpdate(cat.id, 'importance', parseInt(e.target.value))}
                          className="w-full h-2.5 rounded-lg bg-[#F0F6FA] accent-[#4A90C4] cursor-pointer"
                        />
                        <SliderScale />
                      </div>

                      {/* Dynamic Importance Tag */}
                      <div className={`text-[11px] font-semibold uppercase tracking-wider py-1.5 px-3 rounded-xl border ${tag.color} inline-block`}>
                        {tag.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between gap-4">
                <button onClick={handleBack} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-4 py-2 rounded-xl">
                  <ArrowLeft size={16} /> Rate Satisfaction
                </button>
                <button onClick={handleNext} className="btn-primary">
                  Reveal Alignment Wheel <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* 5. DYNAMIC SPIDER RADAR VISUALIZATION */}
          {currentStep.id === 'visualization' && (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Visual Chart Panel */}
                <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-[40px] border border-slate-200 shadow-sm flex flex-col items-center">
                  <div className="w-full max-w-[380px] aspect-square flex items-center justify-center p-2">
                    <RadarChartSVG data={categories} />
                  </div>

                  {/* High Contrast Color Legend */}
                  <div className="flex justify-center gap-8 mt-6 w-full border-t border-slate-100 pt-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-[4px] bg-[#4A90C4]/25 border-2 border-[#4A90C4]"></div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block leading-none">Satisfaction</span>
                        <span className="text-[10px] text-slate-400">Current Reality</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-[4px] bg-[#F0F6FA] border-2 border-dashed border-[#4A90C4]"></div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block leading-none">Importance</span>
                        <span className="text-[10px] text-slate-400">90-Day Vision</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conceptual breakdown text */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-[#4A90C4]/5 rounded-3xl p-6 border border-[#4A90C4]/10">
                    <h3 className="font-['Inter'] font-semibold text-[#4A90C4] text-lg mb-2">
                      How to Read Your Chart
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed space-y-3">
                      Your chart maps two independent layers. The relationship between these shapes tells your seasonal story:
                    </p>
                    <ul className="space-y-3.5 mt-3 text-xs text-slate-600">
                      <li className="flex gap-2">
                        <span className="text-[#4A90C4] font-bold shrink-0">■</span>
                        <span><strong>Solid Blue Polygon (Satisfaction):</strong> Your daily energy, currently deployed and settled.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#4A90C4] font-bold shrink-0">▨</span>
                        <span><strong>Dashed Outline (Importance):</strong> The seasonal gravity or demands of your goals.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#4A90C4] font-bold shrink-0">⚠</span>
                        <span><strong>The Gaps:</strong> Any area where the dashed outline peaks high above the solid shape is a frictional stress point that demands a strategic pivot.</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    Note: If your Satisfaction shape covers the Importance shape in certain spots, that means you are fully aligned, or even over-delivering relative to current seasonal needs!
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between gap-4">
                <button onClick={handleBack} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-4 py-2 rounded-xl">
                  <ArrowLeft size={16} /> Edit Ratings
                </button>
                <button onClick={handleNext} className="btn-primary">
                  View Gap Analysis <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* 6. GAP ALIGNMENT ANALYSIS REPORT */}
          {currentStep.id === 'analysis' && (
            <div className="max-w-3xl mx-auto animate-in fade-in duration-300 space-y-8">
              
              <div className="text-center max-w-xl mx-auto">
                <h3 className="font-['Inter'] font-medium text-slate-800 text-xl">
                  Your Primary Alignment Gaps
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  We calculated the exact mathematical difference between your <strong>90-Day Importance</strong> and your <strong>Current Satisfaction</strong>.
                </p>
              </div>

              {gaps.length === 0 ? (
                <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 text-center space-y-3">
                  <CheckCircle className="text-emerald-500 mx-auto" size={36} />
                  <h4 className="text-lg font-bold text-emerald-800 font-['Inter']">You Are Fully Aligned!</h4>
                  <p className="text-sm text-emerald-700 max-w-md mx-auto">
                    In all areas of your wheel, your current satisfaction level is equal to or higher than the priority you require. 
                    Your daily effort perfectly supports your goals.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    Top Priority Action Areas
                  </div>
                  
                  {topGaps.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="p-6 bg-[#F0F6FA] border-l-4 border-[#4A90C4] rounded-r-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#4A90C4] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <h4 className="text-lg font-bold text-slate-800 font-['Inter']">
                            {item.name}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600">
                          Satisfaction score of <strong className="text-[#4A90C4]">{item.satisfaction}</strong> vs Seasonal Importance of <strong className="text-[#4A90C4]">{item.importance}</strong>.
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 shrink-0">
                        <span className="bg-[#4A90C4]/10 text-[#4A90C4] font-black text-xs px-3.5 py-1.5 rounded-[4px] font-mono tracking-wider border border-[#4A90C4]/20">
                          GAP: +{item.gap}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Future You demands focus here</span>
                      </div>
                    </div>
                  ))}

                  {/* Breakdown summary of remaining categories */}
                  {categories.length > 3 && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
                      <h4 className="font-['Inter'] font-semibold text-slate-700 text-sm">
                        All Remaining Categories & Gap Calculations
                      </h4>
                      <div className="divide-y divide-slate-100 text-xs">
                        {categories
                          .map(c => ({ name: c.name, satisfaction: c.satisfaction, importance: c.importance, gap: c.importance - c.satisfaction }))
                          .sort((a, b) => b.gap - a.gap)
                          .map((item, i) => (
                            <div key={i} className="py-3 flex justify-between items-center gap-4">
                              <span className="font-medium text-slate-600">{item.name}</span>
                              <div className="flex items-center gap-4 font-mono text-slate-500">
                                <span>Sat: {item.satisfaction}</span>
                                <span>Imp: {item.importance}</span>
                                <span className={`font-bold px-2 py-0.5 rounded-[4px] ${
                                  item.gap > 0 ? 'bg-[#F0F6FA] text-[#4A90C4]' : 'bg-slate-100 text-slate-400'
                                }`}>
                                  Gap: {item.gap > 0 ? `+${item.gap}` : item.gap}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 flex justify-between gap-4">
                <button onClick={handleBack} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-4 py-2 rounded-xl">
                  <ArrowLeft size={16} /> View Wheel Chart
                </button>
                <button onClick={handleNext} className="btn-primary">
                  Begin Reflection <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* 7. GUIDED REFLECTION JOURNALING */}
          {currentStep.id === 'reflection' && (
            <div className="max-w-3xl mx-auto animate-in fade-in duration-300 space-y-8">
              
              <div className="text-center max-w-xl mx-auto">
                <h3 className="font-['Inter'] font-medium text-slate-800 text-xl">
                  Guided Seasonal Reflection
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Translate numerical insights into tangible strategies. Answer these core coaching prompts to formulate your workbook's output.
                </p>
              </div>

              <div className="grid gap-8">
                
                {/* 1. Friction */}
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[32px] space-y-3">
                  <div className="flex items-center gap-2 text-[#4A90C4]">
                    <AlertTriangle size={18} />
                    <label className="text-lg font-bold text-slate-800 font-['Inter']">1. The Friction</label>
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    What stands out when you look at your gaps? Where do you feel the most emotional or operational tension right now?
                  </p>
                  <textarea
                    value={reflections.friction}
                    onChange={(e) => setReflections({ ...reflections, friction: e.target.value })}
                    placeholder="E.g., My career is taking 10/10 focus, leaving health as a huge friction point where I feel physically fatigued..."
                    className="w-full min-h-[110px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4A90C4] focus:ring-1 focus:ring-[#4A90C4] transition-all text-sm font-sans"
                  />
                </div>

                {/* 2. Anchors */}
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[32px] space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <BookmarkCheck size={18} />
                    <label className="text-lg font-bold text-slate-800 font-['Inter']">2. The Anchors</label>
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    Which areas of your wheel feel strongest and most supportive? What are the solid anchors keeping you grounded this season?
                  </p>
                  <textarea
                    value={reflections.anchors}
                    onChange={(e) => setReflections({ ...reflections, anchors: e.target.value })}
                    placeholder="E.g., My relationship with my partner is extremely stable, giving me a solid emotional foundation..."
                    className="w-full min-h-[110px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4A90C4] focus:ring-1 focus:ring-[#4A90C4] transition-all text-sm font-sans"
                  />
                </div>

                {/* 3. Neglect */}
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[32px] space-y-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <TrendingUp size={18} />
                    <label className="text-lg font-bold text-slate-800 font-['Inter']">3. The Neglect</label>
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    Which areas are completely neglected, yet vital to support your energy levels? (What will fail if you ignore it for another 90 days?)
                  </p>
                  <textarea
                    value={reflections.neglect}
                    onChange={(e) => setReflections({ ...reflections, neglect: e.target.value })}
                    placeholder="E.g., Fun and play have been zero. If I don't schedule recreation, I am risking serious creative burnout by next month..."
                    className="w-full min-h-[110px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4A90C4] focus:ring-1 focus:ring-[#4A90C4] transition-all text-sm font-sans"
                  />
                </div>

                {/* 4. Shift */}
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[32px] space-y-3">
                  <div className="flex items-center gap-2 text-[#4A90C4]">
                    <Compass size={18} />
                    <label className="text-lg font-bold text-slate-800 font-['Inter']">4. The Shift</label>
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    What would a small, realistic improvement look like in your highest priority gap? What is the most practical next step?
                  </p>
                  <textarea
                    value={reflections.shift}
                    onChange={(e) => setReflections({ ...reflections, shift: e.target.value })}
                    placeholder="E.g., I will spend 15 minutes every Sunday meal-prepping simple healthy lunches so I don't order takeout during hectic weeks..."
                    className="w-full min-h-[110px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4A90C4] focus:ring-1 focus:ring-[#4A90C4] transition-all text-sm font-sans"
                  />
                </div>

                {/* 5. Trade-off */}
                <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[32px] space-y-3">
                  <div className="flex items-center gap-2 text-[#4A90C4]">
                    <Target size={18} />
                    <label className="text-lg font-bold text-slate-800 font-['Inter']">5. The Trade-Off</label>
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    You cannot gain space without giving something up. What can you safely adjust, delegate, or temporarily pause this season to protect your energy?
                  </p>
                  <textarea
                    value={reflections.tradeoff}
                    onChange={(e) => setReflections({ ...reflections, tradeoff: e.target.value })}
                    placeholder="E.g., I am pausing my community board commitments for the next 90 days to free up Saturday mornings for health/exercise..."
                    className="w-full min-h-[110px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4A90C4] focus:ring-1 focus:ring-[#4A90C4] transition-all text-sm font-sans"
                  />
                </div>

              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between gap-4">
                <button onClick={handleBack} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-4 py-2 rounded-xl">
                  <ArrowLeft size={16} /> View Priority Gaps
                </button>
                <button onClick={handleNext} className="btn-primary">
                  Review & Export Report <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* 8. FINAL PRINTABLE SUMMARY & NEWSLETTER LEAD */}
          {currentStep.id === 'final-report' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
              
              {/* PRINTABLE WORKBOOK CANVAS (Self-contained and highly formatted) */}
              <div id="report-content" className="bg-white rounded-[40px] border border-slate-200 p-6 sm:p-12 shadow-md space-y-10 relative overflow-hidden print:border-none print:shadow-none print:p-0">
                
                {/* Print Banner */}
                <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-end">
                  <div>
                    <h2 className="font-['Inter'] font-black text-[#4A90C4] text-2xl tracking-tight uppercase print:text-slate-900">
                      The Aligned Wheel
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest font-sans">
                      Future You Method • Seasonal Gap Workbook
                    </p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-slate-400">
                    <div>Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div>Framework: {wheelType.toUpperCase()}</div>
                  </div>
                </div>

                {/* Row 1: Radar Chart & Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center print:grid-cols-12">
                  
                  {/* Radar Left */}
                  <div className="md:col-span-6 flex flex-col items-center justify-center p-4 bg-slate-50/50 rounded-3xl border border-slate-100 print:col-span-6 print:bg-white print:border-none">
                    <div className="w-full max-w-[310px] aspect-square flex items-center justify-center">
                      <RadarChartSVG data={categories} size={340} />
                    </div>
                    
                    <div className="flex justify-center gap-6 mt-4 w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-[4px] bg-[#4A90C4]/25 border border-[#4A90C4]"></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Satisfaction</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-[4px] bg-[#F0F6FA] border border-dashed border-[#4A90C4]"></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Importance</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Gaps Right */}
                  <div className="md:col-span-6 space-y-4 print:col-span-6">
                    <h3 className="font-['Inter'] font-bold text-slate-800 text-sm uppercase tracking-wider">
                      Priority Friction Sectors
                    </h3>
                    
                    {topGaps.length === 0 ? (
                      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-800">
                        No major priority friction detected! You are fully aligned in your goals and satisfaction levels.
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {topGaps.map((item, i) => (
                          <div key={item.id} className="p-4 bg-slate-50 border-l-3 border-[#4A90C4] rounded-r-2xl text-xs space-y-1 print:bg-white print:border-slate-300">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800 text-sm font-['Inter']">{i + 1}. {item.name}</span>
                              <span className="bg-[#4A90C4] text-white text-[9px] font-bold px-2 py-0.5 rounded-[4px] font-mono">
                                GAP: +{item.gap}
                              </span>
                            </div>
                            <p className="text-slate-500 font-sans">
                              Your seasonal focus is {item.importance}/10 while current fulfillment is only {item.satisfaction}/10. This requires active tactical attention.
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 text-[11px] text-slate-500 leading-relaxed print:hidden">
                      <strong>Analysis Tip:</strong> High-gap sectors are your primary focus. Centering your effort here builds momentum across other areas.
                    </div>
                  </div>

                </div>

                {/* Page Break for printing is applied cleanly */}
                <div className="print:page-break-before"></div>

                {/* Row 2: Reflection Answers */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h3 className="font-['Inter'] font-bold text-slate-800 text-sm uppercase tracking-wider">
                    My Seasonal Alignment Strategy
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-4">
                    
                    {/* Reflection 1 */}
                    <div className="p-5 border border-slate-150 rounded-2xl space-y-1 bg-slate-50/20 print:bg-white">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A90C4]">1. The Friction (Tensions Identified)</span>
                      <p className="text-xs text-slate-700 leading-relaxed min-h-[40px]">
                        {reflections.friction || <em className="text-slate-400">No response recorded</em>}
                      </p>
                    </div>

                    {/* Reflection 2 */}
                    <div className="p-5 border border-slate-150 rounded-2xl space-y-1 bg-slate-50/20 print:bg-white">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">2. The Anchors (Foundations & Strengths)</span>
                      <p className="text-xs text-slate-700 leading-relaxed min-h-[40px]">
                        {reflections.anchors || <em className="text-slate-400">No response recorded</em>}
                      </p>
                    </div>

                    {/* Reflection 3 */}
                    <div className="p-5 border border-slate-150 rounded-2xl space-y-1 bg-slate-50/20 print:bg-white">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">3. The Neglect (Areas Starved of Oxygen)</span>
                      <p className="text-xs text-slate-700 leading-relaxed min-h-[40px]">
                        {reflections.neglect || <em className="text-slate-400">No response recorded</em>}
                      </p>
                    </div>

                    {/* Reflection 4 */}
                    <div className="p-5 border border-slate-150 rounded-2xl space-y-1 bg-slate-50/20 print:bg-white">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A90C4]">4. The Shift (Next High-Leverage Micro-Action)</span>
                      <p className="text-xs text-slate-700 leading-relaxed min-h-[40px]">
                        {reflections.shift || <em className="text-slate-400">No response recorded</em>}
                      </p>
                    </div>

                  </div>

                  {/* Full width Reflection 5 */}
                  <div className="p-5 border border-slate-150 rounded-2xl space-y-1 bg-slate-50/20 print:bg-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A90C4]">5. The Seasonal Trade-Off (What toadjust, pause or delegate)</span>
                    <p className="text-xs text-slate-700 leading-relaxed min-h-[40px]">
                      {reflections.tradeoff || <em className="text-slate-400">No response recorded</em>}
                    </p>
                  </div>
                </div>

                {/* Footer on print */}
                <div className="pt-8 border-t border-slate-200 text-center text-[9px] uppercase tracking-widest text-slate-400 font-sans mt-12">
                  "Alignment beats balance. Live with seasonal intent." • future you method workshops
                </div>

              </div>

              {/* ACTION PANELS - Hidden on print */}
              <div className="no-print space-y-8">
                
                {/* Print Action Bar */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="space-y-1">
                    <h3 className="font-['Inter'] font-semibold text-lg">
                      Ready to print your workbook?
                    </h3>
                    <p className="text-xs text-slate-400">
                      Print this directly to your paper printer or export it as a highly structured PDF to keep on your dashboard.
                    </p>
                  </div>
                  <button 
                    onClick={() => window.print()} 
                    className="flex items-center justify-center gap-2 bg-[#4A90C4] hover:bg-[#3A7AB0] text-white font-semibold text-sm px-8 py-3.5 rounded-[4px] transition-all shrink-0 w-full sm:w-auto"
                  >
                    <Printer size={16} /> Print Full Workbook
                  </button>
                </div>

                {/* MailerLite Lead Collection Form */}
                <div className="bg-white rounded-[32px] border border-slate-200 p-8 sm:p-10 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#F0F6FA] rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex items-center gap-3 text-[#4A90C4]">
                    <Mail size={22} />
                    <span className="font-sans font-bold text-xs uppercase tracking-widest">Jamie Boyd's Community Updates</span>
                  </div>

                  <div className="max-w-2xl">
                    <h3 className="font-['Inter'] font-semibold text-slate-800 text-xl">
                      Subscribe for Live Workshops & Tools
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Enter your name and email to connect with <strong>Jamie Boyd</strong>. You will receive our full 90-day alignment strategy worksheets, template guides, and exclusive, free invites to our monthly live alignment review workshops.
                    </p>
                  </div>

                  {subscribeStatus === 'success' ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in duration-300">
                      <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-emerald-800 font-['Inter']">Successfully Joined!</h4>
                        <p className="text-xs text-emerald-700">
                          Your address has been successfully registered. Your exclusive Future You workshop materials are flying to your inbox!
                        </p>
                        <button 
                          onClick={() => {
                            localStorage.removeItem('aligned_wheel_newsletter_subscribed');
                            setSubscribeStatus('idle');
                          }}
                          className="text-[11px] text-[#4A90C4] hover:underline font-bold pt-1.5 block"
                        >
                          Reset subscriber form
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-500">First Name</label>
                          <input
                            type="text"
                            required
                            value={subscriberName}
                            onChange={(e) => setSubscriberName(e.target.value)}
                            placeholder="Jamie"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4A90C4] text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-500">Email Address</label>
                          <input
                            type="email"
                            required
                            value={subscriberEmail}
                            onChange={(e) => setSubscriberEmail(e.target.value)}
                            placeholder="jamie@example.com"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4A90C4] text-sm"
                          />
                        </div>
                      </div>

                      {errorMessage && (
                        <p className="text-xs font-semibold text-red-500">{errorMessage}</p>
                      )}

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={subscribeStatus === 'loading'}
                          className="flex items-center justify-center gap-2 bg-[#4A90C4] hover:bg-[#3A7AB0] text-white font-semibold text-xs uppercase tracking-widest px-6 py-3 rounded-[4px] transition-all disabled:opacity-60"
                        >
                          {subscribeStatus === 'loading' ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Syncing...
                            </>
                          ) : (
                            <>
                              Subscribe for Workshops <ExternalLink size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between gap-4">
                  <button onClick={handleBack} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-4 py-2 rounded-xl">
                    <ArrowLeft size={16} /> Edit Reflections
                  </button>
                  <button 
                    onClick={() => setCurrentStepIndex(1)}
                    className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#3A7AB0] transition-colors"
                  >
                    Adjust Categories & Restart Audit
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>



      </main>

      {/* Category Info Modal Overlay */}
      {infoCategoryName && (() => {
        const meta = getSectorMetadata(infoCategoryName);
        return (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 no-print animate-in fade-in duration-200"
            onClick={() => setInfoCategoryName(null)}
          >
            <div 
              className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 border border-slate-100 shadow-xl relative animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setInfoCategoryName(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-xl transition-all"
                aria-label="Close modal"
              >
                <X size={18} strokeWidth={2.5} />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#4A90C4]/10 text-[#4A90C4] p-2.5 rounded-2xl">
                    <Info size={22} />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-['Inter'] font-semibold text-lg leading-tight">
                      {meta.name}
                    </h3>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest font-sans mt-0.5">
                      Sector Definition & Examples
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                      Core Definition
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {meta.definition}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                      Measurement Examples & Audit Prompts:
                    </h4>
                    <ul className="space-y-2">
                      {meta.examples.map((ex, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                          <span className="text-[#4A90C4] mt-0.5 shrink-0 font-bold">•</span>
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => setInfoCategoryName(null)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-6 py-3 rounded-[4px] transition-all"
                  >
                    Got it, thanks!
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
