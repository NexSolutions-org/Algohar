<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function track(Request $request): JsonResponse
    {
        // Log analytics event (can be enhanced to store in database later)
        $event = $request->input('event');
        $data = $request->input('data', []);

        // For now, just log the event (can be enhanced to store in database)
        \Log::info('Analytics Event', [
            'event' => $event,
            'data' => $data,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toDateTimeString(),
        ]);

        // Return success response
        return response()->json([
            'success' => true,
            'message' => 'Event tracked successfully',
        ]);
    }
}

