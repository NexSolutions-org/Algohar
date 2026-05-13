import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { extractErrorMessage } from "@/lib/errorUtils";
import { useToast } from "@/hooks/use-toast";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";

type PaymentStatus = "completed" | "pending" | "failed";

interface PaymentTransaction {
  id: string;
  amount: number;
  method: string;
  methodDetails: string;
  status: PaymentStatus;
  donationId?: string | number; // Numeric ID for API calls
  transactionId?: string; // Transaction ID for display (e.g., "DON-LWS1ZXC8")
  cause?: string;
  donationType?: string;
  createdAt: string;
  description?: string;
  donation?: any; // Store full donation object for PayFast payment
}

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
    default:
      return <Badge>{status}</Badge>;
  }
};


export default function Payments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { format } = useCurrencyConversion();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  // Fetch payment history (placeholder - replace with actual API endpoint)
  // For now, we'll fetch from donations to show payment transactions
  const { data: donationsResponse, isLoading: transactionsLoading } = useQuery<any>({
    queryKey: ["/api/donations"],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: false,
  });

  // Extract donations array from response (handle both direct array, paginated, and wrapped response)
  const donations: any[] = Array.isArray(donationsResponse)
    ? donationsResponse
    : Array.isArray(donationsResponse?.data)
    ? donationsResponse.data
    : Array.isArray(donationsResponse?.data?.data)
    ? donationsResponse.data.data
    : [];

  // Transform donations to payment transactions
  const paymentTransactions: PaymentTransaction[] = donations.map((donation) => ({
    id: `payment-${donation.id}`,
    amount: donation.amount,
    method: donation.payment_method || donation.paymentMethod || "payfast",
    methodDetails: "PayFast", // Always show PayFast
    status: donation.status as PaymentStatus,
    donationId: donation.id, // Use numeric ID for API calls
    transactionId: donation.transaction_id || donation.transactionId, // Transaction ID for display
    cause: donation.cause,
    donationType: donation.donation_type || donation.donationType,
    createdAt: donation.created_at || donation.createdAt,
    description: `Donation for ${donation.cause || "General Fund"}`,
    donation: donation, // Store full donation object for PayFast payment
  }));

  // Filter and sort transactions
  const filteredTransactions = paymentTransactions
    .filter((transaction) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          transaction.id.toLowerCase().includes(query) ||
          transaction.methodDetails.toLowerCase().includes(query) ||
          (transaction.donationId && String(transaction.donationId).toLowerCase().includes(query)) ||
          (transaction.transactionId && transaction.transactionId.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      if (statusFilter !== "all" && transaction.status !== statusFilter) {
        return false;
      }

      // All methods are PayFast now, so only filter if methodFilter is not "all"
      if (methodFilter !== "all" && methodFilter !== "payfast") {
        return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Calculate statistics
  const totalSpent = paymentTransactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthTransactions = paymentTransactions.filter((t) => {
    const transactionDate = new Date(t.createdAt);
    const now = new Date();
    return (
      transactionDate.getMonth() === now.getMonth() &&
      transactionDate.getFullYear() === now.getFullYear() &&
      t.status === "completed"
    );
  });

  const thisMonthTotal = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

  const completedCount = paymentTransactions.filter((t) => t.status === "completed").length;
  const pendingCount = paymentTransactions.filter((t) => t.status === "pending").length;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };


  // Mutation to retry failed payment by changing status to pending
  const retryPaymentMutation = useMutation({
    mutationFn: async (donationId: string | number) => {
      const response = await apiRequest("PUT", `/api/donations/${donationId}`, {
        status: "pending",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      toast({
        title: "Payment retry initiated",
        description: "Payment status has been updated to pending. You can now proceed with payment.",
      });
    },
    onError: (error: any) => {
      const errorMessage = extractErrorMessage(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleRetryPayment = (transaction: PaymentTransaction) => {
    if (!transaction.donationId) {
      toast({
        title: "Error",
        description: "Donation ID not found.",
        variant: "destructive",
      });
      return;
    }
    retryPaymentMutation.mutate(transaction.donationId);
  };

  const handlePayNow = async (transaction: PaymentTransaction) => {
    if (!transaction.donationId) {
      toast({
        title: "Error",
        description: "Donation ID not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Fetch donation details
      const response = await apiRequest("GET", `/api/donations/${transaction.donationId}`);
      const donationData = await response.json();
      const donation = donationData.data || donationData;

      let donationIdToUse = transaction.donationId;

      // If the donation has failed, create a new donation with the same details for retry
      if (transaction.status === "failed") {
        try {
          toast({
            title: "Creating new payment",
            description: "Preparing your payment retry...",
          });

          // Get user info if available
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;

          // Prepare new donation data from the failed donation
          const newDonationData: any = {
            donor_name: donation.donor_name || donation.donorName || user?.name || "",
            donor_email: donation.donor_email || donation.donorEmail || user?.email || "",
            donor_phone: donation.donor_phone || donation.donorPhone || user?.phone || null,
            amount: donation.amount || transaction.amount,
            type: donation.type || "one-time",
            payment_method: donation.payment_method || donation.paymentMethod || "payfast",
          };

          // Add cause if it exists
          if (donation.cause) {
            newDonationData.cause = donation.cause;
          }

          // Create a new donation
          const createResponse = await apiRequest("POST", "/api/donations", newDonationData);
          const createData = await createResponse.json();
          const newDonation = createData.data || createData;

          donationIdToUse = newDonation.id || newDonation.donationId;

          // Invalidate queries to refresh the list
          queryClient.invalidateQueries({ queryKey: ["/api/donations"] });

          toast({
            title: "Payment ready",
            description: "Redirecting to payment gateway...",
          });
        } catch (createError: any) {
          console.error("Error creating new donation:", createError);
          toast({
            title: "Error",
            description: "Failed to create new donation. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // Check if PayFast payment data exists in the original donation (for pending payments)
      if (donation.payfast && donation.payfast.payment_url && donation.payfast.form_data && transaction.status === "pending") {
        // Create a form and submit it to PayFast
        const form = document.createElement("form");
        form.method = "POST";
        form.action = donation.payfast.payment_url;
        form.target = "_blank";

        // Add form data fields
        Object.entries(donation.payfast.form_data).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } else {
        // Initiate payment with the donation ID (either original or new)
        const initiateResponse = await apiRequest("POST", `/api/payments/payfast/initiate`, {
          donation_id: donationIdToUse,
        });
        const initiateData = await initiateResponse.json();

        // Check if the response indicates success
        if (!initiateData.success) {
          toast({
            title: "Error",
            description: initiateData.message || "Unable to initiate payment. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Handle new response format with payment_form_html
        const paymentFormHtml = initiateData.data?.payment_form_html || initiateData.payment_form_html;

        if (paymentFormHtml) {
          // Show loading message
          toast({
            title: "Redirecting to PayFast...",
            description: "Please wait while we redirect you to the payment gateway.",
          });

          // Create a temporary container for the form
          const formContainer = document.createElement('div');
          formContainer.style.display = 'none';
          formContainer.innerHTML = paymentFormHtml;
          document.body.appendChild(formContainer);

          // Auto-submit the form
          const form = document.getElementById('PayFastForm') as HTMLFormElement;
          if (form) {
            form.submit();
          } else {
            // If form not found, try after a short delay
            setTimeout(() => {
              const form = document.getElementById('PayFastForm') as HTMLFormElement;
              if (form) {
                form.submit();
              } else {
                toast({
                  title: "Payment form error",
                  description: "Could not redirect to payment gateway. Please try again.",
                  variant: "destructive",
                });
              }
            }, 500);
          }
        } else {
          // Fallback: Try old format with payment_url and form_data
          const paymentUrl = initiateData.payment_url || initiateData.data?.payment_url;
          const formData = initiateData.form_data || initiateData.data?.form_data;

          if (paymentUrl && formData) {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = paymentUrl;
            form.target = "_blank";

            Object.entries(formData).forEach(([key, value]) => {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = key;
              input.value = String(value);
              form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
          } else {
            toast({
              title: "Error",
              description: "Unable to initiate payment. Please try again.",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error: any) {
      console.error("PayFast payment error:", error);
      
      // Extract error message from apiRequest error format: "status: responseBody"
      let errorMessage = "Failed to initiate payment. Please try again.";
      
      if (error?.message) {
        // apiRequest throws errors in format: "status: responseBody"
        const errorParts = error.message.split(': ');
        if (errorParts.length > 1) {
          const statusCode = errorParts[0];
          const responseBody = errorParts.slice(1).join(': ');
          
          // Try to parse JSON response body
          try {
            const errorData = JSON.parse(responseBody);
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else {
              errorMessage = responseBody;
            }
          } catch {
            // If not JSON, use the response body or status message
            errorMessage = responseBody || `HTTP ${statusCode} error occurred`;
          }
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <UserLayout>
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-2">
            View your payment transaction history
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">All completed payments</p>
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
              {thisMonthTransactions.length} transaction(s) this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              {pendingCount > 0 && `${pendingCount} pending`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transaction(s) found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
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
                  placeholder="Search by ID, method, or donation..."
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
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="payfast">PayFast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          {transactionsLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading transactions...</div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || methodFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Your payment history will appear here"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{transaction.description}</p>
                            {transaction.donationType && (
                              <Badge variant={transaction.donationType === "zakat" ? "default" : "outline"}>
                                {transaction.donationType.charAt(0).toUpperCase() + transaction.donationType.slice(1)}
                              </Badge>
                            )}
                          </div>
                          {(transaction.transactionId || transaction.donationId) && (
                            <p className="text-sm text-muted-foreground">
                              Donation ID: {transaction.transactionId || transaction.donationId}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          <span>PayFast</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {format(transaction.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-right">
                        {transaction.status === "pending" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePayNow(transaction)}
                            className="gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Pay Now
                          </Button>
                        )}
                        {transaction.status === "failed" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleRetryPayment(transaction)}
                            className="gap-2 bg-red-600 hover:bg-red-700"
                            disabled={retryPaymentMutation.isPending}
                          >
                            <RefreshCw className={`w-4 h-4 ${retryPaymentMutation.isPending ? "animate-spin" : ""}`} />
                            {retryPaymentMutation.isPending ? "Retrying..." : "Retry Payment"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </UserLayout>
  );
}

