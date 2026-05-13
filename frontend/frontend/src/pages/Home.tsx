import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Heart, GraduationCap, Stethoscope, Users, Utensils, Play, Building, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import SEO from "@/components/SEO";
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateBreadcrumbSchema,
} from "@/utils/structuredData";
import { SEO_CONFIG } from "@/config/seo.config";

type Project = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  status: "ongoing" | "completed" | "planned";
  date: string | Date;
  location: string;
  fundsRaised?: string | number | null;
  familiesHelped?: number | null;
};

// Partner logos
import darazLogo from "@assets/Screenshot 2025-09-08 144057_1757367768170.png";
import uolLogo from "@assets/Screenshot 2025-09-08 144109_1757367768171.png";
import payfastLogo from "@assets/Screenshot 2025-09-08 144120_1757367768172.png";
import swdLogo from "@assets/Screenshot 2025-09-08 144135_1757367768173.png";
import dibLogo from "@assets/Screenshot 2025-09-08 144148_1757367768174.png";
import togetherLogo from "@assets/Screenshot 2025-09-08 144209_1757367768175.png";
import hblLogo from "@assets/hbl-logo.webp";
import ucpLogo from "@assets/UCP_Logo@2x_1757695827806.webp";
import baitulmalLogo from "@assets/bait-ul-mal-logo.webp";

// Hero banner image
import heroBanner from "@assets/WhatsApp Image 2025-09-08 at 14.46.16_f3837e68_1757368782054.jpg";

// Additional services image
import servicesImage from "@assets/Screenshot 2025-09-15 134242_1757968993924.png";

// Featured project images
import featuredImage1 from "@assets/IMG-20250908-WA0016_1757963629070.jpg";
import featuredImage2 from "@assets/IMG-20250908-WA0021_1757963629071.jpg";
import featuredImage3 from "@assets/IMG-20250908-WA0037_1757963629073.jpg";

const services = [
  {
    icon: GraduationCap,
    title: "Education",
    description: "Providing quality education to underprivileged children across Pakistan.",
    impact: "12,000+ students educated",
    color: "text-blue-600",
  },
  {
    icon: Stethoscope,
    title: "Healthcare",
    description: "Delivering essential medical care and health services to those in need.",
    impact: "25,000+ patients treated",
    color: "text-green-600",
  },
  {
    icon: Users,
    title: "Child Welfare",
    description: "Supporting orphaned and vulnerable children with care and protection.",
    impact: "3,000+ children supported",
    color: "text-purple-600",
  },
  {
    icon: Utensils,
    title: "Food Relief",
    description: "Distributing monthly rations and emergency food aid to needy families.",
    impact: "8,000+ families fed monthly",
    color: "text-orange-600",
  },
];

const collaborators = [
  {
    name: "Daraz",
    logo: darazLogo
  },
  {
    name: "University of Lahore",
    logo: uolLogo
  },
  {
    name: "PayFast", 
    logo: payfastLogo
  },
  {
    name: "Social Welfare Dept Punjab",
    logo: swdLogo
  },
  {
    name: "Dubai Islamic Bank",
    logo: dibLogo
  },
  {
    name: "Together",
    logo: togetherLogo
  },
  {
    name: "HBL Pay",
    logo: hblLogo
  },
  {
    name: "UCP",
    logo: ucpLogo
  },
  {
    name: "Bait-ul-Mal",
    logo: baitulmalLogo
  },
  {
    name: "Punjab Zakat Council",
    logo: swdLogo
  }
];

