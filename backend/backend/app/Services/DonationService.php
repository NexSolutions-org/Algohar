<?php

namespace App\Services;

use App\Mail\Admin\NewDonationNotification;
use App\Mail\Admin\NewUserNotification;
use App\Mail\User\DonationConfirmation;
use App\Mail\User\DonationStatusUpdate;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class DonationService
{
    public function __construct(
        protected AdminNotificationService $adminNotificationService
    ) {}

    public function createDonation(array $data, ?User $user = null, ?string $screenshotPath = null): array
    {
        return DB::transaction(function () use ($data, $user, $screenshotPath) {
            $isNewUser = false;
            
            // If user is not provided, check if user exists by email, otherwise create one
            if (!$user) {
                $user = User::firstOrCreate(
                    ['email' => $data['donor_email']],
                    [
                        'name' => $data['donor_name'],
                        'phone' => $data['donor_phone'] ?? null,
                        'role' => 'user',
                        'password' => null, // Users don't have passwords
                    ]
                );
                
                // Check if user was just created (wasRecentlyCreated is set by firstOrCreate)
                $isNewUser = $user->wasRecentlyCreated;

                // Notify admins about new user registration
                if ($isNewUser) {
                    try {
                        $this->adminNotificationService->notifyAdmins(
                            new NewUserNotification($user)
                        );
                    } catch (\Exception $e) {
                        // Log error but don't fail the transaction
                        \Log::error('Failed to send new user notification', [
                            'user_id' => $user->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            }

            // Create donation
            $donation = Donation::create([
                'user_id'            => $user->id,
                'donor_name'         => $data['donor_name'],
                'donor_email'        => $data['donor_email'],
                'donor_phone'        => $data['donor_phone'] ?? null,
                'amount'             => $data['amount'],
                'type'               => $data['type'],
                'frequency'          => $data['frequency'] ?? null,
                'payment_method'     => $data['payment_method'],
                'status'             => 'pending',
                'cause'              => $data['cause'] ?? null,
                'project'            => $data['project'] ?? null,
                'donation_type'      => $data['donation_type'] ?? null,
                'transaction_id'     => 'DON-' . strtoupper(Str::random(8)),
                'payment_screenshot' => $screenshotPath,
            ]);

            // Create payment record
            $payment = Payment::create([
                'donation_id' => $donation->id,
                'user_id' => $user->id,
                'amount' => $data['amount'],
                'status' => 'pending',
                'transaction_id' => 'PAY-' . strtoupper(Str::random(8)),
            ]);

            // Link payment to donation
            $donation->update(['payment_id' => $payment->id]);

            // Refresh donation with relationships
            $donation = $donation->fresh(['payment', 'user']);

            // Notify admins about new donation
            try {
                $this->adminNotificationService->notifyAdmins(
                    new NewDonationNotification($donation)
                );
            } catch (\Exception $e) {
                // Log error but don't fail the transaction
                \Log::error('Failed to send new donation notification', [
                    'donation_id' => $donation->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // Send confirmation email to user
            try {
                Mail::to($user->email)->send(new DonationConfirmation($donation));
            } catch (\Exception $e) {
                // Log error but don't fail the transaction
                \Log::error('Failed to send donation confirmation email to user', [
                    'donation_id' => $donation->id,
                    'user_email' => $user->email,
                    'error' => $e->getMessage(),
                ]);
            }

            return [
                'donation' => $donation,
                'user' => $user,
                'is_new_user' => $isNewUser,
            ];
        });
    }

    public function updateDonationStatus(Donation $donation, string $status): Donation
    {
        $oldStatus = $donation->status;
        $donation->update(['status' => $status]);

        // Update payment status accordingly
        if ($donation->payment) {
            $paymentStatus = match ($status) {
                'completed' => 'completed',
                'failed' => 'failed',
                'cancelled' => 'failed',
                default => 'pending',
            };

            $donation->payment->update([
                'status' => $paymentStatus,
                'processed_at' => $paymentStatus === 'completed' ? now() : null,
            ]);
        }

        $donation = $donation->fresh(['payment']);

        // Notify admins about status change if status actually changed
        if ($oldStatus !== $status) {
            try {
                $this->adminNotificationService->notifyAdmins(
                    new \App\Mail\Admin\DonationStatusChangedNotification($donation, $oldStatus, $status)
                );
            } catch (\Exception $e) {
                // Log error but don't fail the operation
                \Log::error('Failed to send donation status change notification', [
                    'donation_id' => $donation->id,
                    'old_status' => $oldStatus,
                    'new_status' => $status,
                    'error' => $e->getMessage(),
                ]);
            }

            // Send status update email to user
            try {
                if ($donation->user && $donation->user->email) {
                    Mail::to($donation->user->email)->send(new DonationStatusUpdate($donation, $oldStatus, $status));
                } elseif ($donation->donor_email) {
                    // Fallback to donor_email if user relationship doesn't exist
                    Mail::to($donation->donor_email)->send(new DonationStatusUpdate($donation, $oldStatus, $status));
                }
            } catch (\Exception $e) {
                // Log error but don't fail the operation
                \Log::error('Failed to send donation status update email to user', [
                    'donation_id' => $donation->id,
                    'old_status' => $oldStatus,
                    'new_status' => $status,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $donation;
    }
}

