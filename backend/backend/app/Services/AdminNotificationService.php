<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminNotificationService
{
    /**
     * Send notification email to all admin users
     *
     * @param Mailable $mailable
     * @return void
     */
    public function notifyAdmins(Mailable $mailable): void
    {
        try {
            $admins = User::where('role', 'admin')->get();

            if ($admins->isEmpty()) {
                Log::warning('No admin users found to send notification');
                return;
            }

            foreach ($admins as $admin) {
                try {
                    Mail::to($admin->email)->send($mailable);
                } catch (\Exception $e) {
                    Log::error('Failed to send admin notification email', [
                        'admin_email' => $admin->email,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    // Continue sending to other admins even if one fails
                }
            }
        } catch (\Exception $e) {
            Log::error('AdminNotificationService: Failed to send notifications', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            // Don't throw exception - email failures shouldn't break main flow
        }
    }
}

