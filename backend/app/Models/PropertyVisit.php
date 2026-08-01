<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyVisit extends Model
{
    protected $fillable = [
        'property_id',
        'name',
        'email',
        'phone',
        'visit_date',
        'visit_time',
        'status',
        'notes',
    ];

    protected $casts = [
        'visit_date' => 'date',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}