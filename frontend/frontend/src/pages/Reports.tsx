import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Calendar, Eye, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import SEO from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/utils/structuredData";

type Report = {
  id: string;
  title: string;
  description: string;
  publishDate: string | Date;
  type: "annual" | "monthly" | "project";
  fileUrl: string;
};

// Official documents image
import officialDocsImage from "@assets/image_1757434545517.png";
// Annual report cover image
import annualReportCover from "@assets/donate_for_a_child_s_education_8_470x_1757437286874.webp";
// Registration certificate image
import registrationCertificate from "@assets/4_dfe3e002-5f78-47e0-8f52-3fb0a9660dbd_470x_1757437410736.webp";
// PCC 2023 certificate image
import pccCertificate from "@assets/3_7fc62d03-e6a6-4eba-87cf-ece26d2803c4_470x_1757437473707.webp";
// Income Tax approval document
import incomeTaxApproval from "@assets/WhatsApp Image 2025-09-10 at 11.54.09_0377e7d6_1757964420562.jpg";
// FBR registration document
import fbrRegistration from "@assets/Screenshot 2025-09-15 122606_1757964436653.png";

function ReportCard({ report }: { report: Report }) {
  const typeColors = {
    annual: "bg-blue-500",
    monthly: "bg-green-500", 
    project: "bg-purple-500",
  };

  const handleDownload = () => {
    // Track analytics event
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        event: "report_download", 
        data: { 
          reportId: report.id,
          type: report.type,
          title: report.title
        } 
      }),
    }).catch(console.error);

    // In a real app, this would trigger the actual download
    window.open(report.fileUrl, '_blank');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`report-card-${report.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 mb-2" data-testid={`title-${report.id}`}>
              {report.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span data-testid={`date-${report.id}`}>
                  {new Date(report.publishDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
          <Badge 
            className={`${typeColors[report.type as keyof typeof typeColors]} text-white`}
            data-testid={`type-${report.id}`}
          >
            {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-3" data-testid={`description-${report.id}`}>
          {report.description}
        </p>

        <div className="flex gap-2">
          <Button 
            onClick={handleDownload}
            className="btn-primary flex-1"
            data-testid={`button-download-${report.id}`}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button 
            variant="outline"
            onClick={handleDownload}
            data-testid={`button-view-${report.id}`}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const filteredReports = typeFilter === "all" 
    ? reports 
    : reports.filter(report => report.type === typeFilter);

  const reportStats = {
    total: reports.length,
    annual: reports.filter(r => r.type === 'annual').length,
    monthly: reports.filter(r => r.type === 'monthly').length,
    project: reports.filter(r => r.type === 'project').length,
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Reports", url: "/reports" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        pageKey="reports"
        structuredData={[breadcrumbSchema]}
      />
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="page-title">
            Reports & Transparency
          </h1>
          <p className="text-xl opacity-90 leading-relaxed max-w-3xl mx-auto" data-testid="page-description">
            Access our comprehensive reports that demonstrate our commitment to transparency and accountability. 
            Download detailed annual reports, monthly updates, and project-specific documentation to track our impact.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-16">
        {/* Official Documents Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Official Documents & Certificates</h2>
            <p className="text-xl text-muted-foreground">Our official registration and annual reports</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {/* Annual Progress Report */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={annualReportCover}
                  alt="Annual Progress Report 2019-20-21 Cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h4 className="font-bold text-foreground mb-3">Annual Report 20-21</h4>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Al-Gohar Educational and Welfare Society is a not for profit, social welfare organization, based at Lahore. This report includes comprehensive information on the foundation's performance, achievements, and goals for the current year along with future investment and aims and how to get involved.
                </p>
                <Button 
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  data-testid="download-annual-report"
                >
                  DOWNLOAD
                </Button>
              </CardContent>
            </Card>

            {/* Registration Certificate */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={registrationCertificate}
                  alt="Registration Certificate from Government of Punjab"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h4 className="font-bold text-foreground mb-3">Registration - Certificate</h4>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  A sample of our official intermittent. Designed by authorities, Al-Gohar Educational and Welfare Society continues its mission to empower lives through education, healthcare and social welfare initiatives.
                </p>
                <Button 
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  data-testid="download-registration"
                >
                  DOWNLOAD
                </Button>
              </CardContent>
            </Card>

            {/* PCC 2023 Certificate */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={pccCertificate}
                  alt="PCC 2023 Registration Certificate from Punjab Charity Commission"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h4 className="font-bold text-foreground mb-3">PCC 2023 - Certificate</h4>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Certificate Punjab Charity Commission 2023 Accreditation of Excellence. We proudly present Certificate from Punjab Charity Commission, granted in 2023, recognizing Al-Gohar Educational and Welfare Society as a distinguished organization committed to charitable endeavors.
                </p>
                <Button 
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  data-testid="download-pcc-certificate"
                >
                  DOWNLOAD
                </Button>
              </CardContent>
            </Card>

            {/* Income Tax Approval */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={incomeTaxApproval}
                  alt="Income Tax Approval from Government of Pakistan"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h4 className="font-bold text-foreground mb-3">Income Tax Approval</h4>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Official approval from the Government of Pakistan, Commissioner of Income Tax, under section 2(36) of the Income Tax Ordinance. This document validates our tax-exempt status as a registered welfare organization.
                </p>
                <Button 
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  data-testid="download-income-tax-approval"
                >
                  DOWNLOAD
                </Button>
              </CardContent>
            </Card>

            {/* FBR Registration */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={fbrRegistration}
                  alt="Federal Board of Revenue Registration Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h4 className="font-bold text-foreground mb-3">FBR Registration</h4>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Federal Board of Revenue taxpayer profile inquiry showing our official registration details, tax office assignment, and active status as a legally recognized charitable organization.
                </p>
                <Button 
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  data-testid="download-fbr-registration"
                >
                  DOWNLOAD
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="mb-12">
          <div className="grid md:grid-cols-4 gap-6">
            <Card data-testid="stat-total-reports">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{reportStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Reports</div>
              </CardContent>
            </Card>
            <Card data-testid="stat-annual-reports">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">{reportStats.annual}</div>
                <div className="text-sm text-muted-foreground">Annual Reports</div>
              </CardContent>
            </Card>
            <Card data-testid="stat-monthly-reports">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">{reportStats.monthly}</div>
                <div className="text-sm text-muted-foreground">Monthly Updates</div>
              </CardContent>
            </Card>
            <Card data-testid="stat-project-reports">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-500 mb-2">{reportStats.project}</div>
                <div className="text-sm text-muted-foreground">Project Reports</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Filter and Reports */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Available Reports</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48" data-testid="filter-select">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="annual">Annual Reports</SelectItem>
                  <SelectItem value="monthly">Monthly Updates</SelectItem>
                  <SelectItem value="project">Project Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="reports-grid">
            {isLoading ? (
              Array.from({ length: 6 }, (_, i) => <ReportSkeleton key={i} />)
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))
            ) : (
              <div className="col-span-full text-center py-16" data-testid="empty-reports-state">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  {typeFilter === "all" ? "No Reports Available" : `No ${typeFilter} Reports`}
                </h3>
                <p className="text-muted-foreground">
                  {typeFilter === "all" 
                    ? "Reports will appear here as they are published."
                    : `No ${typeFilter} reports are currently available. Try a different filter.`
                  }
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Information Box */}
        <section className="mt-16">
          <Card className="bg-muted">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">About Our Reports</h3>
              <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Annual Reports</h4>
                  <p className="text-sm">
                    Comprehensive yearly overviews of our activities, financial statements, 
                    impact assessments, and strategic objectives for transparency and accountability.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Monthly Updates</h4>
                  <p className="text-sm">
                    Regular updates on ongoing projects, recent activities, financial highlights, 
                    and beneficiary stories to keep our supporters informed.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Project Reports</h4>
                  <p className="text-sm">
                    Detailed documentation of specific projects including objectives, outcomes, 
                    beneficiary data, and lessons learned for continuous improvement.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Transparency Commitment</h4>
                  <p className="text-sm">
                    We believe in complete transparency. All reports undergo independent auditing 
                    and are made publicly available to ensure trust and accountability.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
