<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'role' => $this->role,
            'status' => $this->status ?? 'active',
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'total_donations' => (float) ($this->donations_sum_amount ?? 0),
            'settings' => $this->whenLoaded('settings', function () {
                return new UserSettingsResource($this->settings);
            }),
        ];
    }
}

