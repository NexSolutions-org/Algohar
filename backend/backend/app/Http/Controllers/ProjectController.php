<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        // Return mock projects data
        // TODO: Replace with database query when projects table is created
        $projects = [
            [
                'id' => '1',
                'title' => 'Food Distribution Program',
                'description' => 'Monthly food distribution to underprivileged families in rural areas.',
                'imageUrl' => null,
                'status' => 'ongoing',
                'date' => '2024-01-15',
                'location' => 'Lahore, Pakistan',
                'fundsRaised' => 500000,
                'familiesHelped' => 150,
            ],
            [
                'id' => '2',
                'title' => 'Education Support Initiative',
                'description' => 'Providing educational materials and scholarships to deserving students.',
                'imageUrl' => null,
                'status' => 'ongoing',
                'date' => '2024-02-01',
                'location' => 'Karachi, Pakistan',
                'fundsRaised' => 300000,
                'familiesHelped' => 75,
            ],
            [
                'id' => '3',
                'title' => 'Medical Camp',
                'description' => 'Free medical checkups and medicines for low-income families.',
                'imageUrl' => null,
                'status' => 'completed',
                'date' => '2023-12-10',
                'location' => 'Islamabad, Pakistan',
                'fundsRaised' => 200000,
                'familiesHelped' => 200,
            ],
        ];

        return response()->json($projects);
    }
}

