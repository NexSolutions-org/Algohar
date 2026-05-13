import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HeartHandshake,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  Mail,
  Phone,
  CreditCard,
  Building,
  Smartphone,
  Eye,
  FileText,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import jsPDF from "jspdf";

// Donation type definitions
type DonationStatus = "completed" | "pending" | "failed" | "paused" | "cancelled";
type DonationType = "one-time";
type PaymentMethod = "card" | "bank" | "wallet";

// API Donation type (from backend)
interface ApiDonation {
  id: number;
  user_id?: number;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  amount: number;
  type: DonationType;
  payment_method: string;
  status: DonationStatus;
  cause?: string;
  project?: string;
  donation_type?: string;
  transaction_id?: string;
  created_at: string;
  updated_at?: string;
}

// Frontend Donation type
interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  type: DonationType;
  paymentMethod: PaymentMethod;
  status: DonationStatus;
  cause?: string;
  project?: string;
  donationType?: string;
  createdAt: string;
  updatedAt?: string;
  transactionId?: string;
}

// API Response type (Laravel pagination)
interface ApiResponse {
  data: ApiDonation[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export default function Donations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { format } = useCurrencyConversion();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [causeFilter, setCauseFilter] = useState<string>("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  // Build API URL with query parameters
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (typeFilter !== "all") params.append("type", typeFilter);
    if (causeFilter !== "all") params.append("cause", causeFilter);
    const queryString = params.toString();
    return `/api/admin/donations${queryString ? `?${queryString}` : ""}`;
  }, [searchQuery, statusFilter, typeFilter, causeFilter]);

