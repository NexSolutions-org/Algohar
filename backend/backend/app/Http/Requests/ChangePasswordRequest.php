<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $user = $this->user();
        $rules = [
            'new_password' => ['required', 'confirmed', Password::defaults()],
        ];

        // Only require current password if user already has one
        if ($user && $user->hasPassword()) {
            $rules['current_password'] = ['required', 'string'];
        }

        return $rules;
    }
}

