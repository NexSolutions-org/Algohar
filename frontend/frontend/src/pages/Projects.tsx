import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { Calendar, MapPin, Users, DollarSign, Clock, Eye, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DonationModalContext } from "@/App";
import SEO from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/utils/structuredData";

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

// Projects banner image
import projectsBanner from "@assets/Untitled-6-01_1757434265646.webp";
import ongoingProjectImage from "@assets/on-going_project_1757698923054.webp";
import dengueCampImage from "@assets/Dengue_4a004af4-4a19-45a1-86a2-08c7e90e8f0d_1757700698372.jpg";
import ramadanBoxesImage from "@assets/Ramadan_Boxes_1757700998629.webp";
import hepatitisCampImage from "@assets/9-10_Free_Medical_Camp_2011_2_1757701214517.jpg";
import hepatitisScreeningImage from "@assets/Hepatits_Screening_camp_1757701375502.webp";
import covidReliefImage from "@assets/Covid_1757702005600.webp";
import floodReliefImage from "@assets/Flood_Naushera_Relief_Camp_70686c30-10ff-42e7-a5ef-e64bb2128278_1757702386534.webp";
import winterDriveImage from "@assets/Winter_Drive_1757703244559.webp";
import medicalCamp2011Image from "@assets/9-10_Free_Medical_Camp_2011_a307b049-f169-4e08-a9ca-e565baa1ddaa_1757703331125.webp";
import webDevelopmentImage from "@assets/Web_Development_1757703792040.webp";
import diabeticsCampImage from "@assets/Diabetics_Camp_1757703878099.webp";
import leadershipTeamImage from "@assets/image_1757705024656.png";

