<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyVisitRequest;
use App\Http\Requests\UpdatePropertyVisitStatusRequest;
use App\Models\Property;
use App\Models\PropertyVisit;
use Illuminate\Http\JsonResponse;

class PropertyVisitController extends Controller
{
    public function store(
        StorePropertyVisitRequest $request,
        Property $property
    ): JsonResponse {
        $visit = PropertyVisit::create([
            'property_id' => $property->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'visit_date' => $request->visit_date,
            'visit_time' => $request->visit_time,
            'notes' => $request->notes,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Property visit scheduled successfully.',
            'visit' => $visit,
        ], 201);
    }

    public function index(): JsonResponse
    {
        $visits = PropertyVisit::with('property')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'visits' => $visits,
        ]);
    }

    public function show(PropertyVisit $propertyVisit): JsonResponse
    {
        $propertyVisit->load('property');

        return response()->json([
            'success' => true,
            'visit' => $propertyVisit,
        ]);
    }

    public function updateStatus(
        UpdatePropertyVisitStatusRequest $request,
        PropertyVisit $propertyVisit
    ): JsonResponse {
        $validated = $request->validated();

        $propertyVisit->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Property visit status updated successfully.',
            'visit' => $propertyVisit,
        ]);
    }
}
