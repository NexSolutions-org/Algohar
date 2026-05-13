import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DonationModalContext } from "@/App";
import SEO from "@/components/SEO";
import { generateBreadcrumbSchema, generateServiceSchema } from "@/utils/structuredData";

// Service icons
import generalDonationIcon from "@assets/Mobile_banner_6_470x_1758055763310.webp";
import childEducationIcon from "@assets/Mobile_banner_4_470x_1758055763309.webp";
import classroomIcon from "@assets/Mobile_banner_7_470x_1758055763308.webp";
import schoolBuildingIcon from "@assets/Mobile_banner_8_470x_1758055763308.webp";
import rationIcon from "@assets/Mobile_banner_9_470x_1758055763306.webp";
import booksUniformIcon from "@assets/Mobile_banner_5_470x_1758055763303.webp";

const services = [
  {
    id: "general-donation",
    title: "GENERAL DONATION",
    description: "It allows you to express your compassion and commitment to our cause in the most meaningful way. Whether it's a small gesture of support or a larger contribution, like PKR 500 or more.",
    icon: generalDonationIcon,
    buttonText: "DONATE NOW"
  },
  {
    id: "child-education",
    title: "CHILD'S EDUCATION", 
    description: "Support a child and help create a brighter future for a disadvantaged student, and enable them to reach their full potential. Be part of a better, more equitable world with just 3000 PKR a month.",
    icon: childEducationIcon,
    buttonText: "DONATE NOW"
  },
  {
    id: "classroom",
    title: "CLASSROOM",
    description: "Support the education of 20 students in a classroom by sponsoring the whole classroom and its maintenance. Make a difference in the lives of many by gifting with 50K PKR only.",
    icon: classroomIcon,
    buttonText: "DONATE NOW"
  },
  {
    id: "salaries-building",
    title: "SALARIES & BUILDING RENT",
    description: "Support our staff and keep our office running with a donation as low as 25,000 PKR. Make a meaningful difference in our employees' lives and contribute to the running of our office.",
    icon: schoolBuildingIcon,
    buttonText: "DONATE NOW"
  },
  {
    id: "ration",
    title: "RATION",
    description: "Donate Ration Monthly is a program that provides rations to needy families, ensuring they don't miss essential meals. Make a difference by donating a ration bag costing only 6,000 PKR.",
    icon: rationIcon,
    buttonText: "DONATE NOW"
  },
  {
    id: "books-uniform",
    title: "BOOKS & UNIFORM",
    description: "Your donation makes a real difference to those in need. Whether it's providing them with access to knowledge or the means to attend school, your contributions will help improve people's lives.",
    icon: booksUniformIcon,
    buttonText: "DONATE NOW"
  }
];

export default function Services() {
  const { openModal } = useContext(DonationModalContext);

  const handleDonateClick = (serviceId: string) => {
    openModal();
    
    // Track analytics event
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        event: "donation_cta_click", 
        data: { location: `services-${serviceId}` } 
      }),
    }).catch(console.error);
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
  ]);

  // Generate service schemas for each service
  const serviceSchemas = services.map(service =>
    generateServiceSchema({
      name: service.title,
      description: service.description,
    })
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        pageKey="services"
        structuredData={[breadcrumbSchema, ...serviceSchemas]}
      />
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="page-title">
            Our Services
          </h1>
          <p className="text-xl opacity-90 leading-relaxed max-w-3xl mx-auto" data-testid="page-description">
            Choose how you want to make a difference. Every donation creates lasting change in communities 
            across Pakistan through our comprehensive programs.
          </p>
        </div>
      </section>

      {/* Services Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card 
                key={service.id} 
                className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg"
                data-testid={`service-card-${service.id}`}
              >
                <CardContent className="p-8">
                  {/* Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden">
                      <img
                        src={service.icon}
                        alt={`${service.title} icon`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground mb-4" data-testid={`title-${service.id}`}>
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6" data-testid={`description-${service.id}`}>
                    {service.description}
                  </p>

                  {/* Donate Button */}
                  <Button
                    onClick={() => handleDonateClick(service.id)}
                    className="w-full bg-primary text-white hover:bg-primary/90 font-bold py-3 rounded-lg transition-colors"
                    data-testid={`button-donate-${service.id}`}
                  >
                    {service.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Summary */}
      <section className="bg-muted py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Making a Real Difference</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your donations directly impact thousands of lives across Pakistan. Here's how we're creating change together.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center" data-testid="total-beneficiaries">
              <div className="text-3xl font-bold text-primary mb-2">25,000+</div>
              <div className="text-sm text-muted-foreground">Lives Touched</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center" data-testid="active-programs">
              <div className="text-3xl font-bold text-primary mb-2">6</div>
              <div className="text-sm text-muted-foreground">Service Programs</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center" data-testid="service-locations">
              <div className="text-3xl font-bold text-primary mb-2">15+</div>
              <div className="text-sm text-muted-foreground">Cities Served</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center" data-testid="years-experience">
              <div className="text-3xl font-bold text-primary mb-2">29</div>
              <div className="text-sm text-muted-foreground">Years of Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Every contribution, no matter the size, creates meaningful change. 
            Join thousands of donors who are building a better Pakistan.
          </p>
          <Button
            onClick={() => handleDonateClick("general")}
            className="bg-white text-primary hover:bg-gray-100 font-bold px-8 py-4 text-lg rounded-lg"
            data-testid="button-general-donate"
          >
            Start Donating Today
          </Button>
        </div>
      </section>
    </div>
  );
}
