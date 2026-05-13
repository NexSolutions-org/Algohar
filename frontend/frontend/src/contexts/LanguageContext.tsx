import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ur";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Translation files
const translations = {
  en: {
    // Header
    "header.donate": "DONATE NOW",
    "header.services": "Services",
    "header.projects": "Projects", 
    "header.reports": "Reports",
    "header.blogs": "Blogs",
    "header.about": "About Us",
    "header.bankDetails": "Bank Details",
    "header.contact": "Contact Us",
    "header.home": "Home",
    "header.logoAlt": "Algohar Educational & Welfare Society Logo",
    "header.organizationName": "ALGOHAR",
    "header.organizationSubtitle": "Educational & Welfare Society",
    
    // Home page - Hero section
    "home.hero.title": "Empowering Lives Through",
    "home.hero.titleHighlight": "Education & Welfare",
    "home.hero.subtitle": "Join us in creating sustainable change through education, healthcare, child welfare, and essential food support for families in need across Pakistan.",
    "home.hero.donateButton": "DONATE NOW",
    "home.hero.watchButton": "Watch Our Impact",
    "home.hero.familiesHelped": "Families Helped",
    "home.hero.studentsEducated": "Students Educated",
    "home.hero.yearsService": "Years of Service",
    "home.hero.recentDonation": "Latest donation helped 4 families",
    
    // Services section
    "home.services.title": "Our Services",
    "home.services.subtitle": "Comprehensive support for communities in need",
    "home.services.education.title": "Free Education",
    "home.services.education.description": "Providing quality education to underprivileged children with modern facilities and dedicated teachers.",
    "home.services.education.impact": "2,500+ Students Enrolled",
    "home.services.health.title": "Health Facilities",
    "home.services.health.description": "Free medical care, health checkups, and essential medicines for families who cannot afford healthcare.",
    "home.services.health.impact": "10,000+ Patients Treated",
    "home.services.childWelfare.title": "Child Welfare",
    "home.services.childWelfare.description": "Protecting children's rights, providing shelter, and ensuring their safety and well-being.",
    "home.services.childWelfare.impact": "1,200+ Children Protected",
    "home.services.ration.title": "Ration Program",
    "home.services.ration.description": "Monthly food packages ensuring families don't miss essential meals during difficult times.",
    "home.services.ration.impact": "5,000+ Families Fed Monthly",
    
    // Additional services section
    "home.additionalServices.title": "Make a Difference Today",
    "home.additionalServices.subtitle": "Choose how you want to help and create lasting impact",
    "home.additionalServices.general.title": "GENERAL DONATION",
    "home.additionalServices.general.description": "It allows you to express your compassion and commitment to our cause in the most meaningful way. Whether it's a small gesture of support or a larger contribution, like PKR 500 or more.",
    "home.additionalServices.general.button": "DONATE NOW",
    "home.additionalServices.ration.title": "RATION DONATION",
    "home.additionalServices.ration.description": "Help provide essential food items to families in need. Your contribution ensures no family goes to sleep hungry.",
    "home.additionalServices.ration.button": "DONATE RATION",
    "home.additionalServices.education.title": "EDUCATION SUPPORT",
    "home.additionalServices.education.description": "Support children's education with books, uniforms, and school supplies. Help build a brighter future through learning.",
    "home.additionalServices.education.button": "SUPPORT EDUCATION",
    
    // Footer
    "footer.organizationName": "ALGOHAR",
    "footer.organizationSubtitle": "Educational & Welfare Society", 
    "footer.description": "Empowering communities through education, healthcare, and welfare programs since 2008.",
    "footer.quickLinks": "Quick Links",
    "footer.support": "Support",
    "footer.contactInfo": "Contact Info",
    "footer.address": "Plot no 5, Block 3, Sector D-II\nGreen Town, Lahore, Pakistan",
    "footer.phone": "+92 321 2546427",
    "footer.email": "info@algohar.org",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.faqs": "FAQs",
    "footer.partners": "Our Trusted Partners",
    "footer.sslSecured": "SSL Secured",
    "footer.registeredTrust": "Registered Trust",
    "footer.copyright": "© 2024 ALGOHAR Educational & Welfare Society. All rights reserved.",
    
    // Donation Modal
    "donation.title": "Make a Donation",
    "donation.subtitle": "Your contribution makes a real difference",
    "donation.type": "Donation Type",
    "donation.oneTime": "One-time",
    "donation.monthly": "Monthly",
    "donation.amount": "Donation Amount",
    "donation.customAmount": "Custom Amount (PKR)",
    "donation.impact": "Your Impact",
    "donation.donorInfo": "Donor Information",
    "donation.name": "Full Name",
    "donation.namePlaceholder": "Enter your full name",
    "donation.email": "Email Address",
    "donation.emailPlaceholder": "Enter your email address",
    "donation.phone": "Phone Number",
    "donation.phonePlaceholder": "Enter your phone number",
    "donation.paymentMethod": "Payment Method",
    "donation.card": "Credit/Debit Card",
    "donation.bank": "Bank Transfer",
    "donation.mobile": "Mobile Wallet",
    "donation.submitButton": "DONATE NOW",
    "donation.processing": "Processing...",
    "donation.trustIndicators": "Trust & Security Indicators",
    "donation.secure": "Your donation is secure and encrypted",
    "donation.registered": "We are a registered non-profit organization",
    "donation.transparent": "100% transparency in fund utilization",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.close": "Close",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.readMore": "Read More",
    "common.learnMore": "Learn More",
    "common.viewAll": "View All",
    "common.backHome": "Back to Home",
    "common.language": "Language",
    "common.switchLanguage": "Switch Language",
  },
  ur: {
    // Header
    "header.donate": "اب عطیہ کریں",
    "header.services": "خدمات",
    "header.projects": "منصوبے",
    "header.reports": "رپورٹس",
    "header.blogs": "بلاگز",
    "header.about": "ہمارے بارے میں",
    "header.bankDetails": "بینک کی تفصیلات",
    "header.contact": "رابطہ کریں",
    "header.home": "ہوم",
    "header.logoAlt": "الگوہر تعلیمی اور فلاحی سوسائٹی کا لوگو",
    "header.organizationName": "الگوہر",
    "header.organizationSubtitle": "تعلیمی اور فلاحی سوسائٹی",
    
    // Home page - Hero section
    "home.hero.title": "تعلیم اور فلاح کے ذریعے",
    "home.hero.titleHighlight": "زندگیوں کو بہتر بنانا",
    "home.hero.subtitle": "پاکستان بھر میں ضرورت مند خاندانوں کے لیے تعلیم، صحت کی دیکھ بھال، بچوں کی فلاح اور ضروری خوراک کی مدد کے ذریعے پائیدار تبدیلی لانے میں ہمارا ساتھ دیں۔",
    "home.hero.donateButton": "اب عطیہ کریں",
    "home.hero.watchButton": "ہمارا اثر دیکھیں",
    "home.hero.familiesHelped": "خاندانوں کی مدد کی گئی",
    "home.hero.studentsEducated": "طلباء کو تعلیم دی گئی",
    "home.hero.yearsService": "سال کی خدمت",
    "home.hero.recentDonation": "تازہ عطیے سے 4 خاندانوں کی مدد ہوئی",
    
    // Services section
    "home.services.title": "ہماری خدمات",
    "home.services.subtitle": "ضرورت مند کمیونٹیوں کے لیے جامع مدد",
    "home.services.education.title": "مفت تعلیم",
    "home.services.education.description": "جدید سہولات اور وقفی اساتذہ کے ساتھ غریب بچوں کو معیاری تعلیم فراہم کرنا۔",
    "home.services.education.impact": "2,500+ طلباء داخل",
    "home.services.health.title": "صحت کی سہولات",
    "home.services.health.description": "ان خاندانوں کے لیے مفت طبی دیکھ بھال، صحت کی جانچ اور ضروری ادویات جو صحت کی دیکھ بھال کا متحمل نہیں ہو سکتے۔",
    "home.services.health.impact": "10,000+ مریضوں کا علاج",
    "home.services.childWelfare.title": "بچوں کی فلاح",
    "home.services.childWelfare.description": "بچوں کے حقوق کا تحفظ، پناہ گاہ فراہم کرنا، اور ان کی حفاظت اور بہبود کو یقینی بنانا۔",
    "home.services.childWelfare.impact": "1,200+ بچوں کا تحفظ",
    "home.services.ration.title": "راشن پروگرام",
    "home.services.ration.description": "ماہانہ خوراک کے پیکجز جو یقینی بناتے ہیں کہ خاندان مشکل وقت میں ضروری کھانے سے محروم نہ رہیں۔",
    "home.services.ration.impact": "5,000+ خاندانوں کو ماہانہ کھانا",
    
    // Additional services section
    "home.additionalServices.title": "آج ہی فرق کریں",
    "home.additionalServices.subtitle": "اپنی مدد کا طریقہ منتخب کریں اور دیرپا اثر پیدا کریں",
    "home.additionalServices.general.title": "عام عطیہ",
    "home.additionalServices.general.description": "یہ آپ کو ہمارے مقصد کے لیے اپنی شفقت اور وابستگی کا اظہار انتہائی معنی خیز انداز میں کرنے کی اجازت دیتا ہے۔ چاہے یہ چھوٹا سا اشارہ ہو یا بڑا عطیہ، جیسے 500 روپے یا اس سے زیادہ۔",
    "home.additionalServices.general.button": "اب عطیہ کریں",
    "home.additionalServices.ration.title": "راشن کا عطیہ",
    "home.additionalServices.ration.description": "ضرورت مند خاندانوں کو ضروری خوراک فراہم کرنے میں مدد کریں۔ آپ کا تعاون اس بات کو یقینی بناتا ہے کہ کوئی خاندان بھوکا نہ سوئے۔",
    "home.additionalServices.ration.button": "راشن عطیہ کریں",
    "home.additionalServices.education.title": "تعلیمی مدد",
    "home.additionalServices.education.description": "کتابوں، یونیفارم اور اسکول کے سامان کے ساتھ بچوں کی تعلیم میں مدد کریں۔ سیکھنے کے ذریعے ایک روشن مستقبل بنانے میں مدد کریں۔",
    "home.additionalServices.education.button": "تعلیم کی مدد کریں",
    
    // Footer
    "footer.organizationName": "الگوہر",
    "footer.organizationSubtitle": "تعلیمی اور فلاحی سوسائٹی",
    "footer.description": "2008 سے تعلیم، صحت کی دیکھ بھال، اور فلاحی پروگراموں کے ذریعے کمیونٹیوں کو بااختیار بنانا۔",
    "footer.quickLinks": "فوری لنکس",
    "footer.support": "سپورٹ",
    "footer.contactInfo": "رابطے کی معلومات",
    "footer.address": "پلاٹ نمبر 5، بلاک 3، سیکٹر ڈی-II\nگرین ٹاؤن، لاہور، پاکستان",
    "footer.phone": "0321-2546427",
    "footer.email": "info@algohar.org",
    "footer.privacy": "پرائیویسی پالیسی",
    "footer.terms": "خدمات کی شرائط",
    "footer.faqs": "اکثر پوچھے جانے والے سوالات",
    "footer.partners": "ہمارے قابل اعتماد پارٹنرز",
    "footer.sslSecured": "SSL محفوظ",
    "footer.registeredTrust": "رجسٹرڈ ٹرسٹ",
    "footer.copyright": "© 2024 الگوہر تعلیمی اور فلاحی سوسائٹی۔ تمام حقوق محفوظ ہیں۔",
    
    // Donation Modal
    "donation.title": "عطیہ کریں",
    "donation.subtitle": "آپ کا تعاون حقیقی فرق لاتا ہے",
    "donation.type": "عطیے کی قسم",
    "donation.oneTime": "ایک بار",
    "donation.monthly": "ماہانہ",
    "donation.amount": "عطیے کی رقم",
    "donation.customAmount": "حسب ضرورت رقم (روپے)",
    "donation.impact": "آپ کا اثر",
    "donation.donorInfo": "عطیہ دہندہ کی معلومات",
    "donation.name": "مکمل نام",
    "donation.namePlaceholder": "اپنا مکمل نام درج کریں",
    "donation.email": "ای میل ایڈریس",
    "donation.emailPlaceholder": "اپنا ای میل ایڈریس درج کریں",
    "donation.phone": "فون نمبر",
    "donation.phonePlaceholder": "اپنا فون نمبر درج کریں",
    "donation.paymentMethod": "ادائیگی کا طریقہ",
    "donation.card": "کریڈٹ/ڈیبٹ کارڈ",
    "donation.bank": "بینک ٹرانسفر",
    "donation.mobile": "موبائل والیٹ",
    "donation.submitButton": "اب عطیہ کریں",
    "donation.processing": "پروسیسنگ...",
    "donation.trustIndicators": "اعتماد اور سیکیورٹی کے اشارے",
    "donation.secure": "آپ کا عطیہ محفوظ اور خفیہ ہے",
    "donation.registered": "ہم ایک رجسٹرڈ غیر منافع بخش تنظیم ہیں",
    "donation.transparent": "فنڈز کے استعمال میں 100% شفافیت",
    
    // Common
    "common.loading": "لوڈ ہو رہا ہے...",
    "common.error": "خرابی",
    "common.success": "کامیابی",
    "common.close": "بند کریں",
    "common.submit": "جمع کریں",
    "common.cancel": "منسوخ کریں",
    "common.readMore": "مزید پڑھیں",
    "common.learnMore": "مزید جانیں",
    "common.viewAll": "سب دیکھیں",
    "common.backHome": "واپس ہوم پر",
    "common.language": "زبان",
    "common.switchLanguage": "زبان تبدیل کریں",
  }
} as const;

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Get language from localStorage or default to English
    const savedLanguage = localStorage.getItem("algohar-language");
    return (savedLanguage as Language) || "en";
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem("algohar-language", language);
    
    // Update document direction and language attributes
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    
    // Add/remove RTL class for styling
    if (language === "ur") {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const isRTL = language === "ur";

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};