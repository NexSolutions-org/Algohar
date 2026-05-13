<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('donor_name');
            $table->string('donor_email');
            $table->string('donor_phone')->nullable();
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['one-time', 'recurring'])->default('one-time');
            $table->enum('frequency', ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])->nullable();
            $table->enum('payment_method', ['payfast', 'card', 'bank', 'wallet']);
            $table->enum('status', ['pending', 'completed', 'failed', 'paused', 'cancelled'])->default('pending');
            $table->string('cause')->nullable();
            $table->string('project')->nullable();
            $table->string('transaction_id')->nullable()->unique();
            // payment_id will be added after payments table is created
            $table->unsignedBigInteger('payment_id')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
            $table->index('donor_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};

