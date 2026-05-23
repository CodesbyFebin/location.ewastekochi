import { useState, FormEvent } from 'react';
import { 
  Building2, ShieldCheck, MapPin, Trash2, Cpu, Laptop, HardDrive, 
  Smartphone, Check, FileText, HelpCircle, ChevronRight, Calculator, 
  AlertCircle, Sparkles, Mail, Send, Activity, Download, ArrowRight, 
  ArrowLeft, RefreshCw, Layers, Landmark, Leaf, Truck
} from 'lucide-react';

interface ITADLandingProps {
  onSelectCity: (slug: string) => void;
  onSelectPlatformTab: (tab: 'locations' | 'pillars' | 'itad-infopark' | 'sitemap') => void;
  onSchedulePickup: (details: {
    email: string;
    phone: string;
    deviceType: string;
    estimatedPayout: number;
    history: string[];
  }) => void;
}

export default function ITADInfoparkLanding({ 
  onSelectCity, 
  onSelectPlatformTab,
  onSchedulePickup
}: ITADLandingProps) {
  
  // Interactive estimation calculator states
  const [deviceGrid, setDeviceGrid] = useState([
    { id: 'laptop', name: 'Corporate Laptops (Intel i5/i7)', unitPrice: 3200, qty: 15, co2PerUnit: 120 },
    { id: 'desktop', name: 'Workstations & Desktops', unitPrice: 1800, qty: 10, co2PerUnit: 180 },
    { id: 'server', name: 'Rack Servers & Blades', unitPrice: 8500, qty: 4, co2PerUnit: 450 },
    { id: 'storage', name: 'SSD/HDD Hard Drives (Bulk)', unitPrice: 350, qty: 50, co2PerUnit: 15 },
    { id: 'network', name: 'Cisco Switches & Routers', unitPrice: 2200, qty: 8, co2PerUnit: 90 },
  ]);

  const handleQtyChange = (id: string, value: number) => {
    setDeviceGrid(grid => grid.map(item => {
      if (item.id === id) {
        return { ...item, qty: Math.max(0, value) };
      }
      return item;
    }));
  };

  // Calculate totals
  const totalPayout = deviceGrid.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  const totalCo2Saved = deviceGrid.reduce((sum, item) => sum + (item.qty * item.co2PerUnit), 0);
  const totalInstruments = deviceGrid.reduce((sum, item) => sum + item.qty, 0);

  // Booking Form States
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [corporatePhone, setCorporatePhone] = useState('');
  const [specificTower, setSpecificTower] = useState('Athulya');
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Simulated User Journey Status Tracking
  const [journeyStep, setJourneyStep] = useState<1 | 2 | 3 | 4>(1);

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !corporateEmail.trim() || !corporatePhone.trim()) {
      setFormError('Please fill out all required corporate credentials to secure your ITAD audit.');
      return;
    }
    
    // Auto-schedule pickup log in active App state
    onSchedulePickup({
      email: corporateEmail,
      phone: corporatePhone,
      deviceType: `Corporate Bulk Audit (${totalInstruments} items from Kakkanad ${specificTower})`,
      estimatedPayout: totalPayout,
      history: ['landing-itad-infopark', 'valuation-calculator', `tower-${specificTower}`]
    });

    setFormError('');
    setBookedSuccess(true);
    setJourneyStep(3); // Advanced to book step

    // Auto-scroll simulation
    setTimeout(() => {
      const element = document.getElementById('step-4-success-box');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  return (
    <div id="itad-landing-container" className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-md font-sans">
      
      {/* 1. SCENIC HIGH-CONTRAST CAMPAIGN BANNER HEADER */}
      <div className="bg-gradient-to-r from-[#06281F] via-[#094738] to-[#0d5947] text-white p-8 md:p-12 relative overflow-hidden">
        {/* Dynamic mesh elements */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#F27D26] opacity-10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-400/35 text-emerald-400 text-[10.5px] font-mono font-bold tracking-widest px-3.5 py-1 rounded-full uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Infopark Special ITAD Campaign</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-none text-white font-display">
            Enterprise <span className="text-[#F27D26]">ITAD Services</span> <br />
            in Infopark, Kakkanad
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
            CPCB-authorized electronic asset decommissioning, physical hard drive sanitization (NIST 800-88), and maximum residual value buybacks for Kochi's largest IT parks, multinational corporations, and tech towers.
          </p>

          {/* Quick Stats Badges inside Banner */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-slate-200 font-mono">
            <span className="flex items-center gap-1.5 font-semibold">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              KSPCB Authorized Gateways
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              NIST 800-88 Wiping
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              ISO 14001 Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              DPDP Act 2023 Audits
            </span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC LIFE CYCLE USER JOURNEY COORDINATION RADAR */}
      <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 md:px-8">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-500">
              Interactive User Journey Tracker:
            </span>
          </div>

          {/* 4-Step Interactive Navigation Blocks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1 max-w-4xl text-[11px] font-mono select-none">
            {[
              { step: 1, label: '1. Local Landing Page', desc: 'Infopark Focus' },
              { step: 2, label: '2. Valuation Tool', desc: 'Hardware Estimate' },
              { step: 3, label: '3. Booking Form', desc: 'Secure Audit Scheduled' },
              { step: 4, label: '4. Download Compliances', desc: 'CPCB Form-3 & Certificate' }
            ].map((st) => {
              const active = journeyStep === st.step;
              const completed = journeyStep > st.step;
              return (
                <button
                  key={st.step}
                  onClick={() => {
                    setJourneyStep(st.step as 1|2|3|4);
                    // scroll to respective div
                    const anchors: Record<number, string> = {
                      1: 'itad-landing-container',
                      2: 'itad-calculator-section',
                      3: 'itad-booking-section',
                      4: 'itad-compliance-mesh'
                    };
                    const el = document.getElementById(anchors[st.step]);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    active 
                      ? 'bg-[#06281F] border-emerald-950 text-white font-bold scale-[1.01]' 
                      : completed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-white hover:bg-slate-50 border-slate-205 text-slate-650'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{st.label}</span>
                    {completed && <span className="text-emerald-600">✓</span>}
                  </div>
                  <span className={`text-[8.5px] block ${active ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {st.desc}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* 3. DUAL-COLUMN CONTENT LAYOUT */}
      <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Segment: Locally relevant content and specs (7 cols span) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section: Infopark Context */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Building2 className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <span className="text-[9px] font-mono text-slate-400 block uppercase">Logistical Coverage Profile</span>
                <h3 className="font-display font-black text-slate-800 text-lg">CPCB / KSPCB Licensed Fleet & Team inside Kakkanad</h3>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
              As the technological capital of Ernakulam, Kakkanad hosts premium technology hubs like <strong className="text-slate-900 font-semibold">Infopark Phase I (Athulya, Tapasya, Thapasya, Carnival, Leela Towers)</strong>, <strong className="text-slate-900 font-bold">Infopark Phase II (Jyothirmaya)</strong>, and <strong className="text-slate-900 font-semibold">SmartCity Kochi (SCK 01)</strong>. Under CPCB’s E-Waste guidelines, direct hardware retirement is forbidden without authentic green reporting.
            </p>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 space-y-2 text-xs text-slate-700">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                <Leaf className="w-4 h-4" />
                Specialized Infopark Logistics Operations:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 list-disc pl-4 text-[11.5px] text-slate-650 leading-relaxed">
                <li>Underground basement loading bays clearance</li>
                <li>Freight elevator coordinated multi-floor physical dismounting</li>
                <li>On-site locked bins and secure custody transfer</li>
                <li>GPS-tracked specialized e-waste transit vans</li>
              </ul>
            </div>
          </div>

          {/* Section: ITAD Pillars Detail */}
          <div className="space-y-4">
            <h4 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#F27D26]" />
              Corporate Compliance Solutions Available Onsite
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: 'Secure Hard Drive Shredding',
                  desc: 'On-site physical degaussing or crushing of magnetic disks, SATA networks, and enterprise SSD cards. Full NIST SP 800-88 compliance with audit-ready logs.'
                },
                {
                  title: 'Server Room Decommissioning',
                  desc: 'Complete dismantle of network layouts, heavy routers, terminal racks, UPS cells, and copper cables. Handled securely by qualified corporate engineers.'
                },
                {
                  title: 'ESG and Carbon Reports',
                  desc: 'Raw kilograms recovered are computed into precise CO2 environmental credits and primary mining avoidance values, perfect for annual BRSR board filings.'
                },
                {
                  title: 'Regulatory Form-3 Compliance',
                  desc: 'Authorized filings under KSPCB rules with legal gate passes. Complete liability release guarantees protection against solid-waste dumping penalties.'
                }
              ].map((pill, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-1.5 hover:bg-white hover:shadow-xs transition duration-200">
                  <h5 className="font-sans font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#F27D26] rounded-full"></span>
                    {pill.title}
                  </h5>
                  <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
                    {pill.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Local Regulation Compliance Alert */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4.5 space-y-2 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-red-800 uppercase tracking-wider font-extrabold">GOVERNANCE & LIABILITY RISK</span>
              <h5 className="font-sans font-bold text-slate-800 text-xs">Avoid ₹1 Lakh+ State Pollution Board Fines</h5>
              <p className="text-[10.5px] text-slate-650 leading-relaxed font-sans">
                Under the current E-Waste Rules, corporate directors are individually liable for hardware routed to non-authorized scrap dealers. Secure a certified CPCB chain-of-custody transfer to eliminate physical data breach liability and solid-waste hazard penalties.
              </p>
            </div>
          </div>

          {/* User journey outbound: navigation buttons */}
          <div className="border-t border-slate-100 pt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => onSelectPlatformTab('locations')}
              className="text-xs font-sans text-slate-500 hover:text-[#06281F] flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to National Locations Map</span>
            </button>

            <button
              onClick={() => onSelectPlatformTab('pillars')}
              className="text-xs font-sans text-emerald-700 hover:text-emerald-950 font-bold flex items-center gap-1.5 transition"
            >
              <span>Explore Evergreen CPCB Rules Pillars</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right Segment: Interactive Tools Console (5 cols span) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* INTERACTIVE VALUE CALCULATOR (ITAD TARGET) */}
          <div id="itad-calculator-section" className="bg-slate-50 border border-slate-150 rounded-2xl p-5 md:p-6 space-y-4 shadow-3xs relative scroll-mt-20">
            <span className="absolute top-2 right-2 flex items-center gap-1 text-[8px] bg-emerald-100 border border-emerald-200 text-emerald-850 px-1.5 py-0.2 rounded font-mono uppercase font-bold animate-pulse">
              Simulator Online
            </span>
            
            <div className="border-b border-slate-150 pb-2">
              <h4 className="font-display font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Step 2. Instant Valuation Estimator
              </h4>
              <p className="text-[9.5px] text-slate-400 font-mono">Infopark corporate scrap multiplier applied (1.2x)</p>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Adjust quantities beneath of decommissioned devices to instantly capture the residual buyout value and estimated carbon offset metrics for your next board dashboard.
            </p>

            {/* List of device inputs */}
            <div className="space-y-3 pt-1">
              {deviceGrid.map((item) => (
                <div key={item.id} className="bg-white border border-slate-150 rounded-xl p-3 flex items-center justify-between gap-3 shadow-3xs hover:border-emerald-300 transition duration-200">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-800 block leading-tight">{item.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono">Rate: ₹{item.unitPrice} / Unit • CO₂: {item.co2PerUnit}kg</span>
                  </div>
                  
                  {/* Quantity input fields */}
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleQtyChange(item.id, item.qty - 5)}
                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold cursor-pointer transition select-none"
                    >
                      -5
                    </button>
                    <input
                      type="number"
                      min="0"
                      className="w-12 py-1 text-center border border-slate-200 rounded-md text-xs font-semibold focus:ring-1 focus:ring-emerald-500"
                      value={item.qty}
                      onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 0)}
                    />
                    <button 
                      onClick={() => handleQtyChange(item.id, item.qty + 5)}
                      className="w-6 h-6 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold cursor-pointer transition select-none"
                    >
                      +5
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resulting Panel */}
            <div className="bg-emerald-900 text-white rounded-xl p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-baseline justify-between">
                <span className="text-[9.5px] font-mono text-emerald-300 uppercase font-extrabold tracking-wider">Estimated Corporate Buyback Payout:</span>
                <strong className="text-lg md:text-xl font-black font-display text-white">₹{totalPayout.toLocaleString('en-IN')}</strong>
              </div>

              <div className="h-px bg-emerald-800/60"></div>
              
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-emerald-200 flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  Net CO₂ Emissions Diverted:
                </span>
                <span className="font-mono font-bold text-white">{(totalCo2Saved / 1000).toFixed(2)} Metric Tons</span>
              </div>

              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-emerald-200 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-300" />
                  Total IT Assets Count:
                </span>
                <span className="font-mono font-semibold text-white">{totalInstruments} Hardware Units</span>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => {
                  setJourneyStep(2); // Progress journey
                  const element = document.getElementById('itad-booking-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight focus
                    const inputs = element.getElementsByTagName('input');
                    if (inputs[0]) inputs[0].focus();
                  }
                }}
                className="w-full bg-[#06281F] hover:bg-emerald-950 text-white py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition shadow-2xs"
              >
                Accept Payout Estimate & Book Audit
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CORPORATE ITAD BOOKING FORM (JOURNEY CONNECTIVITY) */}
          <div id="itad-booking-section" className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-md scroll-mt-20">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="font-display font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-4 h-4 text-[#F27D26]" />
                Step 3. Secure CPCB Logistics Audit Scheduler
              </h4>
              <p className="text-[9.5px] text-slate-400 font-mono">Infopark Kakkanad Dedicated Routing Gateways</p>
            </div>

            {bookedSuccess ? (
              <div id="step-4-success-box" className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-slate-700 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold">✓</span>
                  <strong className="text-xs text-emerald-900 font-bold">Kakkanad Logistics Dispatch Scheduled!</strong>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Excellent! We registered your estimated ITAD audit parameters. Your reference code <strong className="text-slate-900 font-bold">ITAD-INFOPARK-{Math.floor(Math.random() * 900 + 100)}</strong> is active. 
                </p>
                <div className="bg-white rounded-lg p-2.5 border border-emerald-150 text-[10px] space-y-1.5 font-mono shadow-3xs text-slate-650">
                  <p>🏢 Company: {companyName}</p>
                  <p>📍 Location: Kakkanad Infopark, {specificTower} Tower</p>
                  <p>📞 Contact: {contactName} ({corporatePhone})</p>
                  <p>🗳️ Scheduled: {totalInstruments} assets • Est: ₹{totalPayout}</p>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  An automated confirmation voucher has been queue-forwarded to our routing systems. Navigate down to the Email Simulator to monitor active logistics signals!
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Corporate Entity / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., TechSolutions India Ltd."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 bg-white"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">IT Head / Contact Person *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Sunil Nair"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 bg-white"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Infopark Building Tower *</label>
                    <select
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 bg-white font-mono"
                      value={specificTower}
                      onChange={(e) => setSpecificTower(e.target.value)}
                    >
                      <option value="Athulya">Athulya (Phase I)</option>
                      <option value="Thapasya">Thapasya (Phase I)</option>
                      <option value="Leela">Leela Infopark</option>
                      <option value="Carnival">Carnival Infopark</option>
                      <option value="Jyothirmaya">Jyothirmaya (Phase II)</option>
                      <option value="SmartCity-SCK01">SmartCity SCK 01</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Corporate Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="s.nair@techsolutions.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-550 bg-white"
                      value={corporateEmail}
                      onChange={(e) => setCorporateEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Operational Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91-9876543210"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 bg-white"
                      value={corporatePhone}
                      onChange={(e) => setCorporatePhone(e.target.value)}
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-[10px] text-red-600 font-mono flex items-center gap-1 animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formError}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#F27D26] hover:bg-[#db6a18] text-white py-2.5 rounded-xl font-sans font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
                  >
                    <span>Secure CPCB ITAD Disposals</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SPECIFIC CPCB CERTIFICATE & RECYCLE COMPLIANCE ACTIONS */}
          <div id="itad-compliance-mesh" className="bg-slate-900 text-white rounded-2xl p-5 md:p-6 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-[8.5px] font-mono text-emerald-400 block uppercase font-bold tracking-widest">Post-Pickup Corporate Artifact Generator</span>
              <h4 className="font-display font-bold text-sm flex items-center gap-1.5 text-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Step 4. Compliance Auditures & Digital Certificates
              </h4>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              To verify carbon lifecycle milestones, our platform provides formal compliance documents direct to your inbox:
            </p>

            <div className="space-y-2.5">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="text-slate-200 font-bold block">CPCB Annexure-I Form-3</span>
                  <span className="text-[9px] text-slate-500">Official filing ledger of materials received</span>
                </div>
                <button 
                  onClick={() => {
                    setJourneyStep(4);
                    alert("Downloaded Simulated Official Form-3 Receipt Ledger!");
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  Form-3
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="text-slate-200 font-bold block">NIST 800-88 Data Erase Receipt</span>
                  <span className="text-[9px] text-slate-500">Physical sanitisation certificate & wiping logs</span>
                </div>
                <button 
                  onClick={() => {
                    setJourneyStep(4);
                    alert("Downloaded Simulated NIST 800-88 Secure Erasure Certification!");
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  NIST-Log
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="text-slate-200 font-bold block">Green ESG Carbon Savings Ledger</span>
                  <span className="text-[9px] text-slate-500">Calculation sheet detailing avoided greenhouse gasses</span>
                </div>
                <button 
                  onClick={() => {
                    setJourneyStep(4);
                    alert("Downloaded Simulated Green ESG Carbon Offset Audit Document!");
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  ESG-Credits
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
