<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDonationRequest;
use App\Http\Requests\UpdateDonationRequest;
use App\Http\Resources\DonationResource;
use App\Http\Resources\UserResource;
use App\Models\Donation;
use App\Services\DonationService;
use App\Services\PayFastService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DonationController extends Controller
{
    public function __construct(
        protected DonationService $donationService,
        protected PayFastService $payFastService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Donation::query();

        // If user is authenticated, show only their donations
        if ($request->user()) {
            $query->where('user_id', $request->user()->id);
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('cause')) {
            $query->where('cause', $request->cause);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $donations = $query->with(['payment', 'user'])->paginate(15);

        return DonationResource::collection($donations);
    }

    public function store(StoreDonationRequest $request): JsonResponse
    {
        $result = $this->donationService->createDonation(
            $request->validated(),
            $request->user()
        );

        $donation = $result['donation'];
        $user = $result['user'];
        $isNewUser = $result['is_new_user'];

        $response = [
            'success' => true,
            'message' => 'Donation created successfully',
            'data' => new DonationResource($donation),
        ];

        // If user is not already authenticated, generate and return auth token for auto-login
        // This handles both new users and existing users making donations while logged out
        if (!$request->user()) {
            $token = $user->createToken('auth-token')->plainTextToken;
            $response['token'] = $token;
            $response['user'] = new UserResource($user);
        }

        // If PayFast is enabled, generate PayFast payment form for all donations
        if ($this->payFastService->isEnabled()) {
            try {
                // Generate basket ID
                $basketId = $this->payFastService->generateBasketId('DON');

                // Store basket ID in payment record first
                $gatewayResponse = $donation->payment->gateway_response;
                if (is_string($gatewayResponse)) {
                    $gatewayResponse = json_decode($gatewayResponse, true) ?? [];
                }
                $gatewayResponse = array_merge($gatewayResponse ?? [], [
                    'basket_id' => $basketId,
                    'initiated_at' => now()->toDateTimeString(),
                ]);
                
                $donation->payment->update([
                    'transaction_id' => $basketId,
                    'gateway_response' => $gatewayResponse,
                ]);

                // Generate payment form HTML using the service
                $appUrl = rtrim(config('app.url'), '/');
                $formResult = $this->payFastService->generatePaymentForm([
                    'order_number' => $basketId,
                    'amount' => $donation->amount,
                    'currency' => 'PKR',
                    'customer_mobile' => $donation->donor_phone ?? '03000000000',
                    'customer_email' => $donation->donor_email,
                    'description' => 'Donation to ' . ($donation->cause ?? 'General Fund'),
                    'merchant_name' => \App\Models\Setting::get('foundationName', 'Al Gohar Foundation'),
                    'success_url' => $appUrl . '/api/payments/payfast/success',
                    'failure_url' => $appUrl . '/api/payments/payfast/failure',
                    'checkout_url' => $appUrl . '/api/payments/payfast/checkout',
                ]);

                // Update payment record with token if available
                if (isset($formResult['payment_form_html'])) {
                    // Extract token from form HTML for storage (optional, for debugging)
                    preg_match('/name="TOKEN" value="([^"]+)"/', $formResult['payment_form_html'], $tokenMatches);
                    if (isset($tokenMatches[1])) {
                        $gatewayResponse = $donation->payment->gateway_response;
                        if (is_string($gatewayResponse)) {
                            $gatewayResponse = json_decode($gatewayResponse, true) ?? [];
                        }
                        $gatewayResponse = array_merge($gatewayResponse ?? [], [
                            'token' => $tokenMatches[1],
                            'form_generated_at' => now()->toDateTimeString(),
                        ]);
                        
                        $donation->payment->update([
                            'gateway_response' => $gatewayResponse,
                        ]);
                    }
                }

                // Add PayFast payment form HTML to response
                $response['payfast'] = [
                    'payment_form_html' => $formResult['payment_form_html'] ?? null,
                    'basket_id' => $basketId,
                    'amount' => (string) $donation->amount,
                    'currency' => 'PKR',
                ];
            } catch (\Exception $e) {
                // Log detailed error for debugging
                \Log::error('PayFast initiation error in DonationController', [
                    'donation_id' => $donation->id,
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ]);
                
                // Extract meaningful error message
                $errorMessage = $e->getMessage();
                
                // Provide user-friendly error messages
                if (str_contains($errorMessage, 'not configured') || str_contains($errorMessage, 'not enabled')) {
                    $errorMessage = 'PayFast payment gateway is not configured. Please contact the administrator.';
                } elseif (str_contains($errorMessage, 'ACCESS_TOKEN')) {
                    $errorMessage = 'Failed to connect to PayFast. Please verify your PayFast credentials are correct.';
                } elseif (str_contains($errorMessage, 'SSL') || str_contains($errorMessage, 'certificate')) {
                    $errorMessage = 'SSL connection error. Please contact support.';
                } elseif (str_contains($errorMessage, 'timeout')) {
                    $errorMessage = 'PayFast service is not responding. Please try again later.';
                }
                
                // Add error to response for frontend handling
                $response['payfast'] = [
                    'error' => $errorMessage,
                    'payment_form_html' => null,
                    'debug' => config('app.debug') ? [
                        'original_error' => $e->getMessage(),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ] : null,
                ];
            }
        }

        return response()->json($response, 201);
    }

    public function show(Donation $donation): JsonResponse
    {
        $this->authorize('view', $donation);

        return response()->json([
            'success' => true,
            'data' => new DonationResource($donation->load(['payment', 'user'])),
        ]);
    }

    public function update(UpdateDonationRequest $request, Donation $donation): JsonResponse
    {
        $this->authorize('update', $donation);

        $donation->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Donation updated successfully',
            'data' => new DonationResource($donation->fresh(['payment', 'user'])),
        ]);
    }
}

