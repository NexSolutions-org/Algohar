<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Payment;
use App\Models\Setting;
use App\Services\DonationService;
use App\Services\PayFastService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PayFastController extends Controller
{
    public function __construct(
        protected PayFastService $payFastService,
        protected PaymentService $paymentService,
        protected DonationService $donationService
    ) {
        // Constructor is intentionally empty - services are injected via dependency injection
    }

    /**
     * Test PayFast connection
     */
    public function testConnection(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'merchant_id' => 'required|string',
                'secured_key' => 'required|string',
                'mode' => 'required|string|in:sandbox,production',
            ]);

            $result = $this->payFastService->testConnection(
                $validated['merchant_id'],
                $validated['secured_key'],
                $validated['mode']
            );

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => $result['message'],
                    'data' => [
                        'basket_id' => $result['basket_id'] ?? null,
                        'mode' => $result['mode'] ?? null,
                        'url_used' => $result['url_used'] ?? null,
                    ],
                ]);
            } else {
                // Enhanced error reporting with detailed information
                $statusCode = $result['http_code'] ?? 400;
                
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                    'error' => $result['error'] ?? null,
                    'http_code' => $result['http_code'] ?? null,
                    'response' => $result['response'] ?? null,
                    'debug' => $result['debug'] ?? null,
                ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 400);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('PayFast test connection error', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to test connection: ' . $e->getMessage(),
                'error_details' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ] : null,
            ], 500);
        }
    }

    /**
     * Initiate PayFast payment
     */
    public function initiate(Request $request): JsonResponse
    {
        $request->validate([
            'donation_id' => 'required|exists:donations,id',
        ]);

        $donation = Donation::with(['payment', 'user'])->findOrFail($request->donation_id);

        if (!$this->payFastService->isEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'PayFast payment gateway is not enabled or configured. Please contact the administrator to configure PayFast credentials.',
            ], 400);
        }

        // Allow all payment methods to use PayFast
        // Removed restriction - all payments go through PayFast

        if ($donation->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Donation is not in pending status.',
            ], 400);
        }

        // Check if payment already has PayFast data that we can reuse
        $payment = $donation->payment;
        $existingPayFastData = null;
        
        if ($payment && $payment->gateway_response) {
            $gatewayResponse = is_string($payment->gateway_response) 
                ? json_decode($payment->gateway_response, true) 
                : $payment->gateway_response;
            
            if (isset($gatewayResponse['token']) && isset($gatewayResponse['basket_id'])) {
                $existingPayFastData = [
                    'basket_id' => $gatewayResponse['basket_id'],
                    'token' => $gatewayResponse['token'],
                ];
            }
        }

        try {
            // Generate basket ID (or reuse existing)
            $basketId = $existingPayFastData['basket_id'] ?? $this->payFastService->generateBasketId('DON');

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
                'merchant_name' => Setting::get('foundationName', 'Al Gohar Foundation'),
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

            Log::info('PayFast payment form created', [
                'donation_id' => $donation->id,
                'basket_id' => $basketId,
                'amount' => $donation->amount,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment form generated successfully',
                'data' => [
                    'payment_form_html' => $formResult['payment_form_html'],
                    'donation_id' => $donation->id,
                    'basket_id' => $basketId,
                    'amount' => (string) $donation->amount,
                    'currency' => 'PKR',
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('PayFast initiation error', [
                'donation_id' => $donation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Check if it's a configuration error
            if (str_contains($e->getMessage(), 'not configured') || str_contains($e->getMessage(), 'not enabled')) {
                return response()->json([
                    'success' => false,
                    'message' => 'PayFast payment gateway is not configured. Please contact the administrator to configure PayFast credentials.',
                    'details' => [
                        'payfast_enabled' => Setting::get('payfastEnabled', false),
                        'merchant_id_set' => !empty(Setting::get('payfastMerchantId', '')),
                        'secured_key_set' => !empty(Setting::get('payfastSecuredKey', '')),
                    ],
                ], 400);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate PayFast payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle PayFast success callback
     */
    public function success(Request $request)
    {
        // Log all callback data for debugging
        Log::info('PayFast success callback', [
            'method' => $request->method(),
            'all_params' => $request->all(),
            'query_params' => $request->query(),
            'post_params' => $request->post(),
        ]);

        $basketId = $request->get('basket_id') ?? $request->get('BASKET_ID');
        $errCode = $request->get('err_code') ?? $request->get('ERR_CODE', '');
        $errMsg = $request->get('err_msg') ?? $request->get('ERR_MSG', '');
        $transactionId = $request->get('transaction_id') ?? $request->get('TRANSACTION_ID', '');
        $orderDate = $request->get('order_date') ?? $request->get('ORDER_DATE', '');
        $validationHash = $request->get('validation_hash') ?? $request->get('VALIDATION_HASH', '');

        // Get frontend URL from config or use default
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        if (!$basketId) {
            return redirect($frontendUrl . '/payment/failure?message=' . urlencode('Invalid callback parameters.'));
        }

        // Find payment by basket_id (stored in transaction_id)
        $payment = Payment::where('transaction_id', $basketId)->first();

        if (!$payment) {
            Log::error('PayFast success: Payment not found', ['basket_id' => $basketId]);
            return redirect($frontendUrl . '/payment/failure?message=' . urlencode('Payment record not found.'));
        }

        $donation = $payment->donation;

        // Validate hash
        if (!$this->payFastService->validateHash($basketId, $errCode, $validationHash)) {
            Log::error('PayFast success: Hash validation failed', [
                'basket_id' => $basketId,
                'err_code' => $errCode,
            ]);

            $this->paymentService->failPayment($payment, [
                'error' => 'Hash validation failed',
                'err_code' => $errCode,
                'err_msg' => $errMsg,
            ]);

            return redirect($frontendUrl . '/payment/failure?message=' . urlencode('Payment verification failed.'));
        }

        // Check if payment was successful
        if ($this->payFastService->isSuccessCode($errCode)) {
            // Process successful payment
            $this->paymentService->processPayment($payment, [
                'transaction_id' => $transactionId,
                'basket_id' => $basketId,
                'err_code' => $errCode,
                'order_date' => $orderDate,
                'validated_at' => now()->toDateTimeString(),
            ]);

            return redirect($frontendUrl . '/payment/success?' . http_build_query([
                'transaction_id' => $transactionId,
                'basket_id' => $basketId,
                'donation_id' => $donation->id,
            ]));
        } else {
            // Payment failed - get user-friendly error message
            $errorMessage = $this->payFastService->getErrorMessage($errCode, $errMsg);
            
            // Log detailed error information
            Log::error('PayFast payment failed', [
                'basket_id' => $basketId,
                'err_code' => $errCode,
                'err_msg' => $errMsg,
                'transaction_id' => $transactionId,
                'payment_type' => $request->get('PaymentType'),
                'payment_name' => $request->get('PaymentName'),
            ]);
            
            $this->paymentService->failPayment($payment, [
                'err_code' => $errCode,
                'err_msg' => $errMsg,
                'error_message' => $errorMessage,
                'payment_type' => $request->get('PaymentType'),
                'payment_name' => $request->get('PaymentName'),
            ]);

            return redirect($frontendUrl . '/payment/failure?message=' . urlencode($errorMessage));
        }
    }

    /**
     * Handle PayFast failure callback
     */
    public function failure(Request $request)
    {
        $basketId = $request->get('basket_id');
        $errCode = $request->get('err_code', '');
        $errMsg = $request->get('err_msg', '');
        $validationHash = $request->get('validation_hash', '');

        // Log all callback data for debugging
        Log::info('PayFast failure callback', [
            'all_params' => $request->all(),
            'basket_id' => $basketId,
            'err_code' => $errCode,
            'err_msg' => $errMsg,
        ]);

        // Get frontend URL from config or use default
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        if ($basketId) {
            $payment = Payment::where('transaction_id', $basketId)->first();

            if ($payment) {
                // Validate hash if provided
                if ($validationHash && $this->payFastService->validateHash($basketId, $errCode, $validationHash)) {
                    $this->paymentService->failPayment($payment, [
                        'err_code' => $errCode,
                        'err_msg' => $errMsg,
                        'validated_at' => now()->toDateTimeString(),
                    ]);
                } else {
                    $this->paymentService->failPayment($payment, [
                        'err_code' => $errCode,
                        'err_msg' => $errMsg,
                        'hash_validation' => 'failed',
                    ]);
                }
            }
        }

        return redirect($frontendUrl . '/payment/failure?message=' . urlencode($errMsg ?: 'Payment was cancelled or failed.'));
    }

    /**
     * Handle PayFast checkout callback (for 3D Secure or additional verification)
     * This is called when PayFast redirects to CHECKOUT_URL
     */
    public function checkout(Request $request)
    {
        // Log all callback data for debugging
        Log::info('PayFast checkout callback', [
            'method' => $request->method(),
            'all_params' => $request->all(),
            'query_params' => $request->query(),
            'post_params' => $request->post(),
        ]);

        $basketId = $request->get('basket_id') ?? $request->get('BASKET_ID');
        $errCode = $request->get('err_code') ?? $request->get('ERR_CODE', '');
        $errMsg = $request->get('err_msg') ?? $request->get('ERR_MSG', '');
        $transactionId = $request->get('transaction_id') ?? $request->get('TRANSACTION_ID', '');
        $validationHash = $request->get('validation_hash') ?? $request->get('VALIDATION_HASH', '');

        // Get frontend URL from config or use default
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        // If we have a basket_id, try to find the payment
        if ($basketId) {
            $payment = Payment::where('transaction_id', $basketId)->first();

            if ($payment) {
                // Store checkout callback data
                $gatewayResponse = $payment->gateway_response;
                if (is_string($gatewayResponse)) {
                    $gatewayResponse = json_decode($gatewayResponse, true) ?? [];
                }
                $gatewayResponse = array_merge($gatewayResponse ?? [], [
                    'checkout_callback' => $request->all(),
                    'checkout_received_at' => now()->toDateTimeString(),
                ]);
                $payment->update(['gateway_response' => $gatewayResponse]);

                // If there's an error code, treat it as failure
                if ($errCode && !$this->payFastService->isSuccessCode($errCode)) {
                    $errorMessage = $this->payFastService->getErrorMessage($errCode, $errMsg ?: 'Payment verification failed during checkout');
                    
                    $this->paymentService->failPayment($payment, [
                        'err_code' => $errCode,
                        'err_msg' => $errMsg ?: 'Payment verification failed during checkout',
                        'error_message' => $errorMessage,
                        'source' => 'checkout_callback',
                    ]);

                    return redirect($frontendUrl . '/payment/failure?message=' . urlencode($errorMessage));
                }

                // If successful, redirect to success (PayFast will also call success callback)
                if ($this->payFastService->isSuccessCode($errCode)) {
                    return redirect($frontendUrl . '/payment/success?' . http_build_query([
                        'transaction_id' => $transactionId,
                        'basket_id' => $basketId,
                        'donation_id' => $payment->donation_id,
                    ]));
                }
            }
        }

        // Default: redirect to failure if we can't process
        // But also log that we received a checkout callback we couldn't process
        Log::warning('PayFast checkout callback received but could not process', [
            'basket_id' => $basketId,
            'all_params' => $request->all(),
        ]);

        return redirect($frontendUrl . '/payment/failure?message=' . urlencode('Payment processing error. Please contact support if this persists.'));
    }
}

