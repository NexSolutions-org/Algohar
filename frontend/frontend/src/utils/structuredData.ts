import { SEO_CONFIG } from "@/config/seo.config";

/**
 * Generate Organization structured data (JSON-LD)
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    "name": SEO_CONFIG.organization.name,
    "legalName": SEO_CONFIG.organization.legalName,
    "description": SEO_CONFIG.organization.description.en,
    "url": SEO_CONFIG.domain,
    "logo": `${SEO_CONFIG.domain}${SEO_CONFIG.organization.logo}`,
    "foundingDate": SEO_CONFIG.organization.foundingDate,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SEO_CONFIG.organization.address.streetAddress,
      "addressLocality": SEO_CONFIG.organization.address.addressLocality,
      "addressRegion": SEO_CONFIG.organization.address.addressRegion,
      "addressCountry": SEO_CONFIG.organization.address.addressCountry,
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": SEO_CONFIG.organization.contact.phone,
      "email": SEO_CONFIG.organization.contact.email,
      "contactType": "customer service",
    },
    "sameAs": Object.values(SEO_CONFIG.organization.social).filter(Boolean),
  };
}

/**
 * Generate Website structured data (JSON-LD)
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SEO_CONFIG.organization.name,
    "url": SEO_CONFIG.domain,
    "description": SEO_CONFIG.organization.description.en,
    "publisher": {
      "@type": "NGO",
      "name": SEO_CONFIG.organization.name,
    },
  };
}

/**
 * Generate BreadcrumbList structured data (JSON-LD)
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SEO_CONFIG.domain}${item.url}`,
    })),
  };
}

/**
 * Generate Article structured data (JSON-LD)
 */
export function generateArticleSchema({
  title,
  description,
  image,
  author,
  publishedTime,
  modifiedTime,
  url,
}: {
  title: string;
  description: string;
  image?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  url?: string;
}) {
  const articleUrl = url ? `${SEO_CONFIG.domain}${url}` : SEO_CONFIG.domain;
  const articleImage = image
    ? image.startsWith("http")
      ? image
      : `${SEO_CONFIG.domain}${image}`
    : `${SEO_CONFIG.domain}${SEO_CONFIG.default.image}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": articleImage,
    "author": {
      "@type": "Organization",
      "name": author || SEO_CONFIG.organization.name,
    },
    "publisher": {
      "@type": "Organization",
      "name": SEO_CONFIG.organization.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${SEO_CONFIG.domain}${SEO_CONFIG.organization.logo}`,
      },
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime || publishedTime,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };
}

/**
 * Generate Service structured data (JSON-LD)
 */
export function generateServiceSchema({
  name,
  description,
  provider,
  areaServed,
}: {
  name: string;
  description: string;
  provider?: string;
  areaServed?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "provider": {
      "@type": "NGO",
      "name": provider || SEO_CONFIG.organization.name,
    },
    "areaServed": {
      "@type": "Country",
      "name": areaServed || "Pakistan",
    },
  };
}

/**
 * Generate DonationAction structured data (JSON-LD)
 */
export function generateDonationActionSchema({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    "name": title,
    "description": description,
    "object": {
      "@type": "Organization",
      "name": SEO_CONFIG.organization.name,
    },
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${SEO_CONFIG.domain}${url}`,
    },
  };
}

