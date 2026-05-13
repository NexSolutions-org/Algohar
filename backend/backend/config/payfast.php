<?php

return [
    /*
    |--------------------------------------------------------------------------
    | PayFast Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for PayFast payment gateway integration.
    | Most settings can be overridden via environment variables.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | SSL Verification
    |--------------------------------------------------------------------------
    |
    | Set to false only in development to bypass SSL certificate issues.
    | WARNING: NEVER set to false in production!
    |
    */
    'verify_ssl' => env('PAYFAST_VERIFY_SSL', true),

    /*
    |--------------------------------------------------------------------------
    | Encrypt Credentials
    |--------------------------------------------------------------------------
    |
    | Whether to encrypt merchant_id and secured_key in the database.
    | Set to false if you want to store credentials in plain text (not recommended).
    |
    */
    'encrypt_credentials' => env('PAYFAST_ENCRYPT_CREDENTIALS', true),

    /*
    |--------------------------------------------------------------------------
    | Hash Key
    |--------------------------------------------------------------------------
    |
    | Optional hash key for HMAC signatures.
    | If not set, will use secured_key from settings.
    |
    */
    'hash_key' => env('PAYFAST_HASH_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Default Currency
    |--------------------------------------------------------------------------
    |
    | Default currency code for transactions.
    |
    */
    'default_currency' => env('PAYFAST_DEFAULT_CURRENCY', 'PKR'),
];

