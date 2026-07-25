<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    // Get all properties
    public function index()
    {
        return Property::all();
    }

    // Store new property
    public function store(Request $request)
    {
        $property = Property::create($request->all());

        return response()->json($property, 201);
    }

    // Get single property
    public function show(Property $property)
    {
        return $property;
    }

    // Update property
    public function update(Request $request, Property $property)
    {
        $property->update($request->all());

        return response()->json($property);
    }

    // Delete property
    public function destroy(Property $property)
    {
        $property->delete();

        return response()->json([
            'message' => 'Property deleted successfully'
        ]);
    }
}