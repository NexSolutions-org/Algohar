<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsDeveloper
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isDeveloper()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Developer access required.',
            ], 403);
        }

        return $next($request);
    }
}

