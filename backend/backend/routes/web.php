<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Al Gohar Foundation API',
        'version' => '1.0.0',
    ]);
});

