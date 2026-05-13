<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@algohar.org',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Create regular user
        User::create([
            'name' => 'Test User',
            'email' => 'user@algohar.org',
            'password' => Hash::make('user123'),
            'role' => 'user',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
    }
}

