<?php

namespace App\Policies;

use App\Models\PaymentMethod;
use App\Models\User;

class PaymentMethodPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PaymentMethod $paymentMethod): bool
    {
        // Users can only view their own payment methods
        return $paymentMethod->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, PaymentMethod $paymentMethod): bool
    {
        // Users can only update their own payment methods
        return $paymentMethod->user_id === $user->id;
    }

    public function delete(User $user, PaymentMethod $paymentMethod): bool
    {
        // Users can only delete their own payment methods
        return $paymentMethod->user_id === $user->id;
    }
}

