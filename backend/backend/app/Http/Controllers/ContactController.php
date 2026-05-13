<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'message' => 'required|string|min:10|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        try {
            // Log the contact message
            Log::info('Contact Form Submission', [
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? 'N/A',
                'message' => $data['message'],
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            // TODO: Send email notification to admin
            // You can implement email sending here using Laravel Mail
            // For example:
            // Mail::to(config('mail.from.address'))->send(new ContactFormMail($data));

            return response()->json([
                'success' => true,
                'message' => 'Thank you for contacting us! We will get back to you soon.',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Contact form submission failed', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit your message. Please try again later.',
            ], 500);
        }
    }
}

