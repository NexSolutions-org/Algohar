<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSettingsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'email_notifications' => $this->email_notifications,
            'donation_receipts' => $this->donation_receipts,
            'monthly_reports' => $this->monthly_reports,
            'campaign_updates' => $this->campaign_updates,
            'impact_stories' => $this->impact_stories,
            'sms_notifications' => $this->sms_notifications,
            'profile_visibility' => $this->profile_visibility,
            'show_donation_amount' => $this->show_donation_amount,
            'show_donation_history' => $this->show_donation_history,
        ];
    }
}

