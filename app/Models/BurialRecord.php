<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BurialRecord extends Model
{
    /** @use HasFactory<\Database\Factories\BurialRecordFactory> */
    use HasFactory;

    public function lot()
    {
        return $this->belongsTo(Lot::class);
    }

    public function deceasedRecord()
    {
        return $this->belongsTo(DeceasedRecord::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
