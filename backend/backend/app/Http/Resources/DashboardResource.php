<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'total_donations' => $this->resource['total_donations'] ?? 0,
            'this_month' => $this->resource['this_month'] ?? 0,
            'active_recurring' => $this->resource['active_recurring'] ?? 0,
            'total_impact' => $this->resource['total_impact'] ?? 0,
            'recent_donations' => DonationResource::collection($this->resource['recent_donations'] ?? []),
            'donation_trends' => $this->resource['donation_trends'] ?? [],
        ];
    }
}

