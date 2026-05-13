import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEO_CONFIG, PageKey } from "@/config/seo.config";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  pageKey?: PageKey;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: object | object[];
  keywords?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export default function SEO({
  title,
  description,
  image,
  pageKey,
  canonicalUrl,
  noindex = false,
  nofollow = false,
  structuredData,
  keywords,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
}: SEOProps) {
  const { language } = useLanguage();
  const lang = language;

  // Get page-specific defaults if pageKey is provided
  const pageData = pageKey ? SEO_CONFIG.pages[pageKey] : null;
  
  // Determine title
  const finalTitle = title || pageData?.title[lang] || SEO_CONFIG.default.title[lang];
  const fullTitle = `${finalTitle} | ${SEO_CONFIG.organization.name}`;

  // Determine description
  const finalDescription =
    description || pageData?.description[lang] || SEO_CONFIG.default.description[lang];

  // Determine image
  const finalImage = image || SEO_CONFIG.default.image;
  const imageUrl = finalImage.startsWith("http")
    ? finalImage
    : `${SEO_CONFIG.domain}${finalImage}`;

  // Determine canonical URL
  const finalCanonicalUrl = canonicalUrl || `${SEO_CONFIG.domain}${typeof window !== "undefined" ? window.location.pathname : ""}`;

  // Determine keywords
  const finalKeywords = keywords || SEO_CONFIG.default.keywords[lang];

  // Build meta robots content
  const robotsContent = [
    noindex ? "noindex" : "index",
    nofollow ? "nofollow" : "follow",
  ].join(", ");

  // Prepare structured data
  const structuredDataArray = Array.isArray(structuredData)
    ? structuredData
    : structuredData
    ? [structuredData]
    : [];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={robotsContent} />
      <meta name="language" content={lang === "ur" ? "Urdu" : "English"} />
      <meta name="author" content={SEO_CONFIG.organization.name} />
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:site_name" content={SEO_CONFIG.organization.name} />
      <meta property="og:locale" content={lang === "ur" ? "ur_PK" : "en_US"} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalCanonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={finalTitle} />

      {/* Article specific meta tags */}
      {type === "article" && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && <meta property="article:author" content={author} />}
        </>
      )}

      {/* Structured Data */}
      {structuredDataArray.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Helmet>
  );
}

