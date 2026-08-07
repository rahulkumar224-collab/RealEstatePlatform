<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyRequest;
use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::with([
            'images' => function ($imageQuery) {
                $imageQuery
                    ->orderByDesc('is_primary')
                    ->orderBy('sort_order');
            },
        ]);

        if ($request->filled('city')) {
            $query->where(
                'city',
                'LIKE',
                '%' . $request->city . '%'
            );
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $properties = $query
            ->latest()
            ->get()
            ->map(function (Property $property) {
                $primaryImage = $property->images
                    ->firstWhere('is_primary', true);

                return [
                    'id' => $property->id,
                    'title' => $property->title,
                    'description' => $property->description,
                    'price' => $property->price,
                    'city' => $property->city,
                    'state' => $property->state,
                    'type' => $property->type,
                    'category' => $property->category,
                    'bedrooms' => $property->bedrooms,
                    'bathrooms' => $property->bathrooms,
                    'area' => $property->area,

                    'primary_image' => $primaryImage
                        ? asset(
                            'storage/' .
                            $primaryImage->image_path
                        )
                        : $property->image,

                    'images_count' => $property->images->count(),

                    'created_at' => $property->created_at,
                    'updated_at' => $property->updated_at,
                ];
            });

        return response()->json($properties);
    }

    public function store(StorePropertyRequest $request)
    {
        $property = Property::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Property created successfully.',
            'property' => $property,
        ], 201);
    }

    public function show(Property $property)
    {
        $property->load([
            'images' => function ($query) {
                $query
                    ->orderByDesc('is_primary')
                    ->orderBy('sort_order');
            },
        ]);

        $images = $property->images
            ->map(function ($image) {
                return [
                    'id' => $image->id,
                    'image_path' => $image->image_path,
                    'image_url' => asset(
                        'storage/' . $image->image_path
                    ),
                    'is_primary' => $image->is_primary,
                    'sort_order' => $image->sort_order,
                ];
            })
            ->values();

        $primaryImage = $property->images
    ->firstWhere('is_primary', true)
    ?? $property->images->first();

        return response()->json([
            'id' => $property->id,
            'title' => $property->title,
            'description' => $property->description,
            'price' => $property->price,
            'city' => $property->city,
            'state' => $property->state,
            'type' => $property->type,
            'category' => $property->category,
            'bedrooms' => $property->bedrooms,
            'bathrooms' => $property->bathrooms,
            'area' => $property->area,

            'primary_image' => $primaryImage
                ? asset('storage/' . $primaryImage->image_path)
                : $property->image,

            'images' => $images,
            'images_count' => $images->count(),

            'created_at' => $property->created_at,
            'updated_at' => $property->updated_at,
        ]);
    }

    public function update(
        Request $request,
        Property $property
    ) {
        //
    }

    public function destroy(Property $property)
    {
        //
    }
}
