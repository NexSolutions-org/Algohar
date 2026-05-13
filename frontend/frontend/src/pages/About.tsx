import { Users, Target, Eye, Award, Heart, Handshake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { partners } from "@/data/partners";
import SEO from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/utils/structuredData";
import leadershipTeamImage from "@assets/image_1757705024656.png";
import sheikhImtiazImage from "@assets/DONATe_now_3_470x_1757707802138.webp";
import rashidIqbalImage from "@assets/DONATe_now_4_470x_1757707836654.webp";
import sheikhGoharImtiazImage from "@assets/DONATe_now_470x_1757707950044.webp";
import drHusnainMukhdoomImage from "@assets/28dba4ae-4be6-4987-b833-e8808b7cf9cc-modified_870x_1757708176230.webp";
import muhammadHasnanTahirAwanImage from "@assets/new_hasnan_1880x_1757708218885.webp";
import mrSherazBootaImage from "@assets/Untitled_design_172fe24c-9084-4e33-8954-b68f492bab0c_1880x_1757708244833.webp";
import presidentImage from "@assets/president_1758055016115.webp";

const teamMembers = [
  {
    id: 'sheikh-imtiaz',
    name: 'Sheikh Imtiaz',
    role: 'President',
    bio: 'Leading our organization with over 20 years of experience in community development and social welfare initiatives.',
    image: 'top-left'
  },
  {
    id: 'rashid-iqbal', 
    name: 'Rashid Iqbal',
    role: 'Senior Vice President',
    bio: 'Overseeing strategic planning and program implementation with expertise in organizational management and community outreach.',
    image: 'top-center'
  },
  {
    id: 'sheikh-gohar-imtiaz',
    name: 'Sheikh Gohar Imtiaz', 
    role: 'Vice President',
    bio: 'Driving operational excellence and program coordination with a focus on educational initiatives and community partnerships.',
    image: 'top-right'
  },
  {
    id: 'dr-husnain-mukhdoom',
    name: 'Dr. Husnain Mukhdoom',
    role: 'General Secretary', 
    bio: 'Managing administrative operations and stakeholder relations with extensive background in healthcare and community service.',
    image: 'bottom-left'
  },
  {
    id: 'muhammad-hasnan-tahir-awan',
    name: 'Muhammad Hasnan Tahir Awan',
    role: 'Director of Marketing & Communications',
    bio: 'Leading outreach efforts and community engagement strategies to amplify our impact and expand our reach.',
    image: 'bottom-center'
  },
  {
    id: 'mr-sheraz-boota',
    name: 'Mr. Sheraz Boota',
    role: 'Director Finance & Accounts',
    bio: 'Ensuring financial transparency and sustainable resource management to support our ongoing community programs.',
    image: 'bottom-right'
  }
];

const milestones = [
  {
    year: "1996",
    title: "Organization Founded",
    description: "Started with a small team in Lahore to address local education needs."
  },
  {
    year: "2010",
    title: "First Health Center",
    description: "Opened our first community health center providing free medical care."
  },
  {
    year: "2013",
    title: "Ration Program Launch",
    description: "Initiated monthly ration distribution program for vulnerable families."
  },
  {
    year: "2016",
    title: "Child Welfare Initiative",
    description: "Established comprehensive child protection and welfare services."
  },
  {
    year: "2019",
    title: "Emergency Response",
    description: "Became a certified emergency response organization for natural disasters."
  },
  {
    year: "2024",
    title: "Digital Transformation",
    description: "Launched digital platform for transparent donations and impact tracking."
  }
];

export default function About() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        pageKey="about"
        structuredData={[breadcrumbSchema]}
      />
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="page-title">
            About Us
          </h1>
          <p className="text-xl opacity-90 leading-relaxed max-w-3xl mx-auto" data-testid="page-description">
            Learn about our journey, mission, and the dedicated team working tirelessly to create 
            positive change in communities across Pakistan since 1996.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-16">
        {/* Mission, Vision, Values */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl" data-testid="mission-title">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed" data-testid="mission-text">
                  To empower underprivileged communities through comprehensive education, healthcare, 
                  child welfare, and food security programs that create lasting positive change and 
                  break the cycle of poverty.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl" data-testid="vision-title">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed" data-testid="vision-text">
                  A Pakistan where every individual has access to quality education, healthcare, 
                  and basic necessities, enabling them to reach their full potential and contribute 
                  positively to society.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl" data-testid="story-title">Our Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed" data-testid="story-text">
                  Al-Gohar Educational & Welfare Society was founded in 1996 with a powerful vision: 
                  to create opportunities for those who need them most. We serve thousands across Pakistan 
                  through education, healthcare, child welfare, and food security programs.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>


        {/* Message from the President */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6" data-testid="president-message-title">
                MESSAGE FROM THE PRESIDENT
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p data-testid="president-paragraph-1">
                  At AEWS, we firmly believe in the power of education to transform communities. Since our establishment in 1996, we have worked tirelessly to provide quality education and improve living standards among marginalized populations.
                </p>
                <p data-testid="president-paragraph-2">
                  Our efforts extend beyond education, encompassing healthcare, women's rights, child labor abolition, support for low-income households, and the promotion of tolerance in society. We understand that education is the cornerstone of progress and the key to a brighter future. By empowering young minds through quality education, we aim to foster a progressive and tolerant Pakistan.
                </p>
                <p data-testid="president-paragraph-3">
                  We continuously expand our scope and initiatives to ensure holistic development and address the evolving needs of the communities we serve. AEWS thrives on the collaboration and support of our network of partners and affiliates. As a non-profit organization, we rely on the generosity of our donors and members, who contribute funds and membership fees. Rest assured, every rupee donated is allocated strategically to achieve our collective goal of welfare for the neglected individuals in our society.
                </p>
                <p data-testid="president-paragraph-4">
                  Join us in making a lasting impact! Together, we can create a more equitable and prosperous Pakistan, where every individual has access to quality education and the opportunity to fulfill their potential.
                </p>
              </div>
            </div>
            <div>
              <img
                src={presidentImage}
                alt="President of Algohar Educational & Welfare Society"
                className="rounded-2xl shadow-lg w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div 
                key={milestone.year}
                className={`flex gap-8 items-center ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}
                data-testid={`milestone-${milestone.year}`}
              >
                <div className="flex-1">
                  <Card className={index % 2 === 1 ? 'text-right' : ''}>
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-4" data-testid={`year-${milestone.year}`}>
                        {milestone.year}
                      </Badge>
                      <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`title-${milestone.year}`}>
                        {milestone.title}
                      </h3>
                      <p className="text-muted-foreground" data-testid={`description-${milestone.year}`}>
                        {milestone.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-4 h-4 bg-primary rounded-full flex-shrink-0"></div>
                <div className="flex-1"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Our Leadership Team */}
        <section className="mb-20" data-testid="section-leadership">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Our Leadership Team</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Meet the dedicated leaders guiding Al-Gohar Educational & Welfare Society's mission to serve communities across Pakistan.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="grid-team">
            {teamMembers.map((member) => (
              <Card key={member.id} className="text-center hover:shadow-lg transition-shadow" data-testid={`card-team-${member.id}`}>
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={member.id === 'sheikh-imtiaz' ? sheikhImtiazImage :
                             member.id === 'rashid-iqbal' ? rashidIqbalImage :
                             member.id === 'sheikh-gohar-imtiaz' ? sheikhGoharImtiazImage :
                             member.id === 'dr-husnain-mukhdoom' ? drHusnainMukhdoomImage :
                             member.id === 'muhammad-hasnan-tahir-awan' ? muhammadHasnanTahirAwanImage :
                             member.id === 'mr-sheraz-boota' ? mrSherazBootaImage :
                             leadershipTeamImage}
                        alt={`${member.name} - ${member.role} of Al-Gohar Educational & Welfare Society`}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: member.id === 'sheikh-imtiaz' ? 'center center' :
                                         member.id === 'rashid-iqbal' ? 'center center' :
                                         member.id === 'sheikh-gohar-imtiaz' ? 'center center' :
                                         member.id === 'dr-husnain-mukhdoom' ? 'center center' :
                                         member.id === 'muhammad-hasnan-tahir-awan' ? 'center center' :
                                         member.id === 'mr-sheraz-boota' ? 'center center' :
                                         'center center'
                        }}
                        data-testid={`img-team-${member.id}`}
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2" data-testid={`text-name-${member.id}`}>{member.name}</h3>
                  <Badge variant="outline" className="mb-3 text-primary border-primary" data-testid={`text-role-${member.id}`}>
                    {member.role}
                  </Badge>
                  <p className="text-sm text-gray-600 leading-relaxed" data-testid={`text-bio-${member.id}`}>
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Collaborators */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Our Partners</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            We work with trusted partners across various sectors to amplify our impact and ensure 
            sustainable delivery of our programs.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`partner-${index + 1}`}>
                <CardHeader>
                  <CardTitle className="text-lg" data-testid={`partner-name-${index + 1}`}>
                    {partner.name}
                  </CardTitle>
                  <Badge variant="outline" data-testid={`partner-type-${index + 1}`}>
                    {partner.type}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground" data-testid={`partner-description-${index + 1}`}>
                    {partner.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
