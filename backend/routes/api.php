<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PropertyController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Test API
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'RealEstatePlatform Backend API Working Successfully 🚀'
    ]);
});

// Property API Routes
Route::apiResource('properties', PropertyController::class);