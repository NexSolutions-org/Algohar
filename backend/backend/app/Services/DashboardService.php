<?php

namespace App\Services;

use App\Models\Donation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getUserDashboardStats(User $user): array
    {
        $donations = $user->donations();

        $totalDonations = (float) $donations->where('status', 'completed')->sum('amount');
        $thisMonth = (float) $donations
            ->where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        $totalImpact = $donations->where('status', 'completed')->count();

        $recentDonations = $donations
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get donation trends (last 6 months)
        $donationTrends = $donations
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(6))
            ->get()
            ->groupBy(function ($donation) {
                return $donation->created_at->format('M');
            })
            ->map(function ($monthDonations, $month) {
                return [
                    'month' => $month,
                    'amount' => (float) $monthDonations->sum('amount'),
                ];
            })
            ->values();

        return [
            'total_donations' => $totalDonations,
            'this_month' => $thisMonth,
            'total_impact' => $totalImpact,
            'recent_donations' => $recentDonations,
            'donation_trends' => $donationTrends,
        ];
    }

    public function getAdminDashboardStats(): array
    {
        $totalDonations = (float) Donation::where('status', 'completed')->sum('amount');
        $thisMonth = (float) Donation::where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        $totalUsers = User::where('role', 'user')->count();
        $newUsersThisMonth = User::where('role', 'user')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $pendingDonations = Donation::where('status', 'pending')->count();

        $recentDonations = Donation::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $recentUsers = User::where('role', 'user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Donation trends (last 6 months)
        $donationTrends = Donation::where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(6))
            ->get()
            ->groupBy(function ($donation) {
                return $donation->created_at->format('M');
            })
            ->map(function ($monthDonations, $month) {
                return [
                    'month' => $month,
                    'amount' => (float) $monthDonations->sum('amount'),
                    'donations' => $monthDonations->count(),
                ];
            })
            ->values();

        // User growth (last 6 months)
        $userGrowth = User::where('role', 'user')
            ->where('created_at', '>=', now()->subMonths(6))
            ->get()
            ->groupBy(function ($user) {
                return $user->created_at->format('M');
            })
            ->map(function ($monthUsers, $month) {
                return [
                    'month' => $month,
                    'users' => $monthUsers->count(),
                ];
            })
            ->values();

        return [
            'total_donations' => $totalDonations,
            'this_month' => $thisMonth,
            'total_users' => $totalUsers,
            'new_users_this_month' => $newUsersThisMonth,
            'pending_donations' => $pendingDonations,
            'recent_donations' => $recentDonations,
            'recent_users' => $recentUsers,
            'donation_trends' => $donationTrends,
            'user_growth' => $userGrowth,
        ];
    }
}

