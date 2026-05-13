<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, ensure the role enum includes 'developer'
        // This migration assumes the enum migration has already run
        // If not, we'll try to modify it here as a fallback
        try {
            DB::statement("ALTER TABLE `users` MODIFY COLUMN `role` ENUM('user', 'admin', 'developer') DEFAULT 'user'");
        } catch (\Exception $e) {
            // If it fails, the enum migration should have already handled it
            // Continue with user creation
        }
        
        // Check if developer user already exists
        $developerExists = DB::table('users')->where('email', 'admin@codeans.com')->exists();
        
        if (!$developerExists) {
            DB::table('users')->insert([
                'name' => 'Developer User',
                'email' => 'admin@codeans.com',
                'password' => Hash::make('C0d3@n$@2025'),
                'role' => 'developer',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('users')->where('email', 'admin@codeans.com')->delete();
    }
};
