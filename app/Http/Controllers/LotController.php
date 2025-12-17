<?php

namespace App\Http\Controllers;

use App\Models\Lot;
use Illuminate\Http\Request;

class LotController extends Controller
{
    //
    public function geoJson()
    {
        $lots = Lot::with('section')->get();

        $features = $lots->map(function ($lot) {
            return [
                'type' => 'Feature',
                'geometry' => $lot->coordinates,
                'properties' => [
                    'lot_id' => $lot->id,
                    'section' => $lot->section->section_name,
                    'lot_number' => $lot->lot_number,
                    'lot_type' => $lot->lot_type,
                    'status' => $lot->status,
                ],
            ];
        });

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }
}
