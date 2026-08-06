<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\PropertyImageController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PropertyVisitController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post(
    '/properties/{property}/visits',
    [PropertyVisitController::class, 'store']
);

Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'RealEstatePlatform Backend API Working Successfully 🚀',
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Public Property Routes
|--------------------------------------------------------------------------
*/

Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{property}', [PropertyController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Public Inquiry Route
|--------------------------------------------------------------------------
*/

Route::post(
    '/properties/{property}/inquiries',
    [InquiryController::class, 'store']
);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Authentication and Profile
    |--------------------------------------------------------------------------
    */

    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/avatar', [AuthController::class, 'updateAvatar']);

});

/*
|--------------------------------------------------------------------------
| Admin Management Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get(
        '/property-visits',
        [PropertyVisitController::class, 'index']
    );

    Route::get(
        '/property-visits/{propertyVisit}',
        [PropertyVisitController::class, 'show']
    );

    Route::patch(
        '/property-visits/{propertyVisit}/status',
        [PropertyVisitController::class, 'updateStatus']
    );

    /*
    |--------------------------------------------------------------------------
    | Protected Property Management
    |--------------------------------------------------------------------------
    */

    Route::post('/properties', [PropertyController::class, 'store']);

    Route::put(
        '/properties/{property}',
        [PropertyController::class, 'update']
    );

    Route::patch(
        '/properties/{property}',
        [PropertyController::class, 'update']
    );

    Route::delete(
        '/properties/{property}',
        [PropertyController::class, 'destroy']
    );

    /*
    |--------------------------------------------------------------------------
    | Property Images
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Inquiry Management
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/inquiries',
        [InquiryController::class, 'index']
    );

    Route::get(
        '/inquiries/{inquiry}',
        [InquiryController::class, 'show']
    );

    Route::patch(
        '/inquiries/{inquiry}/status',
        [InquiryController::class, 'updateStatus']
    );
});
