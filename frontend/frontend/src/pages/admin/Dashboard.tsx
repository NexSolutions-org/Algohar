import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  XAxis,
  YAxis,
  Line,
  CartesianGrid,
  Area,
  ComposedChart,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  Calendar,
  Shield,
  HeartHandshake,
  Activity,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getQueryFn } from "@/lib/queryClient";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";


const chartConfig = {
  amount: {
    label: "Amount",
    theme: {
      light: "hsl(0, 100%, 45%)",
      dark: "hsl(0, 100%, 45%)",
    },
  },
  donations: {
    label: "Donations",
    theme: {
      light: "hsl(221.2 83.2% 53.3%)",
      dark: "hsl(217.2 91.2% 59.8%)",
    },
  },
  users: {
    label: "Users",
    theme: {
      light: "hsl(142.1 76.2% 36.3%)",
      dark: "hsl(142.1 70.6% 45.3%)",
    },
  },
};

export default function Dashboard() {
  const { format } = useCurrencyConversion();
  // Fetch dashboard data from API
  const { data: dashboardResponse, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/dashboard"],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: false,
  });

  const dashboardData = dashboardResponse?.data || dashboardResponse || {};
  
  // Extract stats from API response
  const totalDonations = dashboardData.total_donations || 0;
  const thisMonth = dashboardData.this_month || 0;
  const totalUsers = dashboardData.total_users || 0;
  const newUsersThisMonth = dashboardData.new_users_this_month || 0;
  const pendingDonations = dashboardData.pending_donations || 0;
  
  // Get recent donations and users
  const rawRecentDonations = dashboardData.recent_donations || [];
  const rawRecentUsers = dashboardData.recent_users || [];
  
  // Transform recent donations for display
  const recentDonations = rawRecentDonations.slice(0, 4).map((donation: any) => ({
    id: donation.id,
    donor: donation.donor_name || donation.donorName || "Anonymous",
    amount: donation.amount || 0,
    date: donation.created_at || donation.createdAt || donation.date,
    type: "One-time",
    status: donation.status === "completed" ? "Completed" : donation.status === "pending" ? "Pending" : donation.status,
    cause: donation.cause || "General",
  }));
  
  // Transform recent users for display
  const recentUsers = rawRecentUsers.slice(0, 3).map((user: any) => ({
    id: user.id,
    name: user.name || "Unknown",
    email: user.email || "",
    role: user.role || "user",
    joined: user.created_at || user.createdAt || user.joined,
    status: "active",
  }));
  
  // Get donation trends and user growth from API
  const rawDonationTrends = dashboardData.donation_trends || [];
  const rawUserGrowth = dashboardData.user_growth || [];
  
  // Transform donation trends for chart
  const donationTrends = rawDonationTrends.map((trend: any) => ({
    month: trend.month || "Unknown",
    amount: trend.amount || 0,
    donations: trend.donations || 0,
  }));
  
  // Transform user growth for chart
  const userGrowth = rawUserGrowth.map((growth: any) => ({
    month: growth.month || "Unknown",
    users: growth.users || 0,
  }));
  
  // Calculate additional metrics
  const currentYear = new Date().getFullYear();
  // Calculate this year donations from donation trends (sum of all months in current year)
  const thisYearDonations = donationTrends.reduce((sum: number, trend: any) => {
    return sum + (trend.amount || 0);
  }, 0);
  
  // Calculate donations today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const donationsToday = rawRecentDonations.filter((d: any) => {
    const date = new Date(d.created_at || d.createdAt || d.date);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  }).length;
  
  // Calculate users today
  const usersToday = rawRecentUsers.filter((u: any) => {
    const date = new Date(u.created_at || u.createdAt || u.joined);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  }).length;
  
  // Calculate growth rate (month over month)
  const lastMonth = donationTrends.length >= 2 
    ? donationTrends[donationTrends.length - 2]?.amount || 0 
    : 0;
  const currentMonthAmount = thisMonth;
  const growthRate = lastMonth > 0 
    ? ((currentMonthAmount - lastMonth) / lastMonth * 100).toFixed(1)
    : "0.0";
  
  const systemStatus = "operational";

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Welcome Section */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Overview of your foundation's activities and metrics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4 sm:mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Donations
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold break-words">
              {format(totalDonations)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All-time contributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold break-words">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{newUsersThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold break-words">
              {format(thisMonth)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {growthRate !== "0.0" && growthRate !== "0" ? (
                <>
                  {parseFloat(growthRate) > 0 ? "+" : ""}
                  {growthRate}% from last month
                </>
              ) : (
                "No previous month data"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7 mb-4 sm:mb-6">
        {/* Donation Trends Chart */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Donation Trends</CardTitle>
            <CardDescription>
              Donation activity over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {donationTrends.length > 0 ? (
              <ChartContainer config={chartConfig} className="min-w-[300px]">
                <ComposedChart data={donationTrends}>
                  <defs>
                    <linearGradient id="gradientAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-amount)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="50%"
                        stopColor="var(--color-amount)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-amount)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    fill="url(#gradientAmount)"
                    stroke="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--color-amount)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "var(--color-amount)", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 2, fill: "var(--color-amount)", stroke: "#fff" }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </ComposedChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No donation data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/donations">
                <HeartHandshake className="mr-2 h-4 w-4" />
                View Donations
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 mb-4 sm:mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">User Growth</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              New user registrations over time
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {userGrowth.length > 0 ? (
              <ChartContainer config={chartConfig} className="min-w-[300px]">
                <ComposedChart data={userGrowth}>
                  <defs>
                    <linearGradient id="gradientUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-users)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="50%"
                        stopColor="var(--color-users)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-users)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    fill="url(#gradientUsers)"
                    stroke="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="var(--color-users)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "var(--color-users)", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 2, fill: "var(--color-users)", stroke: "#fff" }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </ComposedChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No user growth data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">System Status</span>
              </div>
              <Badge
                variant={systemStatus === "operational" ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {systemStatus === "operational" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {systemStatus === "operational" ? "Operational" : "Issues"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">New Users Today</span>
              </div>
              <Badge variant="secondary">{usersToday}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Donations Today</span>
              </div>
              <Badge variant="secondary">{donationsToday}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 mb-4 sm:mb-6">
        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div>
                <CardTitle className="text-base sm:text-lg">Recent Donations</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Latest donation transactions</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="self-start sm:self-auto">
                <Link href="/admin/donations">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDonations.length > 0 ? (
                recentDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{donation.donor}</p>
                    <p className="text-xs text-muted-foreground">
                      {donation.cause}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(donation.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {format(donation.amount)}
                    </p>
                    <Badge
                      variant={
                        donation.status === "Completed"
                          ? "default"
                          : "secondary"
                      }
                      className="mt-1 text-xs"
                    >
                      {donation.status}
                    </Badge>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent donations
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Newly registered users</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/users">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(user.joined).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={user.status === "active" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {user.status}
                    </Badge>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent users
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Full</p>
            <p className="text-sm text-muted-foreground">
              All permissions granted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              This Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {format(thisYearDonations)}
            </p>
            <p className="text-sm text-muted-foreground">
              Donations in {currentYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Activity Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">94%</p>
            <p className="text-sm text-muted-foreground">
              System uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {growthRate !== "0.0" && growthRate !== "0" ? (
                <>
                  {parseFloat(growthRate) > 0 ? "+" : ""}
                  {growthRate}%
                </>
              ) : (
                "N/A"
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              Month over month
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

