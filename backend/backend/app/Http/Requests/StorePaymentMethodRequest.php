<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $type = $this->input('type');
        $rules = [
            'type' => 'required|in:card,bank,wallet',
            'provider' => 'required|string|max:255',
            'is_default' => 'sometimes|boolean',
        ];

        if ($type === 'card') {
            $rules['account_name'] = 'required|string|max:255';
            $rules['account_number'] = 'required|string|min:13|max:19'; // Card number
            $rules['card_brand'] = 'nullable|string|max:50';
        } elseif ($type === 'bank') {
            $rules['account_name'] = 'required|string|max:255';
            $rules['account_number'] = 'required|string|max:50';
        } elseif ($type === 'wallet') {
            $rules['phone_number'] = 'required|string|max:20';
            $rules['account_name'] = 'nullable|string|max:255';
        }

        return $rules;
    }
}

