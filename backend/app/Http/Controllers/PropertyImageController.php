<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadPropertyImagesRequest;
use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PropertyImageController extends Controller
{
    public function store(
        UploadPropertyImagesRequest $request,
        Property $property
    ): JsonResponse {
        $uploadedImages = [];
        $maxSortOrder = $property->images()->max('sort_order');
        $nextSortOrder = $maxSortOrder === null
            ? 0
            : $maxSortOrder + 1;
        $hasExistingImages = $property->images()->exists();

        foreach ($request->file('images') as $index => $image) {
            $path = $image->store(
                'properties/' . $property->id,
                'public'
            );

            $propertyImage = PropertyImage::create([
                'property_id' => $property->id,
                'image_path' => $path,
                'is_primary' => ! $hasExistingImages
                    && $index === 0,
                'sort_order' => $nextSortOrder + $index,
            ]);

            $uploadedImages[] = [
                'id' => $propertyImage->id,
                'image_path' => $propertyImage->image_path,
                'image_url' => asset(
                    'storage/' . $propertyImage->image_path
                ),
                'is_primary' => $propertyImage->is_primary,
                'sort_order' => $propertyImage->sort_order,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Property images uploaded successfully.',
            'property_id' => $property->id,
            'images' => $uploadedImages,
        ], 201);
    }

    public function destroy(
        Property $property,
        PropertyImage $image
    ): JsonResponse {
        if ($image->property_id !== $property->id) {
            return response()->json([
                'success' => false,
                'message' => 'Image does not belong to this property.',
            ], 404);
        }

        $wasPrimary = $image->is_primary;

        if (
            $image->image_path &&
            Storage::disk('public')->exists($image->image_path)
        ) {
            Storage::disk('public')->delete($image->image_path);
        }

        $image->delete();

        if ($wasPrimary) {
            $nextImage = $property
                ->images()
                ->orderBy('sort_order')
                ->first();

            if ($nextImage) {
                $nextImage->update([
                    'is_primary' => true,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Property image deleted successfully.',
        ]);
    }

    public function makePrimary(
        Property $property,
        PropertyImage $image
    ): JsonResponse {
        if ($image->property_id !== $property->id) {
            return response()->json([
                'success' => false,
                'message' => 'Image does not belong to this property.',
            ], 404);
        }

        $property->images()->update([
            'is_primary' => false,
        ]);

        $image->update([
            'is_primary' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Primary property image updated successfully.',
            'image' => [
                'id' => $image->id,
                'image_url' => asset(
                    'storage/' . $image->image_path
                ),
                'is_primary' => true,
            ],
        ]);
    }
}
