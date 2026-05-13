<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UpdateSettingsRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserSettingsResource;
use App\Models\UserSettings;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function dashboard(Request $request): JsonResponse
    {
        $stats = $this->dashboardService->getUserDashboardStats($request->user());

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new UserResource($request->user()->load('settings')),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => new UserResource($user->fresh('settings')),
        ]);
    }

    public function settings(Request $request): JsonResponse
    {
        $settings = $request->user()->settings ?? UserSettings::create([
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => new UserSettingsResource($settings),
        ]);
    }

    public function updateSettings(UpdateSettingsRequest $request): JsonResponse
    {
        $user = $request->user();
        $settings = $user->settings ?? UserSettings::create(['user_id' => $user->id]);

        $settings->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => new UserSettingsResource($settings->fresh()),
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        // If user has a password, verify current password
        if ($user->hasPassword()) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect',
                ], 422);
            }
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }
}

