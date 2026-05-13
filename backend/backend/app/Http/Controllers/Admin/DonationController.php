<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateDonationRequest;
use App\Http\Resources\DonationResource;
use App\Models\Donation;
use App\Services\DonationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DonationController extends Controller
{
    public function __construct(
        protected DonationService $donationService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Donation::with(['user', 'payment']);

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('cause')) {
            $query->where('cause', $request->cause);
        }

        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('donor_name', 'like', "%{$search}%")
                    ->orWhere('donor_email', 'like', "%{$search}%")
                    ->orWhere('transaction_id', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $donations = $query->paginate(15);

        return DonationResource::collection($donations);
    }

    public function show(Donation $donation): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new DonationResource($donation->load(['user', 'payment'])),
        ]);
    }

    public function update(UpdateDonationRequest $request, Donation $donation): JsonResponse
    {
        $donation->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Donation updated successfully',
            'data' => new DonationResource($donation->fresh(['user', 'payment'])),
        ]);
    }

    public function updateStatus(Request $request, Donation $donation): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,failed,paused,cancelled',
        ]);

        $donation = $this->donationService->updateDonationStatus($donation, $validated['status']);

        return response()->json([
            'success' => true,
            'message' => 'Donation status updated successfully',
            'data' => new DonationResource($donation),
        ]);
    }

    public function destroy(Donation $donation): JsonResponse
    {
        $donation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Donation deleted successfully',
        ]);
    }
}

