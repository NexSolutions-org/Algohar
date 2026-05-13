<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentMethodRequest;
use App\Http\Resources\PaymentMethodResource;
use App\Mail\Admin\PaymentMethodCreatedNotification;
use App\Mail\Admin\PaymentMethodDeletedNotification;
use App\Mail\Admin\PaymentMethodUpdatedNotification;
use App\Models\PaymentMethod;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentMethodController extends Controller
{
    public function __construct(
        protected AdminNotificationService $adminNotificationService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $paymentMethods = $request->user()
            ->paymentMethods()
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return PaymentMethodResource::collection($paymentMethods);
    }

    public function store(StorePaymentMethodRequest $request): JsonResponse
    {
        $data = $request->validated();

        // If this is set as default, unset other defaults
        if ($data['is_default'] ?? false) {
            $request->user()->paymentMethods()->update(['is_default' => false]);
        }

        // Extract last 4 digits for card
        if ($data['type'] === 'card' && isset($data['account_number'])) {
            $data['card_last_four'] = substr($data['account_number'], -4);
        }

        $paymentMethod = $request->user()->paymentMethods()->create($data);
        $paymentMethod->load('user');

        // Notify admins about payment method creation
        try {
            $this->adminNotificationService->notifyAdmins(
                new PaymentMethodCreatedNotification($paymentMethod)
            );
        } catch (\Exception $e) {
            Log::error('Failed to send payment method created notification', [
                'payment_method_id' => $paymentMethod->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment method added successfully',
            'data' => new PaymentMethodResource($paymentMethod),
        ], 201);
    }

    public function destroy(PaymentMethod $paymentMethod): JsonResponse
    {
        $this->authorize('delete', $paymentMethod);

        // Capture payment method details before deletion
        $paymentMethod->load('user');
        $user = $paymentMethod->user;
        $paymentMethodType = $paymentMethod->type;
        $paymentMethodProvider = $paymentMethod->provider ?? '';

        $paymentMethod->delete();

        // Notify admins about payment method deletion
        try {
            $this->adminNotificationService->notifyAdmins(
                new PaymentMethodDeletedNotification($user, $paymentMethodType, $paymentMethodProvider)
            );
        } catch (\Exception $e) {
            Log::error('Failed to send payment method deleted notification', [
                'user_id' => $user->id,
                'payment_method_type' => $paymentMethodType,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment method deleted successfully',
        ]);
    }

    public function setDefault(Request $request, PaymentMethod $paymentMethod): JsonResponse
    {
        $this->authorize('update', $paymentMethod);

        DB::transaction(function () use ($request, $paymentMethod) {
            // Unset all defaults
            $request->user()->paymentMethods()->update(['is_default' => false]);

            // Set this as default
            $paymentMethod->update(['is_default' => true]);
        });

        $paymentMethod = $paymentMethod->fresh(['user']);

        // Notify admins about payment method update
        try {
            $this->adminNotificationService->notifyAdmins(
                new PaymentMethodUpdatedNotification($paymentMethod, 'default-status-updated')
            );
        } catch (\Exception $e) {
            Log::error('Failed to send payment method updated notification', [
                'payment_method_id' => $paymentMethod->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Default payment method updated',
            'data' => new PaymentMethodResource($paymentMethod),
        ]);
    }
}

