<?php

namespace App\Http\Controllers;

use App\Models\Lot;
use Illuminate\Http\Request;

class LotController extends Controller
{
    //
    public function geoJson()
    {
        $lots = Lot::with(['section', 'burialRecord.deceasedRecord'])->get();

        $features = $lots->map(function ($lot) {
            // Prepare the burial data if it exists
            $burial = null;
            if ($lot->burialRecord) {
                $burial = [
                    'deceased_record_id' => $lot->burialRecord->deceased_record_id,
                    'full_name' => trim(
                        ($lot->burialRecord->deceasedRecord->first_name ?? '') . ' ' .
                        ($lot->burialRecord->deceasedRecord->last_name ?? '')
                    ),
                    'burial_date' => $lot->burialRecord->burial_date,
                    'burial_time' => $lot->burialRecord->burial_time,
                ];
            }

            return [
                'type' => 'Feature',
                'geometry' => $lot->coordinates,
                'properties' => [
                    'lot_id' => $lot->id,
                    'section' => $lot->section->section_name ?? "N/A",
                    'lot_number' => $lot->lot_number,
                    'lot_type' => $lot->lot_type,
                    'status' => $lot->status,
                    'deceased_record' => $burial, // Now returns an object or null
                ],
            ];
        });

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }
}
