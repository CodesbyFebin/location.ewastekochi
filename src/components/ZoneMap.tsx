import { useState, useMemo, useEffect, useRef } from 'react';
import { City } from '../types';
import { MapPin, Navigation, Info, Zap, Calendar, ArrowRight } from 'lucide-react';

interface ZoneMapProps {
  city: City;
  onSelectZone?: (zoneName: string) => void;
}

// Helpler table for mapped coordinates in India
const getCityCoords = (citySlug: string, state: string): [number, number] => {
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
  } else if (stateLower === 'delhi') {
    centerLat = 28.6;
    centerLng = 77.2;
  } else if (stateLower === 'telangana') {
    centerLat = 17.4;
    centerLng = 78.4;
  } else if (stateLower === 'west bengal') {
    centerLat = 22.5;
    centerLng = 88.3;
  }

  // deterministic small offsets (scatter around center coordinate)
  const offsetLat = ((Math.abs(hash) % 100) / 100) * 0.4 - 0.2;
  const offsetLng = (((Math.abs(hash) >> 3) % 100) / 100) * 0.4 - 0.2;

  return [centerLat + offsetLat, centerLng + offsetLng];
};

export default function ZoneMap({ city, onSelectZone }: ZoneMapProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(city.pickupZones[0] || null);
  const [mapType, setMapType] = useState<'regions' | 'network'>('regions');
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);
  const markersLayerGroupRef = useRef<any>(null);

  // Load Leaflet CDN Assets dynamically if they don't already exist on page
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Load Leaflet CSS
    const cssId = 'leaflet-css-cdn';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const scriptId = 'leaflet-js-cdn';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        setLeafletLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      // Script tagged but maybe not ran yet
      const interval = setInterval(() => {
        if ((window as any).L) {
          setLeafletLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // Update selection dynamically when city prop changes
  useEffect(() => {
    setSelectedZone(city.pickupZones[0] || null);
  }, [city]);

  // Generate localized coordinates on-the-fly for zones!
  const plottedZones = useMemo(() => {
    const [centerLat, centerLng] = getCityCoords(city.slug, city.state);
    
    return city.pickupZones.map((zone, idx) => {
      // Circle layout offsets for perfect geographical scattering
      const angle = (idx * (2 * Math.PI)) / city.pickupZones.length;
      // approx 0.5 to 2.5 KM offsets from downtown
      const radius = 0.006 + (idx % 3) * 0.004; 
      
      const lat = centerLat + radius * Math.sin(angle);
      const lng = centerLng + radius * Math.cos(angle);
      
      const distanceKM = (1.5 + (idx * 0.8) % 6).toFixed(1);
      const scheduleDays = idx % 2 === 0 ? "Mon, Wed, Fri" : "Tue, Thu, Sat";
      const workload = idx % 3 === 0 ? "High Capacity" : idx % 3 === 1 ? "Medium Load" : "Rapid Corridor";
      const hexColor = idx % 3 === 0 ? "emerald" : idx % 3 === 1 ? "amber" : "indigo";

      return {
        name: zone,
        lat,
        lng,
        x: 200 + 95 * Math.cos(angle), // For SVG fallback coordinates
        y: 180 + 75 * Math.sin(angle) * 0.8,
        distanceKM,
        scheduleDays,
        workload,
        hexColor,
        isHub: idx === 0
      };
    });
  }, [city]);

  const activeZoneDetails = useMemo(() => {
    return plottedZones.find(z => z.name === selectedZone) || null;
  }, [plottedZones, selectedZone]);

  const handleZoneClick = (name: string) => {
    setSelectedZone(name);
    if (onSelectZone) {
      onSelectZone(name);
    }

    // Pan map to marker smoothly if Leaflet map is loaded
    if (leafletMapInstanceRef.current && leafletLoaded) {
      const zoneNode = plottedZones.find(z => z.name === name);
      if (zoneNode) {
        leafletMapInstanceRef.current.panTo([zoneNode.lat, zoneNode.lng]);
      }
    }
  };

  // Wire up Leaflet map instance inside useEffect
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const [centerLat, centerLng] = getCityCoords(city.slug, city.state);

    // Initialize map if not yet done
    if (!leafletMapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([centerLat, centerLng], 13);

      // Deploy high contrast clean map tiles suited for modern enterprise UI
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      leafletMapInstanceRef.current = map;
      markersLayerGroupRef.current = L.layerGroup().addTo(map);
    } else {
      // Re-center on city change
      leafletMapInstanceRef.current.setView([centerLat, centerLng], 13);
    }

    const map = leafletMapInstanceRef.current;
    const markersLayer = markersLayerGroupRef.current;

    // Flush old markers
    markersLayer.clearLayers();

    // Map through our geographical zone arrays
    plottedZones.forEach((zone) => {
      const isActive = selectedZone === zone.name;
      
      // Select appropriate theme colors matches Tailwind styles
      const fillColor = zone.hexColor === 'emerald' ? '#10b981' : zone.hexColor === 'amber' ? '#f59e0b' : '#6366f1';
      
      // Draw Circular Collection Zone Boundary Markers on actual maps coordinates
      const circleCenterMarker = L.circleMarker([zone.lat, zone.lng], {
        radius: isActive ? 10 : 7,
        fillColor,
        color: isActive ? '#0f172a' : '#ffffff',
        weight: isActive ? 3 : 1.5,
        fillOpacity: 0.85,
      });

      // Show beautiful rich popup tooltip info
      circleCenterMarker.bindTooltip(
        `<div class="font-sans text-xs p-1">
          <strong class="text-slate-800">${zone.name}</strong><br/>
          <span class="text-slate-500 text-[10px]">📍 Distance: ~${zone.distanceKM} KM</span><br/>
          <span class="text-slate-500 text-[10px] uppercase font-bold text-indigo-600">🚀 Log: ${zone.scheduleDays}</span>
        </div>`,
        { direction: 'top', offset: [0, -5], opacity: 0.9 }
      );

      // Handle click handler to update selection
      circleCenterMarker.on('click', () => {
        setSelectedZone(zone.name);
        if (onSelectZone) {
          onSelectZone(zone.name);
        }
      });

      circleCenterMarker.addTo(markersLayer);

      // Draw logistic routing path connections to the Central Sorting Depot (hub) in 'network' mode
      if (mapType === 'network' && !zone.isHub) {
        const depotZone = plottedZones[0];
        const line = L.polyline([[depotZone.lat, depotZone.lng], [zone.lat, zone.lng]], {
          color: '#818cf8',
          weight: 1.5,
          dashArray: '4, 6',
          opacity: 0.7,
        });
        line.addTo(markersLayer);
      }
    });

    // Cleanup hook on dependencies changes
    return () => {
      // map cleanups handled safely inside the next useEffect callback
    };
  }, [leafletLoaded, city.slug, plottedZones, mapType, selectedZone]);

  // Clean map cleanly on main city modifications to avoid container reinitialization conflicts
  useEffect(() => {
    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, [city.slug]);

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden text-slate-800 shadow-xs">
      {/* Map Header */}
      <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="font-display font-bold text-xs md:text-sm text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            🗺️ Live Interactive E-Waste collection radar: {city.name}
          </h4>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Click any node to inspect schedules and coverage metrics</p>
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg text-[9px] font-mono font-bold">
          <button
            onClick={() => setMapType('regions')}
            className={`px-2 py-1 rounded cursor-pointer transition ${
              mapType === 'regions' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Coverage Zones
          </button>
          <button
            onClick={() => setMapType('network')}
            className={`px-2 py-1 rounded cursor-pointer transition ${
              mapType === 'network' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Routing Paths
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* The Live Interactive/Fallback Canvas */}
        <div className="md:col-span-8 bg-slate-100 border-r border-slate-100 relative h-[360px] flex items-center justify-center overflow-hidden">
          
          {leafletLoaded ? (
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" style={{ minHeight: '360px' }} />
          ) : (
            <>
              {/* Fallback Vector SVG Radars Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#e2e2e2_1px,transparent_1px)] [background-size:16px_16px] opacity-65"></div>

              {/* Map Compass Accent */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1 font-mono text-[9px] text-slate-400">
                <Navigation className="w-3.5 h-3.5 rotate-45" />
                <span>HQ RADAR // OFFLINE FALLBACK DIRECTORY ACTIVE</span>
              </div>

              <svg className="w-full h-full max-w-[420px] max-h-[340px] relative z-10" viewBox="0 0 400 340">
                {mapType === 'network' && (
                  <g stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3">
                    {plottedZones.map((zone, idx) => {
                      if (idx === 0) return null;
                      const centralHub = plottedZones[0];
                      return (
                        <line
                          key={`link-${idx}`}
                          x1={centralHub.x}
                          y1={centralHub.y}
                          x2={zone.x}
                          y2={zone.y}
                          className="animate-pulse"
                        />
                      );
                    })}
                  </g>
                )}

                <circle
                  cx="200"
                  cy="180"
                  r="25"
                  fill="rgba(242, 125, 38, 0.05)"
                  stroke="rgba(242, 125, 38, 0.2)"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />

                <g className="cursor-pointer" onClick={() => handleZoneClick(city.pickupZones[0])}>
                  <circle
                    cx="200"
                    cy="180"
                    r="10"
                    className={`transition-all duration-300 ${
                      selectedZone === city.pickupZones[0]
                        ? 'fill-orange-500 stroke-slate-800 stroke-2'
                        : 'fill-slate-800 hover:fill-orange-500 stroke-white stroke-1'
                    }`}
                  />
                  <text
                    x="200"
                    y="162"
                    textAnchor="middle"
                    className="font-display font-medium text-[8px] fill-slate-800 uppercase tracking-wider"
                  >
                    DEPOT CENTER
                  </text>
                </g>

                {plottedZones.map((zone) => {
                  if (zone.isHub) return null;
                  const isActive = selectedZone === zone.name;
                  
                  const isColor = 
                    zone.hexColor === 'emerald'
                      ? '#10b981'
                      : zone.hexColor === 'amber'
                        ? '#f59e0b'
                        : '#6366f1';

                  return (
                    <g 
                      key={zone.name} 
                      className="cursor-pointer group"
                      onClick={() => handleZoneClick(zone.name)}
                    >
                      <circle
                        cx={zone.x}
                        cy={zone.y}
                        r="8"
                        fill={isActive ? 'white' : 'whitesmoke'}
                        stroke={isActive ? '#0f172a' : '#cbd5e1'}
                        strokeWidth={isActive ? '2' : '1'}
                        className="group-hover:stroke-slate-800 transition-all"
                      />
                      <circle
                        cx={zone.x}
                        cy={zone.y}
                        r="4"
                        fill={isColor}
                      />
                      <text
                        x={zone.x}
                        y={zone.y + 16}
                        textAnchor="middle"
                        className="font-mono text-[7px] font-bold fill-slate-500"
                      >
                        {zone.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </>
          )}
        </div>

        {/* Dynamic Zone Details Inspector Panel */}
        <div className="md:col-span-4 p-5 bg-white flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h5 className="font-display font-medium text-xs text-slate-800">Zone Logistics Inspector</h5>
            </div>

            {activeZoneDetails ? (
              <div className="space-y-3 font-sans text-xs text-slate-600 animate-in fade-in duration-300">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Sector Name</span>
                  <strong className="text-slate-800 block text-[12.5px] font-bold mt-0.5">{activeZoneDetails.name}</strong>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg font-mono">
                    <span className="text-[8px] text-slate-400 block uppercase">Zone Distance</span>
                    <span className="text-slate-800 font-bold block text-[11px] mt-0.5">~{activeZoneDetails.distanceKM} KM</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg font-mono">
                    <span className="text-[8px] text-slate-400 block uppercase">Workloading</span>
                    <span className="text-slate-800 font-bold block text-[11px] mt-0.5">{activeZoneDetails.workload}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Scheduled Pickups</span>
                  </div>
                  <strong className="text-slate-800 block font-bold text-[11.5px]">{activeZoneDetails.scheduleDays}</strong>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Authorized eco-vans collect from this sector multiple times during scheduled days. Same-day logistics available.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 font-sans italic">
                <Info className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                Select any zone point on the radar map to inspect schedules
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => {
                if (activeZoneDetails) {
                  // Scroll down to booking CTA directly
                  const element = document.getElementById('section-cta');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }
              }}
              className="w-full bg-slate-900 hover:bg-emerald-600 text-white text-[11px] font-mono font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              Book Pickup in {selectedZone || 'Region'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
