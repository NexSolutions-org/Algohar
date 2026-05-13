<?php

namespace App\Policies;

use App\Models\Donation;
use App\Models\User;

class DonationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Donation $donation): bool
    {
        // Users can view their own donations, admins can view all
        return $user->isAdmin() || $donation->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Donation $donation): bool
    {
        // Admins can update any donation
        // Users can update their own donations (e.g., to retry failed payments)
        return $user->isAdmin() || $donation->user_id === $user->id;
    }

    public function delete(User $user, Donation $donation): bool
    {
        // Only admins can delete donations
        return $user->isAdmin();
    }
}

