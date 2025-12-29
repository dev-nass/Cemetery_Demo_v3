<?php

namespace App\Http\Controllers;

use App\Models\DeceasedRecord;
use App\Models\Lot;
use Inertia\Inertia;

class LotController extends Controller
{
    public function search()
    {

        $search = request('search');

        $deceased = DeceasedRecord::with('burialRecord.lot.section')

            ->when($search, function ($query) use ($search) {

                $query->where(function ($q) use ($search) {

                    // Search by full name (first + last)
                    $q->where('first_name', 'like', "%{$search}%")

                        // Lot number
                        ->orWhereHas('burialRecord.lot', function ($lot) use ($search) {
                        $lot->where('lot_number', 'like', "%{$search}%");
                    })
                        // Section name
                        ->orWhereHas('burialRecord.lot.section', function ($section) use ($search) {
                        $section->where('section_name', 'like', "%{$search}%");
                    });

                });
            })->limit(10) // 🔥 important for suggestions
            ->get();

        return response()->json([
            'results' => $deceased,
        ]);


    }
    //
    public function geoJson()
    {
        $lots = Lot::with(['section', 'burialRecord.deceasedRecord'])->get();

        $features = $lots->map(function ($lot) {
            // Prepare the burial data if it exists
            $burial = null;
            if ($lot->burialRecord) {
                $deceased = $lot->burialRecord->deceasedRecord;

                $burial = [
                    'deceased_record_id' => $lot->burialRecord->deceased_record_id,
                    'full_name' => $deceased
                        ? trim("{$deceased->first_name} {$deceased->last_name}")
                        : 'N/A',
                    'burial_date' => $lot->burialRecord->burial_date,
                    'burial_time' => $lot->burialRecord->burial_time,
                ];
            }

            return [
                'type' => 'Feature',
                'geometry' => $lot->coordinates,
                'properties' => [
                    'lot_id' => $lot->id,
                    'section' => $lot->section->section_name ?? 'N/A',
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
