<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDonationRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Allow both authenticated and guest donations
        return true;
    }

    public function rules(): array
    {
        return [
            'donor_name' => 'required|string|max:255',
            'donor_email' => 'required|email|max:255',
            'donor_phone' => 'nullable|string|max:20',
            'amount' => 'required|numeric|min:500',
            'type' => 'required|in:one-time',
            'payment_method' => 'required|in:payfast,card,bank,wallet',
            'cause' => 'nullable|string|max:255',
            'project' => 'nullable|string|max:255',
            'donation_type' => 'required|in:zakat,donation,qurbani',
            'meta'          => 'nullable|array',
        ];
    }
}

