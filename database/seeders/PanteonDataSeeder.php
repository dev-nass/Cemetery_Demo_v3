<?php

namespace Database\Seeders;

use App\Models\Lot;
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
        $this->seedLot();
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
                'coordinates' => json_encode($feature['geometry']),
            ];

            // insert the other attributes using the factory definition & section variable data
            Section::factory()->create($section);
        }

        $this->command->info("Sections imported: " . count($geoJsonData['features']));
    }


    public function seedLot()
    {

        $geoJsonPath_Underground = public_path('data/lots_underground.geojson');
        $geoJsonPath_Appartment = public_path('data/lots_appartment.geojson');

        if (!$geoJsonPath_Underground || !$geoJsonPath_Appartment) {
            $this->command->error("GeoJSON file for lot underground not found at path: {$geoJsonPath_Underground}");
            return;
        }

        $geoJsonData_underground = json_decode(file_get_contents($geoJsonPath_Underground), true);
        $geoJsonData_appartment = json_decode(file_get_contents($geoJsonPath_Underground), true);


        if (!$geoJsonData_underground['features'] || !$geoJsonData_appartment['features']) {
            $this->command->error("Invalid GeoJSON format: 'features' key not found.");
            return;
        }

        $this->command->info("Seeding sections from GeoJSON...");


        // Seed underground lots
        foreach ($geoJsonData_underground['features'] as $feature) {
            $attributes = $feature['properties'];

            // holds the data from QGIS
            $lot_underground = [
                'section_id' => $attributes['section_id'],
                'lot_type' => 'underground',
                'coordinates' => json_encode($feature['geometry']),
            ];

            // insert the other attributes using the factory definition & lot variable data
            Lot::factory()->create($lot_underground);
        }

        // Seed appartment lots
        foreach ($geoJsonData_appartment['features'] as $feature) {
            $attributes = $feature['properties'];

            // holds the data from QGIS
            $lot_appatment = [
                'section_id' => $attributes['section_id'],
                'lot_type' => 'apartment',
                'coordinates' => json_encode($feature['geometry']),
            ];

            // insert the other attributes using the factory definition & lot variable data
            Lot::factory()->create($lot_appatment);
        }

        $this->command->info("Sections imported: " . count($geoJsonData_underground['features']));
        $this->command->info("Sections imported: " . count($geoJsonData_appartment['features']));
    }
}
