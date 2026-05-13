import { useState, useMemo, useEffect } from "react";
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
  Users as UsersIcon,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield,
  Filter,
  Download,
  FileText,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

// API User type (from backend)
interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "user";
  status?: "active" | "inactive" | "pending";
  created_at: string;
  updated_at: string;
  total_donations: number;
  avatar?: string;
}

// Frontend User type
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "user";
  status: "active" | "inactive" | "pending";
  joined: string;
  lastActive?: string;
  totalDonations?: number;
  avatar?: string;
}

// API Response type (Laravel pagination)
interface ApiResponse {
  data: ApiUser[];
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

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state for add/edit user
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user" as "user" | "admin",
    password: "",
  });

  // Build API URL with query parameters
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
    if (currentPage > 1) params.append("page", currentPage.toString());
    const queryString = params.toString();
    return `/api/admin/users${queryString ? `?${queryString}` : ""}`;
  }, [searchQuery, statusFilter, currentPage]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Fetch users from API
  const { data: apiResponse, isLoading, error } = useQuery<ApiResponse>({
    queryKey: [apiUrl],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Transform API users to frontend User format
  const users: User[] = apiResponse?.data?.map((apiUser) => ({
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    role: apiUser.role === "admin" ? "admin" : "user",
    status: (apiUser.status || "active") as "active" | "inactive" | "pending",
    joined: apiUser.created_at,
    lastActive: apiUser.updated_at,
    totalDonations: apiUser.total_donations || 0,
    avatar: apiUser.avatar,
  })) || [];

  // Calculate statistics
  const totalUsers = apiResponse?.meta?.total || 0;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const pendingUsers = users.filter((u) => u.status === "pending").length;
  const newUsersThisMonth = users.filter((u) => {
    const joinedDate = new Date(u.joined);
    const now = new Date();
    return (
      joinedDate.getMonth() === now.getMonth() &&
      joinedDate.getFullYear() === now.getFullYear()
    );
  }).length;

  // Filter users based on filters (search is handled by backend)
  const filteredUsers = users.filter((user) => {
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesStatus && matchesRole;
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: typeof userForm) => {
      const response = await apiRequest("POST", "/api/admin/users", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0] as string;
          return typeof key === 'string' && key.startsWith('/api/admin/users');
        }
      });
      toast({
        title: "User created",
        description: "User has been created successfully.",
      });
      setIsAddUserDialogOpen(false);
      setUserForm({ name: "", email: "", phone: "", role: "user", password: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: Partial<typeof userForm> }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0] as string;
          return typeof key === 'string' && key.startsWith('/api/admin/users');
        }
      });
      toast({
        title: "User updated",
        description: "User has been updated successfully.",
      });
      setIsEditUserDialogOpen(false);
      setSelectedUser(null);
      setUserForm({ name: "", email: "", phone: "", role: "user", password: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update user.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0] as string;
          return typeof key === 'string' && key.startsWith('/api/admin/users');
        }
      });
      toast({
        title: "User deleted",
        description: "User has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: "active" | "inactive" | "pending" }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0] as string;
          return typeof key === 'string' && key.startsWith('/api/admin/users');
        }
      });
      toast({
        title: "Status updated",
        description: "User status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update user status.",
        variant: "destructive",
      });
    },
  });

  // Handle user actions
  const handleStatusChange = (userId: number, newStatus: "active" | "inactive" | "pending") => {
    updateStatusMutation.mutate({ userId, status: newStatus });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      password: "", // Don't pre-fill password
    });
    setIsEditUserDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const handleAddUser = () => {
    if (!userForm.name || !userForm.email || !userForm.password) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(userForm);
  };

  const handleUpdateUser = () => {
    if (!userForm.name || !userForm.email) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (selectedUser) {
      // Only send password if it's been changed
      const updateData: Partial<typeof userForm> = {
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        role: userForm.role,
      };
      if (userForm.password) {
        updateData.password = userForm.password;
      }
      updateUserMutation.mutate({ userId: selectedUser.id, data: updateData });
    }
  };

  const handleExportUsers = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Role", "Joined", "Total Donations"],
      ...filteredUsers.map((user) => [
        user.name,
        user.email,
        user.phone || "",
        user.role,
        formatDate(user.joined),
        (user.totalDonations || 0).toString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `users_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: "Users have been exported to CSV.",
    });
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

  const exportUserStatementPDF = async (user: User) => {
    try {
      // Fetch user's donations
      const donationsResponse = await apiRequest("GET", `/api/admin/donations?user_id=${user.id}`);
      const donationsData = await donationsResponse.json();
      const userDonations = donationsData?.data || [];

      if (userDonations.length === 0) {
        toast({
          title: "No donations found",
          description: "This user has no donation records to export.",
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
      doc.text(`${user.name}`, margin + 20, yPosition);
      yPosition += 5;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Email:`, margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${user.email}`, margin + 20, yPosition);
      yPosition += 5;
      
      if (user.phone) {
        doc.setFont("helvetica", "bold");
        doc.text(`Phone:`, margin, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(`${user.phone}`, margin + 20, yPosition);
        yPosition += 5;
      }
      
      // Right column
      const rightStart = pageWidth / 2;
      let rightY = yPosition - 10;
      
      doc.setFont("helvetica", "bold");
      doc.text(`User ID:`, rightStart, rightY);
      doc.setFont("helvetica", "normal");
      doc.text(`${user.id}`, rightStart + 30, rightY);
      rightY += 5;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Joined:`, rightStart, rightY);
      doc.setFont("helvetica", "normal");
      doc.text(`${formatDate(user.joined)}`, rightStart + 30, rightY);
      rightY += 5;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Total Donations:`, rightStart, rightY);
      doc.setFont("helvetica", "normal");
      doc.text(`${userDonations.length}`, rightStart + 45, rightY);
      
      yPosition += 10;

      // Account Summary - Clean box
      const totalAmount = userDonations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
      const completedAmount = userDonations
        .filter((d: any) => d.status === "completed")
        .reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
      const completedCount = userDonations.filter((d: any) => d.status === "completed").length;
      const pendingCount = userDonations.filter((d: any) => d.status === "pending").length;

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
      doc.text(`${userDonations.length}`, margin + 55, yPosition + 13);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Completed:`, margin + 3, yPosition + 19);
      doc.setFont("helvetica", "normal");
      doc.text(`${completedCount}`, margin + 55, yPosition + 19);
      
      // Right side amounts
      doc.setFont("helvetica", "bold");
      doc.text(`Total Amount:`, rightStart, yPosition + 13);
      doc.setFont("helvetica", "normal");
      doc.text(`Rs. ${totalAmount.toLocaleString()}`, rightStart + 40, yPosition + 13);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Completed Amount:`, rightStart, yPosition + 19);
      doc.setFont("helvetica", "normal");
      doc.text(`Rs. ${completedAmount.toLocaleString()}`, rightStart + 50, yPosition + 19);
      
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

      // Transaction Rows
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      userDonations.forEach((donation: any, index: number) => {
        // Check page break
        if (yPosition + 7 > pageHeight - 30) {
          doc.addPage();
          yPosition = margin;
        }

        const transDate = new Date(donation.created_at || donation.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        
        const description = donation.cause || donation.project || "Donation Payment";
        const reference = donation.transaction_id || donation.transactionId || donation.id;
        const refText = reference.length > 15 ? reference.substring(0, 15) + "..." : reference;
        const amount = `Rs. ${(donation.amount || 0).toLocaleString()}`;
        const status = (donation.status || "pending").charAt(0).toUpperCase() + (donation.status || "pending").slice(1);

        // Row border
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.2);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        
        // Row data
        doc.text(transDate, colPositions[0], yPosition + 5);
        
        // Description (wrap if needed)
        const descLines = doc.splitTextToSize(description, 60);
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
      const fileName = `Donation_Statement_${user.name.replace(/\s+/g, "_")}_${user.id}.pdf`;
      doc.save(fileName);

      toast({
        title: "Statement exported",
        description: "User donation statement has been exported successfully.",
      });
    } catch (error: any) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: error?.message || "Failed to export user donation statement.",
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
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground mt-2">
              Manage and monitor all registered users
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportUsers}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account. Fill in the required information below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="add-name">Full Name</Label>
                    <Input
                      id="add-name"
                      placeholder="John Doe"
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-email">Email</Label>
                    <Input
                      id="add-email"
                      type="email"
                      placeholder="john@example.com"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-phone">Phone</Label>
                    <Input
                      id="add-phone"
                      placeholder="+92 300 1234567"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-role">Role</Label>
                    <Select
                      value={userForm.role}
                      onValueChange={(value: "user" | "admin") =>
                        setUserForm({ ...userForm, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-password">Password</Label>
                    <Input
                      id="add-password"
                      type="password"
                      placeholder="Enter password (min 8 characters)"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddUserDialogOpen(false);
                      setUserForm({ name: "", email: "", phone: "", role: "user", password: "" });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? "Creating..." : "Add User"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((activeUsers / totalUsers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newUsersThisMonth}</div>
            <p className="text-xs text-muted-foreground">Registered in June 2024</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            A list of all users with their details and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <Shield className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Donations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-destructive">
                      Error loading users. Please try again.
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {user.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "default"
                              : user.role === "moderator"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "active"
                              ? "default"
                              : user.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(user.joined)}</div>
                        {user.lastActive && (
                          <div className="text-xs text-muted-foreground">
                            Last active: {formatDate(user.lastActive)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          Rs. {(user.totalDonations || 0).toLocaleString()}
                        </div>
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
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportUserStatementPDF(user)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Export Statement
                            </DropdownMenuItem>
                            {user.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, "inactive")}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, "active")}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {user.status === "pending" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, "active")}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
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

          {/* Results Count and Pagination */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  Showing {apiResponse?.meta?.from || 0} to {apiResponse?.meta?.to || 0} of {totalUsers} users
                  {apiResponse?.meta && (
                    <span className="ml-2">
                      (Page {apiResponse.meta.current_page} of {apiResponse.meta.last_page})
                    </span>
                  )}
                </>
              )}
            </div>
            
            {apiResponse?.meta && apiResponse.meta.last_page > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (apiResponse.links.prev) {
                          setCurrentPage((prev) => Math.max(1, prev - 1));
                        }
                      }}
                      className={
                        !apiResponse.links.prev
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  
                  {/* Page Numbers */}
                  {(() => {
                    const current = apiResponse.meta.current_page;
                    const last = apiResponse.meta.last_page;
                    const pages: (number | "ellipsis")[] = [];
                    
                    if (last <= 7) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= last; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Always show first page
                      pages.push(1);
                      
                      if (current <= 3) {
                        // Near the beginning
                        for (let i = 2; i <= 4; i++) {
                          pages.push(i);
                        }
                        pages.push("ellipsis");
                        pages.push(last);
                      } else if (current >= last - 2) {
                        // Near the end
                        pages.push("ellipsis");
                        for (let i = last - 3; i <= last; i++) {
                          pages.push(i);
                        }
                      } else {
                        // In the middle
                        pages.push("ellipsis");
                        for (let i = current - 1; i <= current + 1; i++) {
                          pages.push(i);
                        }
                        pages.push("ellipsis");
                        pages.push(last);
                      }
                    }
                    
                    return pages.map((page, index) => {
                      if (page === "ellipsis") {
                        return (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={page === current}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    });
                  })()}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (apiResponse.links.next) {
                          setCurrentPage((prev) => Math.min(apiResponse.meta.last_page, prev + 1));
                        }
                      }}
                      className={
                        !apiResponse.links.next
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password empty to keep current password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                placeholder="John Doe"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="john@example.com"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                placeholder="+92 300 1234567"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={userForm.role}
                onValueChange={(value: "user" | "admin") =>
                  setUserForm({ ...userForm, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave empty to keep current password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditUserDialogOpen(false);
                setSelectedUser(null);
                setUserForm({ name: "", email: "", phone: "", role: "user", password: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              {selectedUser && ` "${selectedUser.name}"`} and remove all associated data from
              the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

