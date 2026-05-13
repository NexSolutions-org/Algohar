<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DonationResource;
use App\Http\Resources\UserResource;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function index(): JsonResponse
    {
        $stats = $this->dashboardService->getAdminDashboardStats();

        // Transform recent donations and users using resources
        if (isset($stats['recent_donations'])) {
            $stats['recent_donations'] = DonationResource::collection($stats['recent_donations']);
        }

        if (isset($stats['recent_users'])) {
            $stats['recent_users'] = UserResource::collection($stats['recent_users']);
        }

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

