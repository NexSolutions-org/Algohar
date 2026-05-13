<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://algohar.org',
        'http://algohar.org',
        'https://www.algohar.org',
        'http://www.algohar.org',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // Explicitly allows Authorization, Content-Type, Accept, etc.

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];