  // Fetch donations from API
  const { data: apiResponse, isLoading, error } = useQuery<ApiResponse>({
    queryKey: [apiUrl],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Transform API donations to frontend Donation format
  const donations: Donation[] = apiResponse?.data?.map((apiDonation) => ({
    id: apiDonation.id.toString(),
    donorName: apiDonation.donor_name,
    donorEmail: apiDonation.donor_email,
    donorPhone: apiDonation.donor_phone,
    amount: apiDonation.amount,
    type: "one-time",
    paymentMethod: apiDonation.payment_method as PaymentMethod,
    status: apiDonation.status,
    cause: apiDonation.cause,
    project: apiDonation.project,
    donationType: apiDonation.donation_type,
    createdAt: apiDonation.created_at,
    updatedAt: apiDonation.updated_at,
    transactionId: apiDonation.transaction_id,
  })) || [];

  // Calculate statistics
  const totalDonations = apiResponse?.meta?.total || 0;
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const thisMonthAmount = donations
    .filter((d) => {
      const donationDate = new Date(d.createdAt);
      const now = new Date();
      return (
        donationDate.getMonth() === now.getMonth() &&
        donationDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, d) => sum + d.amount, 0);
  const pendingDonations = donations.filter((d) => d.status === "pending").length;
  const completedDonations = donations.filter((d) => d.status === "completed").length;

  // Filter donations (search, status, type, and cause are handled by backend)
  const filteredDonations = donations;

  // Handle donation actions
  const updateStatusMutation = useMutation({
    mutationFn: async ({ donationId, status }: { donationId: string; status: DonationStatus }) => {
      const response = await apiRequest("PUT", `/api/admin/donations/${donationId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiUrl] });
      toast({
        title: "Status updated",
        description: "Donation status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update donation status.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (donationId: string, newStatus: DonationStatus) => {
    updateStatusMutation.mutate({ donationId, status: newStatus });
  };

  const deleteDonationMutation = useMutation({
    mutationFn: async (donationId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/donations/${donationId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiUrl] });
      toast({
        title: "Donation deleted",
        description: "Donation has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete donation.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteDonation = (donationId: string) => {
    if (confirm("Are you sure you want to delete this donation record?")) {
      deleteDonationMutation.mutate(donationId);
    }
  };

  const handleViewDonation = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsViewDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
      case "paused":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Paused
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-3 w-3" />;
      case "bank":
        return <Building className="h-3 w-3" />;
      case "wallet":
        return <Smartphone className="h-3 w-3" />;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    return method.charAt(0).toUpperCase() + method.slice(1);
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
      if (filteredDonations.length === 0) {
        toast({
          title: "No donations found",
          description: "There are no donations to export.",
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
      doc.text("Donations Statement", margin, yPosition + 6);
      
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
      
      const completedCount = filteredDonations.filter((d) => d.status === "completed").length;
      const totalDonated = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
      const thisMonthTotal = filteredDonations
        .filter((d) => {
          const donationDate = new Date(d.createdAt);
          const now = new Date();
          return (
            donationDate.getMonth() === now.getMonth() &&
            donationDate.getFullYear() === now.getFullYear() &&
            d.status === "completed"
          );
        })
        .reduce((sum, d) => sum + d.amount, 0);
      
      const rightStart = pageWidth / 2;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Total Donations:`, margin + 3, yPosition + 13);
      doc.setFont("helvetica", "normal");
      doc.text(`${filteredDonations.length}`, margin + 55, yPosition + 13);
      
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

      filteredDonations.forEach((donation: Donation, index: number) => {
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
      doc.text("This is an official donations statement from Al Gohar Educational and Welfare Society.", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 4;
      doc.text("For inquiries: info@algohar.org | Phone: 0321-2546427", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 4;
      doc.text(`Generated on: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, pageWidth / 2, yPosition, { align: "center" });

      // Save the PDF
      const fileName = `Donations_Statement_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Statement exported",
        description: "Donations statement has been exported successfully.",
      });
    } catch (error: any) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: error?.message || "Failed to export donations statement.",
        variant: "destructive",
      });
    }
  };

  const exportIndividualStatementPDF = (donation: Donation) => {
    try {
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
      doc.text(`${donation.donorName}`, margin + 20, yPosition);
      yPosition += 5;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Email:`, margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${donation.donorEmail}`, margin + 20, yPosition);
      yPosition += 5;
      
      if (donation.donorPhone) {
        doc.setFont("helvetica", "bold");
        doc.text(`Phone:`, margin, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(`${donation.donorPhone}`, margin + 20, yPosition);
        yPosition += 5;
      }
      
      // Right column
      const rightStart = pageWidth / 2;
      let rightY = yPosition - 10;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Donation ID:`, rightStart, rightY);
      doc.setFont("helvetica", "normal");
      doc.text(`${donation.transactionId || donation.id}`, rightStart + 40, rightY);
      rightY += 5;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Date:`, rightStart, rightY);
      doc.setFont("helvetica", "normal");
      doc.text(`${new Date(donation.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`, rightStart + 20, rightY);
      
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
      doc.text(`Amount:`, margin + 3, yPosition + 13);
      doc.setFont("helvetica", "normal");
      doc.text(`Rs. ${donation.amount.toLocaleString()}`, margin + 35, yPosition + 13);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Status:`, margin + 3, yPosition + 19);
      doc.setFont("helvetica", "normal");
      doc.text(`${donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}`, margin + 35, yPosition + 19);
      
      // Right side
      doc.setFont("helvetica", "bold");
      doc.text(`Cause:`, rightStart, yPosition + 13);
      doc.setFont("helvetica", "normal");
      doc.text(`${getCauseName(donation.cause)}`, rightStart + 25, yPosition + 13);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Payment Method:`, rightStart, yPosition + 19);
      doc.setFont("helvetica", "normal");
      doc.text(`${getPaymentMethodLabel(donation.paymentMethod)}`, rightStart + 50, yPosition + 19);
      
      yPosition += 30;

      // Transaction Details Table - Professional bank statement style
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Transaction Details", margin, yPosition);
      yPosition += 8;

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

      // Single transaction row
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

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
      const fileName = `Donation_Statement_${donation.id}_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Statement exported",
        description: "Donation statement has been exported successfully.",
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
    <AdminLayout>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Donations Management</h2>
            <p className="text-muted-foreground mt-2">
              View and manage all donation transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportDonationStatementPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Export Statement
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">{totalDonations} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(thisMonthAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {donations.filter((d) => {
                const donationDate = new Date(d.createdAt);
                const now = new Date();
                return (
                  donationDate.getMonth() === now.getMonth() &&
                  donationDate.getFullYear() === now.getFullYear()
                );
              }).length}{" "}
              donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDonations}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Donations</CardTitle>
          <CardDescription>
            A comprehensive list of all donation transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, donor name, email, phone, or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={causeFilter} onValueChange={setCauseFilter}>
                <SelectTrigger className="w-[150px]">
                  <HeartHandshake className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Cause" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Causes</SelectItem>
                  <SelectItem value="Education Support">Education Support</SelectItem>
                  <SelectItem value="Medical Camp">Medical Camp</SelectItem>
                  <SelectItem value="Food Ration">Food Ration</SelectItem>
                  <SelectItem value="General Fund">General Fund</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Donations Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Donation Type</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cause</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Loading donations...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-destructive">
                      Error loading donations. Please try again.
                    </TableCell>
                  </TableRow>
                ) : filteredDonations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No donations found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(donation.donorName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{donation.donorName}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {donation.donorEmail}
                            </div>
                            {donation.donorPhone && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" />
                                {donation.donorPhone}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{format(donation.amount)}</div>
                        <div className="text-xs text-muted-foreground font-mono">{donation.transactionId || donation.id}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">One-time</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={donation.donationType === "zakat" ? "default" : "outline"}>
                          {donation.donationType ? donation.donationType.charAt(0).toUpperCase() + donation.donationType.slice(1) : "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          {getPaymentMethodIcon(donation.paymentMethod)}
                          {getPaymentMethodLabel(donation.paymentMethod)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(donation.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{donation.cause || "General Fund"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(donation.createdAt)}</div>
                        {donation.transactionId && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {donation.transactionId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDonation(donation)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportIndividualStatementPDF(donation)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Export Statement
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Donation
                            </DropdownMenuItem>
                            {donation.status === "pending" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(donation.id, "completed")}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as Completed
                              </DropdownMenuItem>
                            )}
                            {donation.status === "completed" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(donation.id, "pending")}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                Mark as Pending
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteDonation(donation.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Donation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  Showing {filteredDonations.length} of {totalDonations} donations
                  {apiResponse?.meta && (
                    <span className="ml-2">
                      (Page {apiResponse.meta.current_page} of {apiResponse.meta.last_page})
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="text-sm font-medium">
              Total Amount: {format(filteredDonations.reduce((sum, d) => sum + d.amount, 0))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Donation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
            <DialogDescription>
              Complete information about this donation transaction
            </DialogDescription>
          </DialogHeader>
          {selectedDonation && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Donation ID</label>
                  <p className="text-sm font-medium font-mono">{selectedDonation.transactionId || selectedDonation.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Donor Name</label>
                  <p className="text-sm font-medium">{selectedDonation.donorName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <p className="text-sm font-medium text-lg">
                    {format(selectedDonation.amount)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{selectedDonation.donorEmail}</p>
                </div>
                {selectedDonation.donorPhone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm">{selectedDonation.donorPhone}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm">One-time</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Donation Type</label>
                  <p className="text-sm">
                    <Badge variant={selectedDonation.donationType === "zakat" ? "default" : "outline"}>
                      {selectedDonation.donationType ? selectedDonation.donationType.charAt(0).toUpperCase() + selectedDonation.donationType.slice(1) : "N/A"}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                  <p className="text-sm flex items-center gap-2">
                    {getPaymentMethodIcon(selectedDonation.paymentMethod)}
                    {getPaymentMethodLabel(selectedDonation.paymentMethod)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedDonation.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cause</label>
                  <p className="text-sm">{selectedDonation.cause || "General Fund"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-sm">{formatDate(selectedDonation.createdAt)}</p>
                </div>
                {selectedDonation.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="text-sm">{formatDate(selectedDonation.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setIsViewDialogOpen(false)}>Edit Donation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

