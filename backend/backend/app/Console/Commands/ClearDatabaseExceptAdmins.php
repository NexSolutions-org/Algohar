<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ClearDatabaseExceptAdmins extends Command
{
    protected $signature = 'db:clear-except-admins';
    protected $description = 'Clear all database data except admin and developer users';

    public function handle()
    {
        if (!$this->confirm('This will delete ALL data except admin and developer users. Are you sure?')) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $this->info('Starting database cleanup...');

        try {
            DB::beginTransaction();

            // Step 1: Get admin and developer users to preserve
            $this->info('Identifying admin and developer users to preserve...');
            $adminUsers = User::where('role', 'admin')->get();
            $developerUsers = User::where('role', 'developer')->get();
            $this->info('Found ' . $adminUsers->count() . ' admin user(s) and ' . $developerUsers->count() . ' developer user(s) to preserve.');

            if ($adminUsers->count() === 0) {
                $this->warn('No admin users found! Creating default admin user...');
                User::create([
                    'name' => 'Admin User',
                    'email' => 'admin@algohar.org',
                    'password' => bcrypt('admin123'),
                    'role' => 'admin',
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]);
                $this->info('Default admin user created (email: admin@algohar.org, password: admin123)');
                $adminUsers = User::where('role', 'admin')->get();
            }

            // Store admin and developer user IDs and emails for verification
            $preservedUserIds = array_merge(
                $adminUsers->pluck('id')->toArray(),
                $developerUsers->pluck('id')->toArray()
            );

            // Step 2: Disable foreign key checks temporarily for truncation
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            // Step 3: Delete all data from related tables
            $this->info('Clearing donations...');
            DB::table('donations')->truncate();

            $this->info('Clearing payments...');
            DB::table('payments')->truncate();

            $this->info('Clearing payment methods...');
            DB::table('payment_methods')->truncate();

            $this->info('Clearing OTPs...');
            DB::table('otps')->truncate();

            $this->info('Clearing user settings...');
            DB::table('user_settings')->truncate();

            $this->info('Clearing sessions...');
            DB::table('sessions')->truncate();

            $this->info('Clearing password reset tokens...');
            DB::table('password_reset_tokens')->truncate();

            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            // Step 4: Delete all non-admin and non-developer users (only regular users)
            $this->info('Deleting regular users...');
            $deletedUsers = User::whereNotIn('role', ['admin', 'developer'])->delete();
            $this->info("Deleted {$deletedUsers} regular user(s).");

            // Step 5: Verify admin and developer users still exist
            $remainingAdmins = User::where('role', 'admin')->count();
            $remainingDevelopers = User::where('role', 'developer')->count();
            $this->info("Verified {$remainingAdmins} admin user(s) and {$remainingDevelopers} developer user(s) preserved.");

            DB::commit();

            $this->info('');
            $this->info('✅ Database cleanup completed successfully!');
            $this->info('All data has been cleared except admin and developer users.');

            return 0;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Error during database cleanup: ' . $e->getMessage());
            return 1;
        }
    }
}

