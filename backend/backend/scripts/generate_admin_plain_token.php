<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Str;

$email = 'admin@algohar.org';
$user = App\Models\User::where('email', $email)->first();
if (! $user) {
    echo "NO_USER\n";
    exit(1);
}

$plain = Str::random(60);
$user->api_token = hash('sha256', $plain);
$user->api_token_expires_at = now()->addDays(30);
$user->save();

echo "PLAIN_TOKEN=" . $plain . "\n";
echo "USER_ID=" . $user->id . "\n";
