<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Property;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        Property::create([
            'title' => 'Luxury Apartment',
            'description' => 'Beautiful luxury apartment in Mumbai.',
            'price' => 12500000,
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'type' => 'buy',
            'category' => 'residential',
            'bedrooms' => 3,
            'bathrooms' => 2,
            'area' => 1800,
            'image' => 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0',
        ]);

        Property::create([
            'title' => 'Modern Villa',
            'description' => 'Premium villa with private garden.',
            'price' => 24000000,
            'city' => 'Delhi',
            'state' => 'Delhi',
            'type' => 'buy',
            'category' => 'residential',
            'bedrooms' => 5,
            'bathrooms' => 4,
            'area' => 3500,
            'image' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
        ]);

        Property::create([
            'title' => 'Premium Office',
            'description' => 'Commercial office space in Bangalore.',
            'price' => 8500000,
            'city' => 'Bangalore',
            'state' => 'Karnataka',
            'type' => 'buy',
            'category' => 'commercial',
            'bedrooms' => null,
            'bathrooms' => 2,
            'area' => 2200,
            'image' => 'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
        ]);

        Property::create([
            'title' => 'Rental Flat',
            'description' => '2 BHK flat available for rent.',
            'price' => 35000,
            'city' => 'Pune',
            'state' => 'Maharashtra',
            'type' => 'rent',
            'category' => 'residential',
            'bedrooms' => 2,
            'bathrooms' => 2,
            'area' => 1100,
            'image' => 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
        ]);

        Property::create([
            'title' => 'Retail Shop',
            'description' => 'Prime location retail shop.',
            'price' => 120000,
            'city' => 'Hyderabad',
            'state' => 'Telangana',
            'type' => 'rent',
            'category' => 'commercial',
            'bedrooms' => null,
            'bathrooms' => 1,
            'area' => 900,
            'image' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
        ]);
    }
}