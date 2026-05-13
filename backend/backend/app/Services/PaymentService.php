<?php

namespace App\Services;

use App\Mail\Admin\PaymentCompletedNotification;
use App\Mail\Admin\PaymentFailedNotification;
use App\Mail\User\PaymentConfirmation;
use App\Mail\User\DonationStatusUpdate;
use App\Models\Payment;
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class PaymentService
{
    public function __construct(
        protected AdminNotificationService $adminNotificationService
    ) {}

    public function processPayment(Payment $payment, array $gatewayResponse = []): Payment
    {
        return DB::transaction(function () use ($payment, $gatewayResponse) {
            $payment->update([
                'status' => 'completed',
                'gateway_response' => $gatewayResponse,
                'processed_at' => now(),
            ]);

            // Update donation status
            if ($payment->donation) {
                $payment->donation->update(['status' => 'completed']);
            }

            $payment = $payment->fresh(['donation', 'user']);

            // Notify admins about payment completion
            try {
                $this->adminNotificationService->notifyAdmins(
                    new PaymentCompletedNotification($payment)
                );
            } catch (\Exception $e) {
                // Log error but don't fail the transaction
                \Log::error('Failed to send payment completed notification', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // Send payment confirmation email to user
            try {
                if ($payment->user && $payment->user->email) {
                    Mail::to($payment->user->email)->send(new PaymentConfirmation($payment));
                } elseif ($payment->donation && $payment->donation->donor_email) {
                    // Fallback to donor_email if user relationship doesn't exist
                    Mail::to($payment->donation->donor_email)->send(new PaymentConfirmation($payment));
                }
            } catch (\Exception $e) {
                // Log error but don't fail the transaction
                \Log::error('Failed to send payment confirmation email to user', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return $payment;
        });
    }

    public function failPayment(Payment $payment, array $gatewayResponse = []): Payment
    {
        return DB::transaction(function () use ($payment, $gatewayResponse) {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $gatewayResponse,
            ]);

            // Update donation status
            if ($payment->donation) {
                $payment->donation->update(['status' => 'failed']);
            }

            $payment = $payment->fresh(['donation', 'user']);

            // Notify admins about payment failure
            try {
                $this->adminNotificationService->notifyAdmins(
                    new PaymentFailedNotification($payment)
                );
            } catch (\Exception $e) {
                // Log error but don't fail the transaction
                \Log::error('Failed to send payment failed notification', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // Send status update email to user about payment failure
            try {
                if ($payment->donation) {
                    $donation = $payment->donation->fresh();
                    if ($payment->user && $payment->user->email) {
                        Mail::to($payment->user->email)->send(new DonationStatusUpdate($donation, 'pending', 'failed'));
                    } elseif ($donation->donor_email) {
                        // Fallback to donor_email if user relationship doesn't exist
                        Mail::to($donation->donor_email)->send(new DonationStatusUpdate($donation, 'pending', 'failed'));
                    }
                }
            } catch (\Exception $e) {
                // Log error but don't fail the transaction
                \Log::error('Failed to send payment failure email to user', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return $payment;
        });
    }
}

