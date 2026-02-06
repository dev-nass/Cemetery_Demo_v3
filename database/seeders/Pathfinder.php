<?php

namespace Database\Seeders;

use App\Models\Junction;
use App\Models\Pathway;
use Illuminate\Database\Seeder;

class Pathfinder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedJunctions();
        $this->seedPathways();
    }

    private function seedJunctions(): void
    {
        // ❌ ISSUE 1: public_path() returns a string path, not the file contents
        // ✅ FIX: Use file_get_contents() to read the file
        $geoJsonPath = public_path('data/junctionsv2.geojson');

        if (!file_exists($geoJsonPath)) {
            $this->command->error("GeoJSON file for junction coords not found at path: {$geoJsonPath}");
            return;
        }

        // ❌ ISSUE 2: Need to decode JSON string to array
        // ✅ FIX: Use json_decode()
        $geoJsonData = json_decode(file_get_contents($geoJsonPath), true);

        if (!$geoJsonData || !isset($geoJsonData['features'])) {
            $this->command->error("Invalid GeoJSON format: 'features' key not found");
            return;
        }

        // ❌ ISSUE 3: Missing '$' before variable name in isset()
        // ❌ ISSUE 4: Looping over wrong variable ($geoJsonData instead of $geoJsonData['features'])
        // ✅ FIX: Loop over features array
        foreach ($geoJsonData['features'] as $feature) {
            // ❌ ISSUE 5: Accessing wrong nested properties
            // ✅ FIX: Access geometry.coordinates for Point data
            $coordinates = $feature['geometry']['coordinates'];
            $properties = $feature['properties'];

            Junction::create([
                'type' => $properties['type'], // 'entrance', 'intersection'
                'latitude' => $coordinates[1],  // GeoJSON is [lng, lat]
                'longitude' => $coordinates[0],
            ]);
        }

        $this->command->info("Junctions imported: " . count($geoJsonData['features']));
    }

    private function seedPathways(): void
    {
        // ❌ ISSUE 6: Wrong filename (pathway.geojson vs pathways.geojson)
        $geoJsonPath = public_path('data/pathwaysv2.geojson'); // Match your actual filename

        if (!file_exists($geoJsonPath)) {
            $this->command->error("GeoJSON file for pathways not found at path: {$geoJsonPath}");
            return;
        }

        $geoJsonData = json_decode(file_get_contents($geoJsonPath), true);

        if (!$geoJsonData || !isset($geoJsonData['features'])) {
            $this->command->error("Invalid GeoJSON format: 'features' key not found");
            return;
        }

        foreach ($geoJsonData['features'] as $feature) {
            $properties = $feature['properties'];
            $coordinates = $feature['geometry']['coordinates'][0]; // MultiLineString has extra nesting

            // ❌ ISSUE 7: Need to get junction IDs from database, not just use string values
            // ✅ FIX: Find actual junction records
            $fromJunction = Junction::where('id', $properties['from_junct'])->first();
            $toJunction = Junction::where('id', $properties['to_junct'])->first();

            if (!$fromJunction || !$toJunction) {
                $this->command->warn("Skipping pathway {$properties['id']}: Junction not found");
                continue;
            }

            // Calculate distance between points (Haversine formula)
            $distance = $this->calculateDistance(
                $coordinates[0][1],
                $coordinates[0][0], // Start: lat, lng
                $coordinates[1][1],
                $coordinates[1][0]  // End: lat, lng
            );

            Pathway::create([
                'from_junction_id' => $fromJunction->id,
                'to_junction_id' => $toJunction->id,
                'distance_meters' => $distance,
                'coordinates' => json_encode($coordinates), // Store LineString coordinates
            ]);
        }

        $this->command->info("Pathways imported: " . count($geoJsonData['features']));
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $earthRadius = 6371000; // meters

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2)
             + cos(deg2rad($lat1)) * cos(deg2rad($lat2))
             * sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2); // Distance in meters
    }
}
