import { useState, FormEvent, useEffect } from 'react';
import { 
  Check, MapPin, Phone, MessageSquare, ArrowRight, ChevronDown, ChevronRight,
  Search, ShieldCheck, Mail, Globe, Map, Award, Cpu, Flame, Leaf, HelpCircle 
} from 'lucide-react';
import { getCitiesList } from '../data/cities';

interface MainHeroSectionProps {
  activeCitySlug: string;
  onSelectCity: (slug: string) => void;
  onSelectPlatformTab: (tab: 'locations' | 'pillars' | 'itad-infopark' | 'sitemap') => void;
}

export default function MainHeroSection({
  activeCitySlug,
  onSelectCity,
  onSelectPlatformTab
}: MainHeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPointsDropdown, setShowPointsDropdown] = useState(false);
  const [showGuidesDropdown, setShowGuidesDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cities = getCitiesList();

  // Search execution
  const executeSearch = (query: string) => {
    if (!query.trim()) return;
    const normalized = query.trim().toLowerCase();
    
    // Check match for cities list
    const found = cities.find(c => 
      c.name.toLowerCase().includes(normalized) || 
      c.slug.includes(normalized) ||
      c.state.toLowerCase().includes(normalized) ||
      c.region.toLowerCase().includes(normalized)
    );

    if (found) {
      onSelectCity(found.slug);
      onSelectPlatformTab('locations');
      const element = document.getElementById(`city-page-${found.slug}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // Gentle fallback notification inside ui
      alert(`City or area "${query}" is monitored under our pan-India backup, but no specialized local landing page covers this exact phrase yet. Auto-redirecting you to our Central Kerala gateway Kochi!`);
      onSelectCity('kochi');
      onSelectPlatformTab('locations');
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleQuickSearch = (citySlug: string) => {
    onSelectCity(citySlug);
    onSelectPlatformTab('locations');
    setTimeout(() => {
      const element = document.getElementById(`city-page-${citySlug}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // 10 top districts listed in "Select a District" cardboard card
  const selectDistricts = [
    { name: 'Ernakulam', count: 18, points: '18 Collection Points', slug: 'kochi' },
    { name: 'Kozhikode', count: 24, points: '24 Collection Points', slug: 'kozhikode' },
    { name: 'Thrissur', count: 16, points: '16 Collection Points', slug: 'thrissur' },
    { name: 'Thiruvananthapuram', count: 15, points: '15 Collection Points', slug: 'trivandrum' },
    { name: 'Kannur', count: 12, points: '12 Collection Points', slug: 'kannur' },
    { name: 'Malappuram', count: 10, points: '10 Collection Points', slug: 'kozhikode' }, // redirect to nearest calicut
    { name: 'Kollam', count: 8, points: '8 Collection Points', slug: 'trivandrum' }, // redirect to south hub
    { name: 'Palakkad', count: 7, points: '7 Collection Points', slug: 'thrissur' },
    { name: 'Kottayam', count: 6, points: '6 Collection Points', slug: 'kottayam' },
    { name: 'Alappuzha', count: 5, points: '5 Collection Points', slug: 'alappuzha' }
  ];

  return (
    <div className="w-full bg-slate-50 text-slate-800 font-sans">
      
      {/* 1. GREEN DEEP FOREST TRUST TOP-BAR */}
      <div className="bg-[#06281F] text-white text-[10px] md:text-xs py-2 px-4 md:px-8 border-b border-emerald-950/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          
          {/* Trust badges left side */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 font-mono tracking-tight text-emerald-100">
            <span className="flex items-center gap-1">
              <span className="text-emerald-400 font-bold">✓</span> KSPCB Authorized
            </span>
            <span className="flex items-center gap-1 opacity-90">
              <span className="text-emerald-400 font-bold">✓</span> KL/EW/628
            </span>
            <span className="flex items-center gap-1 opacity-90">
              <span className="text-emerald-400 font-bold">✓</span> NIST 800-88 Data Purge
            </span>
            <span className="flex items-center gap-1 opacity-90 pb-0.5">
              <span className="text-emerald-400 font-bold">✓</span> DPDP Act 2023 Compliant
            </span>
            <span className="flex items-center gap-1 opacity-90 text-[10px]">
              <span className="text-emerald-400 font-bold">✓</span> Zero Landfill Commitment
            </span>
          </div>

          {/* Quick contact right side */}
          <div className="flex items-center gap-4 text-emerald-100 font-mono text-[10px]">
            <span className="flex items-center gap-1 hover:text-white transition cursor-pointer">
              📍 Kochi, Kerala
            </span>
            <a href="tel:+917500555454" className="flex items-center gap-1 hover:text-white transition">
              📞 +91 7500 555 454
            </a>
            <a 
              href="https://wa.me/917500555454" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#25D366] hover:bg-[#20ba59] text-white px-2.5 py-1 rounded-full font-sans font-bold text-[10px] uppercase flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <MessageSquare className="w-3 h-3 fill-current text-white stroke-0" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BLOCK */}
      <header className="sticky top-0 z-50 transition-all duration-300">
        <div className={`bg-white/95 border-b transition-all duration-300 ${scrolled ? 'shadow-md border-slate-200/90 py-2.5' : 'shadow-sm border-slate-100/85 py-3.5'}`}>
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          
          {/* Brand Logo Left */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleQuickSearch('kochi')}>
            <div className="w-10 h-10 bg-[#06281F]/5 text-[#06281F] rounded-full flex items-center justify-center transition-transform hover:rotate-12 duration-300">
              <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" className="stroke-[#06281F]" strokeWidth="1.5" />
                <path d="M16 26 L24 16 L32 26" className="stroke-[#F27D26]" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M24 16 L24 32" className="stroke-[#06281F]" strokeWidth="2.5" />
                <circle cx="24" cy="16" r="2.5" className="fill-[#F27D26]" />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black tracking-tighter text-[#06281F] uppercase">Ewaste</span>
                <span className="text-xl font-extrabold tracking-tight text-[#F27D26] uppercase">Kochi</span>
              </div>
              <span className="text-[8.5px] font-mono leading-none tracking-widest text-slate-400 uppercase font-black">Location Network</span>
            </div>
          </div>

          {/* Navigation link items in center */}
          <nav className="hidden lg:flex items-center gap-6 text-[12.5px] font-sans font-semibold text-slate-600">
            <a href="#home" className="text-[#06281F] border-b-2 border-[#06281F] pb-1 font-bold">
              Home
            </a>

            <button
              onClick={() => onSelectPlatformTab('itad-infopark')}
              className="hover:text-[#06281F] font-bold bg-[#06281F]/5 text-[#06281F] px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 hover:bg-[#06281F] hover:text-white transition-all duration-200 cursor-pointer"
            >
              🏢 Infopark ITAD Campaign
            </button>
            
            {/* Collection Points with custom drop indicator */}
            <div className="relative">
              <button 
                onClick={() => setShowPointsDropdown(!showPointsDropdown)}
                className="hover:text-[#06281F] transition flex items-center gap-1 py-1"
                aria-haspopup="true"
              >
                <span>Collection Points</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-450 transition-transform duration-250 ${showPointsDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showPointsDropdown && (
                <div className="absolute top-8 left-0 w-56 bg-white border border-slate-100 rounded-xl shadow-lg p-2.5 z-10 grid grid-cols-1 gap-1 text-slate-700 font-sans font-medium text-xs">
                  {cities.slice(0, 6).map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => {
                        handleQuickSearch(c.slug);
                        setShowPointsDropdown(false);
                      }}
                      className="text-left w-full py-1.5 px-2 hover:bg-slate-50 hover:text-[#06281F] rounded-lg transition"
                    >
                      📍 {c.name} Hub ({c.state})
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a href="#section-cta" onClick={() => {
              const element = document.getElementById('section-cta');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }} className="hover:text-[#06281F] transition py-1">
              Schedule Pickup
            </a>
            
            <a href="#section-auth-tracker" onClick={() => {
              const element = document.getElementById('section-auth-tracker');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }} className="hover:text-[#06281F] transition py-1">
              Track Request
            </a>

            <a href="#section-schema-view" onClick={() => {
              const element = document.getElementById('section-schema-view');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }} className="hover:text-[#06281F] transition py-1">
              Bulk Pickup
            </a>

            {/* Guides with custom drop indicator */}
            <div className="relative">
              <button 
                onClick={() => setShowGuidesDropdown(!showGuidesDropdown)}
                className="hover:text-[#06281F] transition flex items-center gap-1 py-1"
                aria-haspopup="true"
              >
                <span>Guides</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-450 transition-transform duration-250 ${showGuidesDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showGuidesDropdown && (
                <div className="absolute top-8 right-0 w-64 bg-white border border-slate-100 rounded-xl shadow-lg p-2.5 z-10 grid grid-cols-1 gap-1 text-slate-700 font-sans font-medium text-xs">
                  <button
                    onClick={() => {
                      onSelectPlatformTab('pillars');
                      setShowGuidesDropdown(false);
                    }}
                    className="text-left w-full py-1.5 px-2.5 hover:bg-slate-50 hover:text-[#06281F] rounded-lg transition"
                  >
                    📚 All Compliance Pillars
                  </button>
                  <a
                    href="#section-sitemap"
                    className="text-left w-full py-1.5 px-2.5 hover:bg-slate-50 hover:text-[#06281F] rounded-lg transition"
                    onClick={() => setShowGuidesDropdown(false)}
                  >
                    🕸️ Programmatic Site Map Index
                  </a>
                </div>
              )}
            </div>

            <a href="#section-schema-view" onClick={() => {
              const element = document.getElementById('section-schema-view');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }} className="hover:text-[#06281F] transition py-1">
              Contact
            </a>
          </nav>

          {/* Right Button Column */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const element = document.getElementById('section-cta');
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="bg-[#F27D26] hover:bg-[#db6a18] text-white font-sans font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>Book Pickup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* 3. HERO MAIN CONTAINER PORTION */}
      <section className="relative overflow-hidden bg-slate-100 py-10 md:py-16 px-4 md:px-8 border-b border-slate-200">
        
        {/* Decorative backdrop mesh layout */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-75"></div>
        
        {/* Absolute ambient light leaks */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-100/30 to-rose-100/20 blur-3xl rounded-full z-0 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Left Segment: Key headlines, Search tool & benefits list */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10.5px] font-mono font-bold tracking-widest px-3 py-1 rounded-full uppercase border border-emerald-100 animate-pulse">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kerala-Wide Coverage Area</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none font-display">
              Find E-Waste Pickup <br className="hidden sm:inline" />
              Locations <span className="text-[#F27D26]">Near You</span>
            </h1>

            <p className="text-sm md:text-base text-slate-600 max-w-xl font-sans leading-relaxed">
              KSPCB authorized collection points and secure electronic waste recycling pickup services across all districts & municipalities of Kerala.
            </p>

            {/* Checklist of 4 items with premium rounded check badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                "Free pickup for 10+ units",
                "Same-day pickup in major cities",
                "DPDP compliant data destruction",
                "Live tracking & certificate provided"
              ].map((bullet, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3.5]" />
                  </div>
                  <span className="text-xs md:text-[13px] font-semibold text-slate-700">{bullet}</span>
                </div>
              ))}
            </div>

            {/* Search Input Box Frame */}
            <form onSubmit={handleSearchSubmit} className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-md flex flex-col sm:flex-row items-center gap-2 max-w-xl">
              <div className="relative w-full flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Search by city, area or pincode (e.g., Kozhikode, Kochi, Kollam...)"
                  className="w-full pl-10 pr-4 py-2 bg-transparent text-slate-800 placeholder-slate-400 text-xs md:text-sm outline-hidden focus:ring-0 focus:border-transparent font-sans"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#F27D26] hover:bg-[#db6a18] text-white font-mono font-bold text-[11px] uppercase tracking-wide px-6 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                Search Locations
              </button>
            </form>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-sans">
              <span className="font-semibold">Popular Searches:</span>
              {['Kochi', 'Trivandrum', 'Kozhikode', 'Thrissur', 'Kannur'].map((pName) => {
                const mapSlug: Record<string, string> = {
                  'Kochi': 'kochi',
                  'Trivandrum': 'trivandrum',
                  'Kozhikode': 'kozhikode',
                  'Thrissur': 'thrissur',
                  'Kannur': 'kannur'
                };
                return (
                  <button
                    key={pName}
                    onClick={() => handleQuickSearch(mapSlug[pName])}
                    className="text-emerald-700 hover:text-emerald-900 hover:underline font-bold transition cursor-pointer"
                  >
                    {pName}
                  </button>
                );
              })}
            </div>

            {/* Interactive Campaign Alert banner for Infopark ITAD */}
            <div 
              onClick={() => onSelectPlatformTab('itad-infopark')}
              className="bg-[#051C15] text-[#6ee7b7] border border-emerald-900 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#06281F] hover:border-emerald-700 transition duration-300 shadow-md max-w-xl group"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-emerald-400 font-extrabold uppercase tracking-wider block">🏢 ACTIVE CORPORATE CAMPAIGN</span>
                <h4 className="text-xs font-bold text-white group-hover:text-[#F27D26] transition-colors leading-tight">
                  ITAD & Secure Scrap Recycling inside Infopark Kakkanad
                </h4>
                <p className="text-[10.5px] text-emerald-300 leading-normal font-sans font-light">
                  Calculate maximum residual recovery buyback values, request hard drive wiping & generate KSPCB compliant Form-3 certificates instantly.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Right Segment: Coastal scenery backdrop, SVG Map with pins, truck animation & list box */}
          <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start h-full relative">
            
            {/* Cyber Map backdrop container with animated trucks & neon green glowing centers */}
            <div className="md:col-span-1 lg:col-span-7 bg-slate-950 rounded-3xl p-4 border-2 border-emerald-500/30 shadow-lg shadow-emerald-950/20 overflow-hidden relative min-h-[300px] flex flex-col justify-between">
              
              {/* Cyber tech network background digital elements */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.04)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(16,185,129,0.04)_1.5px,transparent_1.5px)] bg-[size:16px_16px] pointer-events-none"></div>
              
              {/* Top ambient green light leak */}
              <div className="absolute top-0 left-1/4 w-36 h-24 bg-emerald-500/10 blur-xl rounded-full pointer-events-none"></div>

              {/* Header inside Scenic card */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[9px] font-mono tracking-wider font-extrabold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/40 uppercase">
                  ⚡ CYBER KERALA LOGISTICS GRID
                </span>
                <span className="text-[8px] font-mono font-bold text-emerald-500/80 animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-450"></span> ACTIVE
                </span>
              </div>

              {/* Stylized Interactive Map Layout */}
              <div className="relative w-full h-44 my-2 flex items-center justify-center z-10">
                <svg className="w-52 h-44 text-slate-400" viewBox="0 0 200 180" fill="none">
                  <defs>
                    <linearGradient id="keralaGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="50%" stopColor="#047857" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#022c22" stopOpacity="0.05" />
                    </linearGradient>
                    <filter id="neonGlow" x="-35%" y="-35%" width="170%" height="170%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* High-Fidelity Realistic Kerala Spline Outline State drawing with cyber neon style */}
                  <path 
                    d="M 52 10 
                       C 55 15, 59 21, 62 26 
                       C 65 31, 68 36, 72 42 
                       C 76 48, 80 54, 84 61 
                       C 88 68, 92 75, 96 83 
                       C 100 91, 103 99, 105 107 
                       C 107 115, 109 123, 110 131 
                       C 111 139, 113 147, 116 155 
                       C 119 163, 122 170, 128 175 
                       C 134 178, 136 179, 135 177 
                       C 130 171, 127 163, 124 154 
                       C 121 145, 119 136, 116 127 
                       C 113 118, 110 109, 107 100 
                       C 104 91, 100 82, 96 73 
                       C 92 64, 87 55, 83 46 
                       C 79 37, 74 28, 70 19 
                       C 66 10, 60 5, 52 10 Z" 
                    fill="url(#keralaGlowGrad)" 
                    stroke="#10b981" 
                    strokeWidth="1.8" 
                    filter="url(#neonGlow)"
                    className="opacity-90"
                  />

                  {/* High-tech communication network lines */}
                  <path 
                    d="M 55 12 L 75 35 L 92 65 L 102 115 L 108 135 L 118 155 L 128 175" 
                    stroke="#059669" 
                    strokeWidth="1.2" 
                    strokeOpacity="0.6" 
                    strokeDasharray="3 3"
                    fill="none"
                  />
                  
                  {/* Interactive pins dots plotted nicely inside map bounds */}
                  {[
                    { x: 55, y: 12, name: 'Kasaragod', points: 8, slug: 'kozhikode' },
                    { x: 75, y: 35, name: 'Kannur', points: 10, slug: 'kannur' },
                    { x: 92, y: 65, name: 'Kozhikode', points: 18, slug: 'kozhikode' },
                    { x: 102, y: 115, name: 'Thrissur', points: 16, slug: 'thrissur' },
                    { x: 108, y: 135, name: 'Ernakulam', points: 14, slug: 'kochi' },
                    { x: 118, y: 155, name: 'Alappuzha', points: 10, slug: 'alappuzha' },
                  ].map((pin, idx) => {
                    const isFocus = activeCitySlug === pin.slug;
                    return (
                      <g 
                        key={idx} 
                        className="cursor-pointer group select-none"
                        onClick={() => handleQuickSearch(pin.slug)}
                      >
                        {/* Interactive glow scale ring */}
                        <circle 
                          cx={pin.x} 
                          cy={pin.y} 
                          r={isFocus ? 13 : 8} 
                          className={`${isFocus ? 'fill-emerald-400/20 stroke-emerald-400 animate-pulse' : 'fill-emerald-500/10 stroke-emerald-500/40'} group-hover:fill-emerald-500/30 group-hover:stroke-emerald-400 transition-all duration-300`} 
                          strokeWidth="1.5"
                        />
                        {/* Dynamic cyber wave pulsing rings emanating from collection centers */}
                        {isFocus && (
                          <circle 
                            cx={pin.x} 
                            cy={pin.y} 
                            r="18" 
                            className="fill-none stroke-emerald-400/60 opacity-60 animate-ping"
                            style={{ transformOrigin: `${pin.x}px ${pin.y}px` }}
                          />
                        )}

                        {/* Pin core dot */}
                        <circle 
                          cx={pin.x} 
                          cy={pin.y} 
                          r={isFocus ? 5 : 3.5} 
                          className={`${isFocus ? 'fill-[#F27D26]' : 'fill-emerald-400 group-hover:fill-[#F27D26]' } transition-all`} 
                        />
                        
                        {/* Place marker radar beacon line */}
                        <line x1={pin.x} y1={pin.y} x2={pin.x} y2={pin.y - 8} stroke={isFocus ? '#F27D26' : '#10b981'} strokeWidth="1" strokeDasharray="1 1" />

                        {/* Cyberstyled active text pin label alongside node */}
                        <g transform={`translate(${pin.x + 6}, ${pin.y - 12})`}>
                          <rect x="0" y="0" width="13" height="10" rx="2.5" fill="#022c22" stroke="#10b981" strokeWidth="0.8" className="shadow-xs" />
                          <text x="6.5" y="7.5" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#34d399">{pin.points}</text>
                        </g>

                        {/* Hover Tooltip tag with futuristic glass styling */}
                        <g className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-250">
                          <rect x={pin.x - 25} y={pin.y - 25} width="50" height="11" rx="2" fill="#042f2e" stroke="#10b981" strokeWidth="0.5" />
                          <text x={pin.x} y={pin.y - 17} textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#34d399">{pin.name}</text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* CSS-Animated Truck Graphics core at the bottom of map block with dark cyber theme */}
              <div className="relative z-10 w-full bg-slate-900 border-2 border-emerald-500/25 rounded-2xl p-2 shadow-md mt-3 select-none">
                <div className="flex items-center gap-2 relative overflow-hidden h-7">
                  
                  {/* Moving truck assembly */}
                  <div className="flex items-center gap-1.5 absolute animate-march-truck inline-flex whitespace-nowrap">
                    <div className="w-5 h-5 bg-gradient-to-r from-emerald-600 to-[#F27D26] rounded-md text-white flex items-center justify-center font-bold text-[8px] shrink-0 font-mono shadow-md">
                      🚚
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-[8.5px] text-emerald-400 font-mono leading-none uppercase tracking-tight">Kochi E-Waste Fleet</strong>
                      <span className="text-[6.5px] text-white/80 font-mono leading-none tracking-tight uppercase font-extrabold">GPS-TRACKED • ZERO LANDFILL</span>
                    </div>
                  </div>

                  {/* Right side static label */}
                  <div className="ml-auto text-[7.5px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded shrink-0">
                    SENSORS ONLINE
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card Panel: Select a District (White Cardboard Core) */}
            <div className="md:col-span-1 lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-lg relative min-h-[300px] flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-2 mb-3">
                  <h3 className="font-display font-black text-slate-800 text-sm">Select a District</h3>
                  <p className="text-[9.5px] text-slate-400 font-mono">10 Anchor Resource Gateways</p>
                </div>

                {/* Vertical interactive list of 10 districts */}
                <div className="space-y-1.5 max-h-[195px] overflow-y-auto pr-1">
                  {selectDistricts.map((dst) => {
                    const isCurrent = activeCitySlug === dst.slug;
                    return (
                      <button
                        key={dst.name}
                        onClick={() => handleQuickSearch(dst.slug)}
                        className={`w-full py-2 px-3 border rounded-xl text-left transition-all cursor-pointer flex justify-between items-center ${
                          isCurrent 
                            ? 'bg-[#06281F] border-emerald-950 text-white font-bold scale-[1.01] shadow-2xs' 
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono text-[8px] font-bold ${
                            isCurrent ? 'bg-[#F27D26] text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {dst.count}
                          </span>
                          <span className="truncate text-xs tracking-tight font-medium">{dst.name}</span>
                        </div>
                        <span className={`text-[8.5px] font-mono ${isCurrent ? 'text-emerald-300' : 'text-slate-400'}`}>
                          {dst.count} Points &gt;
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* View all districts bottom text button */}
              <div className="pt-2 border-t border-slate-100 mt-2 text-center">
                <button
                  onClick={() => {
                    const element = document.getElementById('section-sitemap');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[10px] font-mono font-extrabold text-[#06281F] hover:text-[#F27D26] uppercase transition flex items-center justify-center gap-1 mx-auto"
                >
                  <span>View All Districts</span>
                  <MapPin className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SEVEN HORIZONTAL ICON CARDS OF CORE OFFERINGS */}
      <section className="bg-white border-b border-rose-100/10 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { 
                title: 'Collection Points', 
                subtitle: 'Find centers near you', 
                icon: '📍',
                onClick: () => {
                  const element = document.getElementById('section-sitemap');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }
              },
              { 
                title: 'Schedule Pickup', 
                subtitle: 'Book a free pickup', 
                icon: '🚚',
                onClick: () => {
                  const element = document.getElementById('section-cta');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              },
              { 
                title: 'Bulk Pickup', 
                subtitle: 'For offices & industries', 
                icon: '🏢',
                onClick: () => {
                  const element = document.getElementById('section-schema-view');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }
              },
              { 
                title: 'Track Request', 
                subtitle: 'Live tracking updates', 
                icon: '💻',
                onClick: () => {
                  const element = document.getElementById('section-auth-tracker');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }
              },
              { 
                title: 'Data Security', 
                subtitle: 'NIST 800-88 certified', 
                icon: '🛡️',
                onClick: () => {
                  onSelectPlatformTab('pillars');
                  setTimeout(() => {
                    const element = document.getElementById('live-content-preview-anchor');
                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }
              },
              { 
                title: 'Certificates', 
                subtitle: 'Get digital certificate', 
                icon: '📜',
                onClick: () => {
                  const element = document.getElementById('section-email-simulator');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }
              },
              { 
                title: 'Guides & Help', 
                subtitle: 'E-waste information', 
                icon: '❓',
                onClick: () => {
                  onSelectPlatformTab('pillars');
                }
              }
            ].map((offering, idx) => (
              <div 
                key={idx}
                onClick={offering.onClick}
                className="bg-slate-50 hover:bg-[#06281F]/5 border border-slate-200/55 hover:border-emerald-300 rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-xl mb-1.5">{offering.icon}</div>
                <h4 className="font-sans font-bold text-slate-800 text-[11px] md:text-xs leading-snug truncate">{offering.title}</h4>
                <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{offering.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. STATISTICAL OVERVIEW KPI BAR */}
      <section className="bg-[#05221b] text-white py-6 px-4 md:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
          
          {/* Dynamic counter facts elements */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 text-center lg:text-left">
            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-extrabold block">Network Hubs</span>
              <strong className="text-xl md:text-2xl font-black block font-display leading-tight text-white">215+</strong>
              <span className="text-[8px] text-slate-400 font-mono block">Collection Points</span>
            </div>
            
            <div className="h-8 w-px bg-emerald-900 hidden sm:block"></div>
            
            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-extrabold block">Volume Completed</span>
              <strong className="text-xl md:text-2xl font-black block font-display leading-tight text-white">32,450+</strong>
              <span className="text-[8px] text-slate-400 font-mono block">Household Pickups</span>
            </div>

            <div className="h-8 w-px bg-emerald-900 hidden sm:block"></div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-extrabold block">Tons Decommissioned</span>
              <strong className="text-xl md:text-2xl font-black block font-display leading-tight text-white">1,250+</strong>
              <span className="text-[8px] text-slate-400 font-mono block">Processed Materials</span>
            </div>

            <div className="h-8 w-px bg-emerald-900 hidden sm:block"></div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-extrabold block">Material Recovered</span>
              <strong className="text-xl md:text-2xl font-black block font-display leading-tight text-white">98.7%</strong>
              <span className="text-[8px] text-slate-400 font-mono block">Recovery Standard</span>
            </div>

            <div className="h-8 w-px bg-emerald-900 hidden sm:block"></div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-[#F27D26] uppercase font-mono tracking-wider font-extrabold block">Sustainability Goal</span>
              <strong className="text-xl md:text-2xl font-black block font-display leading-tight text-white">100%</strong>
              <span className="text-[8px] text-emerald-350 font-mono block">Zero Landfill Level</span>
            </div>
          </div>

          {/* Large Maps and Booking buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0 font-mono text-[10px] uppercase font-extrabold">
            <a 
              href="https://google.com/maps?q=e-waste+collection+kochi" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#24d96c] hover:bg-[#1fbd5d] text-[#05221b] py-2.5 px-5 rounded-xl text-center transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Map className="w-4 h-4" />
              <span>Open in Google Maps</span>
            </a>
            
            <button 
              onClick={() => {
                const element = document.getElementById('section-cta');
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="bg-transparent hover:bg-white/10 text-white border border-emerald-800 hover:border-white py-2.5 px-5 rounded-xl text-center transition flex justify-center items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Book Secure Collection</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
