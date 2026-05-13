import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Calendar,
  Heart,
  Filter,
  Download,
  Search,
  ArrowUpDown,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";
import UserLayout from "@/components/user/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getQueryFn } from "@/lib/queryClient";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

type DonationStatus = "completed" | "pending" | "failed";
type DonationType = "one-time";

interface Donation {
  id: string;
  transactionId?: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  type: DonationType;
  paymentMethod: string;
  status: DonationStatus;
  cause?: string;
  donationType?: string;
  createdAt: string;
  updatedAt?: string;
}

const getStatusBadge = (status: DonationStatus) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

const getCauseName = (cause?: string) => {
  const causeMap: Record<string, string> = {
    education: "Education Support",
    medical: "Medical Camp",
    ration: "Food Ration",
    general: "General Fund",
  };
  return cause ? causeMap[cause] || cause : "General Fund";
};

export default function MyDonations() {
  const { format } = useCurrencyConversion();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  // Fetch donations
  const { data: donationsResponse, isLoading, error } = useQuery<any>({
    queryKey: ["/api/donations"],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: false,
  });

  // Extract donations array from response (handle both direct array, paginated, and wrapped response)
  const rawDonations: any[] = Array.isArray(donationsResponse)
    ? donationsResponse
    : Array.isArray(donationsResponse?.data)
    ? donationsResponse.data
    : Array.isArray(donationsResponse?.data?.data)
    ? donationsResponse.data.data
    : [];

  // Normalize donations to handle both snake_case and camelCase from API
  const donations: Donation[] = rawDonations.map((donation: any) => ({
    id: donation.id,
    transactionId: donation.transaction_id || donation.transactionId,
    donorName: donation.donor_name || donation.donorName || "",
    donorEmail: donation.donor_email || donation.donorEmail || "",
    donorPhone: donation.donor_phone || donation.donorPhone,
    amount: donation.amount || 0,
    type: "one-time",
    paymentMethod: donation.payment_method || donation.paymentMethod || "payfast",
    status: donation.status || "pending",
    cause: donation.cause,
    donationType: donation.donation_type || donation.donationType,
    createdAt: donation.created_at || donation.createdAt || new Date().toISOString(),
    updatedAt: donation.updated_at || donation.updatedAt,
  }));

  // Filter and sort donations
  const filteredDonations = donations
    .filter((donation: Donation) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          (donation.transactionId && donation.transactionId.toLowerCase().includes(query)) ||
          donation.id.toLowerCase().includes(query) ||
          donation.donorName.toLowerCase().includes(query) ||
          donation.donorEmail.toLowerCase().includes(query) ||
          getCauseName(donation.cause).toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && donation.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && donation.type !== typeFilter) {
        return false;
      }

      return true;
    })
    .sort((a: Donation, b: Donation) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  // Calculate statistics
  const totalDonated = donations
    .filter((d: Donation) => d.status === "completed")
    .reduce((sum: number, d: Donation) => sum + d.amount, 0);

  const thisMonthDonations = donations.filter((d: Donation) => {
    const donationDate = new Date(d.createdAt);
    const now = new Date();
    return (
      donationDate.getMonth() === now.getMonth() &&
      donationDate.getFullYear() === now.getFullYear() &&
      d.status === "completed"
    );
  });

  const thisMonthTotal = thisMonthDonations.reduce((sum: number, d: Donation) => sum + d.amount, 0);

  const completedCount = donations.filter((d: Donation) => d.status === "completed").length;
  const pendingCount = donations.filter((d: Donation) => d.status === "pending").length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForPDF = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportDonationStatementPDF = () => {
    try {
      if (donations.length === 0) {
        toast({
          title: "No donations found",
          description: "You have no donation records to export.",
          variant: "destructive",
        });
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Professional bank statement colors - subtle grays
      const darkGray = [50, 50, 50];
      const lightGray = [248, 248, 248];
      const borderGray = [200, 200, 200];

      // Header - Clean and professional
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Al Gohar Educational and Welfare Society", margin, yPosition);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Donation Statement", margin, yPosition + 6);
      
      // Statement date (under the title)
      const statementDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.setFontSize(9);
      doc.text(`Statement Date: ${statementDate}`, margin, yPosition + 12);
      
      yPosition += 20;
      
      // Thin line separator
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Account Holder Information - Clean two-column layout
      const firstDonation = donations[0];
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Account Holder Information", margin, yPosition);
      yPosition += 7;
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      
      // Left column
      doc.text(`Name:`, margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${firstDonation.donorName}`, margin + 20, yPosition);
      yPosition += 5;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Email:`, margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${firstDonation.donorEmail}`, margin + 20, yPosition);
      yPosition += 5;
      
      if (firstDonation.donorPhone) {
        doc.setFont("helvetica", "bold");
        doc.text(`Phone:`, margin, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(`${firstDonation.donorPhone}`, margin + 20, yPosition);
        yPosition += 5;
      }
      
      // Right column
      const rightStart = pageWidth / 2;
      let rightY = yPosition - 10;
      
      // Get date range from donations
      const dates = donations.map(d => new Date(d.createdAt)).sort((a, b) => a.getTime() - b.getTime());
      const fromDate = dates.length > 0 ? dates[0].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : statementDate;
      const toDate = dates.length > 0 ? dates[dates.length - 1].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : statementDate;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Statement Period:`, rightStart, rightY);
      doc.setFont("helvetica", "normal");
      doc.text(`${fromDate} to ${toDate}`, rightStart + 45, rightY);
      rightY += 5;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Total Donations:`, rightStart, rightY);
      doc.setFont("helvetica", "normal");
      doc.text(`${donations.length}`, rightStart + 45, rightY);
      
      yPosition += 10;

      // Account Summary - Clean box
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 25, "F");
      
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 25);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Account Summary", margin + 3, yPosition + 6);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Total Donations:`, margin + 3, yPosition + 13);
      doc.setFont("helvetica", "normal");
      doc.text(`${donations.length}`, margin + 55, yPosition + 13);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Completed:`, margin + 3, yPosition + 19);
      doc.setFont("helvetica", "normal");
      doc.text(`${completedCount}`, margin + 55, yPosition + 19);
      
      // Right side amounts
      doc.setFont("helvetica", "bold");
      doc.text(`Total Amount:`, rightStart, yPosition + 13);
      doc.setFont("helvetica", "normal");
      doc.text(`Rs. ${totalDonated.toLocaleString()}`, rightStart + 40, yPosition + 13);
      
      doc.setFont("helvetica", "bold");
      doc.text(`This Month:`, rightStart, yPosition + 19);
      doc.setFont("helvetica", "normal");
      doc.text(`Rs. ${thisMonthTotal.toLocaleString()}`, rightStart + 40, yPosition + 19);
      
      yPosition += 30;

      // Transaction Details Table - Professional bank statement style
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Transaction Details", margin, yPosition);
      yPosition += 8;

      const tableTop = yPosition;
      // Adjusted column positions for better alignment
      const colPositions = [
        margin + 2,
        margin + 32,
        margin + 98,
        margin + 133,
        margin + 163,
      ];
      const colWidths = [30, 66, 35, 30, 25];
      const headers = ["Date", "Description", "Reference", "Amount", "Status"];

      // Table Header - Subtle gray background
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, "F");
      
      // Table borders
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 7);
      
      // Header text - properly aligned
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      headers.forEach((header, index) => {
        doc.text(header, colPositions[index], yPosition + 5);
      });
      
      yPosition += 7;

      // Transaction Rows
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      donations.forEach((donation: Donation, index: number) => {
        // Check page break
        if (yPosition + 7 > pageHeight - 30) {
          doc.addPage();
          yPosition = margin;
        }

        const transDate = new Date(donation.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        
        const description = getCauseName(donation.cause);
        const reference = donation.transactionId || donation.id;
        const refText = reference.length > 12 ? reference.substring(0, 12) + "..." : reference;
        const amount = `Rs. ${donation.amount.toLocaleString()}`;
        const status = donation.status.charAt(0).toUpperCase() + donation.status.slice(1);

        // Row border
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.2);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        
        // Row data - properly aligned
        doc.text(transDate, colPositions[0], yPosition + 5);
        
        // Description (wrap if needed, using column width)
        const descLines = doc.splitTextToSize(description, colWidths[1] - 4);
        doc.text(descLines[0], colPositions[1], yPosition + 5);
        
        doc.text(refText, colPositions[2], yPosition + 5);
        doc.text(amount, colPositions[3], yPosition + 5);
        doc.text(status, colPositions[4], yPosition + 5);
        
        // Bottom border
        doc.line(margin, yPosition + 7, pageWidth - margin, yPosition + 7);
        
        yPosition += 7;
      });

      // Footer - Professional bank statement style
      yPosition = pageHeight - 30;
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("This is an official donation statement from Al Gohar Educational and Welfare Society.", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 4;
      doc.text("For inquiries: info@algohar.org | Phone: 0321-2546427", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 4;
      doc.text(`Generated on: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, pageWidth / 2, yPosition, { align: "center" });

      // Save the PDF
      const fileName = `My_Donation_Statement_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Statement exported",
        description: "Your donation statement has been exported successfully.",
      });
    } catch (error: any) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: error?.message || "Failed to export donation statement.",
        variant: "destructive",
      });
    }
  };

  return (
    <UserLayout>
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Donations</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all your donation history
          </p>
        </div>
        <Button asChild>
          <Link href="/user/donate-now">
            <Heart className="w-4 h-4 mr-2" />
            Make New Donation
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{format(totalDonated)}</div>
              <p className="text-xs text-muted-foreground">All completed donations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{format(thisMonthTotal)}</div>
              <p className="text-xs text-muted-foreground">
                {thisMonthDonations.length} donation(s) this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
              <p className="text-xs text-muted-foreground">
                {pendingCount > 0 && `${pendingCount} pending`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Donation History</CardTitle>
                <CardDescription>
                  {filteredDonations.length} donation(s) found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportDonationStatementPDF}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download Statement
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by ID, name, email, or cause..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                  <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Donations List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">Loading donations...</div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-destructive">Error loading donations. Please try again.</div>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No donations found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Start making a difference with your first donation"}
                </p>
                {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
                  <Button asChild>
                    <Link href="/user/donate-now">
                      <Heart className="w-4 h-4 mr-2" />
                      Make Your First Donation
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDonations.map((donation: Donation) => (
                  <Card key={donation.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Heart className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {getCauseName(donation.cause)}
                              </h3>
                              {getStatusBadge(donation.status)}
                              {donation.donationType && (
                                <Badge variant={donation.donationType === "zakat" ? "default" : "outline"}>
                                  {donation.donationType.charAt(0).toUpperCase() + donation.donationType.slice(1)}
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-4 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDateTime(donation.createdAt)}
                                </span>
                                <span>ID: {donation.transactionId || donation.id}</span>
                              </div>
                              <div className="flex items-center gap-4 flex-wrap">
                                <span>
                                  Payment: PayFast
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-2xl font-bold text-primary">
                            {format(donation.amount)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </UserLayout>
  );
}