export default function Home() {
  const { format } = useCurrencyConversion();
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const featuredProject = projects.find((p: Project) => p.status === "completed") || projects[0];

  // Structured data
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
  ]);

  return (
    <div>
      <SEO
        pageKey="home"
        structuredData={[organizationSchema, websiteSchema, breadcrumbSchema]}
      />
      {/* Hero Section */}
      <section className="hero-gradient py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="space-y-3">
                <h1 className="text-3xl lg:text-5xl font-bold text-foreground leading-tight text-left">
                  Transform Lives Through
                  <span className="text-primary block">Education & Care</span>
                </h1>
                <p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl text-left">
                  Join us in building a brighter future for Pakistan through education, healthcare, and community support. Every donation makes a difference.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button 
                  asChild
                  className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl"
                  data-testid="button-hero-donate"
                >
                  <Link href="/donate">
                    <Heart className="w-5 h-5 mr-2" />
                    Donate Now
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  className="px-8 py-4 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white"
                  data-testid="button-watch-impact"
                  asChild
                >
                  <a 
                    href="https://youtu.be/TMdDsDCH4Fs?si=Pdv33Idn9LtPy6_Y"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Watch Our Impact
                  </a>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-6 pt-4">
                <div className="text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-primary" data-testid="stat-families-helped">5,000+</div>
                  <div className="text-sm text-muted-foreground">Families Helped</div>
                </div>
                <div className="text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-primary" data-testid="stat-students-educated">12,000+</div>
                  <div className="text-sm text-muted-foreground">Students Educated</div>
                </div>
                <div className="text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-primary" data-testid="stat-years-service">15+</div>
                  <div className="text-sm text-muted-foreground">Years of Service</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={heroBanner}
                  alt="Parhe ga Pakistan - Every child has the right to education" 
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover" 
                />
                
                <div className="absolute -bottom-4 -right-3 bg-white rounded-lg shadow-lg p-3 max-w-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-foreground" data-testid="recent-donation-amount">{format(25000)}</div>
                      <div className="text-xs text-muted-foreground">Recent Donation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4 text-left">Our Services</h2>
            <p className="text-xl text-muted-foreground text-left">Making a difference in communities across Pakistan</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-200" data-testid={`card-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader>
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-left">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-left">{service.description}</p>
                  <div className="text-sm text-primary font-semibold text-left" data-testid={`impact-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {service.impact}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4 text-left">Make a Difference Today</h2>
            <p className="text-xl text-muted-foreground text-left">Choose how you want to support our mission</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* General Donation */}
            <Card className="text-center hover:shadow-xl transition-shadow duration-200 border-2 hover:border-primary">
              <CardContent className="p-8">
                <div className="w-32 h-32 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <Heart className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 text-left" data-testid="general-donation-title">
                  General Donation
                </h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed text-left">
                  Support our mission with a general donation that helps us continue our work across all programs and services.
                </p>
                <Button 
                  asChild
                  className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  data-testid="button-donate-general"
                >
                  <Link href="/donate">Donate Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Child's Education */}
            <Card className="text-center hover:shadow-xl transition-shadow duration-200 border-2 hover:border-primary">
              <CardContent className="p-8">
                <div className="w-32 h-32 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <GraduationCap className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 text-left" data-testid="child-education-title">
                  Child's Education
                </h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed text-left">
                  Sponsor a child's education and help them build a brighter future through learning.
                </p>
                <Button 
                  asChild
                  className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  data-testid="button-donate-education"
                >
                  <Link href="/donate">Donate Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Classroom */}
            <Card className="text-center hover:shadow-xl transition-shadow duration-200 border-2 hover:border-primary">
              <CardContent className="p-8">
                <div className="w-32 h-32 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 text-left" data-testid="classroom-title">
                  CLASSROOM
                </h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed text-left">
                  Support the education of 20 students in a classroom by sponsoring the 
                  whole classroom and its maintenance. Make a difference in the lives of 
                  many by gifting with <strong>50K PKR</strong> only.
                </p>
                <Button 
                  asChild
                  className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  data-testid="button-donate-classroom"
                >
                  <Link href="/donate">Donate Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Salaries & Building Rent */}
            <Card className="text-center hover:shadow-xl transition-shadow duration-200 border-2 hover:border-primary">
              <CardContent className="p-8">
                <div className="w-32 h-32 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <Building className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 text-left" data-testid="salaries-building-title">
                  SALARIES & BUILDING RENT
                </h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed text-left">
                  Support our staff and keep our office running with a donation as low as 
                  <strong> 25,000 PKR</strong>. Make a huge difference in the important lives of 
                  many and give the gift of knowledge by serving others.
                </p>
                <Button 
                  asChild
                  className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  data-testid="button-donate-salaries"
                >
                  <Link href="/donate">Donate Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Ration */}
            <Card className="text-center hover:shadow-xl transition-shadow duration-200 border-2 hover:border-primary">
              <CardContent className="p-8">
                <div className="w-32 h-32 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <Utensils className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 text-left" data-testid="ration-title">
                  Monthly Ration
                </h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed text-left">
                  Provide monthly food rations to families in need, including rice, flour, oil, and other essential groceries.
                </p>
                <Button 
                  asChild
                  className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  data-testid="button-donate-ration"
                >
                  <Link href="/donate">Donate Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Books & Uniform */}
            <Card className="text-center hover:shadow-xl transition-shadow duration-200 border-2 hover:border-primary">
              <CardContent className="p-8">
                <div className="w-32 h-32 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 text-left" data-testid="books-uniform-title">
                  BOOKS & UNIFORM
                </h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed text-left">
                  Your donation makes a real difference to those in need. Whether it's 
                  providing them with access to knowledge or the means to attend 
                  school, your contributions will help transform lives.
                </p>
                <Button 
                  asChild
                  className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  data-testid="button-donate-books"
                >
                  <Link href="/donate">Donate Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Project Section */}
      {featuredProject && (
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                  FEATURED PROJECT
                </div>
                <h2 className="text-4xl font-bold text-foreground" data-testid="featured-project-title">
                  {featuredProject.title}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed" data-testid="featured-project-description">
                  {featuredProject.description}
                </p>
                
                <div className="grid grid-cols-3 gap-4 py-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary" data-testid="featured-project-families">
                      {featuredProject.familiesHelped?.toLocaleString()}+
                    </div>
                    <div className="text-sm text-muted-foreground">Families Helped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary" data-testid="featured-project-funds">
                      {featuredProject.fundsRaised ? format(Number(featuredProject.fundsRaised)) : format(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Funds Raised</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary" data-testid="featured-project-days">30</div>
                    <div className="text-sm text-muted-foreground">Days Response</div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button className="btn-primary px-6 py-3 rounded-lg font-semibold" data-testid="button-view-report">
                    <Link href="/reports">View Full Report</Link>
                  </Button>
                  <Button variant="outline" className="px-6 py-3 rounded-lg border border-border text-foreground hover:bg-accent" data-testid="button-all-projects">
                    <Link href="/projects">All Projects</Link>
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <img 
                  src={featuredProject.imageUrl || featuredImage1}
                  alt="Medical team providing healthcare to community members" 
                  className="rounded-xl shadow-lg w-full h-auto"
                  loading="lazy" 
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <img 
                    src={featuredImage2}
                    alt="Children with message about change and hope" 
                    className="rounded-lg w-full h-auto"
                    loading="lazy"
                  />
                  <img 
                    src={featuredImage3}
                    alt="Charity distribution showing community support" 
                    className="rounded-lg w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Collaborators Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-left">Our Partners</h2>
            <p className="text-lg text-muted-foreground text-left">Working together to create lasting impact</p>
          </div>

          <div className="space-y-8">
            {/* ROW 1 - 5 LOGOS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
              {collaborators.slice(0, 5).map((partner) => (
                <div 
                  key={partner.name}
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center justify-center h-24"
                  data-testid={`partner-${partner.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {partner.name === "Daraz" ? (
                    <a 
                      href="https://s.daraz.pk/s.buU7H" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className="max-h-16 max-w-full object-contain"
                      />
                    </a>
                  ) : partner.name === "HBL Pay" ? (
                    <a 
                      href="https://www.hblpay.com/HBLPay/Payment/Subcategories?category=Donations#" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className="max-h-16 max-w-full object-contain"
                      />
                    </a>
                  ) : (
                    <img
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      className="max-h-16 max-w-full object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* ROW 2 - 5 LOGOS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
              {collaborators.slice(5, 10).map((partner) => (
                <div 
                  key={partner.name}
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center justify-center h-24"
                  data-testid={`partner-${partner.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {partner.name === "Daraz" ? (
                    <a 
                      href="https://s.daraz.pk/s.buU7H" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className="max-h-16 max-w-full object-contain"
                      />
                    </a>
                  ) : partner.name === "HBL Pay" ? (
                    <a 
                      href="https://www.hblpay.com/HBLPay/Payment/Subcategories?category=Donations#" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className="max-h-16 max-w-full object-contain"
                      />
                    </a>
                  ) : (
                    <img
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      className="max-h-16 max-w-full object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-left">Become a Donor Today</h2>
          <p className="text-xl mb-8 opacity-90 text-left">
            Your contribution can transform lives. Join thousands of donors who are making a real difference in communities across Pakistan.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              asChild
              className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 shadow-lg"
              data-testid="button-cta-donate"
            >
              <Link href="/donate">
                <Heart className="w-5 h-5 mr-2" />
                Start Donating
              </Link>
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary bg-transparent"
              style={{ color: 'white' }}
              data-testid="button-learn-more"
            >
              Learn More About Us
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-white/80">Transparent</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">15+</div>
              <div className="text-white/80">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-white/80">Lives Impacted</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}