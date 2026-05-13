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
        // Check if admin user already exists
        $adminExists = DB::table('users')->where('email', 'admin@algohar.org')->exists();
        
        if (!$adminExists) {
            DB::table('users')->insert([
                'name' => 'Admin User',
                'email' => 'admin@algohar.org',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('users')->where('email', 'admin@algohar.org')->delete();
    }
};

