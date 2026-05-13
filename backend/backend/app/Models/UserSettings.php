<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email_notifications',
        'donation_receipts',
        'monthly_reports',
        'campaign_updates',
        'impact_stories',
        'sms_notifications',
        'profile_visibility',
        'show_donation_amount',
        'show_donation_history',
    ];

    protected $casts = [
        'email_notifications' => 'boolean',
        'donation_receipts' => 'boolean',
        'monthly_reports' => 'boolean',
        'campaign_updates' => 'boolean',
        'impact_stories' => 'boolean',
        'sms_notifications' => 'boolean',
        'show_donation_amount' => 'boolean',
        'show_donation_history' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

