<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (config('database.default') !== 'sqlite') {
            Schema::table('donations', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
            Schema::table('payments', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
            Schema::table('user_settings', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
            Schema::table('payment_methods', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        }
        // Note: NOT dropping users table — needed for auth
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: This migration cannot be fully reversed as it would require
        // recreating the users table with all its columns and relationships.
        // If you need to restore the users table, run the original migrations.
    }
};
