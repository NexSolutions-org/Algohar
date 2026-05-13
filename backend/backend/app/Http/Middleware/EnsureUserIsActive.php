<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Please log in.',
            ], 401);
        }

        // Get status, default to 'active' if null (for backward compatibility)
        $status = $user->status ?? 'active';

        // Check if user is inactive
        if ($status === 'inactive') {
            // Revoke api token to force logout
            $user->api_token = null;
            $user->api_token_expires_at = null;
            $user->save();
            
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        // Check if user is pending (optional - you might want to allow pending users)
        if ($status === 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Your account is pending approval. Please wait for activation.',
            ], 403);
        }

        // Allow active users and null status (defaults to active)
        return $next($request);
    }
}

