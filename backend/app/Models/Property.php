<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'image',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class);
    }
}