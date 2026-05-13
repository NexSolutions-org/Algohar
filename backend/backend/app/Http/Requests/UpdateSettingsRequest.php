<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'email_notifications' => 'sometimes|boolean',
            'donation_receipts' => 'sometimes|boolean',
            'monthly_reports' => 'sometimes|boolean',
            'campaign_updates' => 'sometimes|boolean',
            'impact_stories' => 'sometimes|boolean',
            'sms_notifications' => 'sometimes|boolean',
            'profile_visibility' => 'sometimes|in:public,private',
            'show_donation_amount' => 'sometimes|boolean',
            'show_donation_history' => 'sometimes|boolean',
        ];
    }
}

