<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (config('database.default') !== 'sqlite') {
            DB::statement("ALTER TABLE `donations` MODIFY COLUMN `donation_type` ENUM('zakat', 'donation', 'qurbani') NULL");
        }
    }

    public function down(): void
    {
        if (config('database.default') !== 'sqlite') {
            DB::statement("ALTER TABLE `donations` MODIFY COLUMN `donation_type` ENUM('zakat', 'donation') NULL");
        }
    }
};
