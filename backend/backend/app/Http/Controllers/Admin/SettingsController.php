<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class SettingsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $group = $request->get('group', 'all');
        
        $query = Setting::query();
        
        if ($group !== 'all') {
            $query->where('group', $group);
        }
        
        $settings = $query->get()->mapWithKeys(function ($setting) {
            return [$setting->key => Setting::castValue($setting->value, $setting->type ?? 'string')];
        });

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        $updated = [];
        
        foreach ($validated['settings'] as $key => $value) {
            $setting = Setting::where('key', $key)->first();
            
            if ($setting) {
                $type = $setting->type;
                $group = $setting->group;
            } else {
                // Determine type and group from key
                $type = $this->determineType($value);
                $group = $this->determineGroup($key);
            }
            
            Setting::set($key, $value, $type, $group);
            $updated[$key] = Setting::castValue(
                is_array($value) || is_object($value) ? json_encode($value) : $value,
                $type
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => $updated,
        ]);
    }

    protected function determineType($value): string
    {
        if (is_bool($value)) {
            return 'boolean';
        }
        if (is_int($value)) {
            return 'integer';
        }
        if (is_array($value) || is_object($value)) {
            return 'json';
        }
        return 'string';
    }

    protected function determineGroup(string $key): string
    {
        if (str_starts_with($key, 'foundation') || str_starts_with($key, 'website') || 
            str_starts_with($key, 'timezone') || str_starts_with($key, 'currency') || 
            str_starts_with($key, 'language') || str_starts_with($key, 'description') ||
            str_starts_with($key, 'contact') || str_starts_with($key, 'officeHours') ||
            str_starts_with($key, 'whatsapp')) {
            return 'general';
        }
        
        if (str_starts_with($key, 'stripe') || str_starts_with($key, 'jazzcash') || 
            str_starts_with($key, 'payfast') || str_starts_with($key, 'bank') || 
            str_starts_with($key, 'payment') || str_starts_with($key, 'minimumDonation')) {
            return 'payment';
        }
        
        if (str_starts_with($key, 'smtp') || str_starts_with($key, 'email') || 
            str_starts_with($key, 'fromEmail') || str_starts_with($key, 'fromName') || 
            str_starts_with($key, 'replyTo')) {
            return 'email';
        }
        
        if (str_starts_with($key, 'twoFactor') || str_starts_with($key, 'session') || 
            str_starts_with($key, 'password') || str_starts_with($key, 'maxLogin') || 
            str_starts_with($key, 'lockout') || str_starts_with($key, 'audit') || 
            str_starts_with($key, 'ipWhitelist') || str_starts_with($key, 'allowedIps')) {
            return 'security';
        }
        
        if (str_starts_with($key, 'emailNotifications') || str_starts_with($key, 'donationNotifications') || 
            str_starts_with($key, 'userRegistrationNotifications') || str_starts_with($key, 'paymentNotifications') || 
            str_starts_with($key, 'systemAlerts') || str_starts_with($key, 'weeklyReports') || 
            str_starts_with($key, 'monthlyReports') || str_starts_with($key, 'smsNotifications')) {
            return 'notifications';
        }
        
        if (str_starts_with($key, 'maintenance') || str_starts_with($key, 'allowRegistration') || 
            str_starts_with($key, 'requireEmailVerification') || str_starts_with($key, 'enableAnalytics') || 
            str_starts_with($key, 'enableErrorReporting') || str_starts_with($key, 'logLevel') || 
            str_starts_with($key, 'cacheEnabled') || str_starts_with($key, 'apiRateLimit')) {
            return 'system';
        }
        
        if (str_starts_with($key, 'autoBackup') || str_starts_with($key, 'backupFrequency') || 
            str_starts_with($key, 'backupRetention') || str_starts_with($key, 'backupLocation') || 
            str_starts_with($key, 'lastBackup')) {
            return 'backup';
        }
        
        return 'general';
    }

    public function getContactDetails(): JsonResponse
    {
        // Get all contact-related settings
        $contactSettings = Setting::whereIn('key', [
            'foundationAddress',
            'contactPhone1',
            'contactPhone2',
            'contactPhone3',
            'contactWhatsapp',
            'contactEmail1',
            'contactEmail2',
            'contactEmailContact',
            'contactEmailDonations',
            'contactEmailVolunteer',
            'contactEmailMedia',
            'officeHours',
            'foundationEmail', // Fallback for primary email
            'foundationPhone', // Fallback for primary phone
            'whatsappButtonEnabled', // WhatsApp button settings
            'whatsappNumber',
            'contactLatitude', // Map coordinates
            'contactLongitude', // Map coordinates
        ])->get()->mapWithKeys(function ($setting) {
            return [$setting->key => Setting::castValue($setting->value, $setting->type ?? 'string')];
        });

        // Format office hours as array if it's a string with newlines
        $officeHours = [];
        if (isset($contactSettings['officeHours'])) {
            if (is_string($contactSettings['officeHours'])) {
                $officeHours = array_filter(
                    array_map('trim', explode("\n", $contactSettings['officeHours'])),
                    function($line) {
                        return !empty($line);
                    }
                );
            } elseif (is_array($contactSettings['officeHours'])) {
                $officeHours = array_filter($contactSettings['officeHours'], function($line) {
                    return !empty($line) && trim($line) !== '';
                });
            }
        }

        // Build phones array (filter out empty values)
        $phones = array_filter([
            $contactSettings['contactPhone1'] ?? null,
            $contactSettings['contactPhone2'] ?? null,
            $contactSettings['contactPhone3'] ?? null,
        ], function($value) {
            return !empty($value) && trim($value) !== '';
        });

        // If no contact phones but foundationPhone exists, use it
        if (empty($phones) && !empty($contactSettings['foundationPhone'])) {
            $phones = [$contactSettings['foundationPhone']];
        }

        // Build emails array (filter out empty values)
        $emails = array_filter([
            $contactSettings['contactEmail1'] ?? null,
            $contactSettings['contactEmail2'] ?? null,
        ], function($value) {
            return !empty($value) && trim($value) !== '';
        });

        // If no contact emails but foundationEmail exists, use it
        if (empty($emails) && !empty($contactSettings['foundationEmail'])) {
            $emails = [$contactSettings['foundationEmail']];
        }

        // Get WhatsApp number with fallback
        $whatsapp = !empty($contactSettings['contactWhatsapp']) 
            ? $contactSettings['contactWhatsapp'] 
            : (!empty($contactSettings['contactPhone1']) 
                ? $contactSettings['contactPhone1'] 
                : (!empty($contactSettings['foundationPhone']) ? $contactSettings['foundationPhone'] : null));

        // Get WhatsApp button settings
        $whatsappButtonEnabled = isset($contactSettings['whatsappButtonEnabled']) 
            ? $contactSettings['whatsappButtonEnabled'] 
            : true; // Default to enabled
        
        // Get WhatsApp number for button (prefer whatsappNumber setting, then fallback to contactWhatsapp)
        $whatsappNumber = !empty($contactSettings['whatsappNumber']) 
            ? $contactSettings['whatsappNumber'] 
            : $whatsapp;

        // Get contact email with fallback
        $contactEmail = !empty($contactSettings['contactEmailContact'])
            ? $contactSettings['contactEmailContact']
            : (!empty($contactSettings['contactEmail1'])
                ? $contactSettings['contactEmail1']
                : (!empty($contactSettings['foundationEmail']) ? $contactSettings['foundationEmail'] : null));

        return response()->json([
            'success' => true,
            'data' => [
                'address' => $contactSettings['foundationAddress'] ?? '',
                'phones' => array_values($phones),
                'whatsapp' => $whatsapp,
                'emails' => array_values($emails),
                'contactEmail' => $contactEmail,
                'donationsEmail' => !empty($contactSettings['contactEmailDonations']) ? $contactSettings['contactEmailDonations'] : null,
                'volunteerEmail' => !empty($contactSettings['contactEmailVolunteer']) ? $contactSettings['contactEmailVolunteer'] : null,
                'mediaEmail' => !empty($contactSettings['contactEmailMedia']) ? $contactSettings['contactEmailMedia'] : null,
                'officeHours' => array_values($officeHours),
                // WhatsApp Button Settings
                'whatsappButtonEnabled' => $whatsappButtonEnabled,
                'whatsappNumber' => $whatsappNumber,
                // Map Coordinates
                'latitude' => !empty($contactSettings['contactLatitude']) ? (float)$contactSettings['contactLatitude'] : null,
                'longitude' => !empty($contactSettings['contactLongitude']) ? (float)$contactSettings['contactLongitude'] : null,
                // For backward compatibility
                'phone1' => !empty($contactSettings['contactPhone1']) ? $contactSettings['contactPhone1'] : (!empty($contactSettings['foundationPhone']) ? $contactSettings['foundationPhone'] : null),
                'phone2' => !empty($contactSettings['contactPhone2']) ? $contactSettings['contactPhone2'] : null,
                'phone3' => !empty($contactSettings['contactPhone3']) ? $contactSettings['contactPhone3'] : null,
                'email1' => !empty($contactSettings['contactEmail1']) ? $contactSettings['contactEmail1'] : (!empty($contactSettings['foundationEmail']) ? $contactSettings['foundationEmail'] : null),
                'email2' => !empty($contactSettings['contactEmail2']) ? $contactSettings['contactEmail2'] : null,
            ],
        ]);
    }

    public function sendTestEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'settings' => 'sometimes|array',
        ]);

        $testEmail = $validated['email'];
        $emailSettings = $validated['settings'] ?? [];

        // Get email settings from request or from database
        if (empty($emailSettings)) {
            $emailSettings = [
                'smtpEnabled' => Setting::get('smtpEnabled', true),
                'smtpHost' => Setting::get('smtpHost', config('mail.mailers.smtp.host')),
                'smtpPort' => Setting::get('smtpPort', config('mail.mailers.smtp.port')),
                'smtpUsername' => Setting::get('smtpUsername', config('mail.mailers.smtp.username')),
                'smtpPassword' => Setting::get('smtpPassword', config('mail.mailers.smtp.password')),
                'smtpEncryption' => Setting::get('smtpEncryption', config('mail.mailers.smtp.encryption')),
                'fromEmail' => Setting::get('fromEmail', config('mail.from.address')),
                'fromName' => Setting::get('fromName', config('mail.from.name')),
            ];
        }

        // Check if SMTP is enabled
        if (!($emailSettings['smtpEnabled'] ?? true)) {
            return response()->json([
                'success' => false,
                'message' => 'SMTP is not enabled. Please enable SMTP first.',
            ], 400);
        }

        // Validate required SMTP settings
        if (empty($emailSettings['smtpHost']) || empty($emailSettings['smtpPort'])) {
            return response()->json([
                'success' => false,
                'message' => 'SMTP host and port are required.',
            ], 400);
        }

        if (empty($emailSettings['smtpUsername']) || empty($emailSettings['smtpPassword'])) {
            return response()->json([
                'success' => false,
                'message' => 'SMTP username and password are required.',
            ], 400);
        }

        try {
            // Temporarily configure mail settings for this request
            Config::set('mail.mailers.smtp.host', $emailSettings['smtpHost']);
            Config::set('mail.mailers.smtp.port', $emailSettings['smtpPort']);
            Config::set('mail.mailers.smtp.username', $emailSettings['smtpUsername']);
            Config::set('mail.mailers.smtp.password', $emailSettings['smtpPassword']);
            Config::set('mail.mailers.smtp.encryption', $emailSettings['smtpEncryption'] ?? 'tls');
            Config::set('mail.from.address', $emailSettings['fromEmail'] ?? config('mail.from.address'));
            Config::set('mail.from.name', $emailSettings['fromName'] ?? config('mail.from.name'));

            // Also set via app config to ensure it's applied
            app()['config']->set('mail.mailers.smtp.host', $emailSettings['smtpHost']);
            app()['config']->set('mail.mailers.smtp.port', $emailSettings['smtpPort']);
            app()['config']->set('mail.mailers.smtp.username', $emailSettings['smtpUsername']);
            app()['config']->set('mail.mailers.smtp.password', $emailSettings['smtpPassword']);
            app()['config']->set('mail.mailers.smtp.encryption', $emailSettings['smtpEncryption'] ?? 'tls');
            app()['config']->set('mail.from.address', $emailSettings['fromEmail'] ?? config('mail.from.address'));
            app()['config']->set('mail.from.name', $emailSettings['fromName'] ?? config('mail.from.name'));

            // Get the from email and name
            $fromEmail = $emailSettings['fromEmail'] ?? config('mail.from.address');
            $fromName = $emailSettings['fromName'] ?? config('mail.from.name');

            // Send test email
            Mail::raw('This is a test email from Al Gohar Foundation. Your email configuration is working correctly!', function ($message) use ($testEmail, $fromEmail, $fromName) {
                $message->to($testEmail)
                        ->subject('Test Email - Al Gohar Foundation');
                
                if (!empty($fromEmail)) {
                    $message->from($fromEmail, $fromName);
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Test email sent successfully to ' . $testEmail,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send test email: ' . $e->getMessage(), [
                'exception' => $e,
                'email_settings' => [
                    'host' => $emailSettings['smtpHost'] ?? null,
                    'port' => $emailSettings['smtpPort'] ?? null,
                    'username' => $emailSettings['smtpUsername'] ?? null,
                ],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send test email: ' . $e->getMessage(),
            ], 500);
        }
    }
}

