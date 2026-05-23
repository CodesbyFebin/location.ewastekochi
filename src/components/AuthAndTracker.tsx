import { useState, useEffect, useRef, FormEvent } from 'react';
import { 
  User, Lock, Mail, Smartphone, MapPin, 
  Compass, Navigation, Truck, RefreshCw, LogOut, CheckCircle, 
  Zap, Clock, Play, HelpCircle, ServerCrash, Terminal, Radio
} from 'lucide-react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
}

interface SimulatedPickup {
  id: string;
  clientEmail: string;
  clientPhone: string;
  city: string;
  deviceType: string;
  quantity: number;
  estimatedPayout: number;
  status: 'pending' | 'assigned' | 'in_transit' | 'completed';
  createdAt: string;
  driverName?: string;
  driverPhone?: string;
  driverLat?: number;
  driverLng?: number;
  estimatedArrivalMinutes?: number;
}

export default function AuthAndTracker() {
  // State variables for Auth flow
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Auth inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('kozhikode');
  
  // Errors & success state
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Tracking states
  const [userPickups, setUserPickups] = useState<SimulatedPickup[]>([]);
  const [selectedTrackingPickup, setSelectedTrackingPickup] = useState<SimulatedPickup | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsLogs, setWsLogs] = useState<string[]>([]);
  
  // WebSocket Reference
  const wsRef = useRef<WebSocket | null>(null);

  // Sync user status on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ewaste_session_token');
    const savedUser = localStorage.getItem('ewaste_session_user');
    
    if (savedToken && savedUser) {
      setSessionToken(savedToken);
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('ewaste_session_token');
        localStorage.removeItem('ewaste_session_user');
      }
    }
  }, []);

  // Fetch pickups when logged in
  useEffect(() => {
    if (currentUser) {
      fetchUserPickups();
    } else {
      setUserPickups([]);
      setSelectedTrackingPickup(null);
    }
  }, [currentUser, sessionToken]);

  // Connect WebSocket when tracking an active pickup
  useEffect(() => {
    if (!selectedTrackingPickup) {
      if (wsRef.current) {
        wsRef.current.close();
      }
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}`;

    addWsLog(`Connecting to WebSocket server: ${wsUrl}...`);
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setWsConnected(true);
      addWsLog(`[Connected] Connected safely to live WebSocket upgrade channel.`);
      
      // Subscribe to active pickup updates
      socket.send(JSON.stringify({
        type: "subscribe",
        pickupId: selectedTrackingPickup.id
      }));
      addWsLog(`[Subscribed] Requested active feed for pickup: ${selectedTrackingPickup.id}`);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "pickup_update" && data.pickup) {
          addWsLog(`[Broadcast Recv] WebSocket tick update for PKP: ${data.pickup.id} // Status: ${data.pickup.status}`);
          setSelectedTrackingPickup(data.pickup);
          
          // Also sync corresponding node in userPickups list
          setUserPickups(prev => prev.map(p => p.id === data.pickup.id ? data.pickup : p));
        }
      } catch (err) {
        console.error("Error reading WebSocket payload: ", err);
      }
    };

    socket.onerror = (error) => {
      addWsLog(`[Socket Error] Connection constraint or timeout occurred.`);
      console.error("WS connection error :", error);
    };

    socket.onclose = () => {
      setWsConnected(false);
      addWsLog(`[Socket Closed] WebSocket closed channel connection gracefully.`);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedTrackingPickup?.id]);

  const addWsLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setWsLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 25)]);
  };

  const fetchUserPickups = async () => {
    try {
      const resp = await fetch('/api/pickups/user', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        setUserPickups(data);
        if (data.length > 0 && !selectedTrackingPickup) {
          // Select newest to display by default
          setSelectedTrackingPickup(data[data.length - 1]);
        }
      }
    } catch (err) {
      console.error("Error fetching client pickups history: ", err);
    }
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setLoading(true);

    const isLogin = authMode === 'login';
    const url = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin
      ? { email, password }
      : { name, email, password, phone, city };

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();

      if (!resp.ok) {
        setAuthError(data.error || "Authentication issue experienced.");
        setLoading(false);
        return;
      }

      // Save credentials in local storage
      localStorage.setItem('ewaste_session_token', data.sessionToken);
      localStorage.setItem('ewaste_session_user', JSON.stringify(data.user));
      
      setSessionToken(data.sessionToken);
      setCurrentUser(data.user);
      
      setAuthSuccess(isLogin ? "Logged in successfully!" : "Account created successfully!");
      
      // Clear inputs
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
    } catch (err) {
      setAuthError("Could not transmit auth request. Ensure fullstack is compiling.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
    } catch (e) {
      // Offline fallback
    }

    localStorage.removeItem('ewaste_session_token');
    localStorage.removeItem('ewaste_session_user');
    setSessionToken(null);
    setCurrentUser(null);
    setUserPickups([]);
    setSelectedTrackingPickup(null);
    setAuthSuccess("Logged out securely.");
  };

  // 4. Client simulator functions to easily demo real-time vehicle movement
  const handleSimulateTick = async (action: 'assign' | 'transmit' | 'complete') => {
    if (!selectedTrackingPickup) return;

    let payload: any = { pickupId: selectedTrackingPickup.id, action };
    
    // Simulate real path updates on the map
    if (action === 'assign') {
      payload.lat = 11.2688;
      payload.lng = 75.7804;
      payload.minutes = 15;
    } else if (action === 'transmit') {
      // Calculate a progressive drive closer to the destination (approx 11.258, 75.772 coordinates)
      // Generates deterministic incremental coordinates down to target
      const currentLat = selectedTrackingPickup.driverLat || 11.2688;
      const currentLng = selectedTrackingPickup.driverLng || 75.7804;
      const step = 0.25; // 25% closer per click for rapid demo joy!
      
      const destLat = 11.2505; 
      const destLng = 75.7656;

      const nextLat = currentLat + (destLat - currentLat) * step;
      const nextLng = currentLng + (destLng - currentLng) * step;
      const currentMinutes = selectedTrackingPickup.estimatedArrivalMinutes || 15;
      const nextMinutes = Math.max(1, Math.round(currentMinutes * (1 - step)));

      payload.lat = Number(nextLat.toFixed(5));
      payload.lng = Number(nextLng.toFixed(5));
      payload.minutes = nextMinutes;
    } else if (action === 'complete') {
      payload.lat = 11.2505;
      payload.lng = 75.7656;
      payload.minutes = 0;
    }

    try {
      await fetch('/api/driver/simulate-tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // The update is pushed through WebSocket server and automatically refreshes state!
    } catch (err) {
      console.error("Simulation error: ", err);
    }
  };

  return (
    <div className="bg-white border border-crisp rounded-2xl overflow-hidden shadow-xs text-charcoal font-sans" id="section-auth-tracker">
      <div className="grid grid-cols-1 md:grid-cols-12">
        
        {/* Module Sidebar: Auth Controls and Pickups overview */}
        <div className="md:col-span-4 p-6 bg-alabaster border-r border-crisp flex flex-col justify-between">
          <div>
            {/* Header Identity */}
            <div className="flex items-center gap-2 mb-6 border-b border-crisp pb-4">
              <div className="p-2 bg-sunset text-white rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-extrabold text-xs md:text-sm uppercase tracking-tight">
                  Logistics Portal & Tracker
                </h4>
                <p className="text-[10px] text-slate-500 font-mono">Secure Auth and Real-time Sockets</p>
              </div>
            </div>

            {/* Unauthenticated View: SignUp & SignIn */}
            {!currentUser ? (
              <div className="space-y-4 text-xs">
                <div className="flex bg-slate-100 p-1 rounded-lg border border-crisp/50">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-1.5 text-center rounded-md font-bold cursor-pointer transition ${
                      authMode === 'login' ? 'bg-white text-charcoal shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 py-1.5 text-center rounded-md font-bold cursor-pointer transition ${
                      authMode === 'signup' ? 'bg-white text-charcoal shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {authError && (
                  <div className="p-2.5 bg-red-50 text-red-900 border border-red-100 rounded-lg text-[10px]">
                    ⚠️ {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-lg text-[10px]">
                    ✓ {authSuccess}
                  </div>
                )}

                <form onSubmit={handleAuth} className="space-y-3.5">
                  {authMode === 'signup' && (
                    <div>
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-0.5">Full Name</label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="Adarsh Nair"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl outline-hidden focus:border-slate-300"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-0.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. adarsh@work.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl outline-hidden focus:border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-0.5">Custom Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl outline-hidden focus:border-slate-300"
                      />
                    </div>
                  </div>

                  {authMode === 'signup' && (
                    <>
                      <div>
                        <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Phone/WhatsApp Line</label>
                        <div className="relative">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="tel"
                            required
                            placeholder="+91-9845011223"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl outline-hidden focus:border-slate-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Anchor City Area</label>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                          <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl outline-hidden focus:border-slate-300"
                          >
                            <option value="kochi">Kochi</option>
                            <option value="kozhikode">Kozhikode</option>
                            <option value="trivandrum">Thiruvananthapuram</option>
                            <option value="bangalore">Bangalore</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-charcoal hover:bg-sunset text-white text-[11px] font-mono font-bold uppercase py-2.5 rounded-xl tracking-wider transition cursor-pointer"
                  >
                    {loading ? "Decrypting..." : authMode === 'login' ? "Access Private Portal" : "Assemble Account"}
                  </button>
                </form>

                {authMode === 'login' && (
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1 mt-4">
                    <span className="text-[9px] uppercase font-mono font-bold text-indigo-705 block">🔒 DEMO CREDENTIAL ACCESS</span>
                    <span className="block text-[9.5px] text-slate-600">Email: <strong className="text-charcoal font-semibold">codesbyfebin@gmail.com</strong></span>
                    <span className="block text-[9.5px] text-slate-600">Password: <strong className="text-charcoal font-semibold">demo123</strong></span>
                  </div>
                )}
              </div>
            ) : (
                
              /* Authenticated View: Show pickups list and logout buttons */
              <div className="space-y-4">
                <div className="p-3.5 bg-white border border-crisp rounded-xl">
                  <div className="flex items-center gap-1.5 font-sans">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Active Client Identity</span>
                      <strong className="text-charcoal block text-xs font-bold leading-tight line-clamp-1">{currentUser.name}</strong>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 block font-mono border-t border-slate-105 mt-2 pt-2 truncate">City Base: /{currentUser.city}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Your Pickups History</span>
                    <button 
                      onClick={fetchUserPickups}
                      className="text-slate-400 hover:text-charcoal cursor-pointer flex items-center gap-0.5 text-[9px] font-mono font-bold bg-white px-1.5 py-0.5 border border-crisp rounded transition"
                    >
                      <RefreshCw className="w-2.5 h-2.5 text-slate-400" />
                      Sync
                    </button>
                  </div>

                  {userPickups.length === 0 ? (
                    <div className="p-6 bg-white border border-crisp rounded-xl text-center italic text-slate-400 text-[10px]">
                      No pickups scheduled under this profile yet. Submit a pickup in the form to register one!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {userPickups.map((pkp) => {
                        const isSelected = selectedTrackingPickup?.id === pkp.id;
                        const statusColors = 
                          pkp.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pkp.status === 'in_transit'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800';

                        return (
                          <button
                            key={pkp.id}
                            onClick={() => setSelectedTrackingPickup(pkp)}
                            className={`w-full p-2.5 border text-left rounded-xl transition cursor-pointer flex justify-between items-center ${
                              isSelected
                                ? 'bg-slate-900 border-slate-950 text-white shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-crisp'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-extrabold uppercase ${
                                isSelected ? 'bg-slate-800 text-slate-200 border border-slate-700' : statusColors
                              }`}>
                                {pkp.status}
                              </span>
                              <h5 className={`font-mono text-[10px] font-bold mt-1 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                {pkp.id}
                              </h5>
                              <span className="text-[8px] text-slate-400 block font-mono">Payout: ₹{pkp.estimatedPayout}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">→</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {currentUser && (
            <div className="pt-4 border-t border-crisp mt-4">
              <button
                onClick={handleLogout}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9.5px] font-mono font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                Disconnect Session
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Map/Tracking Dashboard Side */}
        <div className="md:col-span-8 p-6 flex flex-col justify-between h-full bg-slate-900 text-white min-h-[500px]">
          <div>
            {/* Header Telemetry Status indicators */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[9.5px]">
                <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'animate-pulse text-emerald-400' : 'text-slate-600'}`} />
                Live Sockets Link Status // 
                <span className={wsConnected ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {wsConnected ? "CONNECTED" : "OFFLINE"}
                </span>
              </span>
              
              <div className="flex gap-1.5 font-mono text-[8.5px]">
                <span className="flex items-center gap-1 bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full font-bold">
                  PORT: 3000
                </span>
              </div>
            </div>

            {selectedTrackingPickup ? (
              <div className="space-y-4">
                
                {/* Visual SVG Map with animated truck trajectory tracker */}
                <div className="bg-slate-950 border border-slate-800.5 rounded-xl h-56 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:14px_14px] opacity-40"></div>
                  
                  {/* Outer status watermarks */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 font-mono text-[8px] text-slate-500">
                    <Compass className="w-3 h-3 animate-spin-reverse" />
                    <span>LDT // LIVE DRIVER TRACKING DATA</span>
                  </div>

                  {/* Complete SVG Path Grid Map */}
                  <svg className="w-[320] h-[190] relative z-10" viewBox="0 0 320 190">
                    
                    {/* Logistical corridor Path */}
                    <path
                      d="M 60 140 Q 150 40 260 90"
                      fill="transparent"
                      stroke="#475569"
                      strokeWidth="2"
                    />
                    
                    {/* Animated current position indicator route dots */}
                    {selectedTrackingPickup.status === 'in_transit' && (
                      <path
                        d="M 60 140 Q 150 40 260 90"
                        fill="transparent"
                        stroke="#01ee82"
                        strokeWidth="2.5"
                        strokeDasharray="40 160"
                        className="animate-pulse"
                      />
                    )}

                    {/* Start Point: Local Sorting Depot Hub */}
                    <circle cx="60" cy="140" r="5" fill="#f27d26" stroke="#ffffff" strokeWidth="1" />
                    <text x="60" y="155" textAnchor="middle" className="font-mono text-[6px] fill-slate-400">DEPOT HUB</text>

                    {/* Destination Target Point: User's Neighborhood Ward */}
                    <circle cx="260" cy="90" r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="1" />
                    <text x="260" y="105" textAnchor="middle" className="font-mono text-[6.5px] fill-indigo-400 font-bold">YOUR LOCATION</text>

                    {/* Dynamic vehicle marker plotted on driver coordinates */}
                    {selectedTrackingPickup.driverLat && selectedTrackingPickup.driverLng && (
                      <g>
                        {/* Map lat/lng coordinates to standard SVG dimensions dynamically */}
                        {(() => {
                          // Standard mapping functions for coords near 11.2588, 75.7804 to SVG Box
                          const originLat = 11.2688;
                          const originLng = 75.7804;
                          const destLat = 11.2505;
                          const destLng = 75.7656;

                          const latDiff = originLat - destLat;
                          const lngDiff = originLng - destLng;

                          const currentLatDiff = originLat - (selectedTrackingPickup.driverLat || 11.2688);
                          const currentLngDiff = originLng - (selectedTrackingPickup.driverLng || 75.7804);

                          // Interpolate coordinate ratio alongside Q bezier curve coordinates
                          const latRatio = currentLatDiff / (latDiff || 1);
                          const lngRatio = currentLngDiff / (lngDiff || 1);
                          const progress = Math.min(Math.max((latRatio + lngRatio) / 2, 0), 1);

                          // Parametric points on Bezier Q curve M 60 140 Q 150 40 260 90
                          // B(t) = (1-t)^2 * P0 + 2*(1-t)*t * P1 + t^2 * P2
                          const t = progress;
                          const truckX = (1 - t) * (1 - t) * 60 + 2 * (1 - t) * t * 150 + t * t * 260;
                          const truckY = (1 - t) * (1 - t) * 140 + 2 * (1 - t) * t * 40 + t * t * 90;

                          return (
                            <g transform={`translate(${truckX - 9}, ${truckY - 9})`}>
                              <circle cx="9" cy="9" r="11" fill="rgba(1, 238, 130, 0.15)" stroke="rgba(1, 238, 130, 0.4)" strokeWidth="0.8" className="animate-ping" style={{ transformOrigin: '9px 9px' }} />
                              <circle cx="9" cy="9" r="6" fill="#01ee82" stroke="#111827" strokeWidth="2" />
                              <svg viewBox="0 0 24 24" className="w-[10px] h-[10px] text-slate-950 absolute left-[4px] top-[4px] rotate-12">
                                <Truck className="w-full h-full fill-slate-950 stroke-1" />
                              </svg>
                            </g>
                          );
                        })()}
                      </g>
                    )}
                  </svg>
                </div>

                {/* Logistics telemetry facts */}
                <div className="flex flex-col sm:flex-row gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 justify-between">
                  <div className="space-y-0.5 flex-1 min-w-[120px]">
                    <span className="text-[8px] text-slate-500 uppercase font-mono block">Active Driver</span>
                    <strong className="text-[11.5px] font-sans block truncate">{selectedTrackingPickup.driverName || "Driver Standby"}</strong>
                  </div>
                  <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3 flex-1 min-w-[120px]">
                    <span className="text-[8px] text-slate-500 uppercase font-mono block">Vehicle Contact</span>
                    <strong className="text-[11.5px] font-mono block truncate">{selectedTrackingPickup.driverPhone || "+91-XXXXXXXXXX"}</strong>
                  </div>
                  <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3 flex-1 min-w-[120px]">
                    <span className="text-[8px] text-slate-500 uppercase font-mono block">ETA Window</span>
                    <strong className="text-[12px] font-mono block text-emerald-400 font-extrabold truncate">
                      {selectedTrackingPickup.status === 'completed' ? 'Arrived / Recycled' : selectedTrackingPickup.estimatedArrivalMinutes ? `${selectedTrackingPickup.estimatedArrivalMinutes} Mins` : 'Pending dispatch'}
                    </strong>
                  </div>
                  <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3 flex-1 min-w-[120px]">
                    <span className="text-[8px] text-slate-500 uppercase font-mono block">Order ID</span>
                    <strong className="text-[11.5px] font-mono block truncate text-indigo-400 font-extrabold">{selectedTrackingPickup.id}</strong>
                  </div>
                </div>

                {/* Sockets Event Log Console */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block tracking-wider">Device Connection Message Stream:</span>
                  <div className="h-20 bg-black text-emerald-400 font-mono text-[8px] p-2 rounded-lg border border-slate-800 overflow-y-auto leading-normal">
                    {wsLogs.length === 0 ? (
                      <span className="text-slate-600 block italic">Awaiting secure driver connection updates...</span>
                    ) : (
                      wsLogs.map((log, idx) => (
                        <span key={idx} className="block border-b border-slate-950 pb-0.5 mb-0.5 last:border-0 truncate font-mono">
                          {log}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* 5. Driver controls dispatcher/simulation (Allows inspecting actual WebSocket pushes) */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 border-dashed">
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal className="w-4 h-4 text-orange-400" />
                    <div>
                      <h4 className="font-display font-medium text-[10.5px] text-slate-100 uppercase tracking-widest leading-none">
                        Logistics Dispatch Controls
                      </h4>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5">Simulate driver coordinates to test routing software</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleSimulateTick('assign')}
                      disabled={selectedTrackingPickup.status === 'completed'}
                      className="bg-slate-900 border border-slate-800 hover:bg-slate-850 p-2 rounded-lg text-[9px] font-mono font-bold text-slate-300 flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-30"
                    >
                      <Zap className="w-3 h-3 text-orange-400" />
                      1. Dispatch Driver
                    </button>
                    <button
                      onClick={() => handleSimulateTick('transmit')}
                      disabled={!selectedTrackingPickup.driverLat || selectedTrackingPickup.status === 'completed'}
                      className="bg-slate-900 border border-slate-800 hover:bg-slate-850 p-2 rounded-lg text-[9px] font-mono font-bold text-slate-300 flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-30"
                    >
                      <Play className="w-3 h-3 text-emerald-400" />
                      2. Proceed Route
                    </button>
                    <button
                      onClick={() => handleSimulateTick('complete')}
                      disabled={selectedTrackingPickup.status !== 'in_transit'}
                      className="bg-slate-900 border border-slate-800 hover:bg-slate-850 p-2 rounded-lg text-[9px] font-mono font-bold text-slate-300 flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-30"
                    >
                      <CheckCircle className="w-3 h-3 text-indigo-400" />
                      3. Complete Recycle
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-600 font-mono text-[9.5px]">
                <ServerCrash className="w-8 h-8 text-slate-800 animate-pulse mb-2" />
                <p className="text-slate-300">Awaiting Active Pickup Channel...</p>
                <p className="text-slate-500 text-[8.5px] pr-8 pl-8 mt-1.5 max-w-md">
                  No active pickups selected for tracking. If you are unauthenticated, please login using the sidebar demo credentials or submit a pickup request on the frontend first!
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-3 mt-4 text-center font-mono text-[8px] text-slate-600 flex justify-between">
            <span>Central Facility Connection: Secured Node</span>
            <span>Channel: location.ewastekochi.com/logistics/dispatch</span>
          </div>
        </div>

      </div>
    </div>
  );
}
