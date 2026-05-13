<?php

namespace App\Services;

use App\Mail\Admin\NewUserNotification;
use App\Models\Otp;
use App\Models\User;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class OtpService
{
    public function __construct(
        protected AdminNotificationService $adminNotificationService
    ) {}

    public function generateAndSend(string $email): array
    {
        // Check if user exists, if not create one
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => explode('@', $email)[0], // Use email prefix as default name
                'role' => 'user',
                'password' => null, // Users don't have passwords
            ]
        );

        // Check if user was just created
        $isNewUser = $user->wasRecentlyCreated;

        // Notify admins about new user registration
        if ($isNewUser) {
            try {
                $this->adminNotificationService->notifyAdmins(
                    new NewUserNotification($user)
                );
            } catch (\Exception $e) {
                // Log error but don't fail the operation
                Log::error('Failed to send new user notification', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Generate OTP
        $otpCode = Otp::generate(6);
        
        // Expires in 10 minutes
        $expiresAt = now()->addMinutes(10);

        // Invalidate previous OTPs for this email
        Otp::where('email', $email)
            ->where('used', false)
            ->update(['used' => true]);

        // Create new OTP
        Otp::create([
            'email' => $email,
            'otp' => $otpCode,
            'expires_at' => $expiresAt,
            'used' => false,
        ]);

        // Send OTP via email
        try {
            $this->sendOtpEmail($email, $otpCode, $user->name);
            
            return [
                'success' => true,
                'message' => 'OTP sent successfully to your email.',
            ];
        } catch (\Exception $e) {
            Log::error('Failed to send OTP email: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Failed to send OTP. Please try again later.',
            ];
        }
    }

    public function verify(string $email, string $otp): array
    {
        $otpRecord = Otp::where('email', $email)
            ->where('otp', $otp)
            ->where('used', false)
            ->latest()
            ->first();

        if (!$otpRecord) {
            return [
                'success' => false,
                'message' => 'Invalid OTP code.',
            ];
        }

        if (!$otpRecord->isValid()) {
            return [
                'success' => false,
                'message' => 'OTP has expired. Please request a new one.',
            ];
        }

        // Mark OTP as used
        $otpRecord->markAsUsed();

        // Get user
        $user = User::where('email', $email)->first();

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found.',
            ];
        }

        // Check if user is active
        if ($user->status === 'inactive') {
            return [
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ];
        }

        if ($user->status === 'pending') {
            return [
                'success' => false,
                'message' => 'Your account is pending approval. Please wait for activation.',
            ];
        }

        return [
            'success' => true,
            'user' => $user,
        ];
    }

    private function sendOtpEmail(string $email, string $otp, string $name): void
    {
        Mail::to($email)->send(new OtpMail($otp, $name));
    }
}

