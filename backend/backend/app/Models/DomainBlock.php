<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DomainBlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'is_enabled',
        'html_content',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];

    /**
     * Get the current domain block settings (singleton pattern)
     */
    public static function getSettings(): self
    {
        return static::firstOrCreate(
            ['id' => 1],
            [
                'is_enabled' => false,
                'html_content' => '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Temporarily Unavailable</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 600px;
        }
        h1 {
            color: #e60000;
            margin-bottom: 20px;
        }
        p {
            line-height: 1.6;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Site Temporarily Unavailable</h1>
        <p>This site is currently unavailable. Please contact the administrator for more information.</p>
    </div>
</body>
</html>',
            ]
        );
    }
}

