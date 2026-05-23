import { useEffect } from 'react';

// Domain configuration
export const DOMAIN = 'https://ewastekochi.com';

/**
 * Returns canonical URLs dynamically depending on the route type.
 */
export function getCanonicalUrl(type: 'homepage' | 'city' | 'pillar' | 'campaign', slug?: string): string {
  switch (type) {
    case 'homepage':
      return `${DOMAIN}/`;
    case 'campaign':
      return `${DOMAIN}/itad-campaign`;
    case 'city':
      return `${DOMAIN}/location/${slug || ''}`;
    case 'pillar':
      return `${DOMAIN}/pillar/${slug || ''}`;
    default:
      return `${DOMAIN}/`;
  }
}

/**
 * Build a structured schema mapping for an FAQ Page
 */
export function buildFAQSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };
}

/**
 * Build structured Schema mapping for breadcrumb navigation list
 */
export function buildBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  };
}

/**
 * Build structured schema for a local business node (dynamic per city)
 */
export function buildLocalBusinessSchema(city: { slug: string; name: string; state: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${DOMAIN}/location/${city.slug}#localbusiness`,
    "name": `Kochi E-Waste Recycling Center - ${city.name} Branch`,
    "telephone": "+91-484-255011",
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": city.name
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city.name,
      "addressRegion": city.state,
      "addressCountry": "IN"
    },
    "priceRange": "$$"
  };
}

/**
 * Build structured schema for TechArticle compliance guidelines
 */
export function buildTechArticleSchema(pillar: { slug: string; title: string; aiSummary: string; cluster: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": pillar.title,
    "description": pillar.aiSummary,
    "dependencies": "E-Waste Rules 2022, DPDP Act 2023",
    "inLanguage": "en-IN",
    "author": {
      "@type": "Organization",
      "name": "E-Waste Kochi Group",
      "url": DOMAIN
    },
    "publisher": {
      "@type": "Organization",
      "name": "E-Waste Kochi",
      "logo": {
        "@type": "ImageObject",
        "url": `${DOMAIN}/logo.png`
      }
    },
    "mainEntityOfPage": `${DOMAIN}/pillar/${pillar.slug}`,
    "about": {
      "@type": "Thing",
      "name": pillar.cluster
    }
  };
}

interface SeoProps {
  title: string;
  description: string;
  canonicalUrl: string;
  schemas?: any[];
  ogImage?: string;
}

/**
 * A central React side-effect hook that injects and updates document tags dynamically.
 * Updates document page title, description meta, canonical link, OpenGraph metadata, and
 * dynamically creates/replaces JSON-LD structured schema script elements in the head.
 */
export function useSeo({ title, description, canonicalUrl, schemas = [], ogImage }: SeoProps) {
  useEffect(() => {
    // 1. Title
    document.title = `${title} | E-Waste Kochi Compliance Network`;

    // 2. Meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // 3. Meta OpenGraph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonicalUrl);

    if (ogImage) {
      let ogImg = document.querySelector('meta[property="og:image"]');
      if (!ogImg) {
        ogImg = document.createElement('meta');
        ogImg.setAttribute('property', 'og:image');
        document.head.appendChild(ogImg);
      }
      ogImg.setAttribute('content', ogImage);
    }

    // 4. Canonical URL Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 5. Injected JSON-LD Schema Tags
    // Remove existing programmatic JSON-LD elements
    const oldScripts = document.querySelectorAll('script[data-seo-module="true"]');
    oldScripts.forEach(script => script.remove());

    // Inject newly compiled schema structures
    schemas.forEach((schema, idx) => {
      if (!schema) return;
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-module', 'true');
      script.setAttribute('data-schema-index', String(idx));
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      // Optional: Cleanup injected script blocks when page unmounts
      const currentScripts = document.querySelectorAll('script[data-seo-module="true"]');
      currentScripts.forEach(script => script.remove());
    };
  }, [title, description, canonicalUrl, schemas, ogImage]);
}
