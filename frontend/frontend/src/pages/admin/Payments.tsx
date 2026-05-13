import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
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
  CreditCard,
  Building,
  Smartphone,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  RefreshCw,
  ArrowLeftRight,
  Mail,
  Phone,
  User,
  Receipt,
  FileText,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Payment type definitions
type PaymentStatus = "completed" | "pending" | "failed" | "refunded" | "cancelled";
type PaymentMethodType = "card" | "bank" | "wallet";

// API Donation type (from backend)
interface ApiDonation {
  id: number;
  user_id?: number;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  amount: number;
  type: "one-time" | "recurring";
  frequency?: string;
  payment_method: string;
  status: PaymentStatus;
  cause?: string;
  project?: string;
  donation_type?: string;
  transaction_id?: string;
  created_at: string;
  updated_at?: string;
}

// Frontend Payment Transaction type
interface PaymentTransaction {
  id: string;
  transactionId: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  method: PaymentMethodType;
  methodDetails: string;
  status: PaymentStatus;
  donationId?: string;
  cause?: string;
  project?: string;
  donationType?: string;
  createdAt: string;
  completedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  description?: string;
  gatewayResponse?: string;
  fees?: number;
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

// Sample payment transaction data (removed - using real data)
const samplePayments: PaymentTransaction[] = [
  {
    id: "PAY-001",
    transactionId: "TXN-123456",
    donorName: "John Doe",
    donorEmail: "john.doe@example.com",
    donorPhone: "+92 300 1234567",
    amount: 5000,
    method: "card",
    methodDetails: "Credit Card •••• 4242",
    status: "completed",
    donationId: "DON-001",
    cause: "Education Support",
    createdAt: "2024-06-15T10:30:00Z",
    completedAt: "2024-06-15T10:31:00Z",
    fees: 150,
    description: "Donation for Education Support",
    gatewayResponse: "Success",
  },
  {
    id: "PAY-002",
    transactionId: "TXN-123457",
    donorName: "Jane Smith",
    donorEmail: "jane.smith@example.com",
    donorPhone: "+92 301 2345678",
    amount: 10000,
    method: "bank",
    methodDetails: "Bank Transfer - HBL",
    status: "completed",
    donationId: "DON-002",
    cause: "Medical Camp",
    createdAt: "2024-06-14T14:20:00Z",
    completedAt: "2024-06-14T14:25:00Z",
    fees: 200,
    description: "Recurring donation for Medical Camp",
    gatewayResponse: "Success",
  },
  {
    id: "PAY-003",
    transactionId: "TXN-123458",
    donorName: "Ahmed Khan",
    donorEmail: "ahmed.khan@example.com",
    donorPhone: "+92 302 3456789",
    amount: 2500,
    method: "wallet",
    methodDetails: "JazzCash •••• 5678",
    status: "completed",
    donationId: "DON-003",
    cause: "Food Ration",
    createdAt: "2024-06-13T09:15:00Z",
    completedAt: "2024-06-13T09:16:00Z",
    fees: 50,
    description: "Donation for Food Ration",
    gatewayResponse: "Success",
  },
  {
    id: "PAY-004",
    transactionId: "TXN-123459",
    donorName: "Sarah Ali",
    donorEmail: "sarah.ali@example.com",
    donorPhone: "+92 303 4567890",
    amount: 7500,
    method: "card",
    methodDetails: "Debit Card •••• 8888",
    status: "pending",
    donationId: "DON-004",
    cause: "Education Support",
    createdAt: "2024-06-12T16:45:00Z",
    description: "Recurring donation for Education Support",
    gatewayResponse: "Pending",
  },
  {
    id: "PAY-005",
    transactionId: "TXN-123460",
    donorName: "Mohammad Raza",
    donorEmail: "mohammad.raza@example.com",
    donorPhone: "+92 304 5678901",
    amount: 15000,
    method: "bank",
    methodDetails: "Bank Transfer - UBL",
    status: "completed",
    donationId: "DON-005",
    cause: "Medical Camp",
    createdAt: "2024-06-11T11:20:00Z",
    completedAt: "2024-06-11T11:22:00Z",
    fees: 300,
    description: "Donation for Medical Camp",
    gatewayResponse: "Success",
  },
  {
    id: "PAY-006",
    transactionId: "TXN-123461",
    donorName: "Fatima Sheikh",
    donorEmail: "fatima.sheikh@example.com",
    donorPhone: "+92 305 6789012",
    amount: 3000,
    method: "card",
    methodDetails: "Credit Card •••• 1234",
    status: "refunded",
    donationId: "DON-006",
    cause: "Food Ration",
    createdAt: "2024-06-10T13:30:00Z",
    completedAt: "2024-06-10T13:31:00Z",
    refundedAt: "2024-06-10T15:00:00Z",
    refundAmount: 3000,
    fees: 90,
    description: "Donation for Food Ration (Refunded)",
    gatewayResponse: "Refunded",
  },
  {
    id: "PAY-008",
    transactionId: "TXN-123463",
    donorName: "Ayesha Malik",
    donorEmail: "ayesha.malik@example.com",
    donorPhone: "+92 307 8901234",
    amount: 8000,
    method: "bank",
    methodDetails: "Bank Transfer - MCB",
    status: "completed",
    donationId: "DON-008",
    cause: "Education Support",
    createdAt: "2024-06-08T15:10:00Z",
    completedAt: "2024-06-08T15:12:00Z",
    fees: 160,
    description: "Recurring donation for Education Support",
    gatewayResponse: "Success",
  },
];

export default function Payments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);

  // Build API URL with query parameters
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (methodFilter !== "all") params.append("payment_method", methodFilter);
    const queryString = params.toString();
    return `/api/admin/donations${queryString ? `?${queryString}` : ""}`;
  }, [searchQuery, statusFilter, methodFilter]);

  // Fetch donations from API (payments are derived from donations)
  const { data: apiResponse, isLoading, error } = useQuery<ApiResponse>({
    queryKey: [apiUrl],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Transform API donations to payment transactions
  const payments: PaymentTransaction[] = apiResponse?.data?.map((apiDonation) => {
    const paymentMethod = apiDonation.payment_method as PaymentMethodType;
    let methodDetails = "";
    switch (paymentMethod) {
      case "card":
        methodDetails = "Credit/Debit Card";
        break;
      case "bank":
        methodDetails = "Bank Transfer";
        break;
      case "wallet":
        methodDetails = "Mobile Wallet";
        break;
      default:
        methodDetails = paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1);
    }

    return {
      id: `PAY-${apiDonation.id}`,
      transactionId: apiDonation.transaction_id || `TXN-${apiDonation.id}`,
      donorName: apiDonation.donor_name,
      donorEmail: apiDonation.donor_email,
      donorPhone: apiDonation.donor_phone,
      amount: apiDonation.amount,
      method: paymentMethod,
      methodDetails,
      status: apiDonation.status,
      donationId: `DON-${apiDonation.id}`,
      cause: apiDonation.cause,
      project: apiDonation.project,
      donationType: apiDonation.donation_type,
      createdAt: apiDonation.created_at,
      completedAt: apiDonation.status === "completed" ? apiDonation.updated_at : undefined,
      description: `Donation for ${apiDonation.cause || "General Fund"}`,
      gatewayResponse: apiDonation.status === "completed" ? "Success" : apiDonation.status === "failed" ? "Failed" : "Pending",
    };
  }) || [];

  // Calculate statistics
  const totalPayments = apiResponse?.meta?.total || 0;
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const completedAmount = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const thisMonthAmount = payments
    .filter((p) => {
      const paymentDate = new Date(p.createdAt);
      const now = new Date();
      return (
        paymentDate.getMonth() === now.getMonth() &&
        paymentDate.getFullYear() === now.getFullYear() &&
        p.status === "completed"
      );
    })
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const failedPayments = payments.filter((p) => p.status === "failed").length;
  const refundedAmount = payments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + (p.refundAmount || 0), 0);
  const totalFees = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.fees || 0), 0);

  // Filter payments (search, status, and method are handled by backend)
  const filteredPayments = payments;

  // Handle payment actions
  const updateStatusMutation = useMutation({
    mutationFn: async ({ donationId, status }: { donationId: string; status: PaymentStatus }) => {
      // Extract donation ID from payment ID (PAY-123 -> 123)
      const id = donationId.replace("PAY-", "");
      const response = await apiRequest("PUT", `/api/admin/donations/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiUrl] });
      toast({
        title: "Status updated",
        description: "Payment status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update payment status.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (paymentId: string, newStatus: PaymentStatus) => {
    updateStatusMutation.mutate({ donationId: paymentId, status: newStatus });
  };

  const handleRefund = (payment: PaymentTransaction) => {
    setSelectedPayment(payment);
    setIsRefundDialogOpen(true);
  };

  const confirmRefund = () => {
    if (selectedPayment) {
      // For now, just update status to refunded
      // In a real implementation, you'd call a refund API endpoint
      handleStatusChange(selectedPayment.id, "refunded");
      setIsRefundDialogOpen(false);
      setSelectedPayment(null);
      toast({
        title: "Refund processed",
        description: "Payment refund has been processed successfully.",
      });
    }
  };

  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      // Extract donation ID from payment ID (PAY-123 -> 123)
      const id = paymentId.replace("PAY-", "");
      const response = await apiRequest("DELETE", `/api/admin/donations/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiUrl] });
      toast({
        title: "Payment deleted",
        description: "Payment has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete payment.",
        variant: "destructive",
      });
    },
  });

  const handleDeletePayment = (paymentId: string) => {
    if (confirm("Are you sure you want to delete this payment record?")) {
      deletePaymentMutation.mutate(paymentId);
    }
  };

  const handleViewPayment = (payment: PaymentTransaction) => {
    setSelectedPayment(payment);
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

  const formatDateForPDF = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportStatementPDF = (payment: PaymentTransaction) => {
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
      doc.text("Payment Statement", margin, yPosition + 6);
      
      // Statement date (right aligned)
      const statementDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.setFontSize(9);
      doc.text(`Statement Date: ${statementDate}`, pageWidth - margin, yPosition + 3, { align: "right" });
      
      yPosition += 15;
      
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
      doc.text(`${payment.donorName}`, margin + 20, yPosition);
      yPosition += 5;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Email:`, margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${payment.donorEmail}`, margin + 20, yPosition);
      yPosition += 5;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Phone:`, margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${payment.donorPhone || "N/A"}`, margin + 20, yPosition);
      
      // Right column
      const rightStart = pageWidth / 2;
      let rightY = yPosition - 10;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Payment ID:`, rightStart, rightY);
      doc.setFont("helvetica", "normal");
      doc.text(`${payment.id}`, rightStart + 35, rightY);
      rightY += 5;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Transaction ID:`, rightStart, rightY);
      doc.setFont("helvetica", "normal");
      doc.text(`${payment.transactionId}`, rightStart + 35, rightY);
      rightY += 5;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Donation ID:`, rightStart, rightY);
      doc.setFont("helvetica", "normal");
      doc.text(`${payment.donationId || "N/A"}`, rightStart + 35, rightY);
      
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
      
      const netAmount = payment.amount - (payment.fees || 0);
      const statusLabel = payment.status.charAt(0).toUpperCase() + payment.status.slice(1);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Transaction Date:`, margin + 3, yPosition + 13);
      doc.setFont("helvetica", "normal");
      doc.text(`${formatDateForPDF(payment.createdAt)}`, margin + 50, yPosition + 13);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Status:`, margin + 3, yPosition + 19);
      doc.setFont("helvetica", "normal");
      doc.text(`${statusLabel}`, margin + 50, yPosition + 19);
      
      // Right side amounts
      doc.setFont("helvetica", "bold");
      doc.text(`Amount:`, rightStart, yPosition + 13);
      doc.setFont("helvetica", "normal");
      doc.text(`Rs. ${payment.amount.toLocaleString()}`, rightStart + 30, yPosition + 13);
      
      if (payment.fees) {
        doc.setFont("helvetica", "bold");
        doc.text(`Fees:`, rightStart, yPosition + 19);
        doc.setFont("helvetica", "normal");
        doc.text(`Rs. ${payment.fees.toLocaleString()}`, rightStart + 30, yPosition + 19);
      }
      
      yPosition += 30;

      // Transaction Details Table - Professional bank statement style
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Transaction Details", margin, yPosition);
      yPosition += 8;

      const tableTop = yPosition;
      const colPositions = [
        margin + 2,
        margin + 35,
        margin + 100,
        margin + 135,
        margin + 165,
      ];
      const headers = ["Date", "Description", "Reference", "Amount", "Status"];

      // Table Header - Subtle gray background
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, "F");
      
      // Table borders
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 7);
      
      // Header text
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      headers.forEach((header, index) => {
        doc.text(header, colPositions[index], yPosition + 5);
      });
      
      yPosition += 7;

      // Transaction Row - Clean white background
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      
      const transDate = new Date(payment.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      
      const description = payment.cause || payment.project || payment.description || "Donation Payment";
      const reference = payment.transactionId.length > 15 ? payment.transactionId.substring(0, 15) + "..." : payment.transactionId;
      const amount = `Rs. ${payment.amount.toLocaleString()}`;
      const status = payment.status.charAt(0).toUpperCase() + payment.status.slice(1);

      // Row border
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.2);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      
      // Row data
      doc.text(transDate, colPositions[0], yPosition + 5);
      
      // Description (wrap if needed)
      const descLines = doc.splitTextToSize(description, 60);
      doc.text(descLines[0], colPositions[1], yPosition + 5);
      
      doc.text(reference, colPositions[2], yPosition + 5);
      doc.text(amount, colPositions[3], yPosition + 5);
      doc.text(status, colPositions[4], yPosition + 5);
      
      // Bottom border
      doc.line(margin, yPosition + 7, pageWidth - margin, yPosition + 7);
      
      yPosition += 7;

      // Additional Information Section
      yPosition += 10;
      
      if (payment.fees || payment.refundAmount) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text("Additional Information", margin, yPosition);
        yPosition += 6;
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        
        if (payment.fees) {
          doc.setFont("helvetica", "bold");
          doc.text(`Processing Fee:`, margin, yPosition);
          doc.setFont("helvetica", "normal");
          doc.text(`Rs. ${payment.fees.toLocaleString()}`, margin + 45, yPosition);
          yPosition += 5;
        }
        if (payment.refundAmount) {
          doc.setFont("helvetica", "bold");
          doc.text(`Refunded Amount:`, margin, yPosition);
          doc.setFont("helvetica", "normal");
          doc.text(`Rs. ${payment.refundAmount.toLocaleString()}`, margin + 45, yPosition);
          yPosition += 5;
        }
        
        doc.setFont("helvetica", "bold");
        doc.text(`Net Amount:`, margin, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(`Rs. ${netAmount.toLocaleString()}`, margin + 45, yPosition);
        yPosition += 8;
      }

      // Payment Method
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Payment Method:", margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(payment.methodDetails, margin + 45, yPosition);
      
      if (payment.completedAt) {
        yPosition += 6;
        doc.setFont("helvetica", "bold");
        doc.text("Completed On:", margin, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(formatDateForPDF(payment.completedAt), margin + 45, yPosition);
      }

      // Footer - Professional bank statement style
      yPosition = pageHeight - 30;
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("This is an official payment statement from Al Gohar Educational and Welfare Society.", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 4;
      doc.text("For inquiries: info@algohar.org | Phone: 0321-2546427", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 4;
      doc.text(`Generated on: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, pageWidth / 2, yPosition, { align: "center" });

      // Save the PDF
      const fileName = `Payment_Statement_${payment.id}_${payment.donorName.replace(/\s+/g, "_")}.pdf`;
      doc.save(fileName);

      toast({
        title: "Statement exported",
        description: "Payment statement has been exported successfully.",
      });
    } catch (error: any) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: error?.message || "Failed to export payment statement.",
        variant: "destructive",
      });
    }
  };

  const exportCompanyStatementPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;
      const lineHeight = 6;
      let currentPage = 1;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 40) {
          doc.addPage();
          currentPage++;
          yPosition = margin;
          return true;
        }
        return false;
      };

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
      doc.text("Company Payment Statement", margin, yPosition + 6);
      
      // Statement period and date (under the title)
      const statementDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      // Get date range from payments
      const dates = filteredPayments.map(p => new Date(p.createdAt)).sort((a, b) => a.getTime() - b.getTime());
      const fromDate = dates.length > 0 ? dates[0].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : statementDate;
      const toDate = dates.length > 0 ? dates[dates.length - 1].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : statementDate;
      
      doc.setFontSize(9);
      doc.text(`Statement Period: ${fromDate} to ${toDate}`, margin, yPosition + 12);
      doc.text(`Statement Date: ${statementDate}`, margin, yPosition + 18);
      
      yPosition += 25;
      
      // Thin line separator
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Account Summary - Clean box
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 35, "F");
      
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 35);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Account Summary", margin + 3, yPosition + 6);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      
      // Left column
      doc.setFont("helvetica", "bold");
      doc.text(`Total Transactions:`, margin + 3, yPosition + 13);
      doc.setFont("helvetica", "normal");
      doc.text(`${totalPayments}`, margin + 55, yPosition + 13);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Completed:`, margin + 3, yPosition + 19);
      doc.setFont("helvetica", "normal");
      doc.text(`${payments.filter((p) => p.status === "completed").length}`, margin + 55, yPosition + 19);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Pending:`, margin + 3, yPosition + 25);
      doc.setFont("helvetica", "normal");
      doc.text(`${pendingPayments}`, margin + 55, yPosition + 25);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Failed:`, margin + 3, yPosition + 31);
      doc.setFont("helvetica", "normal");
      doc.text(`${failedPayments}`, margin + 55, yPosition + 31);
      
      // Right column
      const rightStart = pageWidth / 2;
      doc.setFont("helvetica", "bold");
      doc.text(`Total Revenue:`, rightStart, yPosition + 13);
      doc.setFont("helvetica", "normal");
      doc.text(`Rs. ${completedAmount.toLocaleString()}`, rightStart + 45, yPosition + 13);
      
      doc.setFont("helvetica", "bold");
      doc.text(`This Month:`, rightStart, yPosition + 19);
      doc.setFont("helvetica", "normal");
      doc.text(`Rs. ${thisMonthAmount.toLocaleString()}`, rightStart + 45, yPosition + 19);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Refunded:`, rightStart, yPosition + 25);
      doc.setFont("helvetica", "normal");
      doc.text(`Rs. ${refundedAmount.toLocaleString()}`, rightStart + 45, yPosition + 25);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Processing Fees:`, rightStart, yPosition + 31);
      doc.setFont("helvetica", "normal");
      doc.text(`Rs. ${totalFees.toLocaleString()}`, rightStart + 45, yPosition + 31);
      
      yPosition += 40;

      // Transaction Details Table - Professional bank statement style
      checkPageBreak(25);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Transaction Details", margin, yPosition);
      yPosition += 8;

      const tableTop = yPosition;
      const colPositions = [
        margin + 2,
        margin + 28,
        margin + 68,
        margin + 108,
        margin + 138,
        margin + 168,
      ];
      const headers = ["Date", "Donor", "Description", "Reference", "Amount", "Status"];

      // Table Header - Subtle gray background
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, "F");
      
      // Table borders
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 7);
      
      // Header text
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      headers.forEach((header, index) => {
        doc.text(header, colPositions[index], yPosition + 5);
      });
      
      yPosition += 7;

      // Payment Transactions
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");

      filteredPayments.forEach((payment, index) => {
        checkPageBreak(10);

        // Date
        const transDate = new Date(payment.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        
        // Donor Name (truncated)
        const donorName = payment.donorName.length > 12 ? payment.donorName.substring(0, 12) + "..." : payment.donorName;
        
        // Description
        const description = payment.cause || payment.project || "Donation Payment";
        const descText = description.length > 15 ? description.substring(0, 15) + "..." : description;
        
        // Reference
        const reference = payment.transactionId.length > 10 ? payment.transactionId.substring(0, 10) + "..." : payment.transactionId;
        
        // Amount
        const amount = payment.status === "completed" ? `Rs. ${payment.amount.toLocaleString()}` : "-";
        
        // Status
        const status = payment.status.charAt(0).toUpperCase() + payment.status.slice(1);

        // Row border
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.2);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        
        // Row data
        doc.text(transDate, colPositions[0], yPosition + 5);
        doc.text(donorName, colPositions[1], yPosition + 5);
        doc.text(descText, colPositions[2], yPosition + 5);
        doc.text(reference, colPositions[3], yPosition + 5);
        doc.text(amount, colPositions[4], yPosition + 5);
        doc.text(status, colPositions[5], yPosition + 5);
        
        // Bottom border
        doc.line(margin, yPosition + 7, pageWidth - margin, yPosition + 7);
        
        yPosition += 7;
      });

      // Summary Section - Clean box
      yPosition += 10;
      checkPageBreak(30);

      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 25, "F");
      
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 25);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Summary by Status", margin + 3, yPosition + 6);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      
      // Group payments by status
      const paymentsByStatus = filteredPayments.reduce((acc, payment) => {
        acc[payment.status] = (acc[payment.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let statusY = yPosition + 13;
      Object.entries(paymentsByStatus).forEach(([status, count]) => {
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
        doc.setFont("helvetica", "bold");
        doc.text(`${statusLabel}:`, margin + 5, statusY);
        doc.setFont("helvetica", "normal");
        doc.text(`${count} transactions`, margin + 35, statusY);
        statusY += 5;
      });
      
      yPosition += 30;

      // Top Donors Section - Clean box
      if (filteredPayments.length > 0) {
        checkPageBreak(35);
        
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 30, "F");
        
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.3);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 30);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text("Top Donors (by Amount)", margin + 3, yPosition + 6);
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        
        // Group by donor and sum amounts
        const donorTotals = filteredPayments.reduce((acc, payment) => {
          if (!acc[payment.donorName]) {
            acc[payment.donorName] = {
              name: payment.donorName,
              total: 0,
              count: 0,
            };
          }
          acc[payment.donorName].total += payment.amount;
          acc[payment.donorName].count += 1;
          return acc;
        }, {} as Record<string, { name: string; total: number; count: number }>);

        // Sort by total amount
        const topDonors = Object.values(donorTotals)
          .sort((a, b) => b.total - a.total)
          .slice(0, 5); // Top 5 donors

        let donorY = yPosition + 13;
        topDonors.forEach((donor, index) => {
          const donorName = donor.name.length > 25 ? donor.name.substring(0, 25) + "..." : donor.name;
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${donorName}:`, margin + 5, donorY);
          doc.setFont("helvetica", "normal");
          doc.text(`Rs. ${donor.total.toLocaleString()} (${donor.count} payment${donor.count > 1 ? "s" : ""})`, margin + 60, donorY);
          donorY += 5;
        });
        
        yPosition += 35;
      }

      // Footer on each page - Professional bank statement style
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        yPosition = pageHeight - 30;
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 6;

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("This is an official company payment statement from Al Gohar Educational and Welfare Society.", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 4;
        doc.text("For inquiries: info@algohar.org | Phone: 0321-2546427", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 4;
        doc.text(`Page ${i} of ${totalPages} | Generated on: ${statementDate}`, pageWidth / 2, yPosition, { align: "center" });
      }

      // Save the PDF
      const fileName = `Company_Payment_Statement_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Company statement exported",
        description: "Company payment statement has been exported successfully.",
      });
    } catch (error: any) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: error?.message || "Failed to export company payment statement.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
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
      case "refunded":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400">
            <RefreshCw className="w-3 h-3 mr-1" />
            Refunded
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

  const getPaymentMethodIcon = (method: PaymentMethodType) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "bank":
        return <Building className="h-4 w-4" />;
      case "wallet":
        return <Smartphone className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Payments Management</h2>
            <p className="text-muted-foreground mt-2">
              Monitor and manage all payment transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCompanyStatementPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Export Company Statement
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {completedAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.status === "completed").length} completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {thisMonthAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => {
                const paymentDate = new Date(p.createdAt);
                const now = new Date();
                return (
                  paymentDate.getMonth() === now.getMonth() &&
                  paymentDate.getFullYear() === now.getFullYear() &&
                  p.status === "completed"
                );
              }).length}{" "}
              payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {refundedAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.status === "refunded").length} refunds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments}</div>
            <p className="text-xs text-muted-foreground">All payment records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedPayments}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {totalFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total gateway fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>
            A comprehensive list of all payment transactions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, transaction ID, donor name, email, phone, or donation ID..."
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
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[150px]">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="wallet">Mobile Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payments Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-destructive">
                      Error loading payments. Please try again.
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No payments found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(payment.donorName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{payment.donorName}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {payment.donorEmail}
                            </div>
                            {payment.donorPhone && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" />
                                {payment.donorPhone}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{payment.transactionId}</div>
                          <div className="text-xs text-muted-foreground">{payment.id}</div>
                          {payment.donationId && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Donation: {payment.donationId}
                            </div>
                          )}
                          {payment.donationType && (
                            <div className="mt-1">
                              <Badge variant={payment.donationType === "zakat" ? "default" : "outline"} className="text-xs">
                                {payment.donationType.charAt(0).toUpperCase() + payment.donationType.slice(1)}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">Rs. {payment.amount.toLocaleString()}</div>
                        {payment.fees && (
                          <div className="text-xs text-muted-foreground">
                            Fees: Rs. {payment.fees.toLocaleString()}
                          </div>
                        )}
                        {payment.refundAmount && (
                          <div className="text-xs text-orange-600 mt-1">
                            Refunded: Rs. {payment.refundAmount.toLocaleString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          {getPaymentMethodIcon(payment.method)}
                          {payment.methodDetails}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(payment.createdAt)}</div>
                        {payment.completedAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Completed: {formatDate(payment.completedAt)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewPayment(payment)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => exportStatementPDF(payment)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Export Statement
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Payment
                              </DropdownMenuItem>
                              {payment.status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(payment.id, "completed")}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Mark as Completed
                                </DropdownMenuItem>
                              )}
                              {payment.status === "completed" && (
                                <DropdownMenuItem onClick={() => handleRefund(payment)}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Process Refund
                                </DropdownMenuItem>
                              )}
                              {payment.status === "failed" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(payment.id, "pending")}
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  Retry Payment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeletePayment(payment.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Payment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
                  Showing {filteredPayments.length} of {totalPayments} payments
                  {apiResponse?.meta && (
                    <span className="ml-2">
                      (Page {apiResponse.meta.current_page} of {apiResponse.meta.last_page})
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="text-sm font-medium">
              Total Amount: Rs.{" "}
              {filteredPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Payment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Complete information about this payment transaction
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment ID</label>
                  <p className="text-sm font-medium">{selectedPayment.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Transaction ID
                  </label>
                  <p className="text-sm font-medium">{selectedPayment.transactionId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Donor Name</label>
                  <p className="text-sm font-medium">{selectedPayment.donorName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <p className="text-sm font-medium text-lg">
                    Rs. {selectedPayment.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{selectedPayment.donorEmail}</p>
                </div>
                {selectedPayment.donorPhone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm">{selectedPayment.donorPhone}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                  <p className="text-sm flex items-center gap-2">
                    {getPaymentMethodIcon(selectedPayment.method)}
                    {selectedPayment.methodDetails}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
              </div>
              {selectedPayment.donationId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Donation ID</label>
                  <p className="text-sm">{selectedPayment.donationId}</p>
                </div>
              )}
              {selectedPayment.cause && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cause</label>
                  <p className="text-sm">{selectedPayment.cause}</p>
                </div>
              )}
              {selectedPayment.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{selectedPayment.description}</p>
                </div>
              )}
              {selectedPayment.fees && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Processing Fees</label>
                  <p className="text-sm">Rs. {selectedPayment.fees.toLocaleString()}</p>
                </div>
              )}
              {selectedPayment.gatewayResponse && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Gateway Response
                  </label>
                  <p className="text-sm">{selectedPayment.gatewayResponse}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-sm">{formatDate(selectedPayment.createdAt)}</p>
                </div>
                {selectedPayment.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Completed At</label>
                    <p className="text-sm">{formatDate(selectedPayment.completedAt)}</p>
                  </div>
                )}
                {selectedPayment.refundedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Refunded At</label>
                    <p className="text-sm">{formatDate(selectedPayment.refundedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedPayment?.status === "completed" && (
              <Button variant="outline" onClick={() => handleRefund(selectedPayment)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Process Refund
              </Button>
            )}
            <Button onClick={() => setIsViewDialogOpen(false)}>Edit Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Are you sure you want to refund this payment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment ID:</span>
                  <span className="text-sm font-medium">{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transaction ID:</span>
                  <span className="text-sm font-medium">{selectedPayment.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Donor:</span>
                  <span className="text-sm font-medium">{selectedPayment.donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-sm font-medium">
                    Rs. {selectedPayment.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRefund}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Confirm Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

