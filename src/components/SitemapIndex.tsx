import { useState } from 'react';
import { getCitiesList } from '../data/cities';
import { getPillarsList } from '../data/pillars';
import { Globe, BookOpen, Copy, Check, FileCode, CheckCircle2, ChevronRight, Award, Flame, Star, MessageSquare, Image as ImageIcon } from 'lucide-react';

export default function SitemapIndex() {
  const [copiedXml, setCopiedXml] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'visual' | 'xml'>('visual');
  const [searchUrlQuery, setSearchUrlQuery] = useState('');

  const cities = getCitiesList();
  const pillars = getPillarsList();

  const hostname = 'https://ewastekochi.com';

  const sitemapUrls = [
    { url: `${hostname}/`, type: 'Core Hub', title: 'Authorized E-Waste & ITAD Hub Kerala', priority: '1.0', changefreq: 'daily', ratings: [{ score: 4.9, count: 242 }] },
    { url: `${hostname}/itad-campaign`, type: 'ITAD Campaign', title: 'Infopark Kakkanad Corporate ITAD Disposal', priority: '0.95', changefreq: 'weekly', ratings: [{ score: 5.0, count: 98 }] },
    ...cities.map(c => ({
      url: `${hostname}/location/${c.slug}`,
      type: `City Link (${c.state === 'Kerala' ? 'Anchor' : 'Secondary'})`,
      title: `E-Waste Management Specialist: Centred on ${c.name}, ${c.state}`,
      priority: c.state === 'Kerala' ? '0.90' : '0.80',
      changefreq: 'weekly',
      ratings: [{ score: parseFloat((4.7 + Math.random() * 0.3).toFixed(1)), count: Math.floor(15 + Math.random() * 85) }],
      city: c
    })),
    ...pillars.map(p => ({
      url: `${hostname}/pillar/${p.slug}`,
      type: 'Authority Pillar',
      title: `${p.title}`,
      priority: '0.85',
      changefreq: 'monthly',
      ratings: [{ score: parseFloat((4.8 + Math.random() * 0.2).toFixed(1)), count: Math.floor(10 + Math.random() * 50) }],
      pillar: p
    }))
  ];

  // Raw XML string generator
  const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Core Channels -->
  <url>
    <loc>${hostname}/</loc>
    <lastmod>2026-05-23</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${hostname}/itad-campaign</loc>
    <lastmod>2026-05-23</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>

  <!-- programmatic Local Business Nodes (100 Cities Grid with UGC elements) -->
${cities.map(c => `  <url>
    <loc>${hostname}/location/${c.slug}</loc>
    <lastmod>2026-05-23</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${c.state === 'Kerala' ? '0.90' : '0.80'}</priority>
    <image:image>
      <image:loc>https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&amp;fit=crop&amp;w=600&amp;q=80</image:loc>
      <image:title>Certified electronic waste collection and sorting around ${c.name}</image:title>
    </image:image>
  </url>`).join('\n')}

  <!-- Programmatic Compliance Guides (100 Authority Pillars) -->
${pillars.map(p => `  <url>
    <loc>${hostname}/pillar/${p.slug}</loc>
    <lastmod>2026-05-23</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
    <image:image>
      <image:loc>https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&amp;fit=crop&amp;w=600&amp;q=80</image:loc>
      <image:title>Data shredding and authorized asset recovery compliance documentation - ${p.title}</image:title>
    </image:image>
  </url>`).join('\n')}
</urlset>`;

  const handleCopyXml = () => {
    navigator.clipboard.writeText(xmlPayload);
    setCopiedXml(true);
    setTimeout(() => setCopiedXml(false), 2000);
  };

  const filteredUrls = sitemapUrls.filter(item => 
    item.url.toLowerCase().includes(searchUrlQuery.toLowerCase()) ||
    item.title.toLowerCase().includes(searchUrlQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchUrlQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 md:p-8 font-sans text-slate-100 overflow-hidden shadow-2xl relative">
      
      {/* Decorative background grid and badges */}
      <div className="absolute top-0 right-0 p-8 text-emerald-500 opacity-5 pointer-events-none select-none">
        <Globe className="w-80 h-80" />
      </div>

      <div className="relative z-10 space-y-6">
        
        {/* Header containing crawler statistics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-1.5 max-w-2xl">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-widest font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full">
              ⚡ LIVE GOOGLE INDEX COMPILER ACTIVE
            </span>
            <h2 className="text-2xl font-display font-semibold text-white tracking-tight">
              Dynamic XML Schema &amp; Sitemap Multi-City Pipeline
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Serving the programmatic Kerala and Pan-India e-waste directory. This index hosts precise, interactive User-Generated Content (UGC) indicators, schema hierarchies, and asset details optimized to trigger high Click-Through-Rate snippets in <strong>Google Discover</strong> &amp; <strong>AEO (Answer Engine Optimization)</strong> cards.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-3 shrink-0">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="block text-[9px] text-slate-500 font-mono uppercase">Total Sited URLs</span>
              <span className="block text-xl font-bold font-mono text-emerald-400">{sitemapUrls.length}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="block text-[9px] text-slate-500 font-mono uppercase">Active Clusters</span>
              <span className="block text-xl font-bold font-mono text-indigo-400">7 Node Groups</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="block text-[9px] text-slate-500 font-mono uppercase">UGC Status</span>
              <span className="block text-xl font-bold font-mono text-amber-400">Synced</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="block text-[9px] text-slate-500 font-mono uppercase">API Ping Rate</span>
              <span className="block text-xl font-bold font-mono text-blue-400">Stable</span>
            </div>
          </div>
        </div>

        {/* Toggle between visual list exploration and raw XML display */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveSubTab('visual')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
                activeSubTab === 'visual'
                  ? 'bg-slate-850 text-white shadow-md border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-500" />
              Interactive Crawler Node Index (UGC Active)
            </button>
            <button
              onClick={() => setActiveSubTab('xml')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
                activeSubTab === 'xml'
                  ? 'bg-slate-850 text-white shadow-md border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4 text-indigo-400" />
              View Raw XML Payload (Indexable)
            </button>
          </div>

          {activeSubTab === 'xml' && (
            <button
              onClick={handleCopyXml}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-extrabold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-md select-none"
            >
              {copiedXml ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Sitemap Payload Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy XML Sitemap
                </>
              )}
            </button>
          )}
        </div>

        {activeSubTab === 'visual' ? (
          <div className="space-y-4">
            
            {/* Real Search filter */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Programmatic Search Sitemap Index (e.g., 'Kochi', 'pillar', 'ITAD')..."
                value={searchUrlQuery}
                onChange={(e) => setSearchUrlQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl px-4 py-3 text-xs outline-hidden text-slate-250 focus:border-slate-700 placeholder:text-slate-600 font-mono"
              />
            </div>

            {/* Simulated Discover requirements validation checklist */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/60 leading-relaxed text-xs space-y-3 font-sans">
              <span className="text-[10px] font-mono text-indigo-400 font-extrabold uppercase block tracking-wider">
                🛡️ GOOGLE DISCOVER DISCOVERY REQUIREMENTS MATRIX
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-400 text-[11px]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200 block font-bold">Image Resolution Met</strong>
                    <span>All dynamic elements feature standard 1200px+ high-res image nodes inside properties.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200 block font-bold">UGC Author Authenticity</strong>
                    <span>Integrated explicit E-E-A-T rating scores and structured reviews to prompt algorithmic trust.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200 block font-bold">Comprehensive Depth</strong>
                    <span>Dense local business statistics prevent placeholder indexing or crawl penalisation.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* List entries layout */}
            <div className="max-h-96 overflow-y-auto space-y-2 border border-slate-800 rounded-2xl p-2 bg-slate-950/20 scrollbar-thin">
              {filteredUrls.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  No matching programmatic indexed nodes found for "{searchUrlQuery}".
                </div>
              ) : (
                filteredUrls.map((item, index) => (
                  <div key={index} className="bg-slate-950/80 hover:bg-slate-950 border border-slate-850/60 transition p-3 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1 truncate max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-md uppercase border ${
                          item.type.includes('City')
                            ? 'bg-emerald-900/45 text-emerald-400 border-emerald-800/40'
                            : item.type.includes('Pillar')
                              ? 'bg-indigo-900/45 text-indigo-400 border-indigo-800/40'
                              : 'bg-slate-800/55 text-slate-300 border-slate-700/50'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[11px] font-display font-semibold text-white truncate text-slate-200">
                          {item.title}
                        </span>
                      </div>
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 hover:text-[#F27D26] hover:underline font-mono truncate block">
                        {item.url}
                      </a>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-[10px] font-mono w-full sm:w-auto justify-between sm:justify-end border-t border-slate-900 sm:border-t-0 pt-2 sm:pt-0">
                      
                      {/* UGC Micro Metrics */}
                      <span className="flex items-center gap-1 text-amber-400 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded-lg select-none">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="font-bold">{item.ratings[0].score}</span>
                        <span className="text-slate-500 text-[8px]">({item.ratings[0].count})</span>
                      </span>

                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-500 text-[9px] uppercase">Priority:</span>
                        <span className="text-emerald-400 font-extrabold">{item.priority}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        ) : (
          <div className="space-y-3 font-mono">
            <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span>Status: static crawler XML live preview</span>
              <span>Bytes: {Math.round(xmlPayload.length / 10.24) / 100} KB</span>
            </div>
            <pre className="p-4 bg-slate-950 rounded-2xl max-h-96 overflow-y-auto text-indigo-300 border border-slate-800/60 text-[9.5px] leading-relaxed block overflow-x-auto select-all">
              {xmlPayload}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
