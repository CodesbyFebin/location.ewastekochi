import { useState, useEffect } from 'react';
import { getCityBySlug } from './data/cities';
import { getPillarBySlug, getPillarsList } from './data/pillars';
import { ConversionLog } from './types';
import Dashboard from './components/Dashboard';
import CityTemplate from './components/CityTemplate';
import PillarTemplate from './components/PillarTemplate';
import ITADInfoparkLanding from './components/ITADInfoparkLanding';
import AuthAndTracker from './components/AuthAndTracker';
import GeolocationBanner from './components/GeolocationBanner';
import MainHeroSection from './components/MainHeroSection';
import SitemapIndex from './components/SitemapIndex';
import { useSeo, getCanonicalUrl } from './packages/seo';
import { isEnabled } from './packages/flags';
import { Leaf, Cpu, Mail, Globe, MapPin, Eye, Settings, FileSpreadsheet, BadgeInfo } from 'lucide-react';

export default function App() {
  // Centralized SEO Configuration for Core Hub
  useSeo({
    title: 'E-Waste Kochi - Authorized E-Waste Recycling & Certified ITAD solutions',
    description: 'CPCB-authorized electronic waste recycling and secure ITAD services in Kerala. Schedule high-payout corporate pickups, data destruction, and green circular logistics.',
    canonicalUrl: getCanonicalUrl('homepage'),
    ogImage: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=600&q=80'
  });

  // Kozhikode first, as requested by the user!
  const [activeCitySlug, setActiveCitySlug] = useState('kozhikode');
  const [activePillarSlug, setActivePillarSlug] = useState('data-destruction-standards-india');
  const [platformTab, setPlatformTab] = useState<'locations' | 'pillars' | 'itad-infopark' | 'sitemap'>('locations');
  const [browseHistory, setBrowseHistory] = useState<string[]>(['kozhikode']);
  const [conversions, setConversions] = useState<ConversionLog[]>([]);

  // Sync historical browsing across city selectors
  const handleSelectCity = (slug: string) => {
    setActiveCitySlug(slug);
    setBrowseHistory((prev) => {
      // Keep unique history
      if (prev.includes(slug)) {
        return [slug, ...prev.filter((s) => s !== slug)];
      }
      return [slug, ...prev];
    });
  };

  // Sync historical browsing across evergreen topics
  const handleSelectPillar = (slug: string) => {
    setActivePillarSlug(slug);
    setBrowseHistory((prev) => {
      const entry = `pillar/${slug}`;
      if (prev.includes(entry)) {
        return [entry, ...prev.filter((s) => s !== entry)];
      }
      return [entry, ...prev];
    });
  };

  // Safe fetch active datasets
  const activeCityData = getCityBySlug(activeCitySlug);
  const activePillarData = getPillarBySlug(activePillarSlug);
  const pillarsList = getPillarsList();

  // Handle pickup conversion logs for emails
  const handleSchedulePickup = (details: {
    email: string;
    phone: string;
    deviceType: string;
    estimatedPayout: number;
    history: string[];
  }) => {
    const newLog: ConversionLog = {
      id: `CON-${Math.floor(Math.random() * 900000 + 100000)}`,
      timestamp: new Date().toISOString(),
      city: activeCitySlug,
      email: details.email,
      phone: details.phone,
      deviceType: details.deviceType,
      estimatedPayout: details.estimatedPayout,
      historyViewed: details.history
    };

    setConversions((prev) => [...prev, newLog]);
    
    // Auto scroll or focus down on the Email simulation module to highlight the feature immediately!
    setTimeout(() => {
      const element = document.getElementById('section-email-simulator');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 leading-normal font-sans antialiased">
      
      {/* Main High Fidelity Portal Header, Scenic Hero & Services Board */}
      <MainHeroSection 
        activeCitySlug={activeCitySlug}
        onSelectCity={handleSelectCity}
        onSelectPlatformTab={setPlatformTab}
      />

      {/* Content wrapper */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12">
        
        {/* Real-time approximate location detection / simulation engine */}
        <GeolocationBanner 
          activeCitySlug={activeCitySlug} 
          onSelectCity={handleSelectCity} 
          onNavigateToTab={setPlatformTab} 
        />

        {/* Unified Eco-Impact Commitment section explaining safe recycling in human tone */}
        <section className="bg-slate-900 text-slate-100 rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 text-indigo-800 opacity-5 pointer-events-none">
            <Settings className="w-48 h-48" />
          </div>
          
          <div className="max-w-3xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6ee7b7] bg-emerald-950 px-2.5 py-1 rounded border border-emerald-900/50">
              Responsible Circular Action
            </span>
            <h2 className="text-xl md:text-3xl font-display font-bold text-white tracking-tight mt-3">
              Safeguarding Kerala's Landscapes through Non-Hazardous Asset Recovery
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-3 leading-relaxed font-light font-sans">
              As technology progresses, obsolete devices should not end up in municipal landfill units where corrosive substances threaten pristine waterways. Our statewide infrastructure is dedicated to recovering rare secondary commodities while maintaining complete data confidentiality. We integrate strict hardware dismantling protocols with transparent traceability reports to help businesses and households alike.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-800/80">
            <div className="space-y-1">
              <span className="text-[#6ee7b7] font-bold text-xs block">1. 100% Zero-Landfill Destination</span>
              <span className="text-[11px] text-slate-400 leading-relaxed block font-sans">
                Every component collected goes directly to state-of-the-art automated scrap refineries, ensuring zero soil contamination.
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[#6ee7b7] font-bold text-xs block">2. Military-Grade Data Destruction</span>
              <span className="text-[11px] text-slate-400 leading-relaxed block font-sans">
                Storage medias are sterilized or shredded with legal compliance audits conforming to strict DPDP and NIST safety guidelines.
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[#6ee7b7] font-bold text-xs block">3. Re-introducing Secondary Metals</span>
              <span className="text-[11px] text-slate-400 leading-relaxed block font-sans">
                We reclaim trace elements of copper, silver, and gold to prevent unnecessary mining extraction cycles and reduce carbon footprints.
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: Regional E-Waste Collection Directory */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h3 className="font-display font-extrabold text-slate-900 text-base tracking-tight">
              Statewide E-Waste Disposal Hubs & Action Centres
            </h3>
          </div>
          <Dashboard
            activeCitySlug={activeCitySlug}
            onSelectCity={handleSelectCity}
            activePillarSlug={activePillarSlug}
            onSelectPillar={handleSelectPillar}
            platformTab={platformTab}
            onSelectPlatformTab={setPlatformTab}
            conversions={conversions}
            browseHistory={browseHistory}
          />
        </div>

        {/* Real-time Tracking and Authentication cockpit */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <h3 className="font-display font-extrabold text-slate-900 text-base md:text-lg tracking-tight">
              Secure client workspace & active real-time GPS tracking simulator
            </h3>
          </div>
          <AuthAndTracker />
        </div>

        {/* Section 3: Live Portal Active Content preview (No simulated crawler header) */}
        <div className="space-y-4 pt-4">
          
          {/* Render the full content preview depending on active catalog navigation */}
          {platformTab === 'itad-infopark' ? (
            <ITADInfoparkLanding 
              onSelectCity={handleSelectCity}
              onSelectPlatformTab={setPlatformTab}
              onSchedulePickup={handleSchedulePickup}
            />
          ) : platformTab === 'locations' ? (
            activeCityData ? (
              <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-xs animate-fadeIn">
                <CityTemplate 
                  city={activeCityData} 
                  onSchedulePickup={handleSchedulePickup}
                  browseHistory={browseHistory}
                  onSelectCity={handleSelectCity}
                />
              </div>
            ) : (
              <div className="bg-amber-50 rounded-2xl p-6 text-center border border-amber-100 text-slate-600 font-sans text-xs">
                Error fetching schema metadata for slug "{activeCitySlug}". Reverting directory listings...
              </div>
            )
          ) : platformTab === 'sitemap' ? (
            <SitemapIndex />
          ) : (
            activePillarData ? (
              <PillarTemplate 
                pillar={activePillarData} 
                onNavigateToPillar={handleSelectPillar}
                allPillars={pillarsList}
              />
            ) : (
              <div className="bg-amber-50 rounded-2xl p-6 text-center border border-amber-100 text-slate-600 font-sans text-xs">
                Error fetching topical metadata for slug "{activePillarSlug}". Reverting directory listings...
              </div>
            )
          )}
        </div>

        {/* Section 4: Email simulator highlight container */}
        <div id="section-email-simulator" className="p-1 scroll-mt-20">
          <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-2xl md:p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-start gap-3 max-w-xl">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl h-fit">
                <Mail className="w-5 h-5 shrink-0" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-slate-800 text-xs md:text-sm">Personalized Pick-up Offers & Green Bonus Codes</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                  Our system generates clean, custom bonus vouchers and dispatch confirmations depending on your location. Submit an estimated pickup calculation on any active city page to see your custom recycling vouchers and details instantly!
                </p>
              </div>
            </div>
            <a 
              href="#section-overview" 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('tab-btn-cta');
                if (element) {
                  element.click();
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition md:block flex text-center justify-center align-middle"
            >
              Simulate conversion now →
            </a>
          </div>
        </div>

      </main>

      {/* Global Comprehensive High-Fidelity Forest Green Directories Footer */}
      <footer className="bg-[#051C15] text-slate-300 pt-16 pb-8 px-4 md:px-8 mt-20 border-t border-emerald-950 font-sans">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* 7-Segment Main Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 text-xs">
            
            {/* Column 1: Brand Logo & Social rows (4 cols span) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-emerald-400 font-bold text-sm">✓</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <strong className="text-white font-black text-sm uppercase">EWaste</strong>
                    <strong className="text-[#F27D26] font-extrabold text-sm uppercase">Kochi</strong>
                  </div>
                  <span className="text-[7.5px] text-slate-400 font-mono font-black tracking-widest uppercase">Location Network</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                EWasteKochi helps businesses and individuals securely recycle electronic waste, ensure data protection, promote compliance and build a sustainable future.
              </p>

              <div className="space-y-1 text-[11px]">
                <span className="font-semibold text-white block">Active Service Areas:</span>
                <span className="text-slate-400 italic">Kochi • Kerala • Bengaluru • Chennai • Hyderabad • Mumbai • UAE Operations</span>
              </div>

              {/* Social Icon Row */}
              <div className="flex items-center gap-2 pt-2">
                {['linkedin', 'twitter', 'facebook', 'youtube', 'instagram'].map((social) => (
                  <button key={social} className="w-7 h-7 bg-white/5 hover:bg-emerald-600/35 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition duration-200 uppercase font-mono text-[8px] font-bold">
                    {social[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 2: EWASTEKOCHI PLATFORM (1.5 cols span) */}
            <div className="lg:col-span-1.5 space-y-3">
              <h4 className="font-mono text-[10px] font-bold text-white uppercase tracking-wider">EwasteKochi Platform</h4>
              <ul className="space-y-1.5 text-[10.5px] text-slate-400 font-mono">
                {['info@ewastekochi.com', 'www.ewastekochi.com', 'customer@ewastekochi.com', 'enterprise@ewastekochi.com', 'blog.ewastekochi.com', 'care@ewastekochi.com', 'certificates.ewastekochi.com', 'compliance.ewastekochi.com', 'esg.ewastekochi.com', 'secure.ewastekochi.com', 'itad.ewastekochi.com'].map((item) => (
                  <li key={item} className="hover:text-[#F27D26] transition truncate">
                    <a href="https://ewastekochi.com" target="_blank" rel="noopener noreferrer">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: PLATFORM NETWORK (1.5 cols span) */}
            <div className="lg:col-span-1.5 space-y-3">
              <h4 className="font-mono text-[10px] font-bold text-white uppercase tracking-wider">Platform Network</h4>
              <ul className="space-y-1.5 text-[10.5px] text-slate-400 font-mono">
                {['ai.ewastekochi.com', 'app.ewastekochi.com', 'partner.ewastekochi.com', 'intranet.ewastekochi.com', 'docs.ewastekochi.com', 'status.ewastekochi.com', 'api.ewastekochi.com', 'wiki.ewastekochi.com', 'community.ewastekochi.com', 'media.ewastekochi.com'].map((item) => (
                  <li key={item} className="hover:text-[#F27D26] transition truncate">
                    <a href="https://ewastekochi.com" target="_blank" rel="noopener noreferrer">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: SERVICES ECOSYSTEM (2 cols span) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-sans text-[10px] font-bold text-white uppercase tracking-wider">Services Ecosystem</h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400 font-sans">
                {['E-Waste Pickup', 'Secure Data Destruction', 'IT Asset Disposition (ITAD)', 'Server & Data Recycling', 'Laptop Recycling', 'Mobile Phone Recycling', 'Corporate IT Waste Collection', 'Data Center Decommissioning', 'DPDP-Compliant Solutions', 'Lithium Battery Recycling', 'E-Waste Refurbishment', 'AI Grading & Valuation', 'Enterprise Asset Buyback', 'Certified Refurbished', 'Compliance & EPR Advisory'].map((item) => (
                  <li key={item} className="hover:text-[#F27D26] transition">
                    <a href="https://ewastekochi.com/services" target="_blank" rel="noopener noreferrer">• {item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 5: FOR BUSINESS & INDIVIDUALS (1.5 cols span) */}
            <div className="lg:col-span-1.5 space-y-4">
              <div className="space-y-2">
                <h4 className="font-sans text-[10px] font-bold text-white uppercase tracking-wider">For Businesses</h4>
                <ul className="space-y-1 text-[11px] text-slate-400">
                  {['ITAD for Enterprise', 'High-Volume E-Waste Pickup', 'Batteries & EOL Assets', 'Hospital & Health Care', 'Government & Agency', 'University Recycling Program', 'Corporate CSR Solutions'].map((item) => (
                    <li key={item} className="hover:text-[#F27D26] transition text-[10.5px]">
                      <a href="https://ewastekochi.com/business" target="_blank" rel="noopener noreferrer">• {item}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 border-t border-emerald-950 pt-3">
                <h4 className="font-sans text-[10px] font-bold text-white uppercase tracking-wider">For Individuals</h4>
                <ul className="space-y-1 text-[11px] text-slate-400">
                  {['Schedule Instant Pickup', 'Track Logistics Instantly', 'Sell Old or Unused Devices', 'Instant Scrap Valuation', 'Clean Recycling Solutions', 'Download Certificates'].map((item) => (
                    <li key={item} className="hover:text-[#F27D26] transition text-[10.5px]">
                      <a href="https://ewastekochi.com" target="_blank" rel="noopener noreferrer">• {item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 6: DIGITAL TECH HUB (1 col span) */}
            <div className="lg:col-span-1 space-y-3">
              <h4 className="font-sans text-[10px] font-bold text-white uppercase tracking-wider whitespace-nowrap">Digital Channels</h4>
              <ul className="space-y-1.5 text-[10.5px] text-slate-400">
                {['Smart Recycling Engine', 'Dynamic Route Optimizer', 'EPR Reward Portal', 'Device Appraisal Logic', 'Predictive Pickup System'].map((item) => (
                  <li key={item} className="hover:text-[#F27D26] transition">
                    <a href="https://ewastekochi.com" target="_blank" rel="noopener noreferrer">• {item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 7: COMPLIANCE STANDARDS (1 col span) */}
            <div className="lg:col-span-1 space-y-3">
              <h4 className="font-sans text-[10px] font-bold text-white uppercase tracking-wider whitespace-nowrap">Compliance</h4>
              <ul className="space-y-1.5 text-[10.5px] text-slate-400">
                {['CPCB Compliance', 'KSPCB Authorized', 'NIST 800-88 Certified', 'NAID AAA Certified', 'ISO 14001:2015'].map((item) => (
                  <li key={item} className="hover:text-[#F27D26] transition">
                    <a href="https://ewastekochi.com/compliance" target="_blank" rel="noopener noreferrer">• {item}</a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Sub-grid of regional local directories links */}
          <div className="pt-8 border-t border-emerald-950 grid grid-cols-1 md:grid-cols-3 gap-6 text-[10.5px] text-slate-400 font-sans">
            
            <div className="space-y-2">
              <span className="font-mono text-[9px] font-bold text-white uppercase tracking-wider block">Regional E-Waste Pickup Network:</span>
              <div className="flex flex-wrap gap-x-2.5 gap-y-1">
                {['E-Waste Recycling Kochi', 'Laptop Recycling Kakkanad', 'Server Data Destruction Kochi', 'E-Waste Pickup Thiruvananthapuram', 'ITAD Services Kerala', 'Computer Scrap Buyers Kochi', 'Hard Disk Destruction Kerala', 'Corporate IT Disposal Kerala'].map((mesh) => (
                  <a key={mesh} href="https://ewastekochi.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition underline decoration-dotted decoration-white/20">{mesh}</a>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[9px] font-bold text-white uppercase tracking-wider block">Refurbished Device Exchange:</span>
              <div className="flex flex-wrap gap-x-2.5 gap-y-1">
                {['Refurbished Laptops', 'Phones', 'Desktops', 'Monitors', 'Recycled Dual Monitors', 'Bulk Auction Portal', 'Trade-In Buybacks'].map((item) => (
                  <a key={item} href="https://ewastekochi.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition underline decoration-dotted decoration-white/20">{item}</a>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[9px] font-bold text-white uppercase tracking-wider block">Enterprise API Systems:</span>
              <div className="flex flex-wrap gap-x-2.5 gap-y-1">
                {['REST API Services', 'GraphQL Gateway', 'Webhook Integration', 'Rate Appraisal Engine', 'OpenAPI Specifications'].map((item) => (
                  <a key={item} href="https://ewastekochi.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition underline decoration-dotted decoration-white/20">{item}</a>
                ))}
              </div>
            </div>

          </div>

          {/* Centered responsive GMB Embed Map Iframe of Kochi headquarters */}
          <div className="pt-8 border-t border-emerald-950/60 flex flex-col items-center space-y-4">
            <div className="w-full text-center max-w-2xl mx-auto space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6ee7b7] bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-1 rounded inline-block">
                📍 Authorized Central Processing Facility Location
              </span>
              <h4 className="font-display font-semibold text-white text-xs sm:text-sm">
                Kochi Secure E-Waste &amp; Certified ITAD - Data Destruction Solutions
              </h4>
              <p className="text-slate-400 text-[11px] font-sans">
                Near Infopark Kakkanad, Kochi, Kerala, India — Licensed E-Waste, Lead Inverter Refinery &amp; ITAD Plant
              </p>
            </div>
            <div className="w-full max-w-4xl h-56 sm:h-64 rounded-2xl border border-emerald-950/80 overflow-hidden shadow-xl shadow-emerald-950/30">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125744.63273804834!2d76.2447004890625!3d9.973853345731698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0873e1e02e1053%3A0xc6baa7e9228b3049!2sKochi%20Secure%20E-Waste%20%26%20Certified%20ITAD%20-%20Data%20Destruction%20Solutions!5e0!3m2!1sen!2sin!4v1779116858396!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Bottom copyright line bar */}
          <div className="pt-6 border-t border-emerald-950 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-mono">
            <span className="text-slate-400">© 2026 EWasteKochi Location Network. All rights reserved.</span>
            
            <div className="flex flex-wrap justify-center gap-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy', 'Sitemap', 'Accessibility'].map((legal) => (
                <a key={legal} href="https://ewastekochi.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition cursor-pointer">
                  {legal}
                </a>
              ))}
            </div>

            <span className="text-[#F27D26] font-bold flex items-center gap-1 shrink-0 font-sans">
              Made with ❤️ in Kerala
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}

