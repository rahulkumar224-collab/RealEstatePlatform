<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInquiryRequest;
use App\Http\Requests\UpdateInquiryStatusRequest;
use App\Models\Inquiry;
use App\Models\Property;
use Illuminate\Http\JsonResponse;

class InquiryController extends Controller
{
    public function store(
        StoreInquiryRequest $request,
        Property $property
    ): JsonResponse {
        $inquiry = Inquiry::create([
            'property_id' => $property->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'message' => $request->message,
            'status' => 'new',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inquiry submitted successfully.',
            'inquiry' => $inquiry,
        ], 201);
    }

    public function index(): JsonResponse
    {
        $inquiries = Inquiry::with('property')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'inquiries' => $inquiries,
        ]);
    }

    public function show(Inquiry $inquiry): JsonResponse
    {
        $inquiry->load('property');

        return response()->json([
            'success' => true,
            'inquiry' => $inquiry,
        ]);
    }

    public function updateStatus(
        UpdateInquiryStatusRequest $request,
        Inquiry $inquiry
    ): JsonResponse {
        $validated = $request->validated();

        $inquiry->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inquiry status updated successfully.',
            'inquiry' => $inquiry,
        ]);
    }
}
