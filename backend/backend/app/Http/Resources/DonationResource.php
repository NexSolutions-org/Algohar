<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'donor_name' => $this->donor_name,
            'donor_email' => $this->donor_email,
            'donor_phone' => $this->donor_phone,
            'amount' => (float) $this->amount,
            'type' => $this->type,
            'frequency' => $this->frequency,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'cause' => $this->cause,
            'project' => $this->project,
            'donation_type' => $this->donation_type,
            'transaction_id' => $this->transaction_id,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'payment' => $this->whenLoaded('payment', function () {
                return new PaymentResource($this->payment);
            }),
        ];
    }
}

