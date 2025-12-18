<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeceasedRecord extends Model
{
    /** @use HasFactory<\Database\Factories\DeceasedRecordFactory> */
    use HasFactory;

    public function burialRecord()
    {
        return $this->hasOne(BurialRecord::class);
    }
}
