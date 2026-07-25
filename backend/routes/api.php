<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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