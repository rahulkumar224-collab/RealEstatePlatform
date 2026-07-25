<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = [
        'title',
        'description',
        'price',
        'city',
        'state',
        'type',
        'category',
        'bedrooms',
        'bathrooms',
        'area',
        'image'
    ];
}