<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyImageController;

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
Route::post('/avatar-test', function () {
    return response()->json([
        'success' => true,
        'message' => 'Avatar Test Route Working'
    ]);
});
// Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/avatar', [AuthController::class, 'updateAvatar']);
    Route::post(
    '/properties/{property}/images',
    [PropertyImageController::class, 'store']
);

Route::delete(
    '/properties/{property}/images/{image}',
    [PropertyImageController::class, 'destroy']
);

Route::put(
    '/properties/{property}/images/{image}/primary',
    [PropertyImageController::class, 'makePrimary']
);
});
// Property API Routes
Route::apiResource('properties', PropertyController::class);