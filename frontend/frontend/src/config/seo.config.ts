/**
 * SEO Configuration for Al Gohar Foundation
 * Update the domain URL when the website is deployed
 */

export const SEO_CONFIG = {
  // Website domain - UPDATE THIS WITH YOUR ACTUAL DOMAIN
  // You can set VITE_APP_DOMAIN in your .env file, or update this default value
  domain: import.meta.env.VITE_APP_DOMAIN || "https://algoharfoundation.org",
  
  // Organization information
  organization: {
    name: "Al Gohar Foundation",
    legalName: "ALGOHAR Educational & Welfare Society",
    description: {
      en: "Empowering communities through education, healthcare, child welfare, and food relief programs across Pakistan since 2008.",
      ur: "2008 سے پاکستان بھر میں تعلیم، صحت کی دیکھ بھال، بچوں کی بہبود اور خوراک کی امداد کے پروگراموں کے ذریعے کمیونٹیز کو بااختیار بنانا۔",
    },
    logo: "/favicon.svg",
    address: {
      streetAddress: "Plot no 5, Block 3, Sector D-II, Green Town",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      postalCode: "",
      addressCountry: "PK",
    },
    contact: {
      phone: "+92 321 2546427",
      email: "info@algohar.org",
    },
    social: {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
    },
    foundingDate: "2008",
  },

  // Default SEO values
  default: {
    title: {
      en: "Al Gohar Foundation - Empowering Lives Through Education & Welfare",
      ur: "الگوہر فاؤنڈیشن - تعلیم اور بہبود کے ذریعے زندگیوں کو بااختیار بنانا",
    },
    description: {
      en: "Join Al Gohar Foundation in creating sustainable change through education, healthcare, child welfare, and essential food support for families in need across Pakistan.",
      ur: "پاکستان بھر میں ضرورت مند خاندانوں کے لیے تعلیم، صحت کی دیکھ بھال، بچوں کی بہبود اور ضروری خوراک کی مدد کے ذریعے پائیدار تبدیلی لانے میں الگوہر فاؤنڈیشن میں شامل ہوں۔",
    },
    image: "/og-image.jpg", // Default OG image - should be 1200x630px
    keywords: {
      en: "charity, donation, education, healthcare, child welfare, food relief, Pakistan, NGO, nonprofit, welfare society, Lahore",
      ur: "صدقہ، عطیہ، تعلیم، صحت کی دیکھ بھال، بچوں کی بہبود، خوراک کی امداد، پاکستان، این جی او، غیر منفعتی، فلاحی معاشرہ، لاہور",
    },
  },

  // Page-specific SEO metadata
  pages: {
    home: {
      title: {
        en: "Al Gohar Foundation - Empowering Lives Through Education & Welfare",
        ur: "الگوہر فاؤنڈیشن - تعلیم اور بہبود کے ذریعے زندگیوں کو بااختیار بنانا",
      },
      description: {
        en: "Join us in creating sustainable change through education, healthcare, child welfare, and essential food support for families in need across Pakistan.",
        ur: "پاکستان بھر میں ضرورت مند خاندانوں کے لیے تعلیم، صحت کی دیکھ بھال، بچوں کی بہبود اور ضروری خوراک کی مدد کے ذریعے پائیدار تبدیلی لانے میں شامل ہوں۔",
      },
    },
    about: {
      title: {
        en: "About Us - Al Gohar Foundation",
        ur: "ہمارے بارے میں - الگوہر فاؤنڈیشن",
      },
      description: {
        en: "Learn about Al Gohar Foundation's mission, vision, and dedicated team working to empower communities across Pakistan through education and welfare programs.",
        ur: "پاکستان بھر میں تعلیم اور فلاحی پروگراموں کے ذریعے کمیونٹیز کو بااختیار بنانے کے لیے کام کرنے والے الگوہر فاؤنڈیشن کے مشن، وژن اور پرعزم ٹیم کے بارے میں جانیں۔",
      },
    },
    services: {
      title: {
        en: "Our Services - Al Gohar Foundation",
        ur: "ہماری خدمات - الگوہر فاؤنڈیشن",
      },
      description: {
        en: "Discover our comprehensive services including free education, healthcare facilities, child welfare, and ration distribution programs across Pakistan.",
        ur: "پاکستان بھر میں مفت تعلیم، صحت کی سہولیات، بچوں کی بہبود، اور راشن تقسیم کے پروگراموں سمیت ہماری جامع خدمات دریافت کریں۔",
      },
    },
    projects: {
      title: {
        en: "Our Projects - Al Gohar Foundation",
        ur: "ہمارے منصوبے - الگوہر فاؤنڈیشن",
      },
      description: {
        en: "Explore our ongoing and completed projects making a positive impact on communities across Pakistan through education, healthcare, and welfare initiatives.",
        ur: "تعلیم، صحت کی دیکھ بھال، اور فلاحی اقدامات کے ذریعے پاکستان بھر کی کمیونٹیز پر مثبت اثر ڈالنے والے ہمارے جاری اور مکمل شدہ منصوبوں کو دریافت کریں۔",
      },
    },
    blogs: {
      title: {
        en: "Blog - Al Gohar Foundation",
        ur: "بلاگ - الگوہر فاؤنڈیشن",
      },
      description: {
        en: "Read our latest news, stories of impact, and insights from the field. Learn about the communities we serve and the difference your support makes.",
        ur: "ہماری تازہ ترین خبریں، اثرات کی کہانیاں، اور میدان سے بصیرتیں پڑھیں۔ ان کمیونٹیز کے بارے میں جانیں جن کی ہم خدمت کرتے ہیں اور آپ کی مدد کا فرق۔",
      },
    },
    "free-education": {
      title: {
        en: "Free Education Program - Al Gohar Foundation",
        ur: "مفت تعلیم پروگرام - الگوہر فاؤنڈیشن",
      },
      description: {
        en: "Providing quality education to underprivileged children across Pakistan with modern facilities and dedicated teachers. Support a child's education today.",
        ur: "جدید سہولیات اور پرعزم اساتذہ کے ساتھ پاکستان بھر کے پسماندہ بچوں کو معیاری تعلیم فراہم کرنا۔ آج ہی کسی بچے کی تعلیم کی مدد کریں۔",
      },
    },
    donate: {
      title: {
        en: "Donate Now - Al Gohar Foundation",
        ur: "ابھی عطیہ دیں - الگوہر فاؤنڈیشن",
      },
      description: {
        en: "Make a donation to support education, healthcare, child welfare, and food relief programs. Your contribution makes a real difference in the lives of those in need.",
        ur: "تعلیم، صحت کی دیکھ بھال، بچوں کی بہبود، اور خوراک کی امداد کے پروگراموں کی مدد کے لیے عطیہ دیں۔ آپ کا تعاون ضرورت مندوں کی زندگیوں میں حقیقی فرق پیدا کرتا ہے۔",
      },
    },
    "donate-ration": {
      title: {
        en: "Donate Ration - Al Gohar Foundation",
        ur: "راشن عطیہ کریں - الگوہر فاؤنڈیشن",
      },
      description: {
        en: "Help provide essential food items to families in need. Your ration donation ensures no family goes to sleep hungry.",
        ur: "ضرورت مند خاندانوں کو ضروری خوراک کی اشیاء فراہم کرنے میں مدد کریں۔ آپ کا راشن کا عطیہ یقینی بناتا ہے کہ کوئی خاندان بھوکا نہ سوئے۔",
      },
    },
    contact: {
      title: {
        en: "Contact Us - Al Gohar Foundation",
        ur: "ہم سے رابطہ کریں - الگوہر فاؤنڈیشن",
      },
      description: {
        en: "Get in touch with Al Gohar Foundation. We're here to answer your questions and help you get involved in our mission.",
        ur: "الگوہر فاؤنڈیشن سے رابطہ کریں۔ ہم آپ کے سوالات کے جوابات دینے اور آپ کو ہمارے مشن میں شامل ہونے میں مدد کرنے کے لیے موجود ہیں۔",
      },
    },
    reports: {
      title: {
        en: "Impact Reports - Al Gohar Foundation",
        ur: "اثرات کی رپورٹیں - الگوہر فاؤنڈیشن",
      },
      description: {
        en: "View our impact reports and see how your donations are making a difference in communities across Pakistan.",
        ur: "ہماری اثرات کی رپورٹیں دیکھیں اور دیکھیں کہ آپ کے عطیات پاکستان بھر کی کمیونٹیز میں کس طرح فرق پیدا کر رہے ہیں۔",
      },
    },
    "bank-details": {
      title: {
        en: "Bank Details - Al Gohar Foundation",
        ur: "بینک کی تفصیلات - الگوہر فاؤنڈیشن",
      },
      description: {
        en: "Find our bank account details for direct donations. Support our mission through bank transfers.",
        ur: "براہ راست عطیات کے لیے ہمارے بینک اکاؤنٹ کی تفصیلات تلاش کریں۔ بینک ٹرانسفر کے ذریعے ہمارے مشن کی مدد کریں۔",
      },
    },
  },
};

export type PageKey = keyof typeof SEO_CONFIG.pages;

