<?php

namespace Database\Seeders;

use App\Models\Section;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PanteonDataSeeder extends Seeder
{

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedSections();
    }

    private function seedSections()
    {
        $geoJsonPath = public_path('data/sections.geojson');

        if (!$geoJsonPath) {
            $this->command->error("GeoJSON file for sections not found at path: {$geoJsonPath}");
            return;
        }

        $geoJsonData = json_decode(file_get_contents($geoJsonPath), true);

        if (!$geoJsonData['features']) {
            $this->command->error("Invalid GeoJSON format: 'features' key not found.");
            return;
        }

        $this->command->info("Seeding sections from GeoJSON...");

        foreach ($geoJsonData['features'] as $feature) {
            $attributes = $feature['properties'];

            // holds the data from QGIS
            $section = [
                'id' => $attributes['id'],
                'coordinates' => json_encode($feature['geometry']),
            ];

            // insert the other attributes using the factory definition & section variable data
            Section::factory()->create($section);
        }

        $this->command->info("Sections imported: " . count($geoJsonData['features']));
    }


    public function seedLotUnderground()
    {

        $geoJsonPath = public_path('data/lots_underground.geojson');

        if (!$geoJsonPath) {
            $this->command->error("GeoJSON file for lot underground not found at path: {$geoJsonPath}");
            return;
        }

        $geoJsonData = json_decode(file_get_contents($geoJsonPath), true);

        if (!$geoJsonData['features']) {
            $this->command->error("Invalid GeoJSON format: 'features' key not found.");
            return;
        }


    }
}
