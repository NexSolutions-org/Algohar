<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        \App\Models\Donation::class => \App\Policies\DonationPolicy::class,
        \App\Models\PaymentMethod::class => \App\Policies\PaymentMethodPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}

