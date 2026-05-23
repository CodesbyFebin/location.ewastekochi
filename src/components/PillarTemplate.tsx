import { useState } from 'react';
import { PillarPage } from '../types';
import { useSeo, getCanonicalUrl, buildFAQSchema, buildTechArticleSchema } from '../packages/seo';
import { 
  BookOpen, Sparkles, Building2, Terminal, ShieldAlert, BadgeCheck, 
  TableProperties, CheckSquare, HelpCircle, ArrowRight, Share2, 
  FileCheck2, Database, Network, Eye, Layers, Landmark
} from 'lucide-react';

interface PillarTemplateProps {
  pillar: PillarPage;
  onNavigateToPillar: (slug: string) => void;
  allPillars: PillarPage[];
}

export default function PillarTemplate({ pillar, onNavigateToPillar, allPillars }: PillarTemplateProps) {
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({
    'Step-1': true,
    'Step-2': false,
    'Step-3': false,
    'Step-4': false,
  });

  const [schemaDrawerOpen, setSchemaDrawerOpen] = useState(false);

  // Filter linked pillars
  const relatedPillars = pillar.relatedSlugs
    .map(slug => allPillars.find(p => p.slug === slug))
    .filter((p): p is PillarPage => p !== undefined);

  // Centralized SEO implementation via packages/seo
  const canonicalUrl = getCanonicalUrl('pillar', pillar.slug);
  const technicalSchemas = buildTechArticleSchema(pillar);
  const faqListSchema = buildFAQSchema(pillar.faqs);

  useSeo({
    title: pillar.title,
    description: pillar.aiSummary,
    canonicalUrl,
    schemas: [technicalSchemas, faqListSchema],
    ogImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80"
  });

  return (
    <article className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden font-sans">
      
      {/* Regulatory Context Banner */}
      <div className="bg-slate-900 text-slate-200 px-6 py-4 border-b border-emerald-950 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-sans font-semibold text-slate-200 uppercase tracking-wide text-[10px]">Kerala E-Waste Compliance Handbook / Guide</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-950 px-2.5 py-1 rounded-lg text-[10px] text-[#6ee7b7] font-mono border border-emerald-900">Resource Category: {pillar.cluster}</span>
          <button 
            onClick={() => setSchemaDrawerOpen(!schemaDrawerOpen)}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
          >
            <Eye className="w-3.5 h-3.5" />
            {schemaDrawerOpen ? 'Hide Compliance Metadata' : 'View Data Integrity Model'}
          </button>
        </div>
      </div>

      {schemaDrawerOpen && (
        <div className="bg-slate-950 p-6 border-b border-slate-900 antialiased font-mono text-[10px] text-slate-300">
          <div className="flex items-center justify-between text-slate-500 pb-2 mb-3 border-b border-slate-900">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400 text-[10px]">
              <Terminal className="w-3.5 h-3.5" />
              Dynamic Structured Data Stack (Schema.org v2026 Injected)
            </span>
            <span className="uppercase text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded font-extrabold">Active Page Ingress</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <span className="text-slate-500 font-bold block">1. Structured Recycling Article Schema</span>
              <pre className="p-3 bg-slate-900/80 rounded-xl max-h-48 overflow-y-auto text-indigo-300 border border-slate-800/60 text-[9px] leading-relaxed">
                {JSON.stringify(technicalSchemas, null, 2)}
              </pre>
            </div>
            <div className="space-y-1.5">
              <span className="text-slate-500 font-bold block">2. Dynamic Interactive FAQ Structure</span>
              <pre className="p-3 bg-slate-900/80 rounded-xl max-h-48 overflow-y-auto text-amber-300 border border-slate-800/60 text-[9px] leading-relaxed">
                {JSON.stringify(faqListSchema, null, 2)}
              </pre>
            </div>
          </div>
          <p className="text-[8px] text-slate-500 mt-3 pr-4 block">
            *This metadata structure utilizes standard JSON-LD schemas to assist researchers, citizens, and businesses in validating regulatory compliance parameters clearly.
          </p>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-slate-50 border-b border-slate-100/50 px-6 py-10 md:p-12">
        <div className="max-w-4xl space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-emerald-700">AUTHORITY RESOURCE IN INDIA</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            {pillar.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-sans max-w-3xl">
            {pillar.introduction}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200/50 mt-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1 uppercase mr-2.5">
              <Share2 className="w-3.5 h-3.5 text-slate-400" /> Share Pillar:
            </span>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://ewastekochi.com/pillar/' + pillar.slug)}&text=${encodeURIComponent('Check out this authorized e-waste resource: ' + pillar.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white transition font-mono text-[9px] uppercase font-bold rounded-lg shadow-2xs"
            >
              <svg className="w-3 h-3 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://ewastekochi.com/pillar/' + pillar.slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0077b5] hover:bg-[#006297] text-white transition font-mono text-[9px] uppercase font-bold rounded-lg shadow-2xs"
            >
              <svg className="w-3 h-3 fill-current text-white" viewBox="0 0 24 24">
                <path d="M19h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              Share on LinkedIn
            </a>
          </div>
        </div>

        {/* Action Engine / Direct Answer Optimization Box */}
        <div className="mt-8 bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm max-w-4xl relative overflow-hidden">
          <div className="absolute top-0 right-0 py-3 px-4 bg-emerald-600 text-white font-mono text-[8px] uppercase tracking-wider font-extrabold rounded-bl-xl shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            AEO Immediate Response Block
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-serif font-bold italic shrink-0">
              Q
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Search query scope:</span>
                <span className="text-xs font-bold font-mono text-slate-800 block mt-0.5">"{pillar.primaryKeyword}"</span>
              </div>
              
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/60">
                <span className="text-[9px] text-emerald-700 font-mono block uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" /> LLM & AI OVERVIEW PARSED ANSWER
                </span>
                <p className="text-[11.5px] text-slate-700 leading-relaxed font-sans font-medium italic">
                  "{pillar.aiSummary}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 p-6 md:p-12">
        
        {/* Left Side: Body Sections (8-12 Clusters) */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Main Prose Clusters */}
          {pillar.h2s.map((cluster, index) => (
            <section key={index} className="space-y-3 pt-4 border-t border-slate-50 first:border-0 first:pt-0">
              <h2 className="text-lg md:text-xl font-display font-bold text-slate-900 tracking-tight flex items-start gap-2">
                <span className="font-mono text-[10px] text-indigo-500 bg-indigo-50 border border-indigo-100/50 w-5 h-5 flex items-center justify-center rounded-md shrink-0 mt-1">
                  0{index + 1}
                </span>
                {cluster.title}
              </h2>
              <div className="text-xs text-slate-600 leading-relaxed font-sans space-y-3">
                <p>{cluster.text}</p>
                <p>
                  Deploying professional solutions in organizations involves auditing infrastructure and aligning with local administrative directives. Our logistics team provides secure bins and specialized carriers to ensure compliance and support material recovery projects at scale.
                </p>
              </div>
            </section>
          ))}

          {/* Interactive Compliance Checklist */}
          <section className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-bold text-sm text-white">Interactive Compliance Step-by-Step Guide</h3>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              To remain compliant with CPCB/MoEF policies, follow this audit validation roadmap. Toggle the gates to simulate compliance milestones:
            </p>

            <div className="space-y-2.5 pt-2">
              {[
                { id: 'Step-1', title: 'Compile Asset Inventory Log', desc: 'Examine serial registries and models, separating components by category.' },
                { id: 'Step-2', title: 'Segregate Hazardous Elements', desc: 'Separate lead-acid batteries, toners, and toxic mercury elements.' },
                { id: 'Step-3', title: 'Confirm Certified Sanitisation', desc: 'Perform NIST 800-88 wipes or secure degaussing command blocks.' },
                { id: 'Step-4', title: 'Issue Serialized Form 3 Certificate', desc: 'Generate complete destruction logs and log files with CPCB portals.' }
              ].map((step) => (
                <button
                  key={step.id}
                  onClick={() => setChecklistState(prev => ({ ...prev, [step.id]: !prev[step.id] }))}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition ${
                    checklistState[step.id]
                      ? 'bg-slate-950 border-emerald-500/40 text-slate-100'
                      : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                    checklistState[step.id] 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' 
                      : 'border-slate-800 text-transparent'
                  }`}>
                    ✓
                  </span>
                  <div>
                    <h5 className="text-[11.5px] font-bold font-sans">{step.title}</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* FAQ Sections */}
          <section className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              <h3 className="font-display font-extrabold text-slate-800 text-sm md:text-base">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-2.5">
              {pillar.faqs.map((faq, idx) => {
                const isOpen = activeFaqIdx === idx;
                return (
                  <div key={idx} className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => setActiveFaqIdx(isOpen ? null : idx)}
                      className="w-full flex justify-between items-center p-4 text-left cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-800 pr-4">{faq.q}</span>
                      <span className="text-slate-400 font-mono">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-0 border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-sans bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* Right Side: Sidebar (Pricing, Certifications, Topic Mesh) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Indian Pricing Matrix */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
              <TableProperties className="w-4 h-4 text-emerald-600" />
              <span>Valuation & Tariff Rates</span>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden font-mono text-[10px]">
              <div className="bg-slate-50 px-3 py-2 text-slate-500 font-bold border-b border-slate-100 grid grid-cols-12">
                <span className="col-span-8">Asset Category</span>
                <span className="col-span-4 text-right">Tariff / Scrap Value</span>
              </div>
              <div className="divide-y divide-slate-50">
                {pillar.pricingTable.map((rate, idx) => (
                  <div key={idx} className="px-3 py-2.5 grid grid-cols-12 hover:bg-slate-50/50">
                    <span className="col-span-7 font-sans text-[11px] text-slate-700 font-medium">{rate.item}</span>
                    <span className="col-span-5 text-right font-bold text-emerald-700">{rate.price}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-[9px] text-slate-400 font-mono tracking-tight leading-normal">
              *Commodity indices change weekly. All corporate contracts include free catalog tagging and local compliance handovers.
            </p>
          </div>

          {/* Compliance Badge card */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 md:p-6 space-y-4">
            <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Corporate Certifications
            </h4>
            <ul className="text-[10px] text-slate-600 space-y-2 font-mono">
              <li className="flex gap-2 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>CPCB Registration: Authorized Recycler</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>DPDP Act compliant data destruction</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>ISO 14001:2015 Environment Certified</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>ISO 27001:2022 Secure logical wipes</span>
              </li>
            </ul>
          </div>

          {/* Topic Mesh / Related Authority Pillars */}
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-wider text-indigo-300">
              <Network className="w-4 h-4 text-indigo-400" />
              <span>Authority Topic Mesh Linkings</span>
            </div>
            
            <p className="text-[9.5px] text-slate-400 leading-relaxed font-sans">
              To build a rich domain entity graph for AI crawlers, each pillar is interconnected. Explore related evergreen guides:
            </p>

            <div className="space-y-2 pt-1">
              {relatedPillars.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => onNavigateToPillar(p.slug)}
                  className="w-full p-2.5 bg-slate-950/80 hover:bg-slate-950 rounded-xl border border-slate-800/50 text-left cursor-pointer group transition"
                >
                  <span className="text-[8px] uppercase tracking-wider text-emerald-400 font-mono block">{p.cluster}</span>
                  <span className="text-[11px] font-bold text-slate-200 block mt-0.5 line-clamp-1 group-hover:text-white group-hover:underline">
                    {p.title}
                  </span>
                  <span className="text-[8px] font-mono mt-1 text-slate-500 block text-right group-hover:text-slate-300">Read Topic Pillar →</span>
                </button>
              ))}

              {relatedPillars.length === 0 && (
                <span className="text-[10px] text-slate-500 italic font-mono block">Zero topic relations defined.</span>
              )}
            </div>
          </div>

          {/* EEAT Signals Box */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 flex gap-3 text-amber-900 font-sans text-[10px]">
            <div className="p-1 h-fit bg-amber-100 rounded-lg text-amber-800 font-bold shrink-0">
              EEAT
            </div>
            <div className="space-y-1 leading-normal">
              <strong>Verified Resource Signal:</strong> This compliance matrix has been prepared under the core guidelines of the Ministry of Electronics & IT, CPCB statutory forms, and data breach logs published by several Indian financial institutions.
            </div>
          </div>

        </div>

      </div>

      {/* Shared Footer with Credits & Sources */}
      <footer className="bg-slate-50 px-6 py-6 border-t border-slate-100/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[10px] text-slate-400 font-mono">
        <div>
          <span>Author: E-Waste Kochi Compliance Editorial Desk</span>
          <span className="block mt-0.5 text-slate-400">Published: May 23, 2026 // Source CPCB statutory bulletins</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Verification Ticket:</span>
          <span className="bg-slate-200/60 text-slate-700 px-1.5 py-0.2 rounded font-bold uppercase">CPCB-EWR-2022-COMPLIANT</span>
        </div>
      </footer>

    </article>
  );
}
