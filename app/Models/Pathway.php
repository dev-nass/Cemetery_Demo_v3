<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pathway extends Model
{
    /** @use HasFactory<\Database\Factories\PathwayFactory> */
    use HasFactory;

    public function fromJunction(): BelongsTo
    {
        return $this->belongsTo(Junction::class, 'from_junction_id');
    }

    public function toJunction(): BelongsTo
    {
        return $this->belongsTo(Junction::class, 'to_junction_id');
    }
}
