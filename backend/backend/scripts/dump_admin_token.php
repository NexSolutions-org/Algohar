<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email','admin@algohar.org')->first();
if (! $user) {
    echo "NO_USER\n";
    exit(0);
}

echo "DB_API_TOKEN=" . ($user->api_token ?? 'NULL') . "\n";
echo "DB_API_TOKEN_EXPIRES_AT=" . ($user->api_token_expires_at ? $user->api_token_expires_at->toDateTimeString() : 'NULL') . "\n";
echo "ROLE=" . ($user->role ?? 'NULL') . "\n";
echo "ID=" . ($user->id ?? 'NULL') . "\n";