function ProjectCard({ project }: { project: Project }) {
  const statusColors = {
    ongoing: "bg-blue-500",
    completed: "bg-green-500",
    planned: "bg-yellow-500",
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`project-card-${project.id}`}>
      <div className="aspect-video relative">
        <img
          src={project.imageUrl || "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3"}
          alt={project.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <Badge 
          className={`absolute top-4 right-4 ${statusColors[project.status as keyof typeof statusColors]} text-white`}
          data-testid={`status-${project.id}`}
        >
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </Badge>
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-2" data-testid={`title-${project.id}`}>
          {project.title}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span data-testid={`date-${project.id}`}>
              {new Date(project.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short' 
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span data-testid={`location-${project.id}`}>{project.location}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-3" data-testid={`description-${project.id}`}>
          {project.description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-lg font-bold text-primary" data-testid={`funds-${project.id}`}>
              Rs. {project.fundsRaised ? (Number(project.fundsRaised) / 1000000).toFixed(1) : '0'}M
            </div>
            <div className="text-xs text-muted-foreground">Funds Raised</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-lg font-bold text-primary" data-testid={`families-${project.id}`}>
              {project.familiesHelped?.toLocaleString() || '0'}+
            </div>
            <div className="text-xs text-muted-foreground">Families Helped</div>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          data-testid={`button-view-details-${project.id}`}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

function ProjectSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function Projects() {
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  const { openModal } = useContext(DonationModalContext);

  const ongoingProjects = projects.filter(p => p.status === 'ongoing');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Projects", url: "/projects" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        pageKey="projects"
        structuredData={[breadcrumbSchema]}
      />
      {/* Projects Banner */}
      <section className="w-full">
        <img
          src={projectsBanner}
          alt="Projects Banner"
          className="w-full h-auto object-cover"
          data-testid="projects-banner"
        />
      </section>

      {/* On Going Projects Highlight */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-left">
                ON GOING PROJECTS
              </h2>
              <div className="space-y-4 text-left">
                <p className="text-lg leading-relaxed">
                  Al-Gohar Welfare Society has the honor that it has got wonderful achievements in the file of education which are enumerated as under:- <strong>Gohar Education School System (Registered + affiliated to BISE)</strong>.
                </p>
                <p className="text-lg leading-relaxed">
                  This institute was founded in 2001. It is situated in the poor and slum area of Lahore, Green Town. It was aimed to ornament those children with the modern education who were not only far away from education but use to spend their time in labor from their very childhood.
                </p>
                <p className="text-lg leading-relaxed">
                  The sources of income of their parents were too short that they were not in position to get their children admitted in schools. That's why, the future of their kids was not only at stake but their children had become the victim of various social evils growing up into young age.
                </p>
                <p className="text-lg leading-relaxed">
                  Keeping in view their economic condition, Gohar education school system was established in 2001. Education has been imparted to hundreds of students who are now getting educations in the best colleges of the city.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={openModal}
                  className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 shadow-lg"
                  data-testid="button-ongoing-donate"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  DONATE NOW
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={ongoingProjectImage}
                alt="Teacher with school children from Gohar Education School System"
                className="rounded-2xl shadow-2xl w-full max-w-md h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Diabetics Awareness Camp */}
      <section className="bg-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <div className="bg-gray-100 p-8 rounded-2xl shadow-lg max-w-md">
                <div className="text-primary text-sm font-semibold mb-4">14 November 2022</div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-10 h-10 border-4 border-white rounded-full relative">
                      <div className="absolute inset-1 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-primary text-xl font-bold mb-2">
                      DIABETICS<br />AWARENESS<br />CAMP
                    </h3>
                    <p className="text-primary text-sm font-semibold">
                      Protect Family<br />From Diabetes
                    </p>
                  </div>
                </div>
                <div className="bg-primary text-center py-2 text-white text-xs font-semibold">
                  Al-Gohar Educational & Welfare Society
                </div>
              </div>
            </div>
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary">
                DIABETICS AWARENESS CAMP
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Continuing our commitment to raising diabetes awareness, this ongoing camp aims to empower individuals with knowledge and promote a healthier lifestyle with <em>Quaid-e-Azam Industrial Estate</em>.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={openModal}
                  className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 shadow-lg"
                  data-testid="button-diabetes-donate"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  DONATE NOW
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dengue Camp */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                DENGUE CAMP
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-white leading-relaxed">
                  Organized a comprehensive awareness and prevention campaign to combat the spread of dengue and protect communities from this mosquito-borne disease.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={openModal}
                  className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 shadow-lg"
                  data-testid="button-dengue-donate"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  DONATE NOW
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={dengueCampImage}
                  alt="Dengue awareness campaign with community members holding banners"
                  className="rounded-2xl shadow-2xl w-full max-w-md h-auto object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center py-2 text-xs font-semibold rounded-b-2xl">
                  Al-Gohar Educational & Welfare Society
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ramadan Boxes */}
      <section className="bg-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <img
                src={ramadanBoxesImage}
                alt="Families receiving Ramadan food supply boxes from Al-Gohar Educational & Welfare Society"
                className="rounded-2xl shadow-2xl w-full max-w-md h-auto object-cover"
              />
            </div>
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary">
                RAMADAN BOXES
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Distributed essential food supplies during Ramadan to support families in need and ensure they can observe the holy month with dignity and comfort.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={openModal}
                  className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 shadow-lg"
                  data-testid="button-ramadan-donate"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  DONATE NOW
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hepatitis Camp */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                HEPATITIS CAMP
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-white leading-relaxed">
                  Conducting screenings, offering medical assistance, and spreading awareness about hepatitis to promote early detection and treatment.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={openModal}
                  className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 shadow-lg"
                  data-testid="button-hepatitis-donate"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  DONATE NOW
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={hepatitisCampImage}
                  alt="Hepatitis screening and medical camp setup with chairs and medical banners"
                  className="rounded-2xl shadow-2xl w-full max-w-md h-auto object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center py-2 text-xs font-semibold rounded-b-2xl">
                  Al-Gohar Educational & Welfare Society
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hepatitis Screening Camp */}
      <section className="bg-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={hepatitisScreeningImage}
                  alt="Hepatitis screening camp with medical staff conducting free health screenings"
                  className="rounded-2xl shadow-2xl w-full max-w-md h-auto object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center py-2 text-xs font-semibold rounded-b-2xl">
                  Al-Gohar Educational & Welfare Society
                </div>
              </div>
            </div>
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary">
                HEPATITIS SCREENING CAMP
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Offered accessible and free screenings for hepatitis, contributing to early diagnosis and better healthcare outcomes for affected individuals.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={openModal}
                  className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 shadow-lg"
                  data-testid="button-hepatitis-screening-donate"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  DONATE NOW
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COVID-19 Relief */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                COVID-19 RELIEF
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-white leading-relaxed">
                  Provided aid and support to those affected by the Covid-19 pandemic, offering essential supplies, medical assistance, and emotional support during these challenging times.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={openModal}
                  className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 shadow-lg"
                  data-testid="button-covid-donate"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  DONATE NOW
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={covidReliefImage}
                  alt="COVID-19 relief awareness poster with virus illustration and safety information"
                  className="rounded-2xl shadow-2xl w-full max-w-md h-auto object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center py-2 text-xs font-semibold rounded-b-2xl">
                  Al-Gohar Educational & Welfare Society
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Naushera Flood Relief Camp */}
      <section className="bg-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={floodReliefImage}
                  alt="Naushera flood relief camp 2010 showing volunteers distributing aid to flood victims"
                  className="rounded-2xl shadow-2xl w-full max-w-md h-auto object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center py-2 text-xs font-semibold rounded-b-2xl">
                  Al-Gohar Educational & Welfare Society
                </div>
              </div>
            </div>
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary">
                NAUSHERA FLOOD RELIEF CAMP - 2010
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Responding to the devastation caused by flooding, our relief camp provided essential relief items and support to affected communities.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={openModal}
                  className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 shadow-lg"
                  data-testid="button-flood-relief-donate"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  DONATE NOW
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Winter Drive */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                WINTER DRIVE
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-white leading-relaxed">
                  Collected and distributed warm clothing, blankets, and essentials during the winter season to protect vulnerable individuals from the harsh weather.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={openModal}
                  className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 shadow-lg"
                  data-testid="button-winter-drive-donate"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  DONATE NOW
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={winterDriveImage}
                  alt="Winter drive clothing donation showing colorful warm clothes and blankets collected for distribution"
                  className="rounded-2xl shadow-2xl w-full max-w-md h-auto object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center py-2 text-xs font-semibold rounded-b-2xl">
                  Al-Gohar Educational & Welfare Society
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9-10 Free Medical Camp 2011 */}
      <section className="bg-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={medicalCamp2011Image}
                  alt="9-10 Free Medical Camp 2011 showing doctor providing medical check-up to patient"
                  className="rounded-2xl shadow-2xl w-full max-w-md h-auto object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center py-2 text-xs font-semibold rounded-b-2xl">
                  Al-Gohar Educational & Welfare Society
                </div>
              </div>
            </div>
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary">
                9-10 FREE MEDICAL CAMP 2011
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Provided free medical services, including check-ups and treatments, to underserved communities, ensuring access to quality healthcare for all.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={openModal}
                  className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 shadow-lg"
                  data-testid="button-medical-camp-2011-donate"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  DONATE NOW
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Web Development & Graphic Design */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                WEB DEVELOPMENT & GRAPHIC DESIGN
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-white leading-relaxed">
                  Empowered the youth with essential digital skills through specialized courses in web development, web designing, and graphic designing, enabling them to pursue promising career opportunities in the tech industry.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={openModal}
                  className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 shadow-lg"
                  data-testid="button-web-development-donate"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  DONATE NOW
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={webDevelopmentImage}
                  alt="Web development and graphic design computer courses showing person working on digital design projects"
                  className="rounded-2xl shadow-2xl w-full max-w-md h-auto object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center py-2 text-xs font-semibold rounded-b-2xl">
                  Al-Gohar Educational & Welfare Society
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diabetics Camp */}
      <section className="bg-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={diabeticsCampImage}
                  alt="Diabetics camp showing medical consultation and educational session for diabetes awareness"
                  className="rounded-2xl shadow-2xl w-full max-w-md h-auto object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center py-2 text-xs font-semibold rounded-b-2xl">
                  Al-Gohar Educational & Welfare Society
                </div>
              </div>
            </div>
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary">
                DIABETICS CAMP
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Provided free medical check-ups, consultations, and educational sessions to raise awareness and support individuals living with diabetes.
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={openModal}
                  className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 shadow-lg"
                  data-testid="button-diabetics-camp-donate"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  DONATE NOW
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="page-title">
            Our Projects
          </h1>
          <p className="text-xl opacity-90 leading-relaxed max-w-3xl mx-auto" data-testid="page-description">
            Discover the impactful initiatives we've undertaken to transform communities. From emergency relief 
            operations to long-term development programs, each project represents our commitment to creating 
            sustainable change.
          </p>
        </div>
      </section>

    </div>
  );
}
