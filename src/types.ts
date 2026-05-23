export interface City {
  slug: string;
  name: string;
  state: string;
  region: string;
  population: string;
  statistics: string;
  pickupZones: string[];
  localInstitutions: string[];
  priceMultiplier: number;
  faqSuffix: string;
  ewasteTonnes: string;
  intent: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface ServiceCluster {
  slug: string;
  title: string;
  content: string;
}

export interface ConversionLog {
  id: string;
  timestamp: string;
  city: string;
  email: string;
  phone: string;
  deviceType: string;
  estimatedPayout: number;
  historyViewed: string[];
}

export interface PillarPage {
  slug: string;
  title: string;
  cluster: string;
  primaryKeyword: string;
  aiSummary: string;
  introduction: string;
  h2s: Array<{ title: string; text: string }>;
  faqs: Array<{ q: string; a: string }>;
  pricingTable: Array<{ item: string; price: string }>;
  relatedSlugs: string[];
}

