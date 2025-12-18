<?php

namespace Database\Seeders;

use App\Models\BurialRecord;
use App\Models\DeceasedRecord;
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
        $this->deceasedRecords();
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


    private function seedLot()
    {
        $geoJsonPath_Underground = public_path('data/lots_underground.geojson');
        $geoJsonPath_Appartment = public_path('data/lots_appartment.geojson');

        if (!file_exists($geoJsonPath_Underground) || !file_exists($geoJsonPath_Appartment)) {
            $this->command->error("GeoJSON files not found");
            return;
        }

        $geoJsonData_underground = json_decode(file_get_contents($geoJsonPath_Underground), true);
        $geoJsonData_appartment = json_decode(file_get_contents($geoJsonPath_Appartment), true); // FIX: Was using Underground path

        if (!isset($geoJsonData_underground['features']) || !isset($geoJsonData_appartment['features'])) {
            $this->command->error("Invalid GeoJSON format: 'features' key not found.");
            return;
        }

        $this->command->info("Seeding lots from GeoJSON...");

        // Add lot_type to each feature's properties
        // REFERENCE OPERATOR
        foreach ($geoJsonData_underground['features'] as &$feature) {
            $feature['properties']['lot_type'] = 'underground';
        }
        unset($feature); // Break reference

        // REFERENCE OPERATOR
        foreach ($geoJsonData_appartment['features'] as &$feature) {
            $feature['properties']['lot_type'] = 'apartment';
        }
        unset($feature); // Break reference

        // Merge features from both GeoJSON files
        $allFeatures = array_merge(
            $geoJsonData_underground['features'],
            $geoJsonData_appartment['features']
        );

        // Insert lots
        foreach ($allFeatures as $feature) {
            $attributes = $feature['properties'];

            $lot = [
                'section_id' => $attributes['section_id'],
                'lot_type' => $attributes['lot_type'],
                'coordinates' => $feature['geometry'],
            ];

            Lot::factory()->create($lot);
        }

        $this->command->info("Underground lots imported: " . count($geoJsonData_underground['features']));
        $this->command->info("Appartment lots imported: " . count($geoJsonData_appartment['features']));
        $this->command->info("Total lots imported: " . count($allFeatures));
    }

    private function deceasedRecords()
    {
        $lots = Lot::with('section')->get();

        foreach ($lots as $lot) {
            $deceased = DeceasedRecord::factory()->create();

            // Generate attributes from factory but save via relationship
            $lot->burialRecord()->create(
                BurialRecord::factory()->make([
                    'deceased_record_id' => $deceased->id,
                ])->toArray()
            );
        }
    }
}
