import { useState, useEffect } from 'react';
import { City } from '../types';
import { getCitiesList } from '../data/cities';
import { getStateRegulation, StateRegulation } from '../data/regulations';
import { MapPin, Navigation, Compass, AlertCircle, ArrowRight, Check, Sparkles, HelpCircle, PhoneCall, History, Trash2 } from 'lucide-react';

interface GeolocationBannerProps {
  activeCitySlug: string;
  onSelectCity: (slug: string) => void;
  onNavigateToTab: (tab: 'locations' | 'pillars') => void;
}

// Helpers for mapped coordinates in India
const getCoordsForGeo = (citySlug: string, state: string): [number, number] => {
  const coords: Record<string, [number, number]> = {
    kochi: [9.9816, 76.2999],
    kozhikode: [11.2588, 75.7804],
    trivandrum: [8.5241, 76.9366],
    thiruvananthapuram: [8.5241, 76.9366],
    thrissur: [10.5276, 76.2144],
    alappuzha: [9.4981, 76.3388],
    palakkad: [10.7867, 76.6547],
    kannur: [11.8745, 75.3704],
    kottayam: [9.5916, 76.5222],
    kollam: [8.8932, 76.6141],
    idukki: [9.85, 76.9667],
    wayanad: [11.6854, 76.132],
    bangalore: [12.9716, 77.5946],
    bengaluru: [12.9716, 77.5946],
    chennai: [13.0827, 80.2707],
    mumbai: [19.0760, 72.8777],
    delhi: [28.6139, 77.2090],
    hyderabad: [17.3850, 78.4867],
    kolkata: [22.5726, 88.3639],
    pune: [18.5204, 73.8567],
  };

  const key = citySlug.toLowerCase();
  if (coords[key]) {
    return coords[key];
  }

  // Generate deterministic coordinates based on name hash if not found
  let hash = 0;
  for (let i = 0; i < citySlug.length; i++) {
    hash = citySlug.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // State-based default coordinates inside India bounds
  let centerLat = 20.5937;
  let centerLng = 78.9629;
  
  const stateLower = state.toLowerCase();
  if (stateLower === 'kerala') {
    centerLat = 10.1;
    centerLng = 76.4;
  } else if (stateLower === 'karnataka') {
    centerLat = 13.0;
    centerLng = 77.6;
  } else if (stateLower === 'tamil nadu') {
    centerLat = 11.1;
    centerLng = 78.6;
  } else if (stateLower === 'maharashtra') {
    centerLat = 19.5;
    centerLng = 75.3;
  } else if (stateLower === 'delhi' || stateLower === 'delhi-ncr') {
    centerLat = 28.6;
    centerLng = 77.2;
  } else if (stateLower === 'telangana') {
    centerLat = 17.4;
    centerLng = 78.4;
  } else if (stateLower === 'west bengal') {
    centerLat = 22.5;
    centerLng = 88.3;
  }

  // deterministic small offsets
  const offsetLat = ((Math.abs(hash) % 100) / 100) * 0.4 - 0.2;
  const offsetLng = (((Math.abs(hash) >> 3) % 100) / 100) * 0.4 - 0.2;

  return [centerLat + offsetLat, centerLng + offsetLng];
};

// Haversine formula
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function GeolocationBanner({ activeCitySlug, onSelectCity, onNavigateToTab }: GeolocationBannerProps) {
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedCity, setDetectedCity] = useState<City | null>(null);
  const [distanceToCity, setDistanceToCity] = useState<number | null>(null);
  const [outsideCoverage, setOutsideCoverage] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [simulationPresetUsed, setSimulationPresetUsed] = useState<string | null>(null);
  
  // History state for last three successfully detected locations
  const [lastThreeDetections, setLastThreeDetections] = useState<Array<{ slug: string; name: string; state: string }>>([]);

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ewaste_last_3_detected');
      if (stored) {
        setLastThreeDetections(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load last detections:", e);
    }
  }, []);

  const cities = getCitiesList();

  const runLocationAnalysis = (lat: number, lng: number, label?: string) => {
    setLoading(true);
    setErrorMsg(null);
    setOutsideCoverage(false);
    
    // Find nearest city from our 100 cities dataset
    let nearestCity: City | null = null;
    let minDistance = Infinity;

    cities.forEach((city) => {
      const [cityLat, cityLng] = getCoordsForGeo(city.slug, city.state);
      const dist = getDistanceKm(lat, lng, cityLat, cityLng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestCity = city;
      }
    });

    setUserCoords([lat, lng]);
    setDistanceToCity(minDistance);
    
    // Check if within 50km service area
    if (minDistance <= 50) {
      setDetectedCity(nearestCity);
      setOutsideCoverage(false);
    } else {
      setDetectedCity(nearestCity); // Still hold nearest city as locator target
      setOutsideCoverage(true);
    }
    
    // Handle adding to successful detections history (last three)
    if (nearestCity) {
      const cityObj = nearestCity as City;
      try {
        const stored = localStorage.getItem('ewaste_last_3_detected');
        let list: Array<{ slug: string; name: string; state: string }> = stored ? JSON.parse(stored) : [];
        
        // Remove existing to push to the front (avoid duplicate slugs)
        list = list.filter(item => item.slug !== cityObj.slug);
        list.unshift({
          slug: cityObj.slug,
          name: cityObj.name,
          state: cityObj.state
        });
        
        // Take last 3 items
        const updatedList = list.slice(0, 3);
        localStorage.setItem('ewaste_last_3_detected', JSON.stringify(updatedList));
        setLastThreeDetections(updatedList);
      } catch (err) {
        console.error("LocalStorage save error:", err);
      }
    }

    setLoading(false);
    if (label) {
      setSimulationPresetUsed(label);
      setIsSimulated(true);
    } else {
      setIsSimulated(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        runLocationAnalysis(latitude, longitude);
      },
      (err) => {
        setLoading(false);
        setErrorMsg(
          "Permission denied or positional retrieval failed. Try simulating below!"
        );
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 600000 }
    );
  };

  const simulatePreset = (name: string) => {
    const presets: Record<string, { coords: [number, number]; label: string }> = {
      kozhikode: { coords: [11.2588, 75.7804], label: 'Kozhikode Center (Within Region)' },
      kochiSuburbs: { coords: [10.0812, 76.3245], label: 'Aluva near Kochi (~21km from Kochi Hub)' },
      mumbai: { coords: [19.0760, 72.8777], label: 'Mumbai Metropole' },
      paris: { coords: [48.8566, 2.3522], label: 'Paris (Paris, France - Outside Coverage)' }
    };

    const target = presets[name];
    if (target) {
      runLocationAnalysis(target.coords[0], target.coords[1], target.label);
    }
  };

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('ewaste_last_3_detected');
      setLastThreeDetections([]);
    } catch (e) {
      console.error(e);
    }
  };

  if (dismissed) return null;

  // Retrieve state regulatory compliance information based on state
  const stateCompliance = detectedCity ? getStateRegulation(detectedCity.state) : null;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs relative">
      {/* Decorative colored glow bar matching visual theme */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500"></div>

      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left segment - Interactive explanation & Trigger actions */}
        <div className="lg:col-span-4 space-y-3 lg:border-r lg:border-slate-100 pr-0 lg:pr-6">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Compass className="w-5 h-5 animate-spin-slow animate-spin-6s" />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Proximity Logic API</span>
              <h4 className="font-display font-black text-slate-800 text-sm">Target Smart Geotargeting</h4>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-normal font-sans">
            Automatically detect your approximate location to check if you reside inside any of our authorized <span className="font-semibold text-slate-800">100 CPCB service areas</span> across the country.
          </p>

          <div className="pt-2">
            <button
              onClick={handleDetectLocation}
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all text-white border border-transparent shadow-2xs ${
                loading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 animate-pulse" />
              {loading ? 'Analyzing Lat/Lng...' : 'Locate Device Area'}
            </button>
            {errorMsg && (
              <p className="text-[10px] text-red-600 font-mono mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}
          </div>
        </div>

        {/* Center section - Real-time analysis outcome block */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col justify-between min-h-[160px] relative">
          {detectedCity ? (
            <div className="space-y-3.5 text-slate-700 animate-in fade-in duration-300">
              {/* Proximity Detected Banner */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${outsideCoverage ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-ping-6s'}`}></span>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-500">
                    {outsideCoverage ? 'Outside Doorstep Bounds' : 'Service Zone Verified'}
                  </span>
                  {isSimulated && (
                    <span className="text-[8px] uppercase tracking-tighter bg-indigo-50 border border-indigo-100 text-indigo-700 px-1 py-0.2 rounded font-mono font-bold">
                      Simulated
                    </span>
                  )}
                </div>
                
                {stateCompliance && (
                  <span className="text-[8px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                    🛡️ {stateCompliance.greenRating}
                  </span>
                )}
              </div>

              {!outsideCoverage ? (
                <div className="space-y-2">
                  <p className="text-xs font-sans leading-relaxed text-slate-700">
                    📍 Coordinates verified! You reside approximately <strong className="text-slate-900 font-semibold">~{distanceToCity?.toFixed(1)} km</strong> from our certified <strong className="text-emerald-700 font-black">{detectedCity.name} ({detectedCity.state})</strong> service gateway.
                  </p>

                  {/* DYNAMIC PROGRESS BAR TARGET: .bg-gradient-to-r */}
                  {distanceToCity !== null && (
                    <div className="bg-white border border-slate-150 rounded-xl p-2.5 space-y-1.5 shadow-3xs">
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Compass className="w-3 h-3 text-emerald-500" />
                          Proximity Engine Range
                        </span>
                        <span className="font-bold text-emerald-600 uppercase">
                          {((50 - distanceToCity) / 50 * 100).toFixed(0)}% Range Strength
                        </span>
                      </div>
                      
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(2, Math.min(100, ((50 - distanceToCity) / 50) * 100))}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-[8px] font-mono text-slate-400">
                        <span>Hub Area (0 km)</span>
                        <span className="font-bold text-slate-600">{(distanceToCity).toFixed(1)} km distance</span>
                        <span>Service Edge (50 km)</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (detectedCity) {
                          onSelectCity(detectedCity.slug);
                          onNavigateToTab('locations');
                          // Scroll down to view the location overview block
                          setTimeout(() => {
                            const section = document.getElementById(`city-page-${detectedCity.slug}`);
                            if (section) section.scrollIntoView({ behavior: 'smooth' });
                          }, 150);
                        }
                      }}
                      className="bg-slate-900 hover:bg-emerald-600 text-white font-mono font-bold text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      View {detectedCity.name} Portal Live
                      <ArrowRight className="w-3" />
                    </button>
                    <span className="text-[9px] text-slate-400 font-mono">Scrap rate multiplier: {detectedCity.priceMultiplier}x</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-sans leading-relaxed text-slate-700">
                    ⚠️ Positional check suggests you are outside our primary doorstep collection bounds. Your nearest authorized hub is <strong className="text-slate-900 font-medium">{detectedCity.name}</strong> (~{(distanceToCity ?? 0).toLocaleString(undefined, {maximumFractionDigits: 1})} km away).
                  </p>
                  
                  {/* Since outside, we can still show a range indicator or default limits */}
                  <div className="bg-slate-100 rounded-lg p-2 text-center text-[9px] font-mono text-slate-500">
                    Doorstep limits: 50km Service Threshold // Outside by {((distanceToCity ?? 0) - 50).toFixed(0)}km.
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (detectedCity) {
                          onSelectCity(detectedCity.slug);
                          onNavigateToTab('locations');
                          setTimeout(() => {
                            const section = document.getElementById(`city-page-${detectedCity.slug}`);
                            if (section) section.scrollIntoView({ behavior: 'smooth' });
                          }, 150);
                        }
                      }}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-mono font-bold text-[8.5px] uppercase tracking-wider py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                    >
                      Go to {detectedCity.name} Locator
                    </button>
                    <button
                      onClick={() => {
                        // Scroll nicely down to general CTA booking form
                        const element = document.getElementById('section-cta');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold text-[8.5px] uppercase tracking-wider py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                    >
                      General Contact Form
                    </button>
                  </div>
                </div>
              )}

              {/* Visually distinct Local Regulatory Compliance Chip */}
              {stateCompliance && (
                <div className="bg-white border-l-4 border-emerald-500 border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[9.5px] font-mono font-extrabold text-[#06281F]">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin-6s shrink-0" />
                    <span>LOCAL REGULATORY COMPLIANCE // {stateCompliance.state.toUpperCase()}</span>
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-650 leading-relaxed font-sans">
                    <div>
                      <span className="font-mono text-[8.5px] text-slate-400 block uppercase">Environmental Authority</span>
                      <strong className="text-slate-800 font-medium">{stateCompliance.authority}</strong>
                    </div>
                    <div>
                      <span className="font-mono text-[8.5px] text-slate-400 block uppercase">Governance Directive & Framework</span>
                      <strong className="text-slate-800 font-semibold">{stateCompliance.ruleTitle}</strong>
                    </div>
                    <p className="bg-slate-50 italic rounded p-1.5 text-[9.5px] text-slate-600 leading-snug">
                      "{stateCompliance.policy}"
                    </p>
                    <div className="text-[9px] text-slate-500 font-mono">
                      Prerequisite checklist: {stateCompliance.compliancePrerequisite}
                    </div>
                    <div className="text-[8.5px] text-red-700 font-mono bg-red-50 py-0.5 px-1.5 rounded border border-red-100 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                      <span>Penalty Warning: {stateCompliance.fineNotice}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-6 text-slate-400 my-auto">
              <MapPin className="w-7 h-7 text-slate-300 animate-pulse mb-1.5" />
              <p className="text-[11px] font-sans italic">Positional evaluation waiting.</p>
              <p className="text-[9px] font-mono text-slate-400 mt-1">Press Locate or select Simulation Preset below</p>
            </div>
          )}

          {simulationPresetUsed && (
            <div className="absolute top-2 right-2 flex items-center gap-1 text-[8px] bg-slate-200 border border-slate-300 text-slate-600 px-1 py-0.2 rounded font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              <span>{simulationPresetUsed}</span>
            </div>
          )}
        </div>

        {/* Right section - Proximity simulator controls */}
        <div className="lg:col-span-3 space-y-3">
          <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Workspace Demo Simulator
          </span>
          
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { key: 'kozhikode', label: '1. Kozhikode (4km)' },
              { key: 'kochiSuburbs', label: '2. Kochi Sub (21km)' },
              { key: 'mumbai', label: '3. Mumbai (15km)' },
              { key: 'paris', label: '4. Europe (>50km)' }
            ].map((pVal) => (
              <button
                key={pVal.key}
                onClick={() => simulatePreset(pVal.key)}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[9.5px] font-mono font-medium rounded-lg text-slate-600 hover:text-slate-800 transition cursor-pointer text-left focus:ring-1 focus:ring-emerald-500 hover:border-slate-300"
              >
                {pVal.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setDismissed(true)}
              className="text-[9px] font-mono text-slate-400 hover:text-slate-600 uppercase underline decoration-double underline-offset-2 transition"
            >
              Dismiss Banner
            </button>
            <span className="text-[8px] font-mono text-slate-400 text-right">Interactive Simulator</span>
          </div>
        </div>
      </div>

      {/* QUICK JUMP CHIPS BENEATH THE DETECTION INTERFACE */}
      {lastThreeDetections.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-100/80 px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-500">
              Quick Jump History (Last 3):
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {lastThreeDetections.map((item, idx) => (
              <button
                key={`${item.slug}-${idx}`}
                onClick={() => {
                  onSelectCity(item.slug);
                  onNavigateToTab('locations');
                  setTimeout(() => {
                    const section = document.getElementById(`city-page-${item.slug}`);
                    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 150);
                }}
                className="py-1 px-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[10px] font-sans font-medium rounded-full text-slate-700 hover:text-emerald-800 transition cursor-pointer flex items-center gap-1.5 shadow-3xs"
              >
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span>{item.name}</span>
                <span className="text-[8px] font-mono text-slate-400 bg-slate-100 rounded px-1 group-hover:bg-emerald-100">{item.state}</span>
              </button>
            ))}
            
            <button
              onClick={handleClearHistory}
              className="text-[9px] font-mono text-slate-400 hover:text-red-500 uppercase tracking-tighter flex items-center gap-1 transition-colors pl-2 ml-1 cursor-pointer border-l border-slate-205"
              title="Clear Saved Search Jumps"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
