import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getQueryFn } from "@/lib/queryClient";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Heart,
  ArrowRight,
  Calendar,
  Users,
} from "lucide-react";
import UserLayout from "@/components/user/UserLayout";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useCurrency } from "@/contexts/CurrencyContext";
import { convertAmountSync } from "@/lib/currencyUtils";

const chartConfig = {
  amount: {
    label: "Amount",
    theme: {
      light: "hsl(221.2 83.2% 53.3%)",
      dark: "hsl(217.2 91.2% 59.8%)",
    },
  },
};

export default function Dashboard() {
  const { format, convert, rates, isLoading: isRatesLoading } = useCurrencyConversion();
  const { currency } = useCurrency();
  
  // Fetch dashboard data
  const { data: dashboardResponse, isLoading: isDashboardLoading } = useQuery<any>({
    queryKey: ["/api/user/dashboard"],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: false,
  });

  const dashboardData = dashboardResponse?.data || dashboardResponse || {};
  
  const totalDonations = dashboardData.total_donations || dashboardData.totalDonations || 0;
  const thisMonth = dashboardData.this_month || dashboardData.thisMonth || 0;
  const communitiesSupported = dashboardData.communities_supported || dashboardData.communitiesSupported || 0;
  
  // Get donation trends from API response
  const apiDonationTrends = dashboardData.donation_trends || dashboardData.donationTrends || [];
  
  // Get recent donations from API response, fallback to donations API
  const apiRecentDonations = dashboardData.recent_donations || dashboardData.recentDonations || [];
  
  // Fetch donations for fallback and calculations (always fetch to ensure we have data for calculations)
  const { data: donationsResponse, isLoading: isDonationsLoading } = useQuery<any>({
    queryKey: ["/api/donations"],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: false,
  });

  // Use API recent donations if available, otherwise use donations API response
  const rawDonations: any[] = apiRecentDonations.length > 0
    ? apiRecentDonations
    : Array.isArray(donationsResponse)
    ? donationsResponse
    : Array.isArray(donationsResponse?.data)
    ? donationsResponse.data
    : Array.isArray(donationsResponse?.data?.data)
    ? donationsResponse.data.data
    : [];

  // Generate donation trends - use API data if available, otherwise calculate from donations
  // Note: We'll convert amounts in the render, but store PKR values for calculations
  let donationTrendsPKR: Array<{ month: string; amount: number }> = [];
  if (apiDonationTrends.length > 0) {
    donationTrendsPKR = apiDonationTrends.map((trend: any) => ({
      month: trend.month || "",
      amount: parseFloat(trend.amount) || 0,
    }));
  } else if (rawDonations.length > 0) {
    // Generate chart data from donations (last 6 months)
    const now = new Date();
    donationTrendsPKR = Array.from({ length: 6 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthName = monthDate.toLocaleDateString("en-US", { month: "short" });
      const monthDonations = rawDonations.filter((d: any) => {
        const donationDate = new Date(d.created_at || d.createdAt);
        return (
          donationDate.getMonth() === monthDate.getMonth() &&
          donationDate.getFullYear() === monthDate.getFullYear() &&
          d.status === "completed"
        );
      });
      const monthAmount = monthDonations.reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0);
      return { month: monthName, amount: monthAmount };
    });
  }
  
  // Convert donation trends for display (for chart) - keep PKR value for tooltip
  // Use useMemo to recompute when currency or rates change
  const donationTrends = useMemo(() => {
    if (!rates || currency === "PKR") {
      // Return PKR values if rates not loaded yet or currency is PKR
      return donationTrendsPKR.map(trend => ({
        month: trend.month,
        amount: trend.amount,
        amountPKR: trend.amount,
      }));
    }
    return donationTrendsPKR.map(trend => ({
      month: trend.month,
      amount: convertAmountSync(trend.amount, "PKR", currency, rates),
      amountPKR: trend.amount, // Keep original for tooltip formatting
    }));
  }, [donationTrendsPKR, currency, rates]);

  // Calculate this year from donations
  const currentYear = new Date().getFullYear();
  const thisYear = rawDonations
    .filter((d: any) => {
      const donationDate = new Date(d.created_at || d.createdAt);
      return donationDate.getFullYear() === currentYear && d.status === "completed";
    })
    .reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0);

  // Get recent donations (last 4) - use API data or fallback
  const recentDonations = rawDonations
    .slice(0, 4)
    .map((donation: any) => ({
      id: donation.id,
      amount: parseFloat(donation.amount) || 0,
      date: donation.created_at || donation.createdAt,
      type: "One-time",
      status: donation.status === "completed" ? "Completed" : donation.status === "pending" ? "Pending" : "Active",
      cause: donation.cause || "General Fund",
    }));

  // Calculate month-over-month percentage change
  const lastMonth = rawDonations
    .filter((d: any) => {
      const donationDate = new Date(d.created_at || d.createdAt);
      const now = new Date();
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        donationDate.getMonth() === lastMonthDate.getMonth() &&
        donationDate.getFullYear() === lastMonthDate.getFullYear() &&
        d.status === "completed"
      );
    })
    .reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0);

  const monthChange = lastMonth > 0 
    ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1)
    : thisMonth > 0 ? "100" : "0";
  const monthChangeText = monthChange === "0" 
    ? "No change from last month"
    : parseFloat(monthChange) >= 0
    ? `+${monthChange}% from last month`
    : `${monthChange}% from last month`;

  const isLoading = isDashboardLoading || isDonationsLoading;

  return (
    <UserLayout>
      {/* Welcome Section */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome Back!</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Here's an overview of your donation activity
        </p>
      </div>

          {/* Statistics Cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mb-4 sm:mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Total Donations
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold break-words">{format(totalDonations)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All-time contributions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold break-words">{format(thisMonth)}</div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {monthChangeText}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7 mb-4 sm:mb-6">
            {/* Donation Trends Chart */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-4">
              <CardHeader>
                <CardTitle>Donation Trends</CardTitle>
                <CardDescription>
                  Your donation activity over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {donationTrends.length > 0 ? (
                  <ChartContainer config={chartConfig} className="min-w-[300px]">
                    <AreaChart data={donationTrends}>
                      <defs>
                        <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="var(--color-amount)"
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="30%"
                            stopColor="var(--color-amount)"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="60%"
                            stopColor="var(--color-amount)"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--color-amount)"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
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
                        tickFormatter={(value) => {
                          if (value >= 1000000) {
                            return `${(value / 1000000).toFixed(1)}M`;
                          } else if (value >= 1000) {
                            return `${(value / 1000).toFixed(0)}k`;
                          }
                          return value.toFixed(0);
                        }}
                      />
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            // Use amountPKR if available (original PKR value), otherwise use the converted value
                            const amountToFormat = data.payload?.amountPKR ?? data.value ?? 0;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid gap-2">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-muted-foreground">
                                      {data.payload?.month || data.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-medium">Amount</span>
                                    <span className="text-sm font-bold">{format(amountToFormat)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="natural"
                        dataKey="amount"
                        stroke="var(--color-amount)"
                        fill="url(#fillAmount)"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 2, fill: "var(--color-amount)" }}
                      />
                    </AreaChart>
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
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/user/donate-now">
                    <Heart className="mr-2 h-4 w-4" />
                    Make a Donation
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/user/my-donations">
                    <Calendar className="mr-2 h-4 w-4" />
                    View All Donations
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/user/payments">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Payment History
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Donations */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div>
                  <CardTitle className="text-base sm:text-lg">Recent Donations</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Your latest donation transactions
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="self-start sm:self-auto">
                  <Link href="/user/my-donations">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
              <CardContent>
                <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : recentDonations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No recent donations</div>
                ) : (
                  recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Heart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{donation.cause}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(donation.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">
                          {format(donation.amount)}
                        </p>
                        <Badge
                          variant={
                            donation.status === "Completed"
                              ? "default"
                              : "secondary"
                          }
                          className="mt-1"
                        >
                          {donation.status}
                        </Badge>
                      </div>
                      <Badge variant="outline">{donation.type}</Badge>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Impact Summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Communities Supported
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{communitiesSupported || 0}</p>
                <p className="text-sm text-muted-foreground">
                  Different communities benefited
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  This Year
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {format(thisYear)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Donated in {new Date().getFullYear()}
                </p>
              </CardContent>
            </Card>
          </div>
    </UserLayout>
  );
}

