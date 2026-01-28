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
        Schema::create('junctions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['entrance', 'intersection']);
            $table->decimal('latitude', 10, 8);   // ✓ 2 digits before, 8 after (good for lat)
            $table->decimal('longitude', 11, 8);  // ✓ 3 digits before, 8 after (good for lng)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('junctions');
    }
};
