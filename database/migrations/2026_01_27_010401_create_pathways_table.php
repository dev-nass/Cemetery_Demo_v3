<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pathways', function (Blueprint $table) {
            $table->id();
            $table->integer('from_junction_id');
            $table->integer('to_junction_id');
            // ⭐ DISTANCE - Key for pathfinding
            $table->decimal('distance_meters', 8, 2)
                  ->comment('Calculated distance between junctions in meters');
            $table->json('coordinates')
                ->comment('GeoJSON LineString coordinates for map display');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pathways');
    }
};
