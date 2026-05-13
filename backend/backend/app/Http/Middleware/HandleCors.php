<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->headers->get('Origin');
        $allowedOrigins = config('cors.allowed_origins', []);
        
        // Get the request hostname for same-origin detection
        $requestHost = $request->getHost();
        $requestScheme = $request->getScheme();
        $requestOrigin = $requestScheme . '://' . $requestHost;
        
        // Check if origin is in allowed list or matches pattern
        $isAllowed = false;
        $allowedOrigin = null;
        
        if ($origin) {
            // Check exact match
            if (in_array($origin, $allowedOrigins)) {
                $isAllowed = true;
                $allowedOrigin = $origin;
            }
            // Check if it's the same domain (for production where frontend and backend are on same domain)
            $hostname = parse_url($origin, PHP_URL_HOST);
            if ($hostname && (
                $hostname === 'algohar.org' || 
                $hostname === 'www.algohar.org' ||
                str_ends_with($hostname, '.algohar.org')
            )) {
                $isAllowed = true;
                $allowedOrigin = $origin;
            }
        } else {
            // No Origin header means same-origin request (frontend and backend on same domain)
            // Check if request is from allowed domain
            if (in_array($requestOrigin, $allowedOrigins) || 
                $requestHost === 'algohar.org' || 
                $requestHost === 'www.algohar.org' ||
                str_ends_with($requestHost, '.algohar.org')) {
                $isAllowed = true;
                $allowedOrigin = $requestOrigin;
            }
        }
        
        // Default to request origin if same-origin, or first allowed origin
        if (!$allowedOrigin) {
            $allowedOrigin = $isAllowed ? $requestOrigin : ($allowedOrigins[0] ?? '*');
        }
        
        // Ensure Authorization header is always explicitly allowed
        $allowedHeaders = 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-TOKEN';
        
        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $allowedOrigin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->header('Access-Control-Allow-Headers', $allowedHeaders)
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400');
        }

        $response = $next($request);

        // Always set CORS headers, even for same-origin requests (helps with debugging)
        $response->headers->set('Access-Control-Allow-Origin', $allowedOrigin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        $response->headers->set('Access-Control-Allow-Headers', $allowedHeaders);
        $response->headers->set('Access-Control-Allow-Credentials', 'true');

        return $response;
    }
}

