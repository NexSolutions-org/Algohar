<?php

namespace App\Http\Middleware;

use App\Models\DomainBlock;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DomainBlockMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip blocking for ALL API routes - domain blocking should only affect frontend/web routes
        $path = $request->path(); // Returns path without leading slash
        $fullPath = $request->getPathInfo(); // Returns path with leading slash, e.g., "/api/developer/auth/login"
        $url = $request->url(); // Full URL
        
        // Skip blocking for:
        // 1. All API routes (they should return JSON, not HTML)
        // 2. Developer and admin routes (both API and web)
        $shouldSkipBlocking = 
            str_starts_with($path, 'api/') ||
            str_starts_with($fullPath, '/api/') ||
            str_contains($url, '/api/') ||
            str_starts_with($path, 'developer') ||
            str_starts_with($path, 'admin') ||
            str_starts_with($fullPath, '/developer') ||
            str_starts_with($fullPath, '/admin') ||
            str_contains($url, '/developer/') ||
            str_contains($url, '/admin/');
        
        if ($shouldSkipBlocking) {
            return $next($request);
        }

        // Check if domain blocking is enabled
        try {
            $domainBlock = DomainBlock::getSettings();
            
            if ($domainBlock->is_enabled) {
                // Return the custom HTML content
                return response($domainBlock->html_content, 200)
                    ->header('Content-Type', 'text/html');
            }
        } catch (\Exception $e) {
            // If there's an error (e.g., table doesn't exist yet), continue normally
            // This allows the application to work before migrations are run
        }

        return $next($request);
    }
}

