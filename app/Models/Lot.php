<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lot extends Model
{
    /** @use HasFactory<\Database\Factories\LotFactory> */
    use HasFactory;

    protected $casts = [
        'coordinates' => 'array', // or 'json'
    ];

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function burialRecord()
    {
        return $this->hasOne(BurialRecord::class);
    }
}
