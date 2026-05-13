<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDonationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'status' => 'sometimes|in:pending,completed,failed,paused,cancelled',
            'cause' => 'nullable|string|max:255',
            'project' => 'nullable|string|max:255',
            'transaction_id' => 'nullable|string|max:255|unique:donations,transaction_id,' . $this->route('donation'),
        ];

        return $rules;
    }
}

