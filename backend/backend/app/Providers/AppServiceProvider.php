<?php

namespace App\Providers;

use App\Services\AdminNotificationService;
use App\Services\OtpService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(OtpService::class, function ($app) {
            return new OtpService($app->make(AdminNotificationService::class));
        });
    }

    public function boot(): void
    {
        //
    }
}

