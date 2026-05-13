<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\DonationController as AdminDonationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Developer\AuthController as DeveloperAuthController;
use App\Http\Controllers\Developer\DeveloperController;
use App\Http\Controllers\PayFastController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ContactController;

// Public Authentication Routes (User - OTP based)
Route::prefix('auth')->group(function () {
    // sendOtp/verifyOtp use session state (StartSession, cookies)
    Route::middleware('session')->group(function () {
        Route::post('/send-otp', [AuthController::class, 'sendOtp']);
        Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

        // Once verified, use session-based auth for user endpoints
        Route::middleware(['session', 'auth', 'active'])->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });
});

// Admin Authentication Routes (Email/Password based)
Route::prefix('admin/auth')->group(function () {
    // Use session middleware so session store is available on login
    Route::middleware('session')->group(function () {
        Route::post('/login', [AdminAuthController::class, 'login']);
        Route::post('/forgot-password', [AdminAuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AdminAuthController::class, 'resetPassword']);

        Route::middleware(['session', 'auth', 'active'])->group(function () {
            Route::post('/logout', [AdminAuthController::class, 'logout']);
            Route::get('/me', [AdminAuthController::class, 'me']);
        });
    });
});

// Developer Authentication Routes (Email/Password based)
Route::prefix('developer/auth')->group(function () {
    // Use session middleware so session store is available on login
    Route::middleware('session')->group(function () {
        Route::post('/login', [DeveloperAuthController::class, 'login']);
        Route::post('/forgot-password', [DeveloperAuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [DeveloperAuthController::class, 'resetPassword']);

        Route::middleware(['session', 'auth', 'active'])->group(function () {
            Route::post('/logout', [DeveloperAuthController::class, 'logout']);
            Route::get('/me', [DeveloperAuthController::class, 'me']);
        });
    });
});

// Public Donation Route (allows guest donations - auto-creates user account)
Route::post('/donations', [DonationController::class, 'store']);

// Public Projects Route
Route::get('/projects', [ProjectController::class, 'index']);

// Public Analytics Route (for tracking events)
Route::post('/analytics/event', [AnalyticsController::class, 'track']);

// Public Contact Route
Route::post('/contact', [ContactController::class, 'store']);

// Public Contact Details Route
Route::get('/contact-details', [AdminSettingsController::class, 'getContactDetails']);

// Public Domain Block Status Route (for frontend to check)
Route::get('/domain-block-status', function () {
    try {
        $domainBlock = \App\Models\DomainBlock::getSettings();
        return response()->json([
            'success' => true,
            'is_enabled' => $domainBlock->is_enabled,
            'html_content' => $domainBlock->is_enabled ? $domainBlock->html_content : null,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => true,
            'is_enabled' => false,
            'html_content' => null,
        ]);
    }
});

// PayFast Payment Routes (public callbacks)
Route::prefix('payments/payfast')->group(function () {
    Route::post('/initiate', [PayFastController::class, 'initiate']);
    Route::get('/success', [PayFastController::class, 'success']);
    Route::get('/failure', [PayFastController::class, 'failure']);
    Route::get('/checkout', [PayFastController::class, 'checkout']); // Handle checkout/3D Secure redirects
    Route::post('/checkout', [PayFastController::class, 'checkout']); // Handle POST from PayFast
});

// Protected User Routes (session-based)
Route::middleware(['session', 'auth', 'active'])->group(function () {
    // Donations
    Route::get('/donations', [DonationController::class, 'index']);
    Route::get('/donations/{donation}', [DonationController::class, 'show']);
    Route::put('/donations/{donation}', [DonationController::class, 'update']);

    // User Dashboard & Profile
    Route::prefix('user')->group(function () {
        Route::get('/dashboard', [UserController::class, 'dashboard']);
        Route::get('/profile', [UserController::class, 'profile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::get('/settings', [UserController::class, 'settings']);
        Route::put('/settings', [UserController::class, 'updateSettings']);
        Route::put('/change-password', [UserController::class, 'changePassword']);
    });

    // Payment Methods
    Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
    Route::post('/payment-methods', [PaymentMethodController::class, 'store']);
    Route::delete('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy']);
    Route::put('/payment-methods/{paymentMethod}/default', [PaymentMethodController::class, 'setDefault']);
});

// Protected Admin Routes (session-based)
Route::middleware(['session', 'auth', 'active', 'admin'])->prefix('admin')->group(function () {
    // Admin Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    // Admin Users Management
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::get('/users/{user}', [AdminUserController::class, 'show']);
    Route::put('/users/{user}', [AdminUserController::class, 'update']);
    Route::put('/users/{user}/status', [AdminUserController::class, 'updateStatus']);
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);

    // Admin Donations Management
    Route::get('/donations', [AdminDonationController::class, 'index']);
    Route::get('/donations/{donation}', [AdminDonationController::class, 'show']);
    Route::put('/donations/{donation}', [AdminDonationController::class, 'update']);
    Route::put('/donations/{donation}/status', [AdminDonationController::class, 'updateStatus']);
    Route::delete('/donations/{donation}', [AdminDonationController::class, 'destroy']);

    // Admin Settings Management
    Route::get('/settings', [AdminSettingsController::class, 'index']);
    Route::put('/settings', [AdminSettingsController::class, 'update']);
    Route::post('/settings/test-email', [AdminSettingsController::class, 'sendTestEmail']);

    // PayFast Test Connection
    Route::post('/payments/payfast/test', [PayFastController::class, 'testConnection']);
});

// Protected Developer Routes (session-based)
Route::middleware(['session', 'auth', 'active', 'developer'])->prefix('developer')->group(function () {
    // Domain Block Management
    Route::get('/domain-block', [DeveloperController::class, 'getDomainBlock']);
    Route::put('/domain-block', [DeveloperController::class, 'updateDomainBlock']);
});

// Debug route (local only) to generate an admin token for testing
if (app()->environment('local')) {
    Route::get('/debug/generate-admin-token', function () {
        $user = App\Models\User::where('email', 'admin@algohar.org')->first();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Admin user not found.'], 404);
        }

        $plain = Str::random(60);
        $user->api_token = hash('sha256', $plain);
        $user->api_token_expires_at = now()->addDays(30);
        $user->save();

        return response()->json(['success' => true, 'token' => $plain]);
    });
}
