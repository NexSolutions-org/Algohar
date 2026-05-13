import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DonationModalContext } from "@/App";
import { Star, Users, GraduationCap, BookOpen, Heart } from "lucide-react";
import SEO from "@/components/SEO";
import { generateBreadcrumbSchema, generateServiceSchema } from "@/utils/structuredData";

// Import provided images
import classroomImage from "@assets/Web_Banner_1_1758056723517.webp";
import studentsWithCertificates from "@assets/Mobile_banner_14_1758056739803.webp";

export default function FreeEducation() {
  const { openModal } = useContext(DonationModalContext);

  const handleDonateClick = () => {
    // Track analytics
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "donation_cta_click",
        location: "free-education-page"
      })
    });
    openModal();
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Free Education", url: "/free-education" },
  ]);

  const educationServiceSchema = generateServiceSchema({
    name: "Free Education Program",
    description: "Providing quality education to underprivileged children across Pakistan with modern facilities and dedicated teachers.",
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO
        pageKey="free-education"
        structuredData={[breadcrumbSchema, educationServiceSchema]}
      />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 to-red-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-page-title">
              Free Education Program
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100" data-testid="text-hero-subtitle">
              Empowering Dreams Through Quality Education
            </p>
            <p className="text-lg mb-8 text-red-100 max-w-2xl mx-auto" data-testid="text-hero-description">
              Breaking the cycle of poverty and offering a pathway to a brighter future for deserving children across Pakistan.
            </p>
            <Button 
              onClick={handleDonateClick}
              size="lg" 
              className="bg-white text-red-600 hover:bg-red-50 font-semibold px-8 py-3 text-lg"
              data-testid="button-hero-donate"
            >
              Support a Child's Education
            </Button>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="text-process-title">
              OUR PROCESS
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" data-testid="text-process-subtitle">
              A Simple Path to Empowerment. Your support is the key to unlocking a child's potential. The process is seamless and impactful.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-red-600 rounded-full w-80 h-80 mx-auto flex items-center justify-center relative overflow-hidden">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🧒</div>
                  <div className="bg-yellow-400 text-black px-6 py-3 rounded transform -rotate-3 font-bold text-lg">
                    WE ARE THE<br/>
                    <span className="text-red-600 text-2xl">FUTURE</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-red-600 mb-6" data-testid="text-empower-title">
                EMPOWER<br/>FUTURES
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6" data-testid="text-empower-description">
                Choose to donate 3000 rupees monthly for a child's education expense.
              </p>
              <Button 
                onClick={handleDonateClick}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                data-testid="button-empower-donate"
              >
                Start Monthly Donation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What It Includes Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="text-includes-title">
              WHAT IT INCLUDES
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto" data-testid="text-includes-subtitle">
              Donation of 3000 rupees per month covers essential educational expenses for a deserving child, ensuring they receive quality education.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Empower Dreams */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow" data-testid="card-empower-dreams">
              <CardContent className="pt-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-600 mb-3" data-testid="text-empower-dreams-title">
                  Empower Dreams
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm" data-testid="text-empower-dreams-description">
                  Access to a reputable school with dedicated teachers.
                </p>
              </CardContent>
            </Card>

            {/* Instill Dignity */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow" data-testid="card-instill-dignity">
              <CardContent className="pt-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-lg flex items-center justify-center">
                  <Users className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-600 mb-3" data-testid="text-instill-dignity-title">
                  Instill Dignity
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm" data-testid="text-instill-dignity-description">
                  Proper school uniforms, fostering a sense of pride and belonging.
                </p>
              </CardContent>
            </Card>

            {/* Nurture Knowledge */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow" data-testid="card-nurture-knowledge">
              <CardContent className="pt-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-600 mb-3" data-testid="text-nurture-knowledge-title">
                  Nurture Knowledge
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm" data-testid="text-nurture-knowledge-description">
                  Learning materials, including books, notebooks, and stationery.
                </p>
              </CardContent>
            </Card>

            {/* Cultivate Growth */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow" data-testid="card-cultivate-growth">
              <CardContent className="pt-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-600 mb-3" data-testid="text-cultivate-growth-title">
                  Cultivate Growth
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm" data-testid="text-cultivate-growth-description">
                  Extracurricular activities and educational workshops for holistic development.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Statistics Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={studentsWithCertificates} 
                alt="Students with certificates and teachers" 
                className="rounded-lg shadow-lg w-full"
                data-testid="img-students-certificates"
              />
            </div>
            
            <div>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8" data-testid="text-impact-intro">
                Your support has the power to create a ripple effect of positive change. By investing in a child's education, we have achieved:
              </p>
              
              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border-l-4 border-red-600">
                  <div className="text-right">
                    <h3 className="text-2xl font-bold text-red-600 mb-2" data-testid="text-total-students">
                      TOTAL STUDENTS: 31,291
                    </h3>
                    <h4 className="text-xl font-semibold text-red-600 mb-2" data-testid="text-enrolled-students">
                      ENROLLED STUDENTS: 8,291
                    </h4>
                    <h4 className="text-xl font-semibold text-red-600" data-testid="text-total-classes">
                      NO. OF CLASSES: 31,291
                    </h4>
                  </div>
                </div>
                
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <div className="flex items-start gap-3" data-testid="text-impact-point-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Breaking the cycle of poverty and offering a pathway to a brighter future.</p>
                  </div>
                  <div className="flex items-start gap-3" data-testid="text-impact-point-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Empowering children with knowledge and skills to become confident, self-reliant individuals.</p>
                  </div>
                  <div className="flex items-start gap-3" data-testid="text-impact-point-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Nurturing a generation of educated leaders, driving progress and prosperity for our nation.</p>
                  </div>
                  <div className="flex items-start gap-3" data-testid="text-impact-point-4">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Building a legacy of empowerment, as educated children uplift their families and communities.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-testimonials-title">
              TESTIMONIALS
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-red-700 border-red-500 text-white" data-testid="card-testimonial-hassan">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-xl font-bold text-white mb-2" data-testid="text-testimonial-name">
                      HASSAN ALI
                    </h3>
                    <p className="text-red-200 mb-4" data-testid="text-testimonial-tagline">
                      Changing Lives, One Child at a Time
                    </p>
                    <div className="flex items-center gap-2 text-red-200 text-sm mb-4" data-testid="text-testimonial-date">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold text-xs">📅</span>
                      </div>
                      Wednesday, Jan 26, 2019
                    </div>
                    <div className="flex gap-1 mb-4" data-testid="rating-testimonial">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="text-white leading-relaxed" data-testid="text-testimonial-content">
                      "I am incredibly grateful for the opportunity provided by this NGO. As a recipient of the monthly 
                      education expense program, I have gained access to quality education, and it has transformed my life. 
                      I now dream of becoming a doctor and giving back to society. Thank you for believing in me and 
                      supporting my journey." - HASSAN ALI, Education Program Beneficiary.
                    </p>
                    <br />
                    <p className="text-red-100 italic" data-testid="text-testimonial-impact">
                      Your donation is more than just a financial contribution; it is an investment in a child's dreams and 
                      aspirations. Join us in this noble mission and witness the profound impact of your generosity on the 
                      lives of deserving children. Together, let's pave the way for a future filled with promise, hope, and 
                      endless possibilities. Donate now and be a catalyst for change!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Classroom Image Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="text-classroom-title">
              Your Support in Action
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" data-testid="text-classroom-description">
              See how your donations are creating real change in the lives of students across Pakistan.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <img 
              src={classroomImage} 
              alt="Students in classroom learning environment" 
              className="rounded-lg shadow-lg w-full"
              data-testid="img-classroom"
            />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-cta-title">
            Transform a Life Today
          </h2>
          <p className="text-xl mb-8 text-red-100 max-w-2xl mx-auto" data-testid="text-cta-description">
            For just Rs. 3,000 per month, you can sponsor a child's complete education and watch them thrive.
          </p>
          <Button 
            onClick={handleDonateClick}
            size="lg" 
            className="bg-white text-red-600 hover:bg-red-50 font-semibold px-12 py-4 text-xl"
            data-testid="button-cta-donate"
          >
            Sponsor a Child Now
          </Button>
        </div>
      </section>
    </div>
  );
}