<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->boolean('email_notifications')->default(true);
            $table->boolean('donation_receipts')->default(true);
            $table->boolean('monthly_reports')->default(true);
            $table->boolean('campaign_updates')->default(true);
            $table->boolean('impact_stories')->default(true);
            $table->boolean('sms_notifications')->default(false);
            $table->enum('profile_visibility', ['public', 'private'])->default('public');
            $table->boolean('show_donation_amount')->default(true);
            $table->boolean('show_donation_history')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};

