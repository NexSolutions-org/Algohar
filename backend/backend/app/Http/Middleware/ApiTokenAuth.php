<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;

class ApiTokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Try bearer token first
        $token = $request->bearerToken();

        // Fallback to cookie named 'admin_token'
        if (!$token) {
            $token = $request->cookie('admin_token');
        }

        // Fallback to token in request input (query or body)
        if (!$token) {
            $token = $request->input('token');
        }

        if (!$token) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $hashed = hash('sha256', $token);
        $user = User::where('api_token', $hashed)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        if ($user->api_token_expires_at && $user->api_token_expires_at->isPast()) {
            return response()->json(['success' => false, 'message' => 'Token expired'], 401);
        }

        auth()->setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
