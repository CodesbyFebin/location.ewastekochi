import { useState, useMemo } from 'react';
import { City, ConversionLog, PillarPage } from '../types';
import { getCitiesList } from '../data/cities';
import { getPillarsList } from '../data/pillars';
import { 
  FolderGit2, ListFilter, Search, Map, CheckCircle2, 
  Workflow, ArrowRight, BookOpen, Mail, History, Terminal, 
  FileCheck2, Database, Network, Clock, ExternalLink, RefreshCw, Layers, Landmark, Globe, Building2, FileCode
} from 'lucide-react';

interface DashboardProps {
  onSelectCity: (slug: string) => void;
  activeCitySlug: string;
  onSelectPillar: (slug: string) => void;
  activePillarSlug: string;
  platformTab: 'locations' | 'pillars' | 'itad-infopark' | 'sitemap';
  onSelectPlatformTab: (tab: 'locations' | 'pillars' | 'itad-infopark' | 'sitemap') => void;
  conversions: ConversionLog[];
  browseHistory: string[];
}

export default function Dashboard({ 
  onSelectCity, 
  activeCitySlug, 
  onSelectPillar, 
  activePillarSlug, 
  platformTab, 
  onSelectPlatformTab, 
  conversions, 
  browseHistory 
}: DashboardProps) {
  const cities = useMemo(() => getCitiesList(), []);
  const pillars = useMemo(() => getPillarsList(), []);
  
  // Search, Filter and Sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'population' | 'region' | 'priceMultiplier'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Tab states for the blueprint breakdown
  const [blueprintTab, setBlueprintTab] = useState('pipeline');

  // Filtered and Sorted Cities list (Exactly 100 cities in list)
  const filteredCities = useMemo(() => {
    const list = cities.filter((city) => {
      const matchSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          city.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          city.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchState = selectedState === 'All' || 
                         (selectedState === 'Kerala' && city.state === 'Kerala') ||
                         (selectedState === 'Karnataka' && city.state === 'Karnataka') ||
                         (selectedState === 'Tamil Nadu' && city.state === 'Tamil Nadu') ||
                         (selectedState === 'Maharashtra' && city.state === 'Maharashtra') ||
                         (selectedState === 'Other States' && !['Kerala', 'Karnataka', 'Tamil Nadu', 'Maharashtra'].includes(city.state));
      
      return matchSearch && matchState;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'priceMultiplier') {
        comparison = a.priceMultiplier - b.priceMultiplier;
      } else if (sortBy === 'region') {
        comparison = (a.region || '').localeCompare(b.region || '');
      } else if (sortBy === 'population') {
        const parsePopulation = (popStr: string): number => {
          if (!popStr) return 0;
          const str = popStr.toLowerCase();
          if (str.includes('million')) {
            const num = parseFloat(str.replace('million', '').trim());
            return isNaN(num) ? 0 : num * 1000000;
          }
          if (str.includes('k') || str.includes('thousand') || str.includes('000') || str.includes('professionals')) {
            const num = parseFloat(str.replace(/[^0-9.]/g, ''));
            return isNaN(num) ? 0 : num * 1000;
          }
          const num = parseFloat(str.replace(/[^0-9.]/g, ''));
          return isNaN(num) ? 0 : num;
        };
        comparison = parsePopulation(a.population) - parsePopulation(b.population);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [cities, searchQuery, selectedState, sortBy, sortOrder]);

  // Filtered Topic Pillars (Exactly 100 evergreen guides)
  const filteredPillars = useMemo(() => {
    return pillars.filter((pillar) => {
      const matchSearch = pillar.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pillar.cluster.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pillar.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCluster = selectedState === 'All' || 
                           (selectedState === 'E-Waste Rules' && pillar.cluster === 'E-Waste Management') ||
                           (selectedState === 'Data Security' && pillar.cluster === 'Data Destruction & Security') ||
                           (selectedState === 'ITAD' && pillar.cluster === 'IT Asset Disposition (ITAD)') ||
                           (selectedState === 'Batteries' && pillar.cluster === 'Battery Recycling') ||
                           (selectedState === 'Other Clusters' && !['E-Waste Management', 'Data Destruction & Security', 'IT Asset Disposition (ITAD)', 'Battery Recycling'].includes(pillar.cluster));
      
      return matchSearch && matchCluster;
    });
  }, [pillars, searchQuery, selectedState]);

  // List of unique states for filters (Locales tab)
  const stateCounts = useMemo(() => {
    const counts: { [key: string]: number } = { All: cities.length };
    cities.forEach((c) => {
      if (['Kerala', 'Karnataka', 'Tamil Nadu', 'Maharashtra'].includes(c.state)) {
        counts[c.state] = (counts[c.state] || 0) + 1;
      } else {
        counts['Other States'] = (counts['Other States'] || 0) + 1;
      }
    });
    return counts;
  }, [cities]);

  // List of topic clusters for filters (Topical Pillars tab)
  const clusterCounts = useMemo(() => {
    const counts: { [key: string]: number } = { All: pillars.length };
    pillars.forEach((p) => {
      if (p.cluster === 'E-Waste Management') {
        counts['E-Waste Rules'] = (counts['E-Waste Rules'] || 0) + 1;
      } else if (p.cluster === 'Data Destruction & Security') {
        counts['Data Security'] = (counts['Data Security'] || 0) + 1;
      } else if (p.cluster === 'IT Asset Disposition (ITAD)') {
        counts['ITAD'] = (counts['ITAD'] || 0) + 1;
      } else if (p.cluster === 'Battery Recycling') {
        counts['Batteries'] = (counts['Batteries'] || 0) + 1;
      } else {
        counts['Other Clusters'] = (counts['Other Clusters'] || 0) + 1;
      }
    });
    return counts;
  }, [pillars]);

  // Dynamic values based on active directory tab
  const activeFilters = platformTab === 'locations' ? stateCounts : clusterCounts;

  // Dynamic e-waste stats of our portal
  const totalWordCount = (cities.length * 3150) + (pillars.length * 3200); // Dynamic authority pools
  const totalSchemaNodes = (cities.length * 16) + (pillars.length * 8); // FAQ, TechArticle, LocalBiz mapping

  // Generate simulated automated returning visitor email campaign based on browsing history
  const generatedCampaign = useMemo(() => {
    if (conversions.length === 0) return null;
    const lastConversion = conversions[conversions.length - 1];
    
    // Determine target category
    const viewedCities = lastConversion.historyViewed.filter(slug => slug !== lastConversion.city);
    const viewedCityNames = viewedCities.map(slug => {
      const c = cities.find(x => x.slug === slug);
      return c ? c.name : slug;
    });

    const activeCityData = cities.find(c => c.slug === lastConversion.city);
    const multiplier = activeCityData ? activeCityData.priceMultiplier : 1.0;

    // Craft custom subject & content
    let subject = '';
    let bonusDeal = '';
    let bodyIntro = '';
    let recommendedCluster = '';

    if (lastConversion.deviceType.includes('laptop')) {
      subject = `[⚠️ Time-Sensitive] Secure ₹${Math.round(250 * multiplier)} Returning Bonus on Laptops in ${lastConversion.city}!`;
      bonusDeal = `Exclusive ₹${Math.round(250 * multiplier)} supplementary trade-in token code: GO-GREEN-${lastConversion.city.toUpperCase()}`;
      bodyIntro = `We noticed you estimated values for laptop recycling on location.ewastekochi.com/${lastConversion.city}. In appreciation of your ecological initiative, we've registered an automated valuation increment.`;
      recommendedCluster = `Laptop Buyback and NIST 800-88 Secure Disk Eradication`;
    } else if (lastConversion.deviceType.includes('server')) {
      subject = `Enterprise ITAD Proposal: Data Center Audit Decommissioning in ${lastConversion.city}`;
      bonusDeal = `Priority 2-Hour Dispatch Guarantee & Custom Onsite Shredding Fee Waiver`;
      bodyIntro = `Following your inquiry on our corporate server decommissioning line for ${lastConversion.city}, our regional operations desk has prepared a custom logistical pipeline.`;
      recommendedCluster = `IT Asset Disposition (ITAD) or On-Site Hard Drive Destruction`;
    } else {
      subject = `Get an extra 15% on Computer Scrap Recycling: ${lastConversion.city} Hub`;
      bonusDeal = `15% Weight-valuation boost ticket: SCRAP-MULTIPLY-${new Date().getFullYear()}`;
      bodyIntro = `Thank you for checking recycling scrap rates on location.ewastekochi.com/${lastConversion.city}. Our logistical carriers are operating in your ward this week.`;
      recommendedCluster = `Free Doorstep Consolidation and Authorized Molecular Dismantling`;
    }

    return {
      to: lastConversion.email,
      phone: lastConversion.phone,
      targetCity: lastConversion.city,
      viewedHistory: viewedCityNames,
      subject,
      bonusDeal,
      bodyIntro,
      recommendedCluster,
      steps: [
        { trigger: 'Day 0: Instant Confirmation', desc: `Immediate transaction summary sent to ${lastConversion.email} with estimated payout of ₹${lastConversion.estimatedPayout}.` },
        { trigger: 'Day 1: Personalized Local Offer', desc: `Triggered email: "${subject}" offering custom bonus: ${bonusDeal}.` },
        { trigger: 'Day 3: Circular Economy Lesson', desc: `Compliance insight: Detailed breakdown of raw copper & cobalt recovery metrics of your specific model, showing direct reduction of carbon outputs.` },
        { trigger: 'Day 7: Final Dispatch Follow-up', desc: `Coordinator SMS dispatching alert to phone: ${lastConversion.phone} offering flexible Sunday pickup option in ${lastConversion.city}.` }
      ]
    };
  }, [conversions, cities]);


  return (
    <div className="space-y-8 font-sans">
      
      {/* Visual Header / Portal Stats */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 md:p-8 border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-slate-800 opacity-20 pointer-events-none">
          <Map className="w-64 h-64" />
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">Authorized Collection Hub Network</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-display font-extrabold tracking-tight text-white mt-1">
              Kerala Regional E-Waste Collection Directories
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl mt-2 font-light">
              Choose your municipality or district center below. We provide seamless door-to-door bulk computer collections, licensed secure hard disk shredding, and official CPCB-backed compliance recycling certificates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800/60 font-mono text-xs w-full md:w-auto">
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[9px]">Hub Facilities</span>
              <span className="text-xl font-bold text-emerald-400 block mt-0.5">100 Areas</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Kerala Wide Access</span>
            </div>
            <div className="sm:border-l border-slate-800 sm:pl-4">
              <span className="text-slate-500 block uppercase font-bold text-[9px]">Active Vehicles</span>
              <span className="text-xl font-bold text-[#F27D26] block mt-0.5">45 Units</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Under GPS Command</span>
            </div>
            <div className="sm:border-l border-slate-800 sm:pl-4">
              <span className="text-slate-500 block uppercase font-bold text-[9px]">Carbon Recovered</span>
              <span className="text-xl font-bold text-amber-400 block mt-0.5">140 Tons</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Zero-landfill objective</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The 100 Cities & 100 Topic Pillars Master Directory Dashboard */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Navigation Tabs between Geo-Specific & Pan-India hub */}
        <div className="flex border-b border-slate-100 bg-slate-50/20 font-sans text-xs">
          <button
            onClick={() => {
              onSelectPlatformTab('locations');
              setSelectedState('All');
            }}
            className={`flex-1 py-4 text-[11px] font-bold border-b-2 text-center cursor-pointer transition flex items-center justify-center gap-2 ${
              platformTab === 'locations'
                ? 'border-[#051C15] text-[#051C15] font-extrabold bg-[#06281F]/5'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            <Globe className="w-4 h-4 text-slate-400" />
            🌐 Statewide Collection Centers
          </button>
          
          <button
            onClick={() => {
              onSelectPlatformTab('itad-infopark');
            }}
            className={`flex-1 py-4 text-[11px] font-bold border-b-2 text-center cursor-pointer transition flex items-center justify-center gap-2 ${
              platformTab === 'itad-infopark'
                ? 'border-[#F27D26] text-[#F27D26] font-extrabold bg-[#F27D26]/5'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#F27D26]" />
            🏢 Infopark Corporate ITAD Campaign
          </button>

          <button
            onClick={() => {
              onSelectPlatformTab('pillars');
              setSelectedState('All');
            }}
            className={`flex-1 py-4 text-[11px] font-bold border-b-2 text-center cursor-pointer transition flex items-center justify-center gap-2 ${
              platformTab === 'pillars'
                ? 'border-[#051C15] text-[#051C15] font-extrabold bg-[#06281F]/5'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            📚 Safety & Compliance Guides
          </button>

          <button
            onClick={() => {
              onSelectPlatformTab('sitemap');
            }}
            className={`flex-1 py-4 text-[11px] font-bold border-b-2 text-center cursor-pointer transition flex items-center justify-center gap-2 ${
              platformTab === 'sitemap'
                ? 'border-[#818cf8] text-[#818cf8] font-extrabold bg-[#818cf8]/5'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            <FileCode className="w-4 h-4 text-indigo-400" />
            🗺️ Live XML Sitemap (Crawl & Discover)
          </button>
        </div>

        {platformTab === 'itad-infopark' ? (
          <div className="p-10 text-center bg-[#051C15] text-white border-b border-emerald-900 font-sans">
            <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-[10px] font-mono font-bold tracking-widest px-3.5 py-1 rounded-full uppercase mb-4 animate-pulse">
              ● Active Special ITAD Portal Loaded
            </span>
            <Building2 className="w-12 h-12 mx-auto text-[#F27D26] mb-3" />
            <h4 className="font-display font-extrabold text-white text-base md:text-lg">Kakkanad Infopark Campaign Landing Live Preview</h4>
            <p className="text-xs text-slate-350 max-w-xl mx-auto leading-relaxed mt-2 font-sans font-light">
              We have compiled the full-suite high-value corporate ITAD landing page below in your active viewport. Scroll down or click the quick action to calculate hardware valuations, estimate carbon emissions diverted, and complete a secure disposal gate pass!
            </p>
            <div className="pt-5 flex justify-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById('itad-landing-container');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="px-6 py-3 bg-[#F27D26] hover:bg-[#db6a18] text-white rounded-xl text-xs font-mono font-bold uppercase transition shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                Go to campaign calculations
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : platformTab === 'sitemap' ? (
          <div className="p-10 text-center bg-[#1e1b4b] text-white border-b border-indigo-950 font-sans">
            <span className="inline-flex items-center gap-1 bg-indigo-505/15 border border-indigo-400/30 text-indigo-300 text-[10px] font-mono font-bold tracking-widest px-3.5 py-1 rounded-full uppercase mb-4 animate-pulse">
              ● Google Discover Index Compiler Active
            </span>
            <FileCode className="w-12 h-12 mx-auto text-indigo-400 mb-3" />
            <h4 className="font-display font-extrabold text-white text-base md:text-lg">Programmatic Google Index &amp; Sitemap Hub Live</h4>
            <p className="text-xs text-indigo-200 max-w-xl mx-auto leading-relaxed mt-2 font-sans font-light">
              We have compiled the full sitemap matrix below in your active viewport. Check dynamic priority rankings, copy active raw XML tags for robot submission, and review compliance scores optimized specifically for Google Discover!
            </p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-100 space-y-4 bg-slate-50/10 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm">
                    {platformTab === 'locations' ? '100 City Programmatic Directory List' : '100 Topical Evergreen Authority Pillars'}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {platformTab === 'locations' 
                      ? 'Search and filter any localized routing entry to instantly preview its 3,000-word crawlable asset page below'
                      : 'Search and inspect foundational evergreen and regulatory guides mapped under the general e-waste domain mesh'
                    }
                  </p>
                </div>
                
                <div className="flex gap-2 font-mono text-[10px] text-slate-400">
                  {platformTab === 'locations' ? (
                    <>
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                        ● 10 Kerala Anchors
                      </span>
                      <span className="flex items-center gap-1 bg-indigo-50 text-indigo-800 border border-indigo-100 px-2 py-0.5 rounded-full font-bold">
                        ● 90 Pan-India Locations
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                        ● 100 Authority Topics
                      </span>
                      <span className="flex items-center gap-1 bg-indigo-50 text-indigo-800 border border-indigo-100 px-2 py-0.5 rounded-full font-bold">
                        ● 5 Cluster Bundles
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Search bar & Filter capsules */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={platformTab === 'locations' ? "Search city, state or region slug..." : "Search evergreen topic, title list..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs outline-hidden text-slate-700 focus:border-slate-300"
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                  {Object.keys(activeFilters).map((filterName) => (
                    <button
                      key={filterName}
                      onClick={() => setSelectedState(filterName)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        selectedState === filterName
                          ? 'bg-white text-slate-800 shadow-2xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {filterName} ({activeFilters[filterName]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Sorting Badges */}
              {platformTab === 'locations' && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100/50 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-mono text-[9px] text-slate-400 font-bold uppercase">
                    <ListFilter className="w-3.5 h-3.5 text-slate-400" />
                    Sort directory:
                  </span>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'name', label: 'City Name' },
                      { id: 'population', label: 'Population' },
                      { id: 'region', label: 'Region' },
                      { id: 'priceMultiplier', label: 'Price Multiplier' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => {
                          if (sortBy === btn.id) {
                            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy(btn.id as any);
                            setSortOrder(btn.id === 'priceMultiplier' || btn.id === 'population' ? 'desc' : 'asc');
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono cursor-pointer transition flex items-center gap-1 ${
                          sortBy === btn.id
                            ? 'bg-slate-900 border-slate-900 text-white font-semibold'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {btn.label}
                        {sortBy === btn.id && (
                          <span className="text-[9px] text-slate-350">
                            {sortOrder === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Bento Box Cards of 100 Cities or 100 Topics */}
            <div className="p-6 max-h-80 overflow-y-auto bg-slate-50/20 divide-y divide-slate-100 font-sans">
              {platformTab === 'locations' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pb-3">
                  {filteredCities.map((city) => {
                    const isActive = city.slug === activeCitySlug;
                    const isKerala = city.state === 'Kerala';
                    
                    return (
                      <button
                        key={city.slug}
                        id={`city-btn-${city.slug}`}
                        onClick={() => onSelectCity(city.slug)}
                        className={`group p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isActive
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm ring-2 ring-slate-800/20'
                            : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] font-mono uppercase tracking-wider font-extrabold ${
                            isActive 
                              ? 'text-emerald-400' 
                              : isKerala 
                                ? 'text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.2 rounded' 
                                : 'text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 py-0.2 rounded'
                          }`}>
                            {city.state}
                          </span>
                          {isActive && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <h4 className={`font-display font-extrabold text-[12px] tracking-tight mt-1 line-clamp-1 ${
                          isActive ? 'text-white' : 'text-slate-800 group-hover:text-slate-900'
                        }`}>
                          {city.name}
                        </h4>
                        <div className="flex items-center justify-between text-[8px] font-mono mt-2 text-slate-400">
                          <span>{city.priceMultiplier}x factor</span>
                          <span className="opacity-0 group-hover:opacity-100 transition">Preview →</span>
                        </div>
                      </button>
                    );
                  })}
                  {filteredCities.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 font-sans text-xs">
                      <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      No dynamic cities found matching "{searchQuery}" under {selectedState} filter.
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-3">
                  {filteredPillars.map((pillarPage) => {
                    const isActive = pillarPage.slug === activePillarSlug;
                    
                    return (
                      <button
                        key={pillarPage.slug}
                        id={`pillar-btn-${pillarPage.slug}`}
                        onClick={() => onSelectPillar(pillarPage.slug)}
                        className={`group p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isActive
                            ? 'bg-indigo-950 border-indigo-950 text-white shadow-sm ring-2 ring-indigo-500/20'
                            : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] font-mono uppercase tracking-wider font-extrabold ${
                            isActive 
                              ? 'text-amber-300' 
                              : 'text-indigo-600 bg-indigo-50/50 border border-indigo-100/50 px-1.5 py-0.2 rounded'
                          }`}>
                            {pillarPage.cluster.split(' ')[0] || 'Topic'}
                          </span>
                          {isActive && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          )}
                        </div>
                        <h4 className={`font-display font-bold text-[11.5px] leading-snug tracking-tight mt-1.5 line-clamp-2 ${
                          isActive ? 'text-white' : 'text-slate-800 group-hover:text-slate-900'
                        }`}>
                          {pillarPage.title}
                        </h4>
                        <div className="flex items-center justify-between text-[8px] font-mono mt-2 text-slate-400">
                          <span>{pillarPage.faqs.length} FAQ nodes</span>
                          <span className="opacity-0 group-hover:opacity-100 transition">View Pillar →</span>
                        </div>
                      </button>
                    );
                  })}
                  {filteredPillars.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 font-sans text-xs">
                      <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      No authority pillars found matching "{searchQuery}" under {selectedState} filter.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex flex-wrap justify-between items-center text-slate-500 font-mono text-[10px]">
          <span>
            {platformTab === 'locations' 
              ? `Displaying ${filteredCities.length} out of exactly ${cities.length} compiled cities`
              : `Displaying ${filteredPillars.length} out of exactly ${pillars.length} topical authorities`
            }
          </span>
          <span>
            {platformTab === 'locations' 
              ? 'Target Directory Domain: location.ewastekochi.com/*'
              : 'Target Authority Directory: ewastekochi.com/pillar/*'
            }
          </span>
        </div>
      </div>

      {/* 4. Automated Personalised Email Sequence returning trigger */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12">
        <div className="p-6 md:col-span-5 border-r border-slate-100 bg-slate-50/50 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            <h3 className="font-display font-bold text-slate-800 text-sm">Returning Visitor Sequence</h3>
          </div>
          
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Under your marketing specifications, we leverage client-side cookie arrays (<code className="bg-slate-200 px-1 py-0.5 rounded text-indigo-600 font-mono text-[9px]">localStorage</code>) to record the clickstream journey.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            If a visitor views multiple city pages or reviews the pricing grids but leaves without completing a pickup, the sequence triggers an automated, personalized coupon code corresponding exactly to their location and intent!
          </p>

          <div className="bg-white border border-slate-100 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Session History Tracking (Local Dev)</span>
            </div>
            
            {browseHistory.length === 0 ? (
              <span className="text-[10px] text-slate-400 italic block font-mono">No pages viewed yet. Click on different cities in the grid above to populate history...</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {browseHistory.map((slug, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 font-mono rounded px-1.5 py-0.5 text-[9px] border border-slate-200/20">
                    /{slug}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 border-dashed text-[10px] leading-relaxed">
            <strong className="block font-semibold mb-0.5">💡 Unlock district custom offers</strong>
            Select any city from the grid directory above, and calculate an estimated pickup price at the bottom. This immediately generates custom location-specific bonus vouchers!
          </div>
        </div>

        {/* Simulated Email Dashboard Panel */}
        <div className="p-6 md:col-span-7 bg-slate-950 text-slate-50 min-h-[300px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[9px]">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Secure Customer Offer Hub // Authorized_disposal_v1
              </span>
              <span className="bg-emerald-600/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded text-[8px] border border-emerald-500/20 font-bold uppercase tracking-wider">
                Active Client Pipeline
              </span>
            </div>

            {generatedCampaign ? (
              <div className="space-y-4">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 font-mono space-y-1">
                  <div className="flex">
                    <span className="text-slate-500 text-[10px] w-14 shrink-0">From:</span>
                    <span className="text-emerald-400 text-[10px] font-bold">compliance@ewastekochi.com</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 text-[10px] w-14 shrink-0">To:</span>
                    <span className="text-slate-200 text-[10px] font-semibold">{generatedCampaign.to}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 text-[10px] w-14 shrink-0">Subject:</span>
                    <span className="text-indigo-300 text-[10px] font-bold">{generatedCampaign.subject}</span>
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 text-[10px] p-4 rounded-xl font-sans text-slate-300 leading-relaxed max-h-44 overflow-y-auto">
                  <p>Hello,</p>
                  <p className="mt-2 text-slate-200">{generatedCampaign.bodyIntro}</p>
                  
                  <div className="my-3 p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono">
                    <span className="text-emerald-400 font-bold block mb-1">🎁 {generatedCampaign.bonusDeal}</span>
                    <span className="text-slate-400 block text-[9px]">Calculated for: {generatedCampaign.recommendedCluster}</span>
                  </div>

                  <p>Our logistical fleet coordinates directly within your boundaries this week. Would you like to confirm a 100% free doorstep collection slot at your earliest convenience?</p>
                  <p className="mt-3">Regards,</p>
                  <p className="font-semibold text-slate-100">Kochi E-Waste Local Compliance Lead</p>
                </div>

                <div>
                  <h5 className="font-mono text-indigo-400 text-[9px] uppercase tracking-wider mb-2 font-bold">Personalized Offer Journey Steps</h5>
                  <div className="space-y-2 font-sans">
                    {generatedCampaign.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-2 text-[10px] items-start border-l border-slate-800 pl-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0"></span>
                        <div>
                          <strong className="text-slate-200 block font-semibold">{step.trigger}</strong>
                          <span className="text-slate-400 block text-[9.5px] mt-0.5">{step.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500 font-mono text-[10px] space-y-2">
                <History className="w-8 h-8 text-slate-800 animate-spin-reverse" />
                <div>
                  <p className="text-slate-300">Awaiting Calculation Input...</p>
                  <p className="text-slate-500 text-[9px] mt-1 pr-6 pl-6 max-w-sm">No submissions recorded during this session. Select any city and perform an estimated pickup calculation to generate location-specific bonus vouchers.</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-900 pt-3 mt-4 text-center font-mono text-[8px] text-slate-600 flex justify-between">
            <span>Process ID: SECURE_VOUCHER_ENGINE_80</span>
            <span>Trigger Synced: Resend API integrations v3</span>
          </div>
        </div>
      </div>

    </div>
  );
}
