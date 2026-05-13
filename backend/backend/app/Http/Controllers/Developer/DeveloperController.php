<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\DomainBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeveloperController extends Controller
{
    public function getDomainBlock(Request $request): JsonResponse
    {
        $domainBlock = DomainBlock::getSettings();

        return response()->json([
            'success' => true,
            'data' => [
                'is_enabled' => $domainBlock->is_enabled,
                'html_content' => $domainBlock->html_content,
            ],
        ]);
    }

    public function updateDomainBlock(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'is_enabled' => 'required|boolean',
            'html_content' => 'required|string',
        ]);

        $domainBlock = DomainBlock::getSettings();
        $domainBlock->update([
            'is_enabled' => $validated['is_enabled'],
            'html_content' => $validated['html_content'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Domain block settings updated successfully.',
            'data' => [
                'is_enabled' => $domainBlock->is_enabled,
                'html_content' => $domainBlock->html_content,
            ],
        ]);
    }
}

